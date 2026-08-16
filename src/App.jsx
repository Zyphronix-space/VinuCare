import { useState, useEffect, useCallback, useRef } from 'react';
import './styles/base.css';
import './styles/nav-footer.css';
import './styles/auth.css';
import Nav from './components/Nav';
import Home from './pages/home/Home';
import Footer from './components/Footer';
import Service from './pages/services/Service';
import Appointment from './pages/appointments/Appointment';
import Team from './pages/team/Team';
import Shop from './pages/shop/Shop';
import CartPage from './pages/shop/CartPage';
import ReviewsPage from './pages/reviews/ReviewsPage';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import VerifyEmail from './pages/auth/VerifyEmail';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import PaymentReturn from './pages/payment/PaymentReturn';
import PaymentCancel from './pages/payment/PaymentCancel';
import Profile from './pages/account/Profile';
import { UIFeedbackProvider } from './context/UIFeedbackContext';
import { API_BASE_URL } from './config/api';
import { ThemeProvider } from './context/ThemeContext';
import AdminDashboard from './pages/admin/AdminDashboard';
import NurseDashboard from './pages/nurse/NurseDashboard';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import ChatBot from './components/ChatBot';
import { notifyAuthChanged } from './lib/authEvents';
import { deriveUserAccess } from './lib/deriveUserAccess';
import { startVisitorPresence } from './lib/visitorPresence';


const VALID_PAGES = ['home', 'services', 'appointments', 'shop', 'cart', 'reviews', 'team', 'login', 'signup', 'verify-email', 'forgot-password', 'reset-password', 'payment-return', 'payment-cancel', 'profile', 'admin', 'nurse', 'doctor'];

// Pages that own the entire viewport with their own sidebar/exit — not
// meant to be sandwiched between the public site's Nav and Footer.
const STAFF_PANEL_PAGES = ['admin', 'nurse', 'doctor'];

// Pages that should NOT be kept alive in the background once you navigate
// away — auth forms shouldn't hold stale input/state indefinitely, the
// profile page shouldn't linger with another user's data in memory after
// a logout/login swap, and 'team' shouldn't linger either: it shares the
// app-wide `selectedProductId` with other detail pages (services/shop), so
// a backgrounded Team instance keeps re-evaluating it against team data as
// it changes for whatever page is now active — and Team, unlike those
// others, reacts with a forced onNavigate('home') when it stops resolving
// to a member, hijacking whatever navigation you actually just made (e.g.
// clicking "Book Now" on a doctor's profile bounced you to Home instead of
// Appointments, because the id changed to the appointments page's productId
// out from under the still-mounted, invisible Team instance).
const NO_KEEP_ALIVE = ['login', 'signup', 'verify-email', 'forgot-password', 'reset-password', 'payment-return', 'payment-cancel', 'profile', 'team'];

function getPathParts() {
  return window.location.pathname.replace(/^\/+/, '').split('/').filter(Boolean);
}

function getPageFromLocation() {
  const p = getPathParts()[0] || 'home';
  return VALID_PAGES.includes(p) ? p : 'home';
}

// Pages that support a nested detail segment, e.g. /shop/:productId or /services/:serviceId
const PAGES_WITH_DETAIL = ['shop', 'services', 'team'];

function getProductIdFromLocation() {
  const parts = getPathParts();
  return PAGES_WITH_DETAIL.includes(parts[0]) && parts[1] ? parts[1] : null;
}

// Pages stay mounted forever once visited (see mountedPages below), so a
// plain CSS "animation" on the page element only ever plays once — on
// its first mount — and never again when you navigate back to it later.
// PageMount fixes that: every time `active` flips from false -> true, it
// removes the animation class, forces a reflow, and re-adds it, which
// makes the browser replay the CSS keyframes from scratch.
function PageMount({ active, children }) {
  const ref = useRef(null);
  const prevActive = useRef(false);

  useEffect(() => {
    if (active && !prevActive.current && ref.current) {
      const el = ref.current;
      el.classList.remove('page-mount-play');
      void el.offsetWidth; // force reflow so the browser notices the class was removed
      el.classList.add('page-mount-play');
    }
    prevActive.current = active;
  }, [active]);

  return (
    <div
      ref={ref}
      className={`page-mount ${active ? 'page-mount-active' : ''}`}
    >
      {children}
    </div>
  );
}

function PageSwitch({ page, isActive, onNavigate, selectedService, setSelectedService, selectedProductId, setSelectedDoctorKeyword, selectedDoctorKeyword, user, setUser, setRedirectAfterLogin, redirectAfterLogin }) {
  const isLoggedIn = !!user;
  switch (page) {
    case 'home':
      return <Home onNavigate={onNavigate} />;
    case 'services':
      return (
        <Service
          onNavigate={onNavigate}
          selectedServiceId={selectedProductId}
          onBook={(serviceTitle) => {
            setSelectedService(serviceTitle);
            onNavigate('appointments');
          }}
        />
      );
    case 'appointments':
      return (
        <Appointment
          selectedService={selectedService}
          selectedDoctorKeyword={selectedDoctorKeyword}
          isLoggedIn={isLoggedIn}
          onNavigate={onNavigate}
          setRedirectAfterLogin={setRedirectAfterLogin}
          user={user}
        />
      );
    case 'team':
      return (
        <Team
          onNavigate={onNavigate}
          selectedTeamId={selectedProductId}
          isActive={isActive}
          onBook={(member) => {
            setSelectedDoctorKeyword(member.matchKeyword);
            onNavigate('appointments');
          }}
        />
      );
    case 'shop':
      return <Shop onNavigate={onNavigate} selectedProductId={selectedProductId} />;
    case 'cart':
      return <CartPage onNavigate={onNavigate} isLoggedIn={isLoggedIn} setRedirectAfterLogin={setRedirectAfterLogin} user={user} />;
    case 'reviews':
      return <ReviewsPage onNavigate={onNavigate} isLoggedIn={isLoggedIn} setRedirectAfterLogin={setRedirectAfterLogin} />;
    case 'login':
      return <Login onNavigate={onNavigate} setUser={setUser} redirectAfterLogin={redirectAfterLogin} />;
    case 'signup':
      return <Signup onNavigate={onNavigate} setUser={setUser} redirectAfterLogin={redirectAfterLogin} />;
    case 'verify-email':
      return <VerifyEmail onNavigate={onNavigate} setUser={setUser} />;
    case 'forgot-password':
      return <ForgotPassword onNavigate={onNavigate} />;
    case 'reset-password':
      return <ResetPassword onNavigate={onNavigate} />;
    case 'payment-return':
      return <PaymentReturn onNavigate={onNavigate} />;
    case 'payment-cancel':
      return <PaymentCancel onNavigate={onNavigate} />;
    case 'profile':
      // Profile shows the logged-in user's own booking/payment history —
      // staff accounts (admin/nurse/doctor) have their own dashboards for
      // that and shouldn't land on the customer profile view. Same
      // render-null-then-redirect-in-an-effect pattern as admin/nurse/doctor
      // below — the actual redirect happens in the useEffect in App.
      if (user?.isAdmin || user?.isNurse || user?.isDoctor) {
        return null;
      }
      return <Profile onNavigate={onNavigate} user={user} setUser={setUser} />;
    case 'admin':
      // TODO: once the backend has a real `role` column, replace
      // this check with `user?.role === 'admin'`.
      // NOTE: don't call onNavigate here — this runs during render, and
      // calling setState (which onNavigate does, via App) while a parent
      // is mid-render throws "Cannot update a component while rendering
      // a different component" and can leave the DOM half-committed.
      // The redirect for an unauthorized visitor is handled by a
      // useEffect in App instead; this just renders nothing meanwhile.
      if (!user?.isAdmin) {
        return null;
      }
      return <AdminDashboard onNavigate={onNavigate} adminName={user?.name} user={user} setUser={setUser} />;
    case 'nurse':
      // Same reasoning as 'admin' above: the redirect for an unauthorized
      // visitor happens in a useEffect in App, not here.
      if (!user?.isNurse) {
        return null;
      }
      return <NurseDashboard onNavigate={onNavigate} user={user} setUser={setUser} />;
    case 'doctor':
      if (!user?.isDoctor) {
        return null;
      }
      return <DoctorDashboard onNavigate={onNavigate} user={user} setUser={setUser} />;
    default:
      return <Home onNavigate={onNavigate} />;
  }
}

export default function App() {
  const [page, setPage] = useState(getPageFromLocation);
  const [selectedProductId, setSelectedProductId] = useState(getProductIdFromLocation);
  const [selectedService, setSelectedService] = useState('');
  const [selectedDoctorKeyword, setSelectedDoctorKeyword] = useState('');
  const [user, setUser] = useState(() => {
  try {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
});
const [redirectAfterLogin, setRedirectAfterLogin] = useState('home');

  // A backend restart invalidates every previously-issued token (see
  // backend/bootId.js) — but a JWT-based session has no server-to-client
  // push, so an already-open tab has no way to know that happened until
  // it makes its next authenticated request. Checking once on load means
  // a stale session gets cleared (nav flips to "Log In", staff dashboards
  // become inaccessible) as soon as the page is loaded/refreshed after
  // the restart, instead of silently failing individual API calls later.
  //
  // This same request also re-syncs role/access flags. Without it, an
  // admin promoting someone to Admin (or any other role change) had no
  // effect on that person's already-open session — isAdmin/isDoctor/
  // isNurse are computed once at login and cached in localStorage, so
  // the change silently "didn't work" until they fully logged out and
  // back in. Now any page load/refresh picks up the current role too.
  useEffect(() => {
    startVisitorPresence();
  }, []);

  useEffect(() => {
    if (!localStorage.getItem('user')) return;
    fetch(`${API_BASE_URL}/api/auth/me`, { credentials: 'include' })
      .then((res) => {
        if (res.status === 401) {
          localStorage.removeItem('user');
          setUser(null);
          notifyAuthChanged();
          return;
        }
        if (res.ok) {
          return res.json().then((profile) => {
            const updated = deriveUserAccess(profile);
            localStorage.setItem('user', JSON.stringify(updated));
            setUser(updated);
          });
        }
      })
      .catch(() => {
        // Backend unreachable — leave the session as-is rather than
        // logging someone out just because of a network hiccup.
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Pages that have been visited at least once and should stay mounted
  // in the background (instead of being destroyed on navigation away).
  const [mountedPages, setMountedPages] = useState(() => [getPageFromLocation()]);
  const prevPageRef = useRef(page);
  const currentRef = useRef({ page, productId: selectedProductId });

  // Navigate + push a real browser history entry.
  // Pass a productId to drill into a nested detail view, e.g. navigate('shop', product.id)
  // Call navigate('shop') with no productId to go back to the shop grid.
  const navigate = useCallback((nextPage, productId = null) => {
    if (!VALID_PAGES.includes(nextPage)) nextPage = 'home';

    const isSame = currentRef.current.page === nextPage && currentRef.current.productId === productId;
    if (isSame) return;

    const path = `/${nextPage === 'home' ? '' : nextPage}${productId ? '/' + productId : ''}`;
    window.history.pushState({ page: nextPage, productId }, '', path);

    currentRef.current = { page: nextPage, productId };
    setSelectedProductId(productId);
    setPage(nextPage);
  }, []);

  // Make sure the very first load has a history entry to land on
  useEffect(() => {
    const path = `/${page === 'home' ? '' : page}${selectedProductId ? '/' + selectedProductId : ''}`;
    window.history.replaceState({ page, productId: selectedProductId }, '', path);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle browser Back / Forward buttons
  useEffect(() => {
    const handlePopState = (e) => {
      const targetPage = (e.state && e.state.page) || getPageFromLocation();
      const targetProductId = e.state ? (e.state.productId ?? null) : getProductIdFromLocation();
      currentRef.current = { page: targetPage, productId: targetProductId };
      setPage(targetPage);
      setSelectedProductId(targetProductId);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page, selectedProductId]);

  // Kick unauthorized visitors off the admin route. This lives in an
  // effect (runs after render/commit) instead of inline in PageSwitch's
  // render — calling navigate()/setState during another component's
  // render is invalid in React and was corrupting the committed DOM,
  // which is what caused the sidebar/overview ghosting.
  useEffect(() => {
    if (page === 'admin' && !user?.isAdmin) {
      navigate('home');
    }
    if (page === 'nurse' && !user?.isNurse) {
      navigate('home');
    }
    if (page === 'doctor' && !user?.isDoctor) {
      navigate('home');
    }
    if (page === 'profile' && (user?.isAdmin || user?.isNurse || user?.isDoctor)) {
      if (user.isAdmin) navigate('admin');
      else if (user.isNurse) navigate('nurse');
      else navigate('doctor');
    }
  }, [page, user, navigate]);

  // Track which pages should be kept in the DOM. Adding the current page
  // (if not already tracked) and dropping the previous page if it's a
  // no-keep-alive page (auth forms).
  useEffect(() => {
    setMountedPages((prev) => {
      let next = prev;
      if (!next.includes(page)) {
        next = [...next, page];
      }
      const leaving = prevPageRef.current;
      if (leaving !== page && NO_KEEP_ALIVE.includes(leaving)) {
        next = next.filter((p) => p !== leaving);
      }
      return next;
    });
    prevPageRef.current = page;
  }, [page]);

  // The admin dashboard owns the entire viewport (its own sidebar, its own
  // "Back to site" exit, height: 100vh internally) — it isn't meant to be
  // sandwiched between the public site's Nav and Footer. Rendering it there
  // is what causes the sidebar/overview layout to overlap and clip.
  if (STAFF_PANEL_PAGES.includes(page)) {
    return (
      <ThemeProvider>
        <UIFeedbackProvider>
          <PageSwitch
            page={page}
            isActive
            onNavigate={navigate}
            selectedService={selectedService}
            setSelectedService={setSelectedService}
            selectedProductId={selectedProductId}
            selectedDoctorKeyword={selectedDoctorKeyword}
            setSelectedDoctorKeyword={setSelectedDoctorKeyword}
            user={user}
            setUser={setUser}
            redirectAfterLogin={redirectAfterLogin}
            setRedirectAfterLogin={setRedirectAfterLogin}
          />
        </UIFeedbackProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <UIFeedbackProvider>
        <Nav
          activePage={page}
          onNavigate={navigate}
          user={user}
          setUser={setUser}
        />
        <div id="app">
          {mountedPages
            .filter((p) => !STAFF_PANEL_PAGES.includes(p))
            .map((p) => (
              <PageMount key={p} active={p === page}>
                <PageSwitch
                  page={p}
                  isActive={p === page}
                  onNavigate={navigate}
                  selectedService={selectedService}
                  setSelectedService={setSelectedService}
                  selectedProductId={selectedProductId}
                  selectedDoctorKeyword={selectedDoctorKeyword}
                  setSelectedDoctorKeyword={setSelectedDoctorKeyword}
                  user={user}
                  setUser={setUser}
                  redirectAfterLogin={redirectAfterLogin}
                  setRedirectAfterLogin={setRedirectAfterLogin}
                />
              </PageMount>
            ))}
        </div>
        <Footer onNavigate={navigate} />
        {['home', 'services', 'appointments', 'shop', 'cart'].includes(page) && (
          <ChatBot
            user={user}
            onNavigate={navigate}
            onBookService={(serviceTitle) => {
              setSelectedService(serviceTitle);
              navigate('appointments');
            }}
          />
        )}
      </UIFeedbackProvider>
    </ThemeProvider>
  );
}