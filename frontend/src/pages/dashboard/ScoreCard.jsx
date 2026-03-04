import { SCORE, SCORE_LABEL, SCORE_DESC, scoreColor } from "./data";

export default function ScoreCard() {
  const color = scoreColor(SCORE);
  return (
    <div className="score-card">
      <div className="score-circle" style={{ background: `${color}22`, border: `2px solid ${color}` }}>
        <span style={{ color }}>{SCORE_LABEL}</span>
      </div>
      <div className="score-info">
        <div className="score-title">Score Global</div>
        <div className="score-value" style={{ color }}>
          {SCORE_LABEL}
          <span className="score-num">({SCORE}/100)</span>
        </div>
        <div className="score-risk">{SCORE_DESC}</div>
      </div>
    </div>
  );
}
