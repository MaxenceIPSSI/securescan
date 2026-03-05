import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell, Tooltip } from "recharts";
import CustomTooltip from "./CustomTooltip";

export default function SeverityBarChart({ severityData }) {
  return (
    <div className="chart-card">
      <div className="chart-card-title">Vulnérabilités par Sévérité</div>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={severityData} barCategoryGap="30%">
          <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="name" tick={{ fill: "#6b7fa3", fontSize: 11, fontFamily: "'DM Mono', monospace" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#6b7fa3", fontSize: 11, fontFamily: "'DM Mono', monospace" }} axisLine={false} tickLine={false} width={24} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
          <Bar dataKey="value" radius={[5, 5, 0, 0]}>
            {severityData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
