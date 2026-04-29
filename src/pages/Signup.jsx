import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Signup() {
  const [level, setLevel] = useState('Intermediate');
  const [langs, setLangs] = useState(['Python', 'JavaScript']);
  const allLangs = ['Python', 'C++', 'Java', 'JavaScript', 'Go', 'Rust'];
  const toggle = (lang) => setLangs((prev) => (prev.includes(lang) ? prev.filter((x) => x !== lang) : [...prev, lang]));

  return (
    <main className="auth-page">
      <section className="card auth-card">
        <div className="logo"><span>// </span>CODIFY</div>
        <h1>Create your account</h1>
        <input className="input" placeholder="Username" />
        <input className="input" placeholder="Email" type="email" />
        <input className="input" placeholder="Password" type="password" />
        <input className="input" placeholder="Confirm Password" type="password" />
        <div className="toggle-row">
          {['Beginner', 'Intermediate', 'Advanced'].map((item) => (
            <button key={item} className={`chip ${level === item ? 'selected' : ''}`} onClick={() => setLevel(item)}>{item}</button>
          ))}
        </div>
        <div className="toggle-row wrap">
          {allLangs.map((lang) => (
            <button key={lang} className={`chip ${langs.includes(lang) ? 'selected' : ''}`} onClick={() => toggle(lang)}>{lang}</button>
          ))}
        </div>
        <button className="btn primary block">Create Account</button>
        <p className="muted">Already have an account? <Link to="/login" className="inline-link">Login →</Link></p>
      </section>
    </main>
  );
}
