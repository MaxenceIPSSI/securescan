const { exec } = require("child_process");

// Fonction pour lancer ESLint sur un dossier
function runEslint(scanPath) {
  return new Promise((resolve) => {
    // Commande ESLint : scanne tous les fichiers JS/TS/JSX/TSX du dossier
    const command = `npx eslint "${scanPath}/**/*.{js,jsx,ts,tsx}" -f json`;

    exec(command, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
      // Si ESLint retourne un JSON valide, on le parse et on renvoie les résultats
      if (stdout) {
        try {
          const results = JSON.parse(stdout);
          resolve(results);
        } catch (parseError) {
          console.error("[ESLINT PARSE ERROR]", parseError.message);
          console.error("Contenu stdout reçu:", stdout);
          resolve([]); // retourne tableau vide si parsing échoue
        }
      } else {
        console.warn("[ESLINT WARNING] Aucun résultat retourné pour", scanPath);
        resolve([]);
      }

      // Ces logs n’apparaissent que si stdout est vide (vrai problème)
      if (error && !stdout) console.error("[ESLINT ERROR]", error.message);
      if (stderr && !stdout) console.error("[ESLINT STDERR]", stderr);
    });
  });
}

module.exports = runEslint;