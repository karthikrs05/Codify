export default function StreakCalendar() {
  return (
    <div>
      <div className="streak-grid">
        {Array.from({ length: 28 }).map((_, i) => {
          let className = 'streak-cell empty';
          if (i < 17) className = 'streak-cell solved';
          if (i === 17) className = 'streak-cell today';
          return <span key={i} className={className} style={{ animationDelay: `${i * 18}ms` }} />;
        })}
      </div>
      <p className="muted mt-8">🔥 18-day streak</p>
    </div>
  );
}
