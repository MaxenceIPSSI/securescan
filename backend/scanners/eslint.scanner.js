'use strict';

const { execFile } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const { normalizeSeverity, resolveOwasp } = require('../utils/owasp');

const execFileAsync = promisify(execFile);

// Sur Windows, npx est un .cmd — execFile ne trouve pas les scripts sans extension
const NPX = process.platform === 'win32' ? 'npx.cmd' : 'npx';

// Règles ESLint dont les findings sont pertinents en tant que failles de sécurité.
// Les règles de qualité de code (no-undef, no-unused-vars, etc.) sont exclues —
// elles ne représentent pas de vulnérabilités et produiraient trop de bruit.
const SECURITY_RULE_PREFIXES = ['security/', 'no-eval', 'no-new-func', 'no-implied-eval'];
const SECURITY_RULE_PATTERNS = /eval|inject|sql|xss|exec|child.process|prototype|deserializ|unsafe|secret|password|token|credential|sanitiz|escape|traversal|redirect/i;

function isSecurityRule(ruleId) {
  if (!ruleId) return false;
  if (SECURITY_RULE_PREFIXES.some((prefix) => ruleId.startsWith(prefix))) return true;
  return SECURITY_RULE_PATTERNS.test(ruleId);
}

function normalizeEslintResults(rawResults, scanPath) {
  const findings = [];
  const seen = new Set(); // dédupliquer par file:line (ex: no-eval + security/detect-eval sur la même ligne)

  for (const fileResult of rawResults) {
    const relativePath = fileResult.filePath.startsWith(scanPath)
      ? fileResult.filePath.slice(scanPath.length).replace(/^[\\/]/, '')
      : path.basename(fileResult.filePath);

    for (const msg of (fileResult.messages || [])) {
      if (!msg.ruleId) continue;
      if (!isSecurityRule(msg.ruleId)) continue;

      const dedupeKey = `${relativePath}:${msg.line}:${msg.column}`;
      if (seen.has(dedupeKey)) continue;
      seen.add(dedupeKey);

      const severity = normalizeSeverity(msg.severity);
      const resolved = resolveOwasp([], msg.ruleId, msg.message || '');
      if (!resolved) continue;
      const { owasp, category } = resolved;

      findings.push({
        file:     relativePath,
        line:     msg.line ?? null,
        desc:     msg.message || msg.ruleId,
        severity,
        owasp,
        category,
      });
    }
  }

  findings.sort((a, b) => {
    if (a.owasp !== b.owasp) return a.owasp.localeCompare(b.owasp);
    return b.severity - a.severity;
  });

  return findings;
}

async function runEslint(scanPath) {
  const configPath = path.join(__dirname, '../utils/eslint-security.config.js');

  const args = [
    'eslint',
    '--no-config-lookup',    // ignorer la config du projet scanné, utiliser la nôtre
    '--config', configPath,  // notre config sécurité (eslint-plugin-security)
    '-f', 'json',
    scanPath,
  ];

  let stdout = '';
  try {
    const result = await execFileAsync(NPX, args, {
      maxBuffer: 1024 * 1024 * 10,
      timeout: 60000,
      shell: process.platform === 'win32', // .cmd nécessite le shell sur Windows
    });
    stdout = result.stdout;
  } catch (err) {
    // ESLint exit code 1 quand il y a des findings — stdout contient quand même le JSON
    if (err.stdout) {
      stdout = err.stdout;
    } else {
      console.warn('[ESLINT] Erreur fatale ou ESLint non installé:', err.message);
      return [];
    }
  }

  let rawResults;
  try {
    rawResults = JSON.parse(stdout);
  } catch (parseErr) {
    console.error('[ESLINT PARSE ERROR]', parseErr.message);
    return [];
  }

  if (!Array.isArray(rawResults)) {
    console.warn('[ESLINT] Format de sortie inattendu');
    return [];
  }

  console.log(`[ESLINT] ${rawResults.length} fichier(s) analysé(s)`);
  return normalizeEslintResults(rawResults, scanPath);
}

module.exports = runEslint;
