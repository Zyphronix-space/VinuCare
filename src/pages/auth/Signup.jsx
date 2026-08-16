import { useState } from 'react';
import { MailIcon } from '../../components/ui/Icons';
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

export default function Signup({ onNavigate, setUser, redirectAfterLogin }) {
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [phone, setPhone]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [showCf, setShowCf]     = useState(false);
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);
  const [apiError, setApiError] = useState('');
  const [sent, setSent]         = useState(false);

  const validate = () => {
    const e = {};
    if (!name.trim())                      e.name     = 'Full name is required';
    if (!email.trim())                     e.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email    = 'Enter a valid email';
    if (!phone.trim())                     e.phone    = 'Phone number is required';
    else if (!/^(?:\+94|0)[1-9]\d{8}$/.test(phone.replace(/[\s-]/g, '')))
                                            e.phone    = 'Enter a valid Sri Lankan phone number';
    if (!password)                         e.password = 'Password is required';
    else if (password.length < 6)          e.password = 'At least 6 characters';
    if (!confirm)                          e.confirm  = 'Please confirm your password';
    else if (confirm !== password)         e.confirm  = 'Passwords do not match';
    return e;
  };

  // Google accounts arrive already verified by Google, so they skip the
  // "check your email" step normal signups go through — log straight in.
  const completeGoogleSignup = (data) => {
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

  const submit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    setApiError('');
    try {
      const res  = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password }),
      });
      const data = await res.json();
      if (!res.ok) { setApiError(data.message || 'Signup failed'); setLoading(false); return; }
      setSent(true);
      setLoading(false);
    } catch {
      setApiError('Cannot connect to server. Make sure the backend is running.');
      setLoading(false);
    }
  };

  const strength = !password ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : /[A-Z]/.test(password) && /[0-9]/.test(password) ? 4 : 3;
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColor = ['', '#e55', '#f90', '#7C5CE8', '#0a0'];

  if (sent) {
    return (
      <div id="page-signup" className="page active">
        <div className="auth-wrap">
          <div className="auth-box" style={{ textAlign: 'center', alignItems: 'center' }}>
            <div className="auth-header">
              <div
                className="auth-logo"
                style={{ background: 'linear-gradient(135deg, #7C5CE8, #5B3FC4)', color: '#fff' }}
              >
                <MailIcon size={24} />
              </div>
              <h1>Check your email</h1>
              <p>
                We've sent a verification link to <strong>{email}</strong>. Click it to
                activate your account, then sign in.
              </p>
            </div>
            <button className="auth-btn-primary" onClick={() => onNavigate('login')}>
              Go to Sign In
            </button>
            <p className="auth-switch" style={{ marginTop: '8px' }}>
              Didn't get it? Check spam, or{' '}
              <button type="button" onClick={() => setSent(false)}>try again</button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="page-signup" className="page active">
      <div className="auth-wrap">
        <div className="auth-box">

          <div className="auth-header">
            <div className="auth-logo" onClick={() => onNavigate('home')} style={{ background: 'transparent' }}>
              <img src={vinuLogo} alt="VinuCare" style={{ width: '100%', height: '100%', borderRadius: '14px', objectFit: 'cover', display: 'block' }} />
            </div>
            <h1>Create your account</h1>
            <p>Join VinuCare and give your pet the best care.</p>
          </div>

          <GoogleAuthButton onAuth={completeGoogleSignup} onError={setApiError} />

          <div className="auth-or"><span>or</span></div>

          {apiError && <div className="auth-api-error">{apiError}</div>}

          <form onSubmit={e => { e.preventDefault(); submit(); }}>

          <div className="auth-field">
            <label htmlFor="signup-name">Full Name</label>
            <input
              id="signup-name"
              name="name"
              type="text"
              className={`auth-input${errors.name ? ' err' : ''}`}
              placeholder="Sarah Johnson"
              autoComplete="name"
              value={name}
              onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: '' })); }}
            />
            {errors.name && <span className="auth-err-msg">{errors.name}</span>}
          </div>

          <div className="auth-field">
            <label htmlFor="signup-phone">Phone Number</label>
            <input
              id="signup-phone"
              name="phone"
              type="tel"
              className={`auth-input${errors.phone ? ' err' : ''}`}
              placeholder="+94 77 000 0000"
              autoComplete="tel"
              value={phone}
              onChange={e => { setPhone(e.target.value); setErrors(p => ({ ...p, phone: '' })); }}
            />
            {errors.phone && <span className="auth-err-msg">{errors.phone}</span>}
          </div>

          <div className="auth-field">
            <label htmlFor="signup-email">Email address</label>
            <input
              id="signup-email"
              name="email"
              type="email"
              className={`auth-input${errors.email ? ' err' : ''}`}
              placeholder="you@example.com"
              autoComplete="username"
              value={email}
              onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })); }}
            />
            {errors.email && <span className="auth-err-msg">{errors.email}</span>}
          </div>

          <div className="auth-field">
            <label htmlFor="signup-password">Password</label>
            <div className="auth-pw-wrap">
              <input
                id="signup-password"
                name="new-password"
                type={showPw ? 'text' : 'password'}
                className={`auth-input${errors.password ? ' err' : ''}`}
                placeholder="Min. 6 characters"
                autoComplete="new-password"
                value={password}
                onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })); }}
              />
              <button className="auth-eye" type="button" onClick={() => setShowPw(v => !v)}>
                {showPw ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {password && (
              <div style={{ marginTop: '6px' }}>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                  {[1,2,3,4].map(i => (
                    <div key={i} style={{
                      height: '3px', flex: 1, borderRadius: '2px',
                      background: i <= strength ? strengthColor[strength] : 'var(--border)',
                      transition: 'background 0.3s'
                    }} />
                  ))}
                </div>
                <span style={{ fontSize: '0.75rem', color: strengthColor[strength] }}>
                  {strengthLabel[strength]} password
                </span>
              </div>
            )}
            {errors.password && <span className="auth-err-msg">{errors.password}</span>}
          </div>

          <div className="auth-field">
            <label htmlFor="signup-confirm">Confirm Password</label>
            <div className="auth-pw-wrap">
              <input
                id="signup-confirm"
                name="confirm-password"
                type={showCf ? 'text' : 'password'}
                className={`auth-input${errors.confirm ? ' err' : ''}`}
                placeholder="Repeat your password"
                autoComplete="new-password"
                value={confirm}
                onChange={e => { setConfirm(e.target.value); setErrors(p => ({ ...p, confirm: '' })); }}
              />
              <button className="auth-eye" type="button" onClick={() => setShowCf(v => !v)}>
                {showCf ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {confirm && !errors.confirm && confirm === password && (
              <span style={{ fontSize: '0.75rem', color: '#0a0' }}>✓ Passwords match</span>
            )}
            {errors.confirm && <span className="auth-err-msg">{errors.confirm}</span>}
          </div>

          <p style={{ fontSize: '0.78rem', color: '#999', textAlign: 'center', margin: '4px 0 12px' }}>
            By signing up you agree to our{' '}
            <span style={{ color: '#7C5CE8', cursor: 'pointer' }}>Terms of Service</span>
            {' '}and{' '}
            <span style={{ color: '#7C5CE8', cursor: 'pointer' }}>Privacy Policy</span>.
          </p>

          <button className="auth-btn-primary" type="submit" disabled={loading}>
            {loading ? <span className="auth-spinner" /> : null}
            {loading ? 'Creating account…' : 'Create Account'}
          </button>

          </form>

          <p className="auth-switch">
            Already have an account?{' '}
            <button type="button" onClick={() => onNavigate('login')}>Sign in</button>
          </p>

        </div>
      </div>
    </div>
  );
}