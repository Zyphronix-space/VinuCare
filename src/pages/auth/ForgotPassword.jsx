import { useState } from 'react';
import '../../styles/auth.css';
import { PawIcon } from '../../components/ui/Icons';
import { API_BASE_URL } from '../../config/api';

export default function ForgotPassword({ onNavigate }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [sent, setSent] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setApiError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) { setApiError(data.message || 'Something went wrong'); setLoading(false); return; }
      setSent(true);
      setLoading(false);
    } catch {
      setApiError('Cannot connect to server. Make sure the backend is running.');
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div id="page-forgot-password" className="page active">
        <div className="auth-wrap">
          <div className="auth-box" style={{ textAlign: 'center', alignItems: 'center' }}>
            <div className="auth-header">
              <div className="auth-logo" onClick={() => onNavigate('home')} style={{ color: '#fff' }}>
                <PawIcon size={24} />
              </div>
              <h1>Check your email</h1>
              <p>
                If an account with <strong>{email}</strong> exists, we've sent a link to reset your password.
              </p>
            </div>
            <button className="auth-btn-primary" onClick={() => onNavigate('login')}>
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="page-forgot-password" className="page active">
      <div className="auth-wrap">
        <div className="auth-box">
          <div className="auth-header">
            <div className="auth-logo" onClick={() => onNavigate('home')} style={{ color: '#fff' }}>
              <PawIcon size={24} />
            </div>
            <h1>Reset your password</h1>
            <p>Enter your email and we'll send you a reset link.</p>
          </div>

          {apiError && <div className="auth-api-error">{apiError}</div>}

          <form onSubmit={submit}>
            <div className="auth-field">
              <label>Email address</label>
              <input
                type="email"
                className="auth-input"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <button className="auth-btn-primary" type="submit" disabled={loading} style={{ marginTop: 16 }}>
              {loading ? <span className="auth-spinner" /> : null}
              {loading ? 'Sending…' : 'Send Reset Link'}
            </button>
          </form>

          <p className="auth-switch">
            Remembered your password?{' '}
            <button type="button" onClick={() => onNavigate('login')}>Sign in</button>
          </p>
        </div>
      </div>
    </div>
  );
}
