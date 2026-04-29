import { Link } from 'react-router-dom';

export default function Login() {
  return (
    <main className="auth-page">
      <section className="card auth-card">
        <div className="logo"><span>// </span>CODIFY</div>
        <h1>Welcome back</h1>
        <p className="muted">Continue your streak</p>
        <input className="input" placeholder="Email" type="email" />
        <input className="input" placeholder="Password" type="password" />
        <button className="btn primary block">Login</button>
        <div className="divider">or</div>
        <button className="btn ghost block">GitHub</button>
        <p className="muted">Don't have an account? <Link to="/signup" className="inline-link">Sign Up →</Link></p>
      </section>
    </main>
  );
}
