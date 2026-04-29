import { useEffect, useState } from 'react';

export default function XPBar({ value = 0, delay = 100 }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    setWidth(0);
    const timer = setTimeout(() => setWidth(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return (
    <div className="xp-track">
      <div className="xp-fill" style={{ width: `${width}%` }} />
    </div>
  );
}
