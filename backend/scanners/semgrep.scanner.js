'use strict';

const { execFile } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const { normalizeSeverity, resolveOwasp } = require('../utils/owasp');

const execFileAsync = promisify(execFile);

/**
 * Normalize a single semgrep result into the FINDINGS shape used by the frontend.
 */
function normalizeResult(result, scanPath) {
  const rawSeverity = (result.extra?.severity || '').toUpperCase();
  const severity = normalizeSeverity(rawSeverity);

  const message = result.extra?.message || '';
  const resolved = resolveOwasp(
    result.extra?.metadata?.owasp || [],
    result.check_id || '',
    message
  );
  if (!resolved) return null;
  const { owasp, category } = resolved;

  const absolutePath = result.path || '';
  const relativePath = absolutePath.startsWith(scanPath)
    ? absolutePath.slice(scanPath.length).replace(/^[\\/]/, '')
    : path.basename(absolutePath);

  return {
    file:     relativePath,
    line:     result.start?.line ?? null,
    desc:     message || result.check_id || 'Security finding',
    severity,
    owasp,
    category,
  };
}

/**
 * Run semgrep on the given directory.
 * Returns findings sorted by OWASP category then severity (desc).
 * Always resolves — never rejects.
 *
 * @param {string} scanPath - absolute path to the project directory
 * @returns {Promise<Array<{ file, line, desc, severity: number, owasp, category }>>}
 */
async function runSemgrep(scanPath) {
  const args = [
    '--config', 'p/owasp-top-ten',
    '--config', 'p/javascript',
    '--config', 'p/secrets',
    '--json',
    '--no-git-ignore',
    scanPath,
  ];

  let stdout = '';

  try {
    const result = await execFileAsync('semgrep', args, {
      maxBuffer: 1024 * 1024 * 50,
      timeout: 120000,
    });
    stdout = result.stdout;
  } catch (err) {
    if (err.stdout) {
      stdout = err.stdout;
    } else {
      if (err.code === 'ENOENT' || /not found|command not found/i.test(err.message)) {
        console.warn('[SEMGREP] semgrep non installé — scan ignoré');
      } else {
        console.error('[SEMGREP ERROR]', err.message);
      }
      return [];
    }
  }

  let parsed;
  try {
    parsed = JSON.parse(stdout);
  } catch (parseErr) {
    console.error('[SEMGREP PARSE ERROR]', parseErr.message);
    return [];
  }

  if (!Array.isArray(parsed.results)) {
    console.warn('[SEMGREP] Format de sortie inattendu — results manquant');
    return [];
  }

  if (Array.isArray(parsed.errors) && parsed.errors.length > 0) {
    console.warn(`[SEMGREP] ${parsed.errors.length} erreur(s) de règle`);
  }

  console.log(`[SEMGREP] ${parsed.results.length} finding(s) brut(s)`);

  const findings = parsed.results.map((r) => normalizeResult(r, scanPath)).filter(Boolean);

  findings.sort((a, b) => {
    if (a.owasp !== b.owasp) return a.owasp.localeCompare(b.owasp);
    return b.severity - a.severity; // 4 (critical) en premier
  });

  return findings;
}

module.exports = runSemgrep;
