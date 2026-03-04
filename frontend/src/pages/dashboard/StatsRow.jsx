import { SEVERITY_DATA } from "./data";

export default function StatsRow() {
  return (
    <div className="stats-row">
      {SEVERITY_DATA.map((s, i) => (
        <div className="stat-card" key={i}>
          <div className="stat-dot" style={{ background: s.color }} />
          <div>
            <div className="stat-val" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-lbl">{s.name}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
