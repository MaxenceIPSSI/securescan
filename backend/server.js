'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const crypto = require('crypto');
const scanRoutes = require('./routes/scan.routes');

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());

app.use(session({
  name:   'ssid',
  secret: process.env.SESSION_SECRET || 'dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', secure: false, domain: process.env.COOKIE_DOMAIN },
}));

// ─── GitHub OAuth ────────────────────────────────────────────────────────────

app.get('/auth/github', (req, res) => {
  const state = crypto.randomBytes(16).toString('hex');
  req.session.oauthState = state;

  const params = new URLSearchParams({
    client_id:    process.env.GITHUB_CLIENT_ID,
    redirect_uri: process.env.GITHUB_CALLBACK_URL,
    scope:        'repo',
    state,
  });

  res.redirect(`https://github.com/login/oauth/authorize?${params}`);
});

app.get('/auth/github/callback', async (req, res) => {
  const { code, state } = req.query;

  if (!code || !state || state !== req.session.oauthState) {
    return res.status(400).send('Invalid OAuth state');
  }

  try {
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method:  'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        client_id:     process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code:          String(code),
        redirect_uri:  process.env.GITHUB_CALLBACK_URL,
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) return res.status(400).send('No access token received');

    req.session.githubToken = tokenData.access_token;
    delete req.session.oauthState;

    res.redirect(process.env.FRONTEND_URL || 'http://localhost:5173');
  } catch (err) {
    console.error('[OAUTH ERROR]', err.message);
    res.status(500).send('OAuth authentication error');
  }
});

app.get('/auth/logout', (req, res) => {
  req.session.destroy();
  res.json({ ok: true });
});

// ─── GitHub API ──────────────────────────────────────────────────────────────

app.get('/auth/github/user', async (req, res) => {
  if (!req.session.githubToken) return res.status(401).json({ error: 'Not authenticated' });

  const r = await fetch('https://api.github.com/user', {
    headers: {
      Authorization:          `Bearer ${req.session.githubToken}`,
      Accept:                 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });

  const data = await r.json();
  res.json({ login: data.login, avatar_url: data.avatar_url });
});

app.get('/api/github/repos', async (req, res) => {
  if (!req.session.githubToken) return res.status(401).json({ error: 'Not authenticated' });

  const r = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
    headers: {
      Authorization:          `Bearer ${req.session.githubToken}`,
      Accept:                 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });

  const data = await r.json();
  res.json(data.map((repo) => ({
    id:             repo.id,
    full_name:      repo.full_name,
    private:        repo.private,
    default_branch: repo.default_branch,
  })));
});

app.get('/api/github/branches', async (req, res) => {
  if (!req.session.githubToken) return res.status(401).json({ error: 'Not authenticated' });

  const { owner, repo } = req.query;
  if (!owner || !repo) return res.status(400).json({ error: 'Missing owner/repo' });

  const r = await fetch(`https://api.github.com/repos/${owner}/${repo}/branches?per_page=100`, {
    headers: {
      Authorization:          `Bearer ${req.session.githubToken}`,
      Accept:                 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });

  if (!r.ok) return res.status(r.status).send(await r.text());

  const data = await r.json();
  res.json(data.map((b) => ({ name: b.name })));
});

// ─── Scan ────────────────────────────────────────────────────────────────────

app.use('/api/scan', scanRoutes);

// ─── Start ───────────────────────────────────────────────────────────────────

app.get('/', (_req, res) => res.send('SecureScan API running'));

const port = Number(process.env.PORT || 4000);
app.listen(port, () => console.log(`SecureScan backend running on port ${port}`));
