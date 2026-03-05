export default function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#0d1526", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 14px" }}>
      <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#e2eaf5" }}>
        {payload[0].name}: <strong>{payload[0].value}</strong>
      </p>
    </div>
  );
}
