import { useEffect, useMemo, useState } from 'react';
import '../../styles/auth.css';
import { notifyAuthChanged } from '../../lib/authEvents';
import { deriveUserAccess } from '../../lib/deriveUserAccess';
import { API_BASE_URL } from '../../config/api';

const REASON_MESSAGES = {
  invalid: "This verification link isn't valid. It may have already been used.",
  expired: 'This verification link has expired. Request a new one from the sign-in page.',
  missing: 'No verification token was provided.',
  server: 'Something went wrong on our end while verifying your email.',
};

export default function VerifyEmail({ onNavigate, setUser }) {
  const { status, reason } = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return {
      status: params.get('status') || 'error',
      reason: params.get('reason') || 'server',
    };
  }, []);

  const success = status === 'success';
  const [destination, setDestination] = useState('home');

  // The backend already set the session cookie on its redirect here — this
  // just fetches who that cookie belongs to so the SPA can log them in.
  useEffect(() => {
    if (!success) return;
    let cancelled = false;

    fetch(`${API_BASE_URL}/api/auth/me`, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((profile) => {
        if (cancelled || !profile) return;

        const userWithAccess = deriveUserAccess(profile);

        localStorage.setItem('user', JSON.stringify(userWithAccess));
        setUser(userWithAccess);
        notifyAuthChanged();

        if (userWithAccess.isAdmin) setDestination('admin');
        else if (userWithAccess.isDoctor) setDestination('doctor');
        else if (userWithAccess.isNurse) setDestination('nurse');
        else setDestination('home');
      })
      .catch(() => {});

    return () => { cancelled = true; };
  }, [success, setUser]);

  return (
    <div id="page-verify-email" className="page active">
      <div className="auth-wrap">
        <div className="auth-box" style={{ textAlign: 'center', alignItems: 'center' }}>
          <div className="auth-header">
            <div
              className="auth-logo"
              style={{
                background: success
                  ? 'linear-gradient(135deg, #4CAF50, #2e8b3f)'
                  : 'linear-gradient(135deg, #e55, #c33)',
              }}
            >
              {success ? '✓' : '✕'}
            </div>
            {success ? (
              <>
                <h1>Email verified successfully!</h1>
                <p>Your account is now active and you're signed in. You're all set to get started.</p>
              </>
            ) : (
              <>
                <h1>Verification failed</h1>
                <p>{REASON_MESSAGES[reason] || REASON_MESSAGES.server}</p>
              </>
            )}
          </div>

          {success ? (
            <button className="auth-btn-primary" onClick={() => onNavigate(destination)}>
              Go to Home
            </button>
          ) : (
            <button className="auth-btn-primary" onClick={() => onNavigate('login')}>
              Back to Sign In
            </button>
          )}
        </div>
      </div>
    </div>
  );
}