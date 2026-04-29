import { useEffect, useState } from 'react';

export default function CountdownTimer({ initial = 31335 }) {
  const [seconds, setSeconds] = useState(initial);

  useEffect(() => {
    const timer = setInterval(() => setSeconds((prev) => (prev > 0 ? prev - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, []);

  const hh = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const mm = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');

  return <span className="mono amber">Resets in {hh}:{mm}:{ss}</span>;
}
