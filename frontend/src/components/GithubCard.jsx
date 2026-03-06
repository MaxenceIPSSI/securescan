import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:4000";

export default function GithubCard() {
  const [user, setUser] = useState(undefined); // undefined=loading, null=disconnected, object=connected
  const [repos, setRepos] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [branchesLoading, setBranchesLoading] = useState(false);
  const [error, setError] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState("");
  const navigate = useNavigate();

  // Vérifie la session au montage
  useEffect(() => {
    fetch(`${API}/auth/github/user`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        setUser(data || null);
        if (data) loadRepos();
      })
      .catch(() => setUser(null));
  }, []);

  async function loadRepos() {
    const r = await fetch(`${API}/api/github/repos`, { credentials: "include" });
    if (!r.ok) return;
    setRepos(await r.json());
  }

  async function loadBranches(owner, repo) {
    setBranchesLoading(true);
    setError("");
    try {
      const url = new URL(`${API}/api/github/branches`);
      url.searchParams.set("owner", owner);
      url.searchParams.set("repo", repo);
      const r = await fetch(url, { credentials: "include" });
      if (!r.ok) throw new Error(await r.text());
      setBranches(await r.json());
    } catch (e) {
      setError(e.message);
      setBranches([]);
    } finally {
      setBranchesLoading(false);
    }
  }

  function selectRepo(fullName) {
    const repo = repos.find((r) => r.full_name === fullName) || null;
    setSelectedRepo(repo);
    setBranches([]);
    setSelectedBranch("");
    if (repo) {
      const [owner, name] = repo.full_name.split("/");
      loadBranches(owner, name).then(() => {
        setSelectedBranch(repo.default_branch || "");
      });
    }
  }

  async function logout() {
    await fetch(`${API}/auth/logout`, { credentials: "include" });
    setUser(null);
    setRepos([]);
    setSelectedRepo(null);
    setBranches([]);
    setSelectedBranch("");
  }

  async function handleAnalyze() {
    if (!selectedRepo || !selectedBranch) return;
    setIsScanning(true);
    setScanError("");
    const [owner, repo] = selectedRepo.full_name.split("/");
    try {
      const res = await fetch(`${API}/api/scan/github`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner, repo, branch: selectedBranch }),
      });
      if (!res.ok) throw new Error(await res.text());
      const results = await res.json();
      const meta = results.meta ?? null;
      navigate("/dashboard", { state: { results, meta } });
    } catch (e) {
      setScanError(e.message || "Une erreur est survenue lors du scan.");
      setIsScanning(false);
    }
  }

  const canAnalyze = !!selectedRepo && !!selectedBranch;

  // ── Scan overlay ─────────────────────────────────────────────────────────────

  if (isScanning) {
    return (
      <div className="scan-overlay">
        {scanError ? (
          <>
            <div className="scan-overlay-error">{scanError}</div>
            <button className="scan-overlay-retry" onClick={() => { setScanError(""); setIsScanning(false); }}>
              Retour
            </button>
          </>
        ) : (
          <>
            <div className="scan-overlay-spinner" />
            <div className="scan-overlay-title">Analyse en cours...</div>
            <div className="scan-overlay-sub">
              {selectedRepo?.full_name} · {selectedBranch}
            </div>
          </>
        )}
      </div>
    );
  }

  // ── États de rendu ──────────────────────────────────────────────────────────

  if (user === undefined) {
    return (
      <div className="card github">
        <div>
          <div className="card-label"><span className="dot" />Option 1</div>
          <div className="card-title">Connexion GitHub</div>
          <div className="card-desc">Vérification de la session...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="card github">
        <div>
          <div className="card-label"><span className="dot" />Option 1</div>
          <div className="card-title">Connexion GitHub</div>
          <div className="card-desc">
            Autorisez l'accès à vos repositories publics et privés via OAuth GitHub.
          </div>
        </div>
        <a className="btn-github" href={`${API}/auth/github`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
          </svg>
          Se connecter avec GitHub
        </a>
      </div>
    );
  }

  // Connecté
  return (
    <div className="card github">
      <div>
        <div className="card-label"><span className="dot" />Option 1</div>
        <div className="card-title">Connexion GitHub</div>
      </div>

      <div className="gh-user">
        <img className="gh-avatar" src={user.avatar_url} alt={user.login} />
        <span className="gh-login">@{user.login}</span>
        <button className="btn-logout" onClick={logout}>Se déconnecter</button>
      </div>

      <select
        className="gh-select"
        value={selectedRepo?.full_name || ""}
        onChange={(e) => selectRepo(e.target.value)}
      >
        <option value="">— Choisir un repository —</option>
        {repos.map((r) => (
          <option key={r.id} value={r.full_name}>
            {r.private ? "🔒 " : ""}{r.full_name}
          </option>
        ))}
      </select>

      {selectedRepo && (
        <select
          className="gh-select"
          value={selectedBranch}
          onChange={(e) => setSelectedBranch(e.target.value)}
          disabled={branchesLoading}
        >
          <option value="">{branchesLoading ? "Chargement..." : "— Choisir une branche —"}</option>
          {branches.map((b) => (
            <option key={b.name} value={b.name}>{b.name}</option>
          ))}
        </select>
      )}

      {error && <div className="gh-error">{error}</div>}

      <button
        className={`btn-analyze${canAnalyze ? " active" : ""}`}
        disabled={!canAnalyze}
        onClick={handleAnalyze}
      >
        Analyser ce repository
      </button>
    </div>
  );
}
