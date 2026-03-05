import "./Dashboard.css";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FINDINGS, computeDashboardData } from "./dashboard/data";
import { generatePDF } from "./dashboard/generatePDF";
import ScoreCard        from "./dashboard/ScoreCard";
import SeverityBarChart from "./dashboard/SeverityBarChart";
import OWASPPieChart    from "./dashboard/OWASPPieChart";
import StatsRow         from "./dashboard/StatsRow";
import FindingsTable    from "./dashboard/FindingsTable";

const API = "http://localhost:4000";

export default function Dashboard() {
  const location = useLocation();
  const findings = location.state?.results?.findings ?? FINDINGS;
  const meta     = location.state?.meta ?? null; // { owner, repo, branch } ou null si ZIP
  const { score, scoreLabel, scoreDesc, severityData, owaspDist } = computeDashboardData(findings);

  const [fixState, setFixState]   = useState("idle"); // idle | loading | success | error
  const [prUrl, setPrUrl]         = useState("");
  const [fixError, setFixError]   = useState("");

  async function handleApplyFixes() {
    if (!meta) return;
    setFixState("loading");
    setPrUrl("");
    setFixError("");
    try {
      const res = await fetch(`${API}/api/scan/fix-pr`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...meta, findings }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setPrUrl(data.prUrl);
      setFixState("success");
    } catch (e) {
      setFixError(e.message || "Erreur lors de la création de la PR.");
      setFixState("error");
    }
  }

  // ── Fix overlay ──────────────────────────────────────────────────────────────
  if (fixState === "loading") {
    return (
      <div className="scan-overlay">
        <div className="scan-overlay-spinner" />
        <div className="scan-overlay-title">Génération des corrections...</div>
        <div className="scan-overlay-sub">
          Claude analyse et corrige chaque fichier. Cela peut prendre une minute.
        </div>
      </div>
    );
  }

  if (fixState === "success") {
    return (
      <div className="scan-overlay">
        <div className="scan-overlay-success-icon">✓</div>
        <div className="scan-overlay-title">Pull Request créée !</div>
        <div className="scan-overlay-sub">Les corrections ont été commitées sur une nouvelle branche.</div>
        <a className="scan-overlay-pr-link" href={prUrl} target="_blank" rel="noreferrer">
          Voir la Pull Request →
        </a>
        <button className="scan-overlay-retry" onClick={() => setFixState("idle")}>
          Retour au tableau de bord
        </button>
      </div>
    );
  }

  if (fixState === "error") {
    return (
      <div className="scan-overlay">
        <div className="scan-overlay-error">{fixError}</div>
        <button className="scan-overlay-retry" onClick={() => setFixState("idle")}>
          Retour
        </button>
      </div>
    );
  }

  // ── Dashboard normal ─────────────────────────────────────────────────────────
  return (
    <main className="dash-main">
      <div className="page-header">
        <div>
          <Link to="/" className="btn-back">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
            Analyser un autre projet
          </Link>
          <div className="page-title">Tableau de Bord</div>
        </div>
        <div className="header-actions">
          <button
            className={`btn-green${meta ? "" : " disabled"}`}
            onClick={handleApplyFixes}
            disabled={!meta}
            title={meta ? "Créer une PR avec les corrections IA" : "Disponible uniquement pour les scans GitHub"}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            Appliquer Corrections
          </button>
          <button className="btn-blue" onClick={() => generatePDF(findings, score, scoreLabel, scoreDesc)}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            Générer Rapport
          </button>
        </div>
      </div>

      <div className="top-grid">
        <div className="left-col">
          <ScoreCard score={score} scoreLabel={scoreLabel} scoreDesc={scoreDesc} />
          <SeverityBarChart severityData={severityData} />
        </div>
        <OWASPPieChart owaspDist={owaspDist} />
      </div>

      <StatsRow severityData={severityData} />
      <FindingsTable filtered={findings} total={findings.length} />
    </main>
  );
}
