import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const features = [
  ['🧠', 'Adaptive Engine', 'Problems that adjust to your skill level'],
  ['⚡', 'XP & Levels', 'Earn XP, rank up, unlock new tiers'],
  ['</>', 'Code Editor', 'Multi-language editor with real-time feedback'],
  ['🗺️', 'Learning Paths', 'Topic-wise structured progression'],
  ['🏆', 'Leaderboard', 'Compete with top coders and climb fast'],
  ['🔥', 'Daily Challenges', 'Streak rewards and bonus XP every day']
];

export default function Landing() {
  return (
    <>
      <Navbar />
      <main className="container page-block">
        <section className="hero-card card">
          <div className="hero-left">
            <div className="live-pill"><span className="dot" />10,000+ coders active this week</div>
            <h1>Code Smarter.<br /><span className="gradient typing">Level Up Faster.</span></h1>
            <p className="muted">An adaptive platform that learns how you think — harder problems when you're ready, guided paths when you need them.</p>
            <div className="btn-row">
              <Link to="/signup" className="btn primary">Start for free →</Link>
              <button className="btn ghost">Watch demo</button>
            </div>
          </div>
          <div className="hero-floats">
            <div className="float-card"><strong className="mono green">4.2k Problems</strong></div>
            <div className="float-card"><strong className="mono purple">12 Languages</strong></div>
            <div className="float-card"><strong className="mono amber">#142 Your Rank</strong></div>
          </div>
        </section>

        <section className="stats-row mt-20">
          <article className="card stat purple-top"><p>Global Rank</p><strong className="mono purple">#142</strong></article>
          <article className="card stat green-top"><p>Daily Streak</p><strong className="mono green">18 days</strong></article>
          <article className="card stat amber-top"><p>Total XP</p><strong className="mono amber">4,250</strong></article>
          <article className="card stat red-top"><p>Problems Solved</p><strong className="mono red">87</strong></article>
        </section>

        <section className="mt-28">
          <p className="section-tag">// features</p>
          <div className="features-grid mt-12">
            {features.map(([icon, title, desc]) => (
              <article className="card feature" key={title}>
                <span className="feature-icon">{icon}</span>
                <h3>{title}</h3>
                <p className="muted">{desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-28">
          <p className="section-tag">// about</p>
          <article className="card">
            <h2>Built for consistency, not cramming</h2>
            <p className="muted">
              Codify Arena helps you build real problem-solving momentum with daily streaks, guided paths, and
              adaptive difficulty that ramps up as you improve.
            </p>
            <div className="btn-row mt-12">
              <Link to="/signup" className="btn primary">Start now →</Link>
              <Link to="/login" className="btn ghost">I already have an account</Link>
            </div>
          </article>
        </section>

        <section className="mt-28">
          <div className="steps-line">
            {[['1', 'Sign Up & Set Your Level'], ['2', 'Solve Adaptive Problems'], ['3', 'Level Up & Earn Rewards']].map(([n, t]) => (
              <div className="step" key={n}>
                <span className="step-num mono">{n}</span>
                <h3>{t}</h3>
                <p className="muted">Personalized milestones tailored to your pace.</p>
              </div>
            ))}
          </div>
        </section>

        <section className="cta-banner mt-28">
          <div>
            <h2>Ready to conquer?</h2>
            <p className="muted">Join thousands of builders leveling up daily.</p>
          </div>
          <Link to="/signup" className="btn light">Start Coding Free →</Link>
        </section>
      </main>
      <footer className="footer">
        <div className="container footer-inner">
          <div className="logo"><span>// </span>CODIFY</div>
          <div className="footer-links"><Link to="/">Home</Link><Link to="/dashboard">Dashboard</Link><Link to="/leaderboard">Leaderboard</Link></div>
          <div className="muted">© 2025 Codify Arena</div>
        </div>
      </footer>
    </>
  );
}
