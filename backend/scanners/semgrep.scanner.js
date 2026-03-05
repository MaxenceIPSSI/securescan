'use strict';

const { execFile } = require('child_process');
const { promisify } = require('util');
const path = require('path');

const execFileAsync = promisify(execFile);

// ─── OWASP 2021 → 2025 mapping ───────────────────────────────────────────────
// Semgrep rule metadata references the 2021 numbering. The frontend uses 2025.
const OWASP_2021_TO_2025 = {
  'A01': 'A01', // Broken Access Control       → Broken Access Control
  'A02': 'A04', // Cryptographic Failures       → Cryptographic Failures
  'A03': 'A05', // Injection                    → Injection
  'A04': 'A06', // Insecure Design              → Insecure Design
  'A05': 'A02', // Security Misconfiguration    → Security Misconfiguration
  'A06': 'A03', // Vulnerable/Outdated Compon.  → Software Supply Chain Failures
  'A07': 'A07', // Identification/Auth Failures → Authentication Failures
  'A08': 'A08', // Software/Data Integrity      → Software or Data Integrity Failures
  'A09': 'A09', // Security Logging Failures    → Security Logging and Alerting Failures
  'A10': 'A10', // Server-Side Request Forgery  → Mishandling of Exceptional Conditions
};

// ─── 2025 code → human-readable category label ───────────────────────────────
const OWASP_2025_CATEGORY = {
  'A01': 'Broken Access Control',
  'A02': 'Security Misconfiguration',
  'A03': 'Software Supply Chain Failures',
  'A04': 'Cryptographic Failures',
  'A05': 'Injection',
  'A06': 'Insecure Design',
  'A07': 'Authentication Failures',
  'A08': 'Software or Data Integrity Failures',
  'A09': 'Security Logging and Alerting Failures',
  'A10': 'Mishandling of Exceptional Conditions',
};

// ─── Semgrep severity → frontend labels ──────────────────────────────────────
const SEVERITY_MAP = {
  'ERROR':   'Critique',
  'WARNING': 'Élevée',
  'INFO':    'Moyenne',
};

// ─── Sort order for severity within each OWASP group ─────────────────────────
const SEVERITY_ORDER = { 'Critique': 0, 'Élevée': 1, 'Moyenne': 2, 'Faible': 3 };

// ─── Overrides haute priorité basés sur le message/check_id ─────────────────
// Corrige les cas où semgrep tague une règle dans une catégorie OWASP 2021
// sémantiquement incorrecte (ex: path traversal tagué A05 au lieu de A01).
// Ces patterns sont testés AVANT les métadonnées OWASP de la règle.
const MESSAGE_OVERRIDES = [
  // Broken Access Control — path traversal, accès fichier arbitraire
  { pattern: /path.*traversal|outside.*destination|target path|nested.*intend|sendfile|arbitrary.*file|directory.*listing/i, owasp: 'A01' },
  // Injection — XSS, injection HTML, SQL, commande, eval
  { pattern: /html escap|bypass.*html|xss|cross.site.script|sql.*inject|inject.*sql|command.*inject|os.*inject|eval\(|innerhtml/i, owasp: 'A05' },
  // Cryptographic Failures — secrets hardcodés, algos faibles (avant A07 car jwt+secret → A04)
  { pattern: /hard.?coded.*(secret|password|credential|key|token)|md5|sha1|weak.*crypt|des.*encrypt/i, owasp: 'A04' },
  // Authentication Failures — JWT algo 'none', session (jwt.*secret exclu, couvert par A04)
  { pattern: /jwt.*none|none.*algorithm|integrity.*token|jwt.*alg|weak.*jwt/i, owasp: 'A07' },
  // Logging — données sensibles dans les logs
  { pattern: /sensitive.*log|password.*log|log.*password|log.*credential/i, owasp: 'A09' },
];

// ─── Rule ID keyword fallback pour règles sans métadonnée OWASP ──────────────
const RULE_ID_FALLBACK = [
  { pattern: /secret|password|token|credential|api.?key/i, owasp: 'A04' },
  { pattern: /inject|sqli|xss|xxe|command/i,              owasp: 'A05' },
  { pattern: /auth|jwt|session|login|cookie/i,             owasp: 'A07' },
  { pattern: /cors|header|csp|misconfigur/i,               owasp: 'A02' },
  { pattern: /traversal|access|permission|privilege/i,     owasp: 'A01' },
  { pattern: /log|audit|monitor/i,                         owasp: 'A09' },
  { pattern: /supply.chain|package|depend/i,               owasp: 'A03' },
  { pattern: /integrity|deserializ/i,                      owasp: 'A08' },
];

/**
 * Extract OWASP 2025 code and category label from a semgrep result.
 * Priority: message override → metadata tag → rule ID keyword → default A02.
 */
function resolveOwasp(owaspTags, checkId, message) {
  const haystack = `${message} ${checkId}`;

  // 1. Override haute priorité basé sur le contenu du message
  for (const { pattern, owasp } of MESSAGE_OVERRIDES) {
    if (pattern.test(haystack)) {
      return { owasp, category: OWASP_2025_CATEGORY[owasp] };
    }
  }

  // 2. Métadonnées OWASP de la règle semgrep (avec mapping 2021→2025)
  if (Array.isArray(owaspTags) && owaspTags.length > 0) {
    for (const tag of owaspTags) {
      const match = tag.match(/^(A\d{2}):/);
      if (match) {
        const code2025 = OWASP_2021_TO_2025[match[1]];
        if (code2025) {
          return { owasp: code2025, category: OWASP_2025_CATEGORY[code2025] };
        }
      }
    }
  }

  // 3. Fallback par keyword sur le check_id
  for (const { pattern, owasp } of RULE_ID_FALLBACK) {
    if (pattern.test(checkId)) {
      return { owasp, category: OWASP_2025_CATEGORY[owasp] };
    }
  }

  return { owasp: 'A02', category: OWASP_2025_CATEGORY['A02'] };
}

/**
 * Normalize a single semgrep result into the FINDINGS shape used by the frontend.
 */
function normalizeResult(result, scanPath) {
  const rawSeverity = (result.extra?.severity || '').toUpperCase();
  const severity = SEVERITY_MAP[rawSeverity] || 'Faible';

  const message = result.extra?.message || '';
  const { owasp, category } = resolveOwasp(
    result.extra?.metadata?.owasp || [],
    result.check_id || '',
    message
  );

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
 * Returns findings sorted by OWASP category then severity.
 * Always resolves — never rejects.
 *
 * @param {string} scanPath - absolute path to the project directory
 * @returns {Promise<Array<{ file, line, desc, severity, owasp, category }>>}
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
      maxBuffer: 1024 * 1024 * 50, // 50 MB
      timeout: 120000,              // 2 minutes
    });
    stdout = result.stdout;
  } catch (err) {
    // semgrep exits with code 1 when findings exist — stdout still has valid JSON
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

  const findings = parsed.results.map((r) => normalizeResult(r, scanPath));

  findings.sort((a, b) => {
    if (a.owasp !== b.owasp) return a.owasp.localeCompare(b.owasp);
    return (SEVERITY_ORDER[a.severity] ?? 99) - (SEVERITY_ORDER[b.severity] ?? 99);
  });

  return findings;
}

module.exports = runSemgrep;
