import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';

export default function Navbar() {
  const { isAuthed, logout } = useAuth();

  const navItems = isAuthed
    ? [
        ['/', 'Home'],
        ['/dashboard', 'Dashboard'],
        ['/problem/1', 'Problems'],
        ['/leaderboard', 'Leaderboard'],
        ['/profile', 'Profile']
      ]
    : [
        ['/', 'Home'],
        ['/leaderboard', 'Leaderboard']
      ];

  return (
    <header className="top-nav">
      <div className="container nav-inner">
        <Link to="/" className="logo"><span>// </span>CODIFY</Link>
        <nav className="main-nav">
          {navItems.map(([to, label]) => (
            <NavLink key={to} to={to} className={({ isActive }) => `nav-pill ${isActive ? 'active' : ''}`}>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="nav-actions">
          {isAuthed ? (
            <button className="btn ghost" onClick={logout}>Logout</button>
          ) : (
            <>
              <Link to="/login" className="btn ghost">Login</Link>
              <Link to="/signup" className="btn primary">Start now</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
