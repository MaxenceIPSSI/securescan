const runEslint = require("../scanners/eslint.scanner");
const runNpmAudit = require("../scanners/npmAudit.scanner");
const runSemgrep = require("../scanners/semgrep.scanner");
const fs = require("fs").promises;

// Lancer ESLint + npm audit + semgrep et retourner les résultats
async function runFullScan(scanPath) {
  let eslintFindings   = [];
  let npmFindings      = [];
  let semgrepFindings  = [];

  try {
    console.log("➡ Lancement ESLint sur:", scanPath);
    eslintFindings = await runEslint(scanPath);
    console.log(`✅ ESLint terminé: ${eslintFindings.length} finding(s)`);
  } catch (err) {
    console.error("[ORCHESTRATOR ESLINT ERROR]", err);
  }

  try {
    console.log("➡ Lancement npm audit sur:", scanPath);
    npmFindings = await runNpmAudit(scanPath);
    console.log(`✅ npm audit terminé: ${npmFindings.length} finding(s)`);
  } catch (err) {
    console.error("[ORCHESTRATOR NPM AUDIT ERROR]", err);
  }

  try {
    console.log("➡ Lancement Semgrep sur:", scanPath);
    semgrepFindings = await runSemgrep(scanPath);
    console.log(`✅ Semgrep terminé: ${semgrepFindings.length} finding(s)`);
  } catch (err) {
    console.error("[ORCHESTRATOR SEMGREP ERROR]", err);
  }

  // Déduplication inter-scanner : même fichier + même ligne + même catégorie OWASP
  // → très probablement la même vulnérabilité détectée par deux outils différents.
  // On priorise semgrep (plus riche en métadonnées) en le mettant en premier.
  const seen = new Set();
  const findings = [...semgrepFindings, ...eslintFindings, ...npmFindings].filter((f) => {
    const key = `${f.file}:${f.line ?? 'null'}:${f.owasp}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return { findings };
}

// Orchestrateur complet + suppression automatique du dossier
async function runFullScanAndCleanup(scanPath) {
  try {
    return await runFullScan(scanPath);
  } finally {
    try {
      console.log("🗑 Suppression du dossier:", scanPath);
      await fs.rm(scanPath, { recursive: true, force: true });
      console.log("✅ Dossier supprimé");
    } catch (cleanupError) {
      console.error("[CLEANUP ERROR]", cleanupError);
    }
  }
}

module.exports = runFullScanAndCleanup;