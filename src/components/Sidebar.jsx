import { NavLink } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';

export default function Sidebar({ stats }) {
  const { user } = useAuth();
  const name = stats?.name || user?.username || 'User';
  const level = stats?.level || 1;
  const xp = stats?.xp || 0;
  const streak = stats?.streak || 0;

  return (
    <aside className="card left-sidebar">
      <div className="avatar">{name.slice(0, 2).toUpperCase()}</div>
      <h3>{name}</h3>
      <p className="subtle">Lv.{level} · Challenger</p>
      <hr />
      <p className="mono amber">{xp.toLocaleString()} XP</p>
      <p className="mono green">🔥 {streak} days</p>
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
