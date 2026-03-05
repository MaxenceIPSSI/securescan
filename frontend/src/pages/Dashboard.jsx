import "./Dashboard.css";
import { Link, useLocation } from "react-router-dom";
import { FINDINGS, computeDashboardData } from "./dashboard/data";
import ScoreCard        from "./dashboard/ScoreCard";
import SeverityBarChart from "./dashboard/SeverityBarChart";
import OWASPPieChart    from "./dashboard/OWASPPieChart";
import StatsRow         from "./dashboard/StatsRow";
import FindingsTable    from "./dashboard/FindingsTable";

export default function Dashboard() {
  const location = useLocation();
  const findings = location.state?.results?.findings ?? FINDINGS;
  const { score, scoreLabel, scoreDesc, severityData, owaspDist } = computeDashboardData(findings);

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
          <button className="btn-green">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            Appliquer Corrections
          </button>
          <button className="btn-blue">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            Générer Rapport
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
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
