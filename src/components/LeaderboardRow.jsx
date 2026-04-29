export default function LeaderboardRow({ row, delay = 0 }) {
  return (
    <div className={`leaderboard-row ${row.isMe ? 'me' : ''}`} style={{ animationDelay: `${delay}ms` }}>
      <span>{row.rank}</span>
      <span>{row.name}</span>
      <span>{row.level}</span>
      <span className="mono purple">{row.xp}</span>
      <span>{row.solved}</span>
      <span>{row.streak}</span>
      <span>{row.rank % 2 ? '↑' : '↓'}</span>
    </div>
  );
}
