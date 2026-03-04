import { useEffect, useMemo, useState } from "react";
import "./App.css";
const API_BASE = "http://localhost:4000";
export default function App() {
  const [repos, setRepos] = useState([]);
  const [reposLoading, setReposLoading] = useState(false);

  const [selectedRepo, setSelectedRepo] = useState(null);
  const [path, setPath] = useState(""); 
  const [selectedPath, setSelectedPath] = useState("");

  const [items, setItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(false);

  const [error, setError] = useState("");

  const login = () => {
    window.location.href = `${API_BASE}/auth/github`;
  };

  const ownerRepo = useMemo(() => {
    if (!selectedRepo?.full_name) return { owner: "", repo: "" };
    const [owner, repo] = selectedRepo.full_name.split("/");
    return { owner, repo };
  }, [selectedRepo]);

  async function loadRepos() {
  setReposLoading(true);
  setError("");
  try {
    const r = await fetch(`${API_BASE}/api/github/repos`, {
      credentials: "include",  // Inclure les cookies de session
    });
    if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
    const data = await r.json();
    setRepos(data); // Met à jour la liste des repos
  } catch (e) {
    setRepos([]);
    setError(e instanceof Error ? e.message : String(e));
  } finally {
    setReposLoading(false);
  }
}

  async function loadContents(nextPath) {
    if (!ownerRepo.owner || !ownerRepo.repo) return;

    setItemsLoading(true);
    setError("");
    try {
      const url = new URL(`${API_BASE}/api/github/contents`);
      url.searchParams.set("owner", ownerRepo.owner);
      url.searchParams.set("repo", ownerRepo.repo);
      url.searchParams.set("path", nextPath || "");

      const r = await fetch(url.toString(), { credentials: "include" });
      if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
      const data = await r.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setItems([]);
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setItemsLoading(false);
    }
  }

  function selectRepo(r) {
    setSelectedRepo(r);
    setPath("");
    setSelectedPath("");
  }

  function goUp() {
    if (!path) return;
    const parts = path.split("/").filter(Boolean);
    parts.pop();
    setPath(parts.join("/"));
  }

  function enterDir(dirPath) {
    setPath(dirPath);
  }

  function chooseThisPath(p) {
    setSelectedPath(p || "");
  }

  useEffect(() => {
    loadRepos();
  }, []);

  useEffect(() => {
    if (!selectedRepo) return;
    loadContents(path);
  }, [selectedRepo, path]);

  const dirs = items.filter((it) => it.type === "dir");

  return (
    <div className="page">
      <div className="container">
        <header className="header">
          <div>
            <h1 className="title">SecureScan</h1>
            <p className="subtitle">Connecte-toi à GitHub, choisis un repo, puis un répertoire.</p>
          </div>

          <div className="actions">
            <button className="btn btn-primary" onClick={login}>
              Se connecter avec GitHub
            </button>
            <button className="btn btn-ghost" onClick={loadRepos} disabled={reposLoading}>
              {reposLoading ? "Chargement..." : "Recharger mes repos"}
            </button>
          </div>
        </header>

        {error && <div className="alert">Erreur : {error}</div>}

        <div className="grid">
          <section className="card">
            <div className="cardHeader">
              <h2>1) Repositories</h2>
              <span className="badge">{repos.length}</span>
            </div>

            {repos.length === 0 && !reposLoading && !error && (
              <p className="muted">Aucun repo affiché (connecte-toi puis recharge).</p>
            )}

            <div className="list">
              {repos.map((r) => {
                const active = selectedRepo?.id === r.id;
                return (
                  <button
                    key={r.id}
                    className={`listItem ${active ? "active" : ""}`}
                    onClick={() => selectRepo(r)}
                  >
                    <div className="listTitle">{r.full_name}</div>
                    <div className="listMeta">
                      {r.private ? "Privé" : "Public"} • {r.default_branch || "?"}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="card">
            <div className="cardHeader">
              <h2>2) Répertoire</h2>
              {selectedRepo ? (
                <span className="pill">{selectedRepo.full_name}</span>
              ) : (
                <span className="pill">Aucun repo</span>
              )}
            </div>

            {!selectedRepo ? (
              <p className="muted">Sélectionne un repository pour afficher les dossiers.</p>
            ) : (
              <>
                <div className="toolbar">
                  <div className="path">
                    Chemin courant : <code>/{path || ""}</code>
                  </div>

                  <div className="toolbarBtns">
                    <button className="btn btn-ghost" onClick={goUp} disabled={!path || itemsLoading}>
                      ⬅️ Remonter
                    </button>
                    <button
                      className="btn btn-ghost"
                      onClick={() => loadContents(path)}
                      disabled={itemsLoading}
                    >
                      {itemsLoading ? "Chargement..." : "Rafraîchir"}
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={() => chooseThisPath(path)}
                      disabled={itemsLoading}
                    >
                      Choisir ce répertoire
                    </button>
                    <button
                      className="btn btn-ghost"
                      onClick={() => chooseThisPath("")}
                      disabled={itemsLoading}
                    >
                      Choisir la racine
                    </button>
                  </div>
                </div>

                <div className="folderGrid">
                  {dirs.map((d) => (
                    <button
                      key={d.path}
                      className="folder"
                      onClick={() => enterDir(d.path)}
                      disabled={itemsLoading}
                      title={`Ouvrir /${d.path}`}
                    >
                      <div className="folderIcon">📁</div>
                      <div className="folderName">{d.name}</div>
                      <div className="folderPath">/{d.path}</div>
                    </button>
                  ))}
                </div>

                <div className="selected">
                  <div className="selectedLabel">Répertoire sélectionné</div>
                  <div className="selectedValue">
                    <code>/{selectedPath || ""}</code>
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}