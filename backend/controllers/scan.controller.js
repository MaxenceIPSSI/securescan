const fs = require("fs-extra");
const path = require("path");
const runFullScan = require("../services/scanOrchestrator"); // ton orchestrateur ESLint + npm audit
const unzipper = require("unzipper");

exports.scanZip = async (req, res) => {
  try {
    const zipPath = req.file.path;
    const extractPath = path.join("scans", req.file.filename);

    await fs.ensureDir(extractPath);

    // Dézippe le projet
    await fs.createReadStream(zipPath)
      .pipe(unzipper.Extract({ path: extractPath }))
      .promise();

    // Trouver le sous-dossier réel (ici projet-vulnerable)
    const folders = (await fs.readdir(extractPath)).filter(f => fs.lstatSync(path.join(extractPath, f)).isDirectory());
    const projectPath = folders.length > 0 ? path.join(extractPath, folders[0]) : extractPath;

    console.log("📁 Scan du projet dans :", projectPath);

    // Lancer le scan complet sur le bon dossier
    const results = await runFullScan(projectPath);

    res.json(results);

  } catch (error) {
    console.error("[SCAN ZIP ERROR]", error);
    res.status(500).json({ error: "Scan failed" });
  } finally {
    // Supprimer le zip uploadé et le dossier extrait
    if (req.file?.path) await fs.remove(req.file.path);
    if (req.file?.filename) await fs.remove(path.join("scans", req.file.filename));
  }
};