import { useState } from 'react';
import '../../styles/auth.css';
import { notifyAuthChanged } from '../../lib/authEvents';
import { deriveUserAccess } from '../../lib/deriveUserAccess';
import GoogleAuthButton from '../../components/GoogleAuthButton';
import vinuLogo from '../../assets/logo/vinucare-logo.png';
import { API_BASE_URL } from '../../config/api';

const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const EyeOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

export default function Login({ onNavigate, setUser, redirectAfterLogin }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);
  const [apiError, setApiError] = useState('');
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resending, setResending]   = useState(false);
  const [resendMsg, setResendMsg]   = useState('');

  const validate = () => {
    const e = {};
    if (!email.trim())                     e.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email    = 'Enter a valid email';
    if (!password)                         e.password = 'Password is required';
    else if (password.length < 6)          e.password = 'At least 6 characters';
    return e;
  };

  // Shared by both the email/password form and Google Sign-In — either
  // path ends with the same { token, user } shape from the backend.
  const completeLogin = (data) => {
    const userWithAccess = deriveUserAccess(data.user);
    localStorage.setItem('user', JSON.stringify(userWithAccess));
    setUser(userWithAccess);
    notifyAuthChanged();

    let destination = redirectAfterLogin || 'home';
    if (userWithAccess.isAdmin) destination = 'admin';
    else if (userWithAccess.isDoctor) destination = 'doctor';
    else if (userWithAccess.isNurse) destination = 'nurse';

    onNavigate(destination);
  };

  const submit = async (e) => {
    e?.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    setApiError('');
    setNeedsVerification(false);
    setResendMsg('');
    try {
      const res  = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setApiError(data.message || 'Login failed');
        if (data.needsVerification) setNeedsVerification(true);
        setLoading(false);
        return;
      }

      completeLogin(data);
    } catch {
      setApiError('Cannot connect to server. Make sure the backend is running.');
      setLoading(false);
    }
  };

  const resendVerification = async () => {
    setResending(true);
    setResendMsg('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setResendMsg(data.message || 'Verification email sent.');
    } catch {
      setResendMsg('Cannot connect to server. Make sure the backend is running.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div id="page-login" className="page active">
      <div className="auth-wrap">
        <div className="auth-box">

          <div className="auth-header">
            <div className="auth-logo" onClick={() => onNavigate('home')} style={{ background: 'transparent' }}>
              <img src={vinuLogo} alt="VinuCare" style={{ width: '100%', height: '100%', borderRadius: '14px', objectFit: 'cover', display: 'block' }} />
            </div>
            <h1>Sign in to VinuCare</h1>
            <p>Welcome back — your pets are waiting.</p>
          </div>

          {apiError && <div className="auth-api-error">{apiError}</div>}
          {needsVerification && (
            <div style={{ textAlign: 'center', marginTop: '-8px' }}>
              {resendMsg ? (
                <span style={{ fontSize: '.82rem', color: '#0a0' }}>{resendMsg}</span>
              ) : (
                <button
                  type="button"
                  className="auth-link-btn"
                  onClick={resendVerification}
                  disabled={resending}
                >
                  {resending ? 'Sending…' : 'Resend verification email'}
                </button>
              )}
            </div>
          )}

          <GoogleAuthButton onAuth={completeLogin} onError={setApiError} />

          <div className="auth-or"><span>or</span></div>

          <form onSubmit={submit}>
            <div className="auth-field">
              <label>Email address</label>
              <input
                type="email"
                className={`auth-input${errors.email ? ' err' : ''}`}
                placeholder="you@example.com"
                value={email}
                onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })); }}
              />
              {errors.email && <span className="auth-err-msg">{errors.email}</span>}
            </div>

            <div className="auth-field">
              <div className="auth-label-row">
                <label>Password</label>
                <button className="auth-link-btn" type="button" onClick={() => onNavigate('forgot-password')}>Forgot password?</button>
              </div>
              <div className="auth-pw-wrap">
                <input
                  type={showPw ? 'text' : 'password'}
                  className={`auth-input${errors.password ? ' err' : ''}`}
                  placeholder="Your password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })); }}
                />
                <button className="auth-eye" type="button" onClick={() => setShowPw(v => !v)}>
                  {showPw ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {errors.password && <span className="auth-err-msg">{errors.password}</span>}
            </div>

            <button className="auth-btn-primary" type="submit" disabled={loading}>
              {loading ? <span className="auth-spinner" /> : null}
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account?{' '}
            <button type="button" onClick={() => onNavigate('signup')}>Create one free</button>
          </p>

        </div>
      </div>
    </div>
  );
}