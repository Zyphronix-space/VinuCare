import { useState, useMemo } from 'react';
import '../../styles/auth.css';
import { PawIcon } from '../../components/ui/Icons';
import { API_BASE_URL } from '../../config/api';

export default function ResetPassword({ onNavigate }) {
  const token = useMemo(() => new URLSearchParams(window.location.search).get('token') || '', []);

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!password || password.length < 6) { setApiError('Password must be at least 6 characters'); return; }
    if (password !== confirm) { setApiError('Passwords do not match'); return; }

    setLoading(true);
    setApiError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await res.json();
      if (!res.ok) { setApiError(data.message || 'Could not reset password'); setLoading(false); return; }
      setDone(true);
      setLoading(false);
    } catch {
      setApiError('Cannot connect to server. Make sure the backend is running.');
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div id="page-reset-password" className="page active">
        <div className="auth-wrap">
          <div className="auth-box" style={{ textAlign: 'center', alignItems: 'center' }}>
            <div className="auth-header">
              <h1>Invalid link</h1>
              <p>This password reset link is missing its token. Request a new one from the sign-in page.</p>
            </div>
            <button className="auth-btn-primary" onClick={() => onNavigate('login')}>Back to Sign In</button>
          </div>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div id="page-reset-password" className="page active">
        <div className="auth-wrap">
          <div className="auth-box" style={{ textAlign: 'center', alignItems: 'center' }}>
            <div className="auth-header">
              <div className="auth-logo" style={{ background: 'linear-gradient(135deg, #4CAF50, #2e8b3f)' }}>✓</div>
              <h1>Password reset</h1>
              <p>Your password has been changed. You can sign in with your new password now.</p>
            </div>
            <button className="auth-btn-primary" onClick={() => onNavigate('login')}>Go to Sign In</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="page-reset-password" className="page active">
      <div className="auth-wrap">
        <div className="auth-box">
          <div className="auth-header">
            <div className="auth-logo" style={{ color: '#fff' }}><PawIcon size={24} /></div>
            <h1>Choose a new password</h1>
            <p>Make it something you haven't used before.</p>
          </div>

          {apiError && <div className="auth-api-error">{apiError}</div>}

          <form onSubmit={submit}>
            <div className="auth-field">
              <label>New password</label>
              <input
                type="password"
                className="auth-input"
                placeholder="Min. 6 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            <div className="auth-field" style={{ marginTop: 12 }}>
              <label>Confirm new password</label>
              <input
                type="password"
                className="auth-input"
                placeholder="Repeat your new password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
              />
            </div>

            <button className="auth-btn-primary" type="submit" disabled={loading} style={{ marginTop: 16 }}>
              {loading ? <span className="auth-spinner" /> : null}
              {loading ? 'Saving…' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
