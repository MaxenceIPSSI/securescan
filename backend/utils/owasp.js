'use strict';

// ─── OWASP 2021 → 2025 mapping ───────────────────────────────────────────────
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
  'A10': null,  // Server-Side Request Forgery (2021) → pas d'équivalent en 2025, ignoré
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

// ─── Severity levels : 4=critical 3=high 2=medium 1=low ──────────────────────

// ─── Overrides haute priorité basés sur le message/check_id ──────────────────
const MESSAGE_OVERRIDES = [
  // Injection via child_process — testé EN PREMIER car "non literal argument" matcherait sinon A01
  { pattern: /child_process/i, owasp: 'A05' },
  // Broken Access Control — path traversal, accès fichier arbitraire (fs avec arg non-littéral)
  { pattern: /path.*traversal|outside.*destination|target path|nested.*intend|sendfile|arbitrary.*file|directory.*listing|non.literal.*fs|non literal.*argument/i, owasp: 'A01' },
  // Injection — XSS, SQL, commande, eval, object injection
  { pattern: /html escap|bypass.*html|xss|cross.site.script|sql.*inject|inject.*sql|command.*inject|os.*inject|eval\b.*harm|harmful.*eval|object injection|injection sink|eval with/i, owasp: 'A05' },
  // Cryptographic Failures — secrets hardcodés, algos faibles
  { pattern: /hard.?coded.*(secret|password|credential|key|token)|md5|sha1|weak.*crypt|des.*encrypt/i, owasp: 'A04' },
  // Authentication Failures — JWT algo none, timing attacks
  { pattern: /jwt.*none|none.*algorithm|integrity.*token|jwt.*alg|weak.*jwt|timing.attack|timing.safe/i, owasp: 'A07' },
  // Insecure Design — ReDoS, regex unsafe
  { pattern: /unsafe.*reg(ex|ular)|redos|catastrophic.*backtrack/i, owasp: 'A06' },
  // Logging — données sensibles dans les logs
  { pattern: /sensitive.*log|password.*log|log.*password|log.*credential/i, owasp: 'A09' },
];

// ─── Rule ID keyword fallback pour règles sans métadonnée OWASP ──────────────
const RULE_ID_FALLBACK = [
  { pattern: /secret|password|token|credential|api.?key/i,                   owasp: 'A04' },
  { pattern: /eval|new.func|implied.eval|child.process|object.inject|inject|sqli|xss|xxe|command/i, owasp: 'A05' },
  { pattern: /auth|jwt|session|login|cookie|timing/i,                         owasp: 'A07' },
  { pattern: /cors|header|csp|misconfigur/i,                                  owasp: 'A02' },
  { pattern: /traversal|access|permission|privilege|non.literal.fs|filename/i, owasp: 'A01' },
  { pattern: /unsafe.regex|unsafe.regexp|non.literal.regexp/i,                owasp: 'A06' },
  { pattern: /log|audit|monitor/i,                                            owasp: 'A09' },
  { pattern: /supply.chain|package|depend/i,                                  owasp: 'A03' },
  { pattern: /integrity|deserializ/i,                                         owasp: 'A08' },
];

/**
 * Resolve OWASP 2025 code and category from any scanner's metadata.
 * Priority: message override → OWASP metadata tags → rule ID keyword → default A02.
 */
function resolveOwasp(owaspTags, checkId, message) {
  const haystack = `${message} ${checkId}`;

  for (const { pattern, owasp } of MESSAGE_OVERRIDES) {
    if (pattern.test(haystack)) {
      return { owasp, category: OWASP_2025_CATEGORY[owasp] };
    }
  }

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

  for (const { pattern, owasp } of RULE_ID_FALLBACK) {
    if (pattern.test(checkId)) {
      return { owasp, category: OWASP_2025_CATEGORY[owasp] };
    }
  }

  return null;
}

/**
 * Normalize any raw severity value to a number: 4=critical 3=high 2=medium 1=low
 *
 * - Semgrep  : 'ERROR' | 'WARNING' | 'INFO'
 * - ESLint   : 2 (error) | 1 (warning)
 * - npm audit: 'critical' | 'high' | 'moderate' | 'low'
 * @returns {1|2|3|4}
 */
function normalizeSeverity(raw) {
  if (typeof raw === 'number') {
    return raw === 2 ? 3 : 1; // ESLint: error(2)→high(3), warning(1)→low(1)
  }
  if (typeof raw === 'string') {
    switch (raw.toUpperCase()) {
      case 'ERROR':
      case 'CRITICAL': return 4;
      case 'WARNING':
      case 'HIGH':     return 3;
      case 'INFO':
      case 'MODERATE': return 2;
      case 'LOW':      return 1;
      default:         return 1;
    }
  }
  return 1;
}

module.exports = {
  OWASP_2021_TO_2025,
  OWASP_2025_CATEGORY,
  MESSAGE_OVERRIDES,
  RULE_ID_FALLBACK,
  resolveOwasp,
  normalizeSeverity,
};
