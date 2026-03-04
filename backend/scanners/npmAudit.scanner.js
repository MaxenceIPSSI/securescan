const { exec } = require("child_process");

// Fonction pour lancer npm audit sur un dossier
function runNpmAudit(scanPath) {
  return new Promise((resolve) => {
    // 1️⃣ Installer les dépendances silencieusement
    const installCmd = `cd "${scanPath}" && npm install --silent`;
    // 2️⃣ Lancer l'audit uniquement en JSON
    const auditCmd = `cd "${scanPath}" && npm audit --json`;

    exec(installCmd, { maxBuffer: 1024 * 1024 * 10 }, (installErr, installStdout, installStderr) => {
      if (installErr && !installStdout) console.error("[NPM INSTALL ERROR]", installErr.message);

      // Après installation, on lance npm audit
      exec(auditCmd, { maxBuffer: 1024 * 1024 * 10 }, (auditErr, stdout, stderr) => {
        if (stdout) {
          try {
            const parsed = JSON.parse(stdout);
            resolve(parsed.vulnerabilities || {}); // renvoie uniquement les vulnérabilités
          } catch (parseError) {
            console.error("[NPM AUDIT PARSE ERROR]", parseError.message);
            console.error("Contenu stdout reçu:", stdout);
            resolve({});
          }
        } else {
          console.warn("[NPM AUDIT WARNING] Aucun résultat retourné pour", scanPath);
          resolve({});
        }

        // Log seulement si vrai problème
        if (auditErr && !stdout) console.error("[NPM AUDIT ERROR]", auditErr.message);
        if (stderr && !stdout) console.error("[NPM AUDIT STDERR]", stderr);
      });
    });
  });
}

module.exports = runNpmAudit;