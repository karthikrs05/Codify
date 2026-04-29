import Navbar from '../components/Navbar';
import LeaderboardRow from '../components/LeaderboardRow';
import { leaderboard } from '../data/mockData';

export default function Leaderboard() {
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

        <section className="podium mt-20">
          <article className="card pod second"><div className="circle">2</div><h3>Priya S.</h3><p className="mono">8410 XP</p></article>
          <article className="card pod first"><div className="circle crown">1</div><h3>Rahul K.</h3><p className="mono">9820 XP</p></article>
          <article className="card pod third"><div className="circle">3</div><h3>Aarav M.</h3><p className="mono">7990 XP</p></article>
        </section>

        <section className="card mt-20">
          <div className="leaderboard-row head"><span>Rank</span><span>User</span><span>Level</span><span>XP</span><span>Solved</span><span>Streak</span><span>Δ</span></div>
          {leaderboard.slice(3).map((row, i) => <LeaderboardRow row={row} key={row.rank} delay={i * 40} />)}
        </section>
      </main>
    </>
  );
}
