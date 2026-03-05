import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import CustomTooltip from "./CustomTooltip";

export default function OWASPPieChart({ owaspDist }) {
  return (
    <div className="pie-card">
      <div className="chart-card-title">Répartition Top 10 OWASP</div>
      <div className="pie-inner">
        <ResponsiveContainer width={220} height={220}>
          <PieChart>
            <Pie data={owaspDist} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
              {owaspDist.map((entry, i) => <Cell key={i} fill={entry.color} stroke="transparent" />)}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pie-legend">
          {owaspDist.map((item, i) => (
            <div className="legend-item" key={i}>
              <div className="legend-dot" style={{ background: item.color }} />
              <span className="legend-name">{item.name}</span>
              <span className="legend-pct">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
