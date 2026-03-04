import { OWASP_COLOR } from "./data";

const severities = ["Toutes", "Critique", "Élevée", "Moyenne", "Faible"];
const owasps = ["Toutes", ...Object.keys(OWASP_COLOR)];

const ChevronIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

export default function DashboardNav({
  severityFilter, setSeverityFilter,
  owaspFilter, setOwaspFilter,
  showSevDropdown, setShowSevDropdown,
  showOwaspDropdown, setShowOwaspDropdown,
}) {
  return (
    <nav className="dash-nav">
      <div className="logo">Secure<span>Scan</span></div>
      <div className="nav-filters">
        <span className="filter-label">Filtrer :</span>

        <div className="dropdown">
          <button className="dropdown-btn" onClick={() => { setShowSevDropdown(v => !v); setShowOwaspDropdown(false); }}>
            {severityFilter}
            <ChevronIcon />
          </button>
          {showSevDropdown && (
            <div className="dropdown-menu">
              {severities.map(s => (
                <div key={s} className={`dropdown-item${severityFilter === s ? " active" : ""}`}
                  onClick={() => { setSeverityFilter(s); setShowSevDropdown(false); }}>
                  {s}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="dropdown">
          <button className="dropdown-btn" onClick={() => { setShowOwaspDropdown(v => !v); setShowSevDropdown(false); }}>
            {owaspFilter === "Toutes" ? "Catégorie OWASP" : owaspFilter}
            <ChevronIcon />
          </button>
          {showOwaspDropdown && (
            <div className="dropdown-menu">
              {owasps.map(o => (
                <div key={o} className={`dropdown-item${owaspFilter === o ? " active" : ""}`}
                  onClick={() => { setOwaspFilter(o); setShowOwaspDropdown(false); }}>
                  {o}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
