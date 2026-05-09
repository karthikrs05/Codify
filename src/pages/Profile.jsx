import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import BadgeGrid from '../components/BadgeGrid';
import HeatmapCalendar from '../components/HeatmapCalendar';
import XPBar from '../components/XPBar';
import { badges as badgeCatalog } from '../data/mockData';
import { apiFetch } from '../auth/api';
import { useAuth } from '../auth/AuthProvider';

export default function Profile() {
  const [tab, setTab] = useState('Overview');
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [handle, setHandle] = useState('');
  const [location, setLocation] = useState('');

  async function load() {
    setError('');
    setLoading(true);
    try {
      const res = await apiFetch('/api/profile/me', { token });
      setData(res);
      setHandle(res.user.handle || '');
      setLocation(res.user.location || '');
    } catch (e) {
      setError(e?.data?.error || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function saveProfile() {
    setError('');
    try {
      const res = await apiFetch('/api/profile/me', {
        token,
        method: 'PATCH',
        body: JSON.stringify({ handle, location })
      });
      setData((prev) => (prev ? { ...prev, user: { ...prev.user, ...res.user } } : prev));
      setEditing(false);
    } catch (e) {
      setError(e?.data?.error || 'Failed to save');
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="container page-block"><p className="muted">Loading profile…</p></main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <main className="container page-block">
          <p className="muted red">{error}</p>
          <button className="btn ghost" onClick={load}>Retry</button>
        </main>
      </>
    );
  }

  const user = data?.user;
  const topics = data?.topicMastery || [];
  const recent = data?.recentSubmissions || [];

  return (
    <>
      <Navbar />
      <main className="container page-block">
        <section className="profile-banner">
          <div className="avatar large">{(user?.name || 'U').slice(0, 2).toUpperCase()}</div>
          <div>
            <h2>{user?.name || 'User'}</h2>
            {editing ? (
              <>
                <input className="input" value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="handle (letters/numbers/_)" />
                <input className="input" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="location" />
                <div className="btn-row">
                  <button className="btn primary" onClick={saveProfile}>Save</button>
                  <button className="btn ghost" onClick={() => setEditing(false)}>Cancel</button>
                </div>
              </>
            ) : (
              <>
                <p className="muted">@{user?.handle || 'handle'}</p>
                <p className="muted">{user?.location || '—'}</p>
                <p className="muted">Member since {user?.joinedAt ? new Date(user.joinedAt).toLocaleString(undefined, { month: 'long', year: 'numeric' }) : '—'}</p>
                <button className="btn ghost small" onClick={() => setEditing(true)}>Edit profile</button>
              </>
            )}
          </div>
        </section>

        <section className="profile-stats mt-16">
          <div className="mono purple">Total XP {user?.xp ?? 0}</div>
          <div className="mono green">Problems {user?.solved ?? 0}</div>
          <div className="mono amber">Level {user?.level ?? 1}</div>
          <div className="mono red">Max Streak {user?.maxStreak ?? 0}d</div>
        </section>

        <div className="tabs mt-20">
          {['Overview', 'Achievements', 'Activity', 'Submissions'].map((t) => (
            <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t}</button>
          ))}
        </div>

        {tab === 'Overview' && (
          <section className="overview-grid mt-16">
            <article className="card">
              <h3>Language Breakdown</h3>
              {(data?.languageBreakdown || []).map((row, i) => (
                <div className="topic-row" key={row.name}><span>{row.name}</span><XPBar value={row.pct} delay={100 + i * 50} /><span className="mono muted">{row.pct}%</span></div>
              ))}
            </article>
            <article className="card">
              <h3>Topic Mastery</h3>
              {topics.map((t, i) => (
                <div className="topic-row" key={t.name}><span>{t.name}</span><XPBar value={t.pct} delay={100 + i * 50} /><span className="mono muted">{t.pct}%</span></div>
              ))}
            </article>
            <article className="card span-2">
              <h3>Recent Submissions</h3>
              <div className="submission head"><span>Problem</span><span>Verdict</span><span>Lang</span><span>Time</span><span>XP</span></div>
              {recent.length === 0 ? <p className="muted">No submissions yet.</p> : null}
              {recent.slice(0, 6).map((s) => (
                <div className="submission" key={`${s.problemTitle}-${s.createdAt}`}>
                  <span>{s.problemTitle}</span>
                  <span className={`difficulty ${s.verdict === 'AC' ? 'easy' : s.verdict === 'WA' ? 'hard' : 'medium'}`}>{s.verdict}</span>
                  <span>{s.language}</span>
                  <span>{s.time || '—'}</span>
                  <span>{s.xp ? `+${s.xp}` : '+0'}</span>
                </div>
              ))}
            </article>
          </section>
        )}

        {tab === 'Achievements' && <section className="mt-16"><BadgeGrid items={badgeCatalog} /></section>}
        {tab === 'Activity' && <section className="card mt-16"><HeatmapCalendar /></section>}
        {tab === 'Submissions' && <section className="card mt-16"><p className="muted">Full submission timeline and filters appear here.</p></section>}
      </main>
    </>
  );
}
