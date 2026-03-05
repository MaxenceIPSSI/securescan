// ─── Severity label (traduction côté front) ───────────────────────────────────
// Le backend retourne severity: 4|3|2|1 (4=critical, 3=high, 2=medium, 1=low)
export const SEV_LABEL = { 4: 'Critique', 3: 'Élevée', 2: 'Moyenne', 1: 'Faible' };

// ─── Mock data (fallback / dev) ───────────────────────────────────────────────
// Shape identique au format renvoyé par POST /api/scan/zip → { findings: [...] }
export const FINDINGS = [
  { file: 'user.php',      line: 23,   desc: 'SQL Injection détectée',             severity: 3, owasp: 'A05', category: 'Injection'                           },
  { file: 'config.js',    line: 10,   desc: 'Mauvaise configuration de sécurité', severity: 2, owasp: 'A02', category: 'Security Misconfiguration'            },
  { file: 'admin.js',     line: 45,   desc: "Contrôle d'accès défaillant",        severity: 2, owasp: 'A01', category: 'Broken Access Control'                },
  { file: 'package.json', line: null, desc: 'Composants vulnérables',             severity: 3, owasp: 'A03', category: 'Software Supply Chain Failures'       },
  { file: 'auth.js',      line: 78,   desc: 'Authentification faible',            severity: 1, owasp: 'A07', category: 'Authentication Failures'              },
  { file: 'db.js',        line: 34,   desc: 'Mot de passe hardcodé',              severity: 4, owasp: 'A04', category: 'Cryptographic Failures'               },
  { file: 'api.js',       line: 102,  desc: 'Injection de commande OS',           severity: 4, owasp: 'A05', category: 'Injection'                           },
  { file: 'logger.js',    line: 15,   desc: 'Logs insuffisants sur les erreurs',  severity: 1, owasp: 'A09', category: 'Security Logging and Alerting Failures'},
  { file: 'upload.js',    line: 57,   desc: 'Validation de fichier manquante',    severity: 3, owasp: 'A05', category: 'Injection'                           },
  { file: 'session.js',   line: 8,    desc: "Session non invalidée à la déco.",   severity: 2, owasp: 'A07', category: 'Authentication Failures'              },
];

// ─── Static lookup tables ─────────────────────────────────────────────────────
export const SEVERITY_COLOR = {
  4: { bg: '#3f1515', text: '#f87171', border: '#7f1d1d' }, // Critique
  3: { bg: '#3f2a0a', text: '#fbbf24', border: '#78350f' }, // Élevée
  2: { bg: '#0e2e20', text: '#34d399', border: '#064e3b' }, // Moyenne
  1: { bg: '#0f1f3d', text: '#60a5fa', border: '#1e3a5f' }, // Faible
};

export const OWASP_COLOR = {
  'A01': '#3b82f6', 'A02': '#8b5cf6', 'A03': '#f59e0b',
  'A04': '#eab308', 'A05': '#ef4444', 'A06': '#ec4899',
  'A07': '#10b981', 'A08': '#06b6d4', 'A09': '#6366f1', 'A10': '#f97316',
};

export const scoreColor = (s) => s >= 90 ? '#10b981' : s >= 70 ? '#f59e0b' : '#ef4444';

// ─── Computed data from findings[] ───────────────────────────────────────────
const DEDUCTIONS = { 4: 10, 3: 5, 2: 2, 1: 1 };
const SEV_COLORS  = { 4: '#ef4444', 3: '#f59e0b', 2: '#10b981', 1: '#3b82f6' };

export function computeDashboardData(findings) {
  // Score
  let score = 100;
  for (const f of findings) score -= (DEDUCTIONS[f.severity] ?? 0);
  score = Math.max(0, Math.min(100, score));

  const scoreLabel = score >= 90 ? 'A' : score >= 75 ? 'B' : score >= 50 ? 'C' : score >= 25 ? 'D' : 'F';
  const scoreDesc  = score >= 90 ? 'Excellent'
                   : score >= 75 ? 'Risque Modéré'
                   : score >= 50 ? 'Risque Élevé'
                   : score >= 25 ? 'Risque Critique'
                   : 'Critique';

  // Répartition par sévérité (4→1 décroissant)
  const sevCounts = { 4: 0, 3: 0, 2: 0, 1: 0 };
  for (const f of findings) {
    if (sevCounts[f.severity] !== undefined) sevCounts[f.severity]++;
  }
  const severityData = [4, 3, 2, 1].map((lvl) => ({
    name:  SEV_LABEL[lvl],  // nosemgrep
    value: sevCounts[lvl],  // nosemgrep
    color: SEV_COLORS[lvl], // nosemgrep
  }));

  // Répartition OWASP (top 6, en %)
  const owaspCounts = {};
  for (const f of findings) {
    owaspCounts[f.owasp] = (owaspCounts[f.owasp] || 0) + 1;
  }
  const total = findings.length || 1;
  const owaspDist = Object.entries(owaspCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([owasp, count]) => {
      const category = findings.find((f) => f.owasp === owasp)?.category || owasp;
      return {
        name:  `${owasp} · ${category}`,
        value: Math.round((count / total) * 100),
        color: OWASP_COLOR[owasp] || '#6b7280', // nosemgrep
      };
    });

  return { score, scoreLabel, scoreDesc, severityData, owaspDist };
}
