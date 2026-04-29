export default function BadgeGrid({ items, compact = false }) {
  return (
    <div className={compact ? 'badge-grid compact' : 'badge-grid'}>
      {items.map((badge) => (
        <div key={badge.id} className={`badge-card ${badge.earned ? 'earned' : 'locked'}`} title={`${badge.name} - ${badge.desc}${badge.earned ? ` (+${badge.xp} XP)` : ''}`}>
          <div className="badge-icon">{badge.icon}</div>
          <div className="badge-name">{badge.name}</div>
          <div className="badge-xp mono">{badge.earned ? `+${badge.xp} XP` : 'Locked'}</div>
          {!badge.earned ? <span className="lock-overlay">🔒</span> : null}
        </div>
      ))}
    </div>
  );
}
