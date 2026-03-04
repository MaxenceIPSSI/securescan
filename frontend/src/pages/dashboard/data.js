export const SCORE = 82;
export const SCORE_LABEL = "B";
export const SCORE_DESC = "Risque Modéré";

export const SEVERITY_DATA = [
  { name: "Critique", value: 5,  color: "#ef4444" },
  { name: "Élevée",   value: 12, color: "#f59e0b" },
  { name: "Moyenne",  value: 18, color: "#10b981" },
  { name: "Faible",   value: 7,  color: "#3b82f6"  },
];

export const OWASP_DIST = [
  { name: "A05 · Injection",        value: 26, color: "#ef4444" },
  { name: "A03 · Supply Chain",     value: 22, color: "#f59e0b" },
  { name: "A04 · Crypto Failures",  value: 19, color: "#eab308" },
  { name: "A01 · Access Control",   value: 18, color: "#3b82f6" },
  { name: "A07 · Auth Failures",    value: 9,  color: "#10b981" },
  { name: "Autres",                 value: 6,  color: "#6b7280" },
];

export const FINDINGS = [
  { file: "user.php",     line: 23,   desc: "SQL Injection détectée",             severity: "Élevée",   owasp: "A05", category: "Injection"               },
  { file: "config.js",   line: 10,   desc: "Mauvaise configuration de sécurité", severity: "Moyenne",  owasp: "A02", category: "Security Misconfig."      },
  { file: "admin.js",    line: 45,   desc: "Contrôle d'accès défaillant",        severity: "Moyenne",  owasp: "A01", category: "Broken Access Control"    },
  { file: "package.json",line: null, desc: "Composants vulnérables",             severity: "Élevée",   owasp: "A03", category: "Supply Chain Failures"    },
  { file: "auth.js",     line: 78,   desc: "Authentification faible",            severity: "Faible",   owasp: "A07", category: "Authentication Failures"  },
  { file: "db.js",       line: 34,   desc: "Mot de passe hardcodé",              severity: "Critique", owasp: "A04", category: "Cryptographic Failures"   },
  { file: "api.js",      line: 102,  desc: "Injection de commande OS",           severity: "Critique", owasp: "A05", category: "Injection"                },
  { file: "logger.js",   line: 15,   desc: "Logs insuffisants sur les erreurs",  severity: "Faible",   owasp: "A09", category: "Logging Failures"         },
  { file: "upload.js",   line: 57,   desc: "Validation de fichier manquante",    severity: "Élevée",   owasp: "A05", category: "Injection"                },
  { file: "session.js",  line: 8,    desc: "Session non invalidée à la déco.",   severity: "Moyenne",  owasp: "A07", category: "Authentication Failures"  },
];

export const SEVERITY_COLOR = {
  "Critique": { bg: "#3f1515", text: "#f87171", border: "#7f1d1d" },
  "Élevée":   { bg: "#3f2a0a", text: "#fbbf24", border: "#78350f" },
  "Moyenne":  { bg: "#0e2e20", text: "#34d399", border: "#064e3b" },
  "Faible":   { bg: "#0f1f3d", text: "#60a5fa", border: "#1e3a5f" },
};

export const OWASP_COLOR = {
  "A01": "#3b82f6", "A02": "#8b5cf6", "A03": "#f59e0b",
  "A04": "#eab308", "A05": "#ef4444", "A06": "#ec4899",
  "A07": "#10b981", "A08": "#06b6d4", "A09": "#6366f1", "A10": "#f97316",
};

export const scoreColor = (s) => s >= 90 ? "#10b981" : s >= 70 ? "#f59e0b" : "#ef4444";
