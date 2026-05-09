import { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import XPBar from '../components/XPBar';
import ProblemCard from '../components/ProblemCard';
import StreakCalendar from '../components/StreakCalendar';
import CountdownTimer from '../components/CountdownTimer';
import { useAuth } from '../auth/AuthProvider';
import { apiFetch } from '../auth/api';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { token, user: authUser } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setError('');
      setLoading(true);
      try {
        const res = await apiFetch('/api/dashboard', { token });
        if (!cancelled) setData(res);
      } catch (e) {
        if (!cancelled) setError(e?.data?.error || 'Failed to load dashboard');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (token) load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="container page-block"><p className="muted">Loading dashboard…</p></main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <main className="container page-block"><p className="muted red">{error}</p></main>
      </>
    );
  }

  const u = data?.user;
  const problems = data?.continueLearning || [];
  const topics = data?.topics || [];
  const leaderboard = data?.leaderboardMini || [];
  const badges = data?.badges || [];
  const assigned = data?.assignedProblem;
  const contest = data?.contest;

  const assignedMeta = useMemo(() => {
    if (!assigned) return null;
    return {
      title: assigned.title,
      pill: assigned.mode === 'boss' ? 'BOSS' : assigned.mode === 'adaptive' ? 'ADAPTIVE' : 'FIXED'
    };
  }, [assigned]);

  return (
    <>
      <Navbar />
      <main className="container dash-layout">
        <Sidebar stats={u} />

        <section className="main-pane">
          <article className="card">
            <div className="row-between">
              <span>Level {u?.level ?? 1} → Level {(u?.level ?? 1) + 1}</span>
              <span className="mono purple">{u?.xp ?? 0} / {u?.nextLevelXp ?? 500} XP</span>
            </div>
            <XPBar value={u?.progressPct ?? 0} delay={100} />
          </article>

          <section className="mt-20">
            <p className="section-tag">// continue learning</p>
            <div className="problem-grid mt-12">
              {problems.slice(0, 3).map((p, i) => <ProblemCard key={p.id} problem={p} delay={i * 80} />)}
            </div>
          </section>

          <article className="card daily-card mt-20">
            <div className="row-between wrap gap-12">
              <div>
                <p className="section-tag amber">// DAILY CHALLENGE</p>
                <h3>{data?.dailyChallenge?.title || 'Daily Challenge'}</h3>
                <p className="muted">Difficulty: {data?.dailyChallenge?.difficulty || 'Medium'}</p>
              </div>
              <CountdownTimer initial={data?.dailyChallenge?.endsInSeconds || 3600} />
              <span className="pill amber">+{data?.dailyChallenge?.bonusXp || 200} XP Bonus</span>
              <button className="btn success" onClick={() => navigate('/problem/1')}>Solve Now →</button>
            </div>
          </article>

          {assigned ? (
            <article className="card mt-20">
              <div className="row-between wrap gap-12">
                <div>
                  <p className="section-tag">// assigned next</p>
                  <h3>{assignedMeta?.title}</h3>
                  <p className="muted">Mode: {assignedMeta?.pill} · Difficulty: {assigned.difficulty} · +{assigned.xp} XP</p>
                </div>
                <button className="btn primary" onClick={() => navigate('/problem/1')}>Open →</button>
              </div>
            </article>
          ) : null}

          <article className="card mt-20">
            <p className="section-tag">// skill progress</p>
            <div className="topic-list mt-12">
              {topics.map((t, i) => (
                <div className="topic-row" key={t.name}>
                  <span>{t.name}</span>
                  <XPBar value={t.pct} delay={100 + i * 50} />
                  <span className="mono muted">{t.pct}%</span>
                </div>
              ))}
            </div>
          </article>

          <article className="card mt-20">
            <h3>Streak Calendar</h3>
            <StreakCalendar />
          </article>
        </section>

        <aside className="right-pane">
          {contest ? (
            <article className="card">
              <p className="section-tag">// today’s contest</p>
              <div className="mt-12">
                <div className="row-between"><span className="muted">Score</span><span className="mono purple">{contest.score}</span></div>
                <div className="row-between"><span className="muted">Solved</span><span className="mono green">{contest.solved}</span></div>
              </div>
            </article>
          ) : null}

          <article className="card">
            <p className="section-tag">// this week</p>
            <div className="lb-mini mt-12">
              {leaderboard.slice(0, 5).map((r) => (
                <div className={`mini-row ${r.name === (authUser?.username || '') ? 'me' : ''}`} key={r.rank}>
                  <span className={`mono ${r.rank < 4 ? 'amber' : 'muted'}`}>#{r.rank}</span>
                  <span className="mini-avatar">{r.name.slice(0, 2).toUpperCase()}</span>
                  <span>{r.name}</span>
                  <span className="mono purple">{r.xp}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="card mt-20">
            <p className="section-tag">// badges</p>
            <div className="badge-grid compact mt-12">
              {badges.slice(0, 6).map((b) => (
                <div className={`badge-card ${b.earned ? 'earned' : 'locked'}`} key={b.id}>
                  <div className="badge-icon">{b.icon}</div>
                  <div className="badge-name">{b.name}</div>
                </div>
              ))}
            </div>
          </article>
        </aside>
      </main>
    </>
  );
}
