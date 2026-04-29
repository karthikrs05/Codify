import { useState } from 'react';
import Navbar from '../components/Navbar';
import BadgeGrid from '../components/BadgeGrid';
import HeatmapCalendar from '../components/HeatmapCalendar';
import XPBar from '../components/XPBar';
import { badges, topics, user } from '../data/mockData';

export default function Profile() {
  const [tab, setTab] = useState('Overview');

  return (
    <>
      <Navbar />
      <main className="container page-block">
        <section className="profile-banner">
          <div className="avatar large">AJ</div>
          <div>
            <h2>Arjun Kumar</h2>
            <p className="muted">@arjun_codes</p>
            <p className="muted">Kerala, India</p>
            <p className="muted">Member since January 2025</p>
          </div>
        </section>

        <section className="profile-stats mt-16">
          <div className="mono purple">Total XP 4,250</div>
          <div className="mono green">Problems 87</div>
          <div className="mono amber">Rank #142</div>
          <div className="mono red">Max Streak 18d</div>
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
              {[['Python', 45], ['C++', 35], ['Java', 20]].map(([name, pct], i) => (
                <div className="topic-row" key={name}><span>{name}</span><XPBar value={pct} delay={100 + i * 50} /><span className="mono muted">{pct}%</span></div>
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
              <div className="submission"><span>Two Sum</span><span className="difficulty easy">AC</span><span>Python</span><span>09:14</span><span>+75</span></div>
              <div className="submission"><span>Graph Path</span><span className="difficulty hard">WA</span><span>C++</span><span>12:44</span><span>+0</span></div>
              <div className="submission"><span>Word Ladder</span><span className="difficulty medium">TLE</span><span>Java</span><span>04:38</span><span>+20</span></div>
            </article>
          </section>
        )}

        {tab === 'Achievements' && <section className="mt-16"><BadgeGrid items={badges} /></section>}
        {tab === 'Activity' && <section className="card mt-16"><HeatmapCalendar /></section>}
        {tab === 'Submissions' && <section className="card mt-16"><p className="muted">Full submission timeline and filters appear here.</p></section>}
      </main>
    </>
  );
}
