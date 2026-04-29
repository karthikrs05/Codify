import { NavLink } from 'react-router-dom';
import { user } from '../data/mockData';

export default function Sidebar() {
  return (
    <aside className="card left-sidebar">
      <div className="avatar">AJ</div>
      <h3>{user.name}</h3>
      <p className="subtle">Lv.{user.level} · Challenger</p>
      <hr />
      <p className="mono amber">{user.xp.toLocaleString()} XP</p>
      <p className="mono purple">#{user.rank} Global</p>
      <p className="mono green">🔥 {user.streak} days</p>
      <hr />
      <nav className="side-nav">
        <NavLink to="/dashboard" className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`}>Dashboard</NavLink>
        <NavLink to="/problem/1" className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`}>Problems</NavLink>
        <NavLink to="/leaderboard" className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`}>Leaderboard</NavLink>
        <a className="side-link" href="#">Challenges</a>
        <NavLink to="/profile" className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`}>Profile</NavLink>
      </nav>
    </aside>
  );
}
