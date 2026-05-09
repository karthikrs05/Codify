import Navbar from '../components/Navbar';
import LeaderboardRow from '../components/LeaderboardRow';
import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../auth/api';
import { useAuth } from '../auth/AuthProvider';

export default function Leaderboard() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setError('');
      setLoading(true);
      try {
        const res = await apiFetch('/api/leaderboard/daily', { token });
        if (!cancelled) setRows(res.rows || []);
      } catch (e) {
        if (!cancelled) setError(e?.data?.error || 'Failed to load leaderboard');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const podium = useMemo(() => rows.slice(0, 3), [rows]);

  return (
    <>
      <Navbar />
      <main className="container page-block">
        <h1 className="mono title">// leaderboard</h1>

        <div className="filter-tabs mt-16">
          <button className="btn primary small">Global</button>
          <button className="btn ghost small">Friends</button>
          <button className="btn ghost small">Weekly</button>
          <button className="btn ghost small">Monthly</button>
        </div>

        {loading ? <p className="muted mt-16">Loading…</p> : null}
        {error ? <p className="muted red mt-16">{error}</p> : null}

        {!loading && podium.length === 3 ? (
          <section className="podium mt-20">
            <article className="card pod second"><div className="circle">2</div><h3>{podium[1].name}</h3><p className="mono">{podium[1].xp} XP</p></article>
            <article className="card pod first"><div className="circle crown">1</div><h3>{podium[0].name}</h3><p className="mono">{podium[0].xp} XP</p></article>
            <article className="card pod third"><div className="circle">3</div><h3>{podium[2].name}</h3><p className="mono">{podium[2].xp} XP</p></article>
          </section>
        ) : null}

        <section className="card mt-20">
          <div className="leaderboard-row head"><span>Rank</span><span>User</span><span>Level</span><span>XP</span><span>Solved</span><span>Streak</span><span>Δ</span></div>
          {rows.slice(3).map((row, i) => (
            <LeaderboardRow
              row={{ ...row, isMe: user?.handle && row.handle === user.handle }}
              key={row.rank}
              delay={i * 40}
            />
          ))}
        </section>
      </main>
    </>
  );
}
