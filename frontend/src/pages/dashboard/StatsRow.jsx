export default function StatsRow({ severityData }) {
  return (
    <div className="stats-row">
      {severityData.map((s, i) => (
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
