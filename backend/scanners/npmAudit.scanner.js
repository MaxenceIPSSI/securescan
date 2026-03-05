'use strict';

const { exec } = require('child_process');
const { promisify } = require('util');
const { normalizeSeverity, resolveOwasp } = require('../utils/owasp');

const execAsync = promisify(exec);

function normalizeNpmResults(vulnerabilities) {
  const findings = [];

  for (const [packageName, vuln] of Object.entries(vulnerabilities)) {
    const viaItem = Array.isArray(vuln.via) && vuln.via.length > 0 ? vuln.via[0] : null;
    const title = (typeof viaItem === 'object' && viaItem?.title) ? viaItem.title : null;

    const severity = normalizeSeverity(vuln.severity);

    // npm audit = supply chain par défaut (A03)
    // resolveOwasp peut quand même détecter un cas plus spécifique via MESSAGE_OVERRIDES
    const resolved = resolveOwasp([], packageName, title || packageName);
    const owasp    = (!resolved || resolved.owasp === 'A02') ? 'A03' : resolved.owasp;
    const category = owasp === 'A03' ? 'Software Supply Chain Failures' : resolved.category;

    findings.push({
      file:     'package.json',
      line:     null,
      desc:     title ? `${title} (${packageName})` : packageName,
      severity,
      owasp,
      category,
    });
  }

  findings.sort((a, b) => {
    if (a.owasp !== b.owasp) return a.owasp.localeCompare(b.owasp);
    return b.severity - a.severity;
  });

  return findings;
}

async function runNpmAudit(scanPath) {
  const opts = { maxBuffer: 1024 * 1024 * 10 };

  try {
    await execAsync(`cd "${scanPath}" && npm install --silent`, opts);
  } catch (installErr) {
    console.warn('[NPM INSTALL WARNING]', installErr.message);
  }

  let stdout = '';
  try {
    const result = await execAsync(`cd "${scanPath}" && npm audit --json`, opts);
    stdout = result.stdout;
  } catch (err) {
    // npm audit exit code 1 quand des vulnérabilités existent — stdout contient quand même le JSON
    if (err.stdout) {
      stdout = err.stdout;
    } else {
      console.warn('[NPM AUDIT WARNING] Aucun résultat pour', scanPath);
      return [];
    }
  }

  let parsed;
  try {
    parsed = JSON.parse(stdout);
  } catch (parseError) {
    console.error('[NPM AUDIT PARSE ERROR]', parseError.message);
    return [];
  }

  const vulnerabilities = parsed.vulnerabilities || {};
  console.log(`[NPM AUDIT] ${Object.keys(vulnerabilities).length} vulnérabilité(s)`);
  return normalizeNpmResults(vulnerabilities);
}

module.exports = runNpmAudit;
