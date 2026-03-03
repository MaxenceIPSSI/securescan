const unzipper = require("unzipper");
const fs = require("fs-extra");
const path = require("path");
const { runSemgrep } = require("../services/semgrep.service");

exports.scanZip = async (req, res) => {
  try {
    const zipPath = req.file.path;
    const extractPath = path.join("scans", req.file.filename);

    await fs.ensureDir(extractPath);

    await fs.createReadStream(zipPath)
      .pipe(unzipper.Extract({ path: extractPath }))
      .promise();

    const results = await runSemgrep(extractPath);

    res.json(results);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Scan failed" });
  }
};