const runEslint = require("../scanners/eslint.scanner");
const runNpmAudit = require("../scanners/npmAudit.scanner");
const fs = require("fs").promises;

// Lancer ESLint + npm audit et retourner les résultats
async function runFullScan(scanPath) {
  let eslintResults = [];
  let npmResults = {};

  try {
    console.log("➡ Lancement ESLint sur:", scanPath);
    eslintResults = await runEslint(scanPath);
    console.log(`✅ ESLint terminé, fichiers scannés: ${eslintResults.length}`);
  } catch (err) {
    console.error("[ORCHESTRATOR ESLINT ERROR]", err);
  }

  try {
    console.log("➡ Lancement npm audit sur:", scanPath);
    npmResults = await runNpmAudit(scanPath);
    console.log(`✅ npm audit terminé, vulnérabilités détectées: ${Object.keys(npmResults).length}`);
  } catch (err) {
    console.error("[ORCHESTRATOR NPM AUDIT ERROR]", err);
  }

  return { eslint: eslintResults, npmAudit: npmResults };
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