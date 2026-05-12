import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';

export default function VerifyEmail() {
  const { user, token, login } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // If not logged in, go to login
  if (!user) return <Navigate to="/login" replace />;
  
  // If already authenticated, go to dashboard
  if (user.authenticated === 1) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (code.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ code })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      // Update user in context
      login(token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="landing-container">
      <div className="glass-card" style={{ maxWidth: '450px', width: '90%', padding: '3rem', textAlign: 'center' }}>
        <div className="logo-section">
          <div className="logo-icon">📧</div>
          <h1 className="logo-text">Verify Email</h1>
        </div>
        
        <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '2rem' }}>
          We've sent a 6-digit verification code to <strong>{user.email}</strong>. 
          Please check your inbox (and spam folder) and enter it below.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="text"
              placeholder="000000"
              maxLength="6"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              required
              style={{
                textAlign: 'center',
                letterSpacing: '0.5rem',
                fontSize: '1.5rem',
                fontWeight: 'bold'
              }}
            />
          </div>

          {error && <p style={{ color: '#ff4444', marginTop: '1rem', fontSize: '0.9rem' }}>{error}</p>}

          <button 
            type="submit" 
            className="hero-button" 
            style={{ width: '100%', marginTop: '2rem' }}
            disabled={loading || code.length !== 6}
          >
            {loading ? 'Verifying...' : 'Verify Now'}
          </button>
        </form>

        <div style={{ marginTop: '2rem' }}>
          <button 
            onClick={() => navigate('/login')} 
            className="secondary-button"
            style={{ fontSize: '0.8rem', opacity: 0.7 }}
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}
