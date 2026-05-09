import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { useEmailDomainValidation } from '../auth/useEmailDomainValidation';

export default function Signup() {
  const { isAuthed, signup } = useAuth();
  const navigate = useNavigate();
  const [level, setLevel] = useState('Intermediate');
  const [langs, setLangs] = useState(['Python', 'JavaScript']);
  const allLangs = ['Python', 'C++', 'Java', 'JavaScript', 'Go', 'Rust'];
  const toggle = (lang) => setLangs((prev) => (prev.includes(lang) ? prev.filter((x) => x !== lang) : [...prev, lang]));

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setSubmitting(true);
    try {
      await signup({ username, email, password });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err?.data?.error || 'Signup failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <form className="card auth-card" onSubmit={onSubmit}>
        <div className="logo"><span>// </span>CODIFY</div>
        <h1>Create your account</h1>
        <input className="input" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
        <input className="input" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        {emailCheck.status === 'checking' ? <p className="muted">Checking email domain…</p> : null}
        {emailCheck.status === 'done' && emailCheck.ok ? <p className="muted green">Email domain looks valid</p> : null}
        {emailCheck.status === 'done' && emailCheck.ok === false ? <p className="muted red">Email domain looks invalid</p> : null}
        <input className="input" placeholder="Password (min 8 chars)" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <input className="input" placeholder="Confirm Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
        <div className="toggle-row">
          {['Beginner', 'Intermediate', 'Advanced'].map((item) => (
            <button key={item} type="button" className={`chip ${level === item ? 'selected' : ''}`} onClick={() => setLevel(item)}>{item}</button>
          ))}
        </div>
        <div className="toggle-row wrap">
          {allLangs.map((lang) => (
            <button key={lang} type="button" className={`chip ${langs.includes(lang) ? 'selected' : ''}`} onClick={() => toggle(lang)}>{lang}</button>
          ))}
        </div>
        {error ? <p className="muted red">{error}</p> : null}
        <button className="btn primary block" disabled={submitting || emailCheck.status === 'checking' || emailCheck.ok === false}>
          {submitting ? 'Creating…' : 'Create Account'}
        </button>
        <p className="muted">Already have an account? <Link to="/login" className="inline-link">Login →</Link></p>
      </form>
    </main>
  );
}
