import express from "express";
import session from "express-session";
import dotenv from "dotenv";
import crypto from "crypto";
import cors from "cors";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
    },
  })
);

// Route d'authentification GitHub
app.get("/auth/github", (req, res) => {
  const state = crypto.randomBytes(16).toString("hex");
  req.session.state = state;

  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID,
    redirect_uri: process.env.GITHUB_CALLBACK_URL,
    state,
  });

  res.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
});

// Callback GitHub après authentification
app.get("/auth/github/callback", async (req, res) => {
  const { code, state } = req.query;

  if (!code || !state || state !== req.session.state) {
    return res.status(400).send("Invalid state");
  }

  try {
    // Récupération du token d'accès
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { Accept: "application/json" },
      body: new URLSearchParams({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code: String(code),
        redirect_uri: process.env.GITHUB_CALLBACK_URL,
      }),
    });

    const tokenData = await tokenResponse.json();
    if (!tokenData.access_token) {
      return res.status(400).send("No access token");
    }

    req.session.githubToken = tokenData.access_token;

    res.redirect(process.env.FRONTEND_URL); 
  } catch (error) {
    console.error(error);
    res.status(500).send("OAuth authentication error");
  }
});

// Récupérer les repos de l'utilisateur, mais uniquement `MaxenceIPSSI/securescan`
app.get("/api/github/repos", async (req, res) => {
  if (!req.session.githubToken) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const response = await fetch("https://api.github.com/user/repos?per_page=100&sort=updated", {
    headers: {
      Authorization: `Bearer ${req.session.githubToken}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  const data = await response.json();

  // Filtre pour ne récupérer que `MaxenceIPSSI/securescan`
  const filteredRepos = data.filter((repo) => repo.full_name === "MaxenceIPSSI/securescan");

  res.json(filteredRepos);
});

// Liste des contenus (dossiers et fichiers)
app.get("/api/github/contents", async (req, res) => {
  const { owner, repo, path = "" } = req.query;

  if (!owner || !repo) {
    return res.status(400).json({ error: "Missing owner/repo" });
  }

  const encodedPath = encodeURIComponent(String(path));
  const apiPath = `/repos/${owner}/${repo}/contents/${encodedPath}`;

  const response = await fetch(`https://api.github.com${apiPath}`, {
    headers: {
      Authorization: `Bearer ${req.session.githubToken}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (!response.ok) {
    const t = await response.text();
    return res.status(response.status).send(t);
  }

  const data = await response.json();
  const items = Array.isArray(data) ? data : [data];

  res.json(
    items.map((it) => ({
      name: it.name,
      path: it.path,
      type: it.type,
    }))
  );
});

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});