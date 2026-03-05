'use strict';

const fs = require("fs-extra");
const path = require("path");
const { execFile } = require("child_process");
const { promisify } = require("util");
const runFullScan = require("../services/scanOrchestrator");
const unzipper = require("unzipper");

const execFileAsync = promisify(execFile);

exports.scanZip = async (req, res) => {
  const extractPath = path.join("scans", req.file.filename);

  try {
    const zipPath = req.file.path;
    await fs.ensureDir(extractPath);

    await fs.createReadStream(zipPath) // nosemgrep
      .pipe(unzipper.Extract({ path: extractPath }))
      .promise();

    const entries = await fs.readdir(extractPath); // nosemgrep
    const folders = entries.filter(f => fs.lstatSync(path.join(extractPath, f)).isDirectory());
    // Si un seul dossier en racine → GitHub ZIP wrapper, on entre dedans.
    // Si plusieurs dossiers → le ZIP est déjà à la racine du projet.
    const projectPath = folders.length === 1 ? path.join(extractPath, folders[0]) : extractPath;

    console.log("Scan du projet dans :", projectPath);
    const results = await runFullScan(projectPath);
    res.json(results);

  } catch (error) {
    console.error("[SCAN ZIP ERROR]", error);
    res.status(500).json({ error: "Scan failed" });
  } finally {
    if (req.file?.path) await fs.remove(req.file.path).catch(() => {});
    await fs.remove(extractPath).catch(() => {});
  }
};

exports.scanGithub = async (req, res) => {
  const { owner, repo, branch } = req.body;
  if (!owner || !repo || !branch) {
    return res.status(400).json({ error: "Missing owner, repo or branch" });
  }

  const token = req.session?.githubToken;
  if (!token) return res.status(401).json({ error: "Not authenticated" });

  const cloneDir = path.join("scans", `github-${Date.now()}`);

  try {
    await fs.ensureDir(cloneDir);

    const cloneUrl = `https://oauth2:${token}@github.com/${owner}/${repo}.git`;
    await execFileAsync("git", [
      "clone", "--branch", branch, "--depth", "1", cloneUrl, cloneDir,
    ]);

    console.log(`Scan du repository ${owner}/${repo}@${branch}`);
    const results = await runFullScan(cloneDir);
    res.json({ ...results, meta: { owner, repo, branch } });

  } catch (error) {
    console.error("[SCAN GITHUB ERROR]", error.message);
    res.status(500).json({ error: "Scan failed" });
  } finally {
    await fs.remove(cloneDir).catch(() => {});
  }
};
