function seeded(seed) {
  let x = seed;
  return () => {
    x = (x * 1664525 + 1013904223) % 4294967296;
    return x / 4294967296;
  };
}

export default function HeatmapCalendar() {
  const rand = seeded(42);
  const cells = Array.from({ length: 364 }).map(() => Math.floor(rand() * 8));

  const cls = (val) => {
    if (val === 0) return 'h0';
    if (val <= 2) return 'h1';
    if (val <= 4) return 'h2';
    if (val <= 6) return 'h3';
    return 'h4';
  };

  return (
    <div>
      <div className="heatmap-grid">
        {cells.map((v, i) => (
          <span className={`heat-cell ${cls(v)}`} key={i} />
        ))}
      </div>
      <p className="muted mt-12">243 submissions in the last year</p>
    </div>
  );
}
