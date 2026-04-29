import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import XPBar from '../components/XPBar';
import ProblemCard from '../components/ProblemCard';
import StreakCalendar from '../components/StreakCalendar';
import CountdownTimer from '../components/CountdownTimer';
import { badges, leaderboard, problems, topics, user } from '../data/mockData';

export default function Dashboard() {
  return (
    <>
      <Navbar />
      <main className="container dash-layout">
        <Sidebar />

        <section className="main-pane">
          <article className="card">
            <div className="row-between"><span>Level 8 → Level 9</span><span className="mono purple">4,250 / 5,000 XP</span></div>
            <XPBar value={85} delay={100} />
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
                <h3>Maximum Subarray</h3>
                <p className="muted">Difficulty: Medium</p>
              </div>
              <CountdownTimer initial={31335} />
              <span className="pill amber">+200 XP Bonus</span>
              <button className="btn success">Solve Now →</button>
            </div>
          </article>

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
          <article className="card">
            <p className="section-tag">// this week</p>
            <div className="lb-mini mt-12">
              {leaderboard.slice(0, 5).map((r) => (
                <div className={`mini-row ${r.name === user.name ? 'me' : ''}`} key={r.rank}>
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
