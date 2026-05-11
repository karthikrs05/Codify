import { useState } from 'react';
import Navbar from '../components/Navbar';
import { mockLeaderboard } from '../data/mock';

const tabs = ['Global', 'Weekly', 'Friends'];

export default function Leaderboard() {
  const [active, setActive] = useState('Global');

  return (
    <>
      <Navbar />
      <div className="page">
        <h1 style={{ marginBottom: 20 }}>Leaderboard</h1>

        <div className="filter-tabs">
          {tabs.map((t) => (
            <button
              key={t}
              className={`filter-tab ${active === t ? 'active' : ''}`}
              onClick={() => setActive(t)}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="card">
          <div className="lb-header">
            <span>Rank</span>
            <span>User</span>
            <span>XP</span>
            <span className="hide-mobile">Solved</span>
            <span className="hide-mobile">Streak</span>
          </div>
          {mockLeaderboard.map((entry) => {
            let rankClass = '';
            if (entry.rank === 1) rankClass = 'rank-gold';
            else if (entry.rank === 2) rankClass = 'rank-silver';
            else if (entry.rank === 3) rankClass = 'rank-bronze';

            return (
              <div key={entry.rank} className={`lb-row ${entry.isMe ? 'me' : ''}`}>
                <span className={rankClass}>#{entry.rank}</span>
                <span className="username">{entry.username}</span>
                <span className="xp">{entry.xp.toLocaleString()}</span>
                <span className="hide-mobile">{entry.solved}</span>
                <span className="hide-mobile">{entry.streak}d</span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
