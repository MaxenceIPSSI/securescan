'use strict';

const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/**
 * POST /api/scan/fix-pr
 * Body: { owner, repo, branch, findings[] }
 * Creates a new branch with AI-fixed files and opens a PR.
 */
exports.createFixPR = async (req, res) => {
  const { owner, repo, branch, findings } = req.body;

  if (!owner || !repo || !branch || !Array.isArray(findings)) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const token = req.session?.githubToken;
  if (!token) return res.status(401).json({ error: 'Not authenticated' });

  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
    'User-Agent': 'SecureScan/1.0',
  };

  const ghBase = `https://api.github.com/repos/${owner}/${repo}`;

  try {
    // 1. Get current SHA of the source branch
    const refRes = await fetch(`${ghBase}/git/ref/heads/${branch}`, { headers });
    if (!refRes.ok) throw new Error(`Cannot get branch ref: ${await refRes.text()}`);
    const { object: { sha: baseSha } } = await refRes.json();

    // 2. Create a new branch
    const newBranch = `securescan-fixes-${Date.now()}`;
    const createBranchRes = await fetch(`${ghBase}/git/refs`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ ref: `refs/heads/${newBranch}`, sha: baseSha }),
    });
    if (!createBranchRes.ok) throw new Error(`Cannot create branch: ${await createBranchRes.text()}`);

    // 3. Group findings by file (skip npm audit entries with line: null)
    const byFile = {};
    for (const f of findings) {
      if (f.line === null || f.line === undefined) continue;
      if (!byFile[f.file]) byFile[f.file] = [];
      byFile[f.file].push(f);
    }

    const fixed = [];
    const skipped = [];

    // 4. For each file: fetch → ask Claude → commit
    for (const [filePath, fileFindingsArr] of Object.entries(byFile)) {
      try {
        // GET file content from GitHub
        const fileRes = await fetch(`${ghBase}/contents/${filePath}?ref=${branch}`, { headers });
        if (!fileRes.ok) {
          skipped.push(`${filePath} (introuvable sur GitHub)`);
          continue;
        }
        const fileData = await fileRes.json();
        const originalContent = Buffer.from(fileData.content, 'base64').toString('utf-8');

        // Call Claude to fix the file
        const vulnList = fileFindingsArr
          .map(f => `Ligne ${f.line}: [${f.owasp}] ${f.desc}`)
          .join('\n');

        const message = await client.messages.create({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 8192,
          messages: [{
            role: 'user',
            content: `You are a security expert. Fix ONLY the vulnerabilities listed below.\nReturn ONLY the complete fixed file content, no explanation, no markdown fences.\n\nFile: ${filePath}\n${originalContent}\n\nVulnerabilities:\n${vulnList}`,
          }],
        });

        const fixedContent = message.content[0].text;

        // Skip if Claude returned identical content
        if (fixedContent.trim() === originalContent.trim()) {
          skipped.push(`${filePath} (aucun changement)`);
          continue;
        }

        // PUT commit on new branch
        const commitRes = await fetch(`${ghBase}/contents/${filePath}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            message: `fix: [SecureScan] corrections de sécurité dans ${filePath}`,
            content: Buffer.from(fixedContent).toString('base64'),
            sha: fileData.sha,
            branch: newBranch,
          }),
        });

        if (!commitRes.ok) {
          skipped.push(`${filePath} (erreur de commit: ${await commitRes.text()})`);
          continue;
        }

        fixed.push(filePath);
      } catch (err) {
        skipped.push(`${filePath} (erreur: ${err.message})`);
      }
    }

    // 5. If nothing was fixed, delete the branch and bail out
    if (fixed.length === 0) {
      await fetch(`${ghBase}/git/refs/heads/${newBranch}`, { method: 'DELETE', headers });
      return res.status(422).json({
        error: `Aucun fichier n'a pu être corrigé. Skippés : ${skipped.join(', ') || 'aucun finding applicable'}`,
      });
    }

    // 6. Create the PR
    const today = new Date().toISOString().slice(0, 10);
    const fixedList = fixed.length > 0 ? fixed.map(f => `- \`${f}\``).join('\n') : '_Aucun_';
    const skippedList = skipped.length > 0 ? skipped.map(s => `- ${s}`).join('\n') : '_Aucun_';

    const prBody = `## [SecureScan] Corrections de sécurité — ${today}

Ce PR a été généré automatiquement par **SecureScan** en utilisant Claude claude-sonnet-4-6.

### Fichiers corrigés
${fixedList}

### Fichiers ignorés
${skippedList}

> Les corrections portent uniquement sur les vulnérabilités détectées lors du dernier scan.
> Veuillez relire les changements avant de merger.`;

    const prRes = await fetch(`${ghBase}/pulls`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        title: `[SecureScan] Corrections de sécurité — ${today}`,
        body: prBody,
        head: newBranch,
        base: branch,
      }),
    });

    if (!prRes.ok) throw new Error(`Cannot create PR: ${await prRes.text()}`);
    const pr = await prRes.json();

    res.json({ prUrl: pr.html_url, fixed, skipped });

  } catch (err) {
    console.error('[FIX PR ERROR]', err.message);
    res.status(500).json({ error: err.message || 'Fix PR failed' });
  }
};
