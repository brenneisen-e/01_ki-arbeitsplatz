export default function ScoreRing({ score, size = 56 }) {
  const scoreClass = score >= 80 ? 'high' : score >= 60 ? 'mid' : 'low';
  const circumference = Math.round(2 * Math.PI * 24);
  const offset = Math.round(circumference * (1 - score / 100));

  return (
    <div className="hp-score-ring">
      <svg viewBox="0 0 56 56" width={size} height={size}>
        <circle className="score-bg" cx="28" cy="28" r="24" />
        <circle className={`score-fill ${scoreClass}`} cx="28" cy="28" r="24" strokeDasharray={circumference} strokeDashoffset={offset} />
      </svg>
      <div className="hp-score-value">{score}%</div>
    </div>
  );
}
