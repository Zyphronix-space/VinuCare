import { useEffect, useRef } from 'react';
import { API_BASE_URL } from '../config/api';
import { useTheme } from '../context/ThemeContext';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const API_BASE = `${API_BASE_URL}/api/auth`;

// Google's <script> only needs injecting once even if both Login and
// Signup mount a button during the same session.
let scriptPromise = null;
function loadGoogleScript() {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) { resolve(window.google); return; }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google);
    script.onerror = () => reject(new Error('Failed to load Google Sign-In'));
    document.head.appendChild(script);
  });
  return scriptPromise;
}

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

// Google Sign-In authenticates with a token, not a password, so there's
// nothing for the browser's password manager to save — that's true on any
// site using "Continue with Google", not specific to this app. The closest
// real equivalent is the Credential Management API's FederatedCredential,
// which lets supporting browsers offer a one-click "sign in as [you]"
// prompt next time instead of replaying the Google popup. Browser support
// is spotty (several browsers, including recent Chrome, have dropped it),
// so this is a no-op with no visible effect in those — it only helps
// where it's actually supported.
async function rememberFederatedSignIn(user) {
  if (!user?.email || typeof window.FederatedCredential !== 'function' || !navigator.credentials?.store) return;
  try {
    await navigator.credentials.store(new window.FederatedCredential({
      id: user.email,
      provider: 'https://accounts.google.com',
      name: user.name || undefined,
      iconURL: user.avatar || undefined,
    }));
  } catch {
    // Credential Management API declined/unsupported — safe to ignore.
  }
}

// Drop-in replacement for the old static "Continue with Google" button.
// Renders Google's own button (required by their branding terms) once
// VITE_GOOGLE_CLIENT_ID is set; otherwise falls back to a disabled
// look-alike so the page still renders sensibly with no key configured.
export default function GoogleAuthButton({ onAuth, onError }) {
  const containerRef = useRef(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (!CLIENT_ID || !containerRef.current) return undefined;
    let cancelled = false;

    loadGoogleScript()
      .then((google) => {
        if (cancelled || !containerRef.current) return;

        google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: async (response) => {
            try {
              const res = await fetch(`${API_BASE}/google`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ credential: response.credential }),
              });
              const data = await res.json();
              if (!res.ok) { onError?.(data.message || 'Google sign-in failed'); return; }
              await rememberFederatedSignIn(data.user);
              onAuth(data);
            } catch {
              onError?.('Cannot connect to server. Make sure the backend is running.');
            }
          },
        });

        // Google's button is its own rendered widget, not styleable via
        // our CSS — it needs to be told which theme to draw explicitly,
        // and re-drawn (clear + renderButton again) whenever the site
        // theme changes, or it stays a plain white pill that barely
        // reads against a dark page.
        containerRef.current.innerHTML = '';
        google.accounts.id.renderButton(containerRef.current, {
          theme: theme === 'dark' ? 'filled_black' : 'outline',
          size: 'large',
          shape: 'pill',
          text: 'continue_with',
          width: containerRef.current.offsetWidth || 300,
        });
      })
      .catch(() => onError?.('Could not load Google Sign-In.'));

    return () => { cancelled = true; };
  }, [onAuth, onError, theme]);

  if (!CLIENT_ID) {
    return (
      <button className="auth-google-btn" type="button" disabled title="Google Sign-In isn't configured yet">
        <GoogleIcon />
        Continue with Google
      </button>
    );
  }

  return <div ref={containerRef} className="auth-google-btn-mount" />;
}
