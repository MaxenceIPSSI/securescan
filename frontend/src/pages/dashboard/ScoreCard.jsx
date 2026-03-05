import { scoreColor } from "./data";

export default function ScoreCard({ score, scoreLabel, scoreDesc }) {
  const color = scoreColor(score);
  return (
    <div className="score-card">
      <div className="score-circle" style={{ background: `${color}22`, border: `2px solid ${color}` }}>
        <span style={{ color }}>{scoreLabel}</span>
      </div>
      <div className="score-info">
        <div className="score-title">Score Global</div>
        <div className="score-value" style={{ color }}>
          {scoreLabel}
          <span className="score-num">({score}/100)</span>
        </div>
        <div className="score-risk">{scoreDesc}</div>
      </div>
    </div>
  );
}
