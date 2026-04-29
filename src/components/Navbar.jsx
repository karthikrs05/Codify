import { Link, NavLink } from 'react-router-dom';

export default function Navbar() {
  const navItems = [
    ['/', 'Home'],
    ['/dashboard', 'Dashboard'],
    ['/problem/1', 'Problems'],
    ['/leaderboard', 'Leaderboard'],
    ['/profile', 'Profile']
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
          <Link to="/login" className="btn ghost">Login</Link>
          <Link to="/signup" className="btn primary">Sign Up</Link>
        </div>
      </div>
    </header>
  );
}
