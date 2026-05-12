import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { token, user: authUser } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [assessmentDone, setAssessmentDone] = useState(false);
  const [progress, setProgress] = useState(null);

  async function loadProgress() {
    try {
      const res = await fetch('/api/learning/progress', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setProgress(data);
        setAssessmentDone(data.assessment?.completed || false);
      }
    } catch (err) {
      setError('Failed to load progress');
    }
    setLoading(false);
  }

  useEffect(() => { loadProgress(); }, []);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading-page">Loading dashboard...</div>
      </>
    );
  }

  if (!assessmentDone) {
    return (
      <>
        <Navbar />
        <div className="page" style={{ maxWidth: 700, margin: '60px auto', textAlign: 'center' }}>
          <div className="card" style={{ padding: 50 }}>
            <div style={{ fontSize: 64, marginBottom: 20 }}>🚀</div>
            <h1 style={{ marginBottom: 16 }}>Welcome to Codify Arena!</h1>
            <p style={{ color: 'var(--muted)', marginBottom: 32, lineHeight: 1.8 }}>
              Before we generate your personalized learning path, we need to assess your current skill level.
              This quick assessment will help us create a roadmap tailored just for you.
            </p>

            <div className="features-grid" style={{ marginBottom: 32, gridTemplateColumns: 'repeat(3, 1fr)' }}>
              <div className="card" style={{ padding: 20 }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>📊</div>
                <h4 style={{ marginBottom: 4 }}>Skill Assessment</h4>
                <p style={{ fontSize: 13, color: 'var(--muted)' }}>5 questions across key topics</p>
              </div>
              <div className="card" style={{ padding: 20 }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>🗺️</div>
                <h4 style={{ marginBottom: 4 }}>Personalized Roadmap</h4>
                <p style={{ fontSize: 13, color: 'var(--muted)' }}>AI-generated learning path</p>
              </div>
              <div className="card" style={{ padding: 20 }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>⚡</div>
                <h4 style={{ marginBottom: 4 }}>Boss Tasks</h4>
                <p style={{ fontSize: 13, color: 'var(--muted)' }}>Prove mastery to advance</p>
              </div>
            </div>

            <Link to="/assessment" className="btn-primary" style={{ minWidth: 250, fontSize: 16, padding: '14px 32px' }}>
              Start Skill Assessment →
            </Link>
          </div>
        </div>
      </>
    );
  }

  const stats = progress?.stats || { xp: 0, level: 1, totalSolved: 0, topicsMastered: 0, bossTasksCompleted: 0 };
  const xpPct = ((stats.xp % 1000) / 1000) * 100;

  return (
    <>
      <Navbar />
      <div className="page">
        {error && (
          <div style={{ color: 'var(--red)', marginBottom: 16, padding: 12, background: 'rgba(239,68,68,0.1)', borderRadius: 8 }}>
            {error}
          </div>
        )}

        <div className="dash-stats">
          <div className="card stat-card stat-purple">
            <div className="stat-value">{stats.xp}</div>
            <div className="stat-label">Total XP</div>
          </div>
          <div className="card stat-card stat-green">
            <div className="stat-value">{stats.totalSolved}</div>
            <div className="stat-label">Solved</div>
          </div>
          <div className="card stat-card stat-amber">
            <div className="stat-value">Lv.{stats.level}</div>
            <div className="stat-label">Level</div>
          </div>
          <div className="card stat-card stat-red">
            <div className="stat-value">{stats.bossTasksCompleted}</div>
            <div className="stat-label">Boss Beaten</div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
            <span>Level {stats.level} → Level {stats.level + 1}</span>
            <span className="mono" style={{ color: 'var(--purple-light)' }}>{stats.xp % 1000} / 1000 XP</span>
          </div>
          <div className="xp-track">
            <div className="xp-fill" style={{ width: `${xpPct}%` }} />
          </div>
        </div>

        {progress?.currentTopic && (
          <div className="card" style={{ marginBottom: 24, borderLeft: '4px solid var(--purple)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ marginBottom: 4 }}>
                  {progress.hasBossTask ? '🔥 Boss Task: ' : '📚 Currently Learning: '}
                  <span style={{ color: 'var(--purple)' }}>{progress.currentTopic}</span>
                </h3>
                <p style={{ color: 'var(--muted)', fontSize: 14 }}>
                  {progress.hasBossTask
                    ? 'Complete this challenge to prove your mastery and advance!'
                    : 'Solve problems to build mastery and unlock the Boss Task.'}
                </p>
              </div>
              <Link to="/practice" className="btn-primary">
                {progress.hasBossTask ? 'Fight Boss →' : 'Start Practicing →'}
              </Link>
            </div>
          </div>
        )}

        {progress?.roadmap && progress.roadmap.length > 0 && (
          <>
            <p className="section-title">// your roadmap</p>
            <div className="card" style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {progress.roadmap.map((item, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      padding: 12,
                      borderRadius: 8,
                      background: item.topic === progress.currentTopic ? 'rgba(124,58,237,0.15)' : 'transparent',
                      border: item.topic === progress.currentTopic ? '1px solid rgba(124,58,237,0.3)' : 'none',
                    }}
                  >
                    <span
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 600,
                        fontSize: 13,
                        background: item.completed ? 'var(--green)' : (item.topic === progress.currentTopic ? 'var(--purple)' : 'var(--bg-card)'),
                        color: 'white',
                      }}
                    >
                      {item.completed ? '✓' : i + 1}
                    </span>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ marginBottom: 2, opacity: item.completed ? 0.6 : 1, textDecoration: item.completed ? 'line-through' : 'none' }}>
                        {item.topic}
                      </h4>
                      <p style={{ fontSize: 13, color: 'var(--muted)' }}>
                        {item.completed ? 'Completed!' : item.reason || `~${item.estimatedProblems} problems`}
                      </p>
                    </div>
                    {item.topic === progress.currentTopic && (
                      <span className="tag" style={{ background: 'rgba(124,58,237,0.2)', color: 'var(--purple-light)' }}>Current</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {progress?.topicProgress && progress.topicProgress.length > 0 && (
          <>
            <p className="section-title">// topic progress</p>
            <div className="card">
              <div className="topic-list">
                {progress.topicProgress
                  .filter(t => t.solvedCount > 0 || t.attemptedCount > 0 || t.masteryScore > 0)
                  .map(t => (
                    <div className="topic-row" key={t.name}>
                      <span>{t.name}</span>
                      <div className="xp-track" style={{ flex: 1, maxWidth: 200 }}>
                        <div className="xp-fill" style={{ width: `${t.masteryScore}%`, background: t.isMastered ? 'var(--green)' : undefined }} />
                      </div>
                      <span className="pct">{t.masteryScore}%</span>
                      {t.bossTaskCompleted && <span style={{ color: 'var(--green)', fontSize: 14 }}>🏆</span>}
                    </div>
                  ))}
                {progress.topicProgress.filter(t => t.solvedCount > 0 || t.attemptedCount > 0).length === 0 && (
                  <p style={{ color: 'var(--muted)', textAlign: 'center', padding: 20 }}>No progress yet. Start solving problems!</p>
                )}
              </div>
            </div>
          </>
        )}

        {progress?.recentProblems && progress.recentProblems.length > 0 && (
          <>
            <p className="section-title" style={{ marginTop: 24 }}>// recent solves</p>
            <div>
              {progress.recentProblems.map((p, i) => (
                <div key={i} className="card" style={{ marginBottom: 8, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <h4 style={{ marginBottom: 4 }}>{p.title}</h4>
                    <p style={{ fontSize: 13, color: 'var(--muted)' }}>
                      {p.topic} • {new Date(p.solvedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span style={{ color: 'var(--green)', fontWeight: 600 }}>+{p.xpEarned} XP</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
