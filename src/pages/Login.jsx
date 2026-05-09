import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { useEmailDomainValidation } from '../auth/useEmailDomainValidation';

export default function Login() {
  const { isAuthed, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const emailCheck = useEmailDomainValidation(email);

  if (isAuthed) return <Navigate to="/dashboard" replace />;

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    if (emailCheck.status === 'done' && emailCheck.ok === false) {
      setError('Email domain looks invalid');
      return;
    }
    setSubmitting(true);
    try {
      await login({ email, password });
      const next = location.state?.from || '/dashboard';
      navigate(next, { replace: true });
    } catch (err) {
      setError(err?.data?.error || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <form className="card auth-card" onSubmit={onSubmit}>
        <div className="logo"><span>// </span>CODIFY</div>
        <h1>Welcome back</h1>
        <p className="muted">Continue your streak</p>
        <input className="input" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        {emailCheck.status === 'checking' ? <p className="muted">Checking email domain…</p> : null}
        {emailCheck.status === 'done' && emailCheck.ok ? <p className="muted green">Email domain looks valid</p> : null}
        {emailCheck.status === 'done' && emailCheck.ok === false ? <p className="muted red">Email domain looks invalid</p> : null}
        <input className="input" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error ? <p className="muted red">{error}</p> : null}
        <button className="btn primary block" disabled={submitting || emailCheck.status === 'checking' || emailCheck.ok === false}>
          {submitting ? 'Logging in…' : 'Login'}
        </button>
        <div className="divider">or</div>
        <button className="btn ghost block" type="button" disabled title="Coming soon">GitHub</button>
        <p className="muted">Don't have an account? <Link to="/signup" className="inline-link">Sign Up →</Link></p>
      </form>
    </main>
  );
}
