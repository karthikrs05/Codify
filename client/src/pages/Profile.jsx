import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

function generateHeatmapFromData(solvedProblems = []) {
  const today = new Date();
  const heatmap = Array.from({ length: 364 }, () => 0);

  const activityByDate = {};
  solvedProblems.forEach(p => {
    const date = new Date(p.solvedAt || p.createdAt);
    const key = date.toDateString();
    activityByDate[key] = (activityByDate[key] || 0) + 1;
  });

  for (let i = 0; i < 364; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - (363 - i));
    const key = date.toDateString();
    const count = activityByDate[key] || 0;
    heatmap[i] = count === 0 ? 0 : Math.min(4, Math.ceil(count / 2));
  }

  return heatmap;
}

function calculateStreak(solvedProblems = []) {
  if (!solvedProblems.length) return { current: 0, max: 0, activeToday: false };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dates = [...new Set(
    solvedProblems.map(p => {
      const d = new Date(p.solvedAt || p.createdAt);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    })
  )].sort((a, b) => b - a);

  let currentStreak = 0;
  let maxStreak = 0;
  let tempStreak = 0;
  let activeToday = false;

  const sortedDates = dates.map(t => new Date(t));

  let checkDate = new Date(today);
  checkDate.setHours(0, 0, 0, 0);

  for (let i = 0; i < sortedDates.length; i++) {
    const d = sortedDates[i];
    const diffDays = Math.floor((checkDate.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      activeToday = true;
      currentStreak++;
      tempStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (diffDays === 1) {
      currentStreak++;
      tempStreak++;
      checkDate = new Date(d);
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      maxStreak = Math.max(maxStreak, tempStreak);
      if (i === 0) currentStreak = 0;
      break;
    }
  }

  maxStreak = Math.max(maxStreak, tempStreak);

  return { current: currentStreak, max: maxStreak, activeToday };
}

export default function Profile() {
  const { token, logout } = useAuth();
  const [user, setUser] = useState(null);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [userRes, progressRes] = await Promise.all([
          fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/learning/progress', { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (userRes.ok) {
          const data = await userRes.json();
          setUser(data.user);
        }
        if (progressRes.ok) {
          const data = await progressRes.json();
          setProgress(data);
        }
      } catch (err) {
        setError('Failed to load profile');
      }
      setLoading(false);
    }
    if (token) loadData();
  }, [token]);

  const allProblems = progress?.solvedProblemsForHeatmap || [];
  const recentProblems = progress?.recentProblems || [];
  const heatmap = generateHeatmapFromData(allProblems);
  const streak = calculateStreak(allProblems);
  const totalActiveDays = heatmap.filter(v => v > 0).length;

  const stats = progress?.stats || { xp: 0, level: 1, totalSolved: 0, topicsMastered: 0, bossTasksCompleted: 0 };
  const xpPct = ((stats.xp % 1000) / 1000) * 100;

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading-page">Loading profile...</div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="page"><p className="error">{error}</p></div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="page" style={{ maxWidth: 900 }}>
        <div className="profile-header">
          <div className="profile-avatar" style={{ width: 80, height: 80, fontSize: 32 }}>
            {user?.username?.slice(0, 2).toUpperCase()}
          </div>
          <div className="profile-info">
            <h1 style={{ marginBottom: 4 }}>{user?.username}</h1>
            <p style={{ marginBottom: 8 }}>{user?.email}</p>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <span className="tag" style={{ background: 'rgba(124,58,237,0.2)', color: 'var(--purple-light)' }}>
                Level {stats.level}
              </span>
              {streak.current > 0 && (
                <span className="tag" style={{ background: 'rgba(245,158,11,0.2)', color: 'var(--amber)' }}>
                  🔥 {streak.current} day streak
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
            <span>Level {stats.level} → Level {stats.level + 1}</span>
            <span className="mono" style={{ color: 'var(--purple-light)' }}>{stats.xp} XP total</span>
          </div>
          <div className="xp-track">
            <div className="xp-fill" style={{ width: `${xpPct}%` }} />
          </div>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 8 }}>
            {stats.xp % 1000} / 1000 XP to next level
          </p>
        </div>

        <div className="profile-stats">
          <div className="card stat-card stat-purple">
            <div className="stat-value">{stats.xp}</div>
            <div className="stat-label">Total XP</div>
          </div>
          <div className="card stat-card stat-green">
            <div className="stat-value">{stats.totalSolved}</div>
            <div className="stat-label">Problems Solved</div>
          </div>
          <div className="card stat-card stat-amber">
            <div className="stat-value">{streak.current}</div>
            <div className="stat-label">Current Streak</div>
          </div>
          <div className="card stat-card stat-red">
            <div className="stat-value">{streak.max}</div>
            <div className="stat-label">Best Streak</div>
          </div>
        </div>

        <div className="dash-grid" style={{ marginTop: 24, marginBottom: 24 }}>
          <div className="card">
            <h3 style={{ marginBottom: 16 }}>Activity</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
              <div style={{ textAlign: 'center', padding: 16, background: 'var(--bg-card)', borderRadius: 8 }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--purple-light)' }}>{totalActiveDays}</div>
                <div style={{ fontSize: 13, color: 'var(--muted)' }}>Active Days</div>
              </div>
              <div style={{ textAlign: 'center', padding: 16, background: 'var(--bg-card)', borderRadius: 8 }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--green)' }}>{stats.bossTasksCompleted}</div>
                <div style={{ fontSize: 13, color: 'var(--muted)' }}>Bosses Defeated</div>
              </div>
              <div style={{ textAlign: 'center', padding: 16, background: 'var(--bg-card)', borderRadius: 8 }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--amber)' }}>{stats.topicsMastered}</div>
                <div style={{ fontSize: 13, color: 'var(--muted)' }}>Topics Mastered</div>
              </div>
              <div style={{ textAlign: 'center', padding: 16, background: 'var(--bg-card)', borderRadius: 8 }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: streak.activeToday ? 'var(--green)' : 'var(--red)' }}>
                  {streak.activeToday ? '✓' : '○'}
                </div>
                <div style={{ fontSize: 13, color: 'var(--muted)' }}>
                  {streak.activeToday ? 'Solved Today' : 'Not Solved Today'}
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: 16 }}>Topic Progress</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {progress?.topicProgress?.slice(0, 6).map((t, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 13, minWidth: 100 }}>{t.name}</span>
                  <div className="xp-track" style={{ flex: 1, height: 8 }}>
                    <div
                      className="xp-fill"
                      style={{
                        width: `${t.masteryScore}%`,
                        background: t.bossTaskCompleted ? 'var(--green)' : t.isMastered ? 'var(--amber)' : undefined,
                      }}
                    />
                  </div>
                  <span style={{ fontSize: 13, color: 'var(--muted)', minWidth: 36, textAlign: 'right' }}>
                    {t.masteryScore}%
                  </span>
                  {t.bossTaskCompleted && <span>🏆</span>}
                </div>
              ))}
              {(!progress?.topicProgress || progress.topicProgress.filter(t => t.masteryScore > 0 || t.solvedCount > 0).length === 0) && (
                <p style={{ color: 'var(--muted)', fontSize: 14, textAlign: 'center', padding: 20 }}>
                  Start solving problems to see your progress!
                </p>
              )}
            </div>
          </div>
        </div>

        <p className="section-title">// activity over the last year</p>
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="heatmap-grid" style={{ minHeight: 110 }}>
            {heatmap.map((level, i) => (
              <div key={i} className={`heat-cell heat-${level}`} title={`Level ${level}`} />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
            <p style={{ color: 'var(--muted)', fontSize: 13 }}>
              {totalActiveDays} active days out of 364
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--muted)' }}>
              <span>Less</span>
              {[0, 1, 2, 3, 4].map(l => (
                <div key={l} className={`heat-cell heat-${l}`} style={{ width: 12, height: 12 }} />
              ))}
              <span>More</span>
            </div>
          </div>
        </div>

        {recentProblems.length > 0 && (
          <>
            <p className="section-title">// recent activity</p>
            <div style={{ marginBottom: 24 }}>
              {recentProblems.map((p, i) => (
                <div key={i} className="card" style={{ marginBottom: 8, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <h4 style={{ marginBottom: 4 }}>{p.title}</h4>
                    <p style={{ fontSize: 13, color: 'var(--muted)' }}>
                      {p.topic || 'Practice'} • {new Date(p.solvedAt || p.createdAt).toLocaleDateString()} • {p.attempts || 1} attempt(s)
                    </p>
                  </div>
                  <span style={{ color: 'var(--green)', fontWeight: 600 }}>+{p.xpEarned || 75} XP</span>
                </div>
              ))}
            </div>
          </>
        )}

        <button className="btn-ghost" onClick={logout}>Logout</button>
      </div>
    </>
  );
}
