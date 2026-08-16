import { useState, useContext, useEffect, useRef } from 'react';
import { ShopContext } from '../pages/shop/ShopContext';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '../context/ThemeContext';
import { notifyAuthChanged } from '../lib/authEvents';
import vinuLogo from '../assets/logo/vinucare-logo.png';
import { CartIcon, SunIcon, MoonIcon, ReceiptIcon, ChartIcon, LogoutIcon, MenuIcon } from './ui/Icons';
import Avatar from './ui/Avatar';
import { API_BASE_URL } from '../config/api';

const NAV_LINKS = [
  { key: 'home', label: 'Home' },
  { key: 'services', label: 'Services' },
  { key: 'appointments', label: 'Appointments' },
  { key: 'shop', label: 'Shop' },
  { key: 'reviews', label: 'Reviews' },
];

export default function Nav({ activePage, onNavigate, user, setUser }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef(null);
  const { getTotalItems, isAnimating } = useContext(ShopContext);
  const { theme, toggleTheme } = useTheme();
  const cartCount = getTotalItems();

  const isStaff = !!(user?.isAdmin || user?.isNurse || user?.isDoctor);

  const goTo = (page) => { onNavigate(page); setMenuOpen(false); setAccountMenuOpen(false); };

  const goToDashboard = () => {
    if (user?.isAdmin) goTo('admin');
    else if (user?.isNurse) goTo('nurse');
    else if (user?.isDoctor) goTo('doctor');
  };

  const handleLogout = () => {
    // Fire-and-forget — the cookie is httpOnly so only the backend can
    // actually clear it; the local state below signs the UI out either way.
    fetch(`${API_BASE_URL}/api/auth/logout`, { method: 'POST', credentials: 'include' }).catch(() => {});
    setUser(null);
    localStorage.removeItem('user');
    notifyAuthChanged();
    goTo('home');
  };

  // Close the account dropdown on an outside click, so it behaves like a
  // normal menu instead of staying open until the account button itself
  // is clicked again.
  useEffect(() => {
    if (!accountMenuOpen) return;
    const handleClickOutside = (e) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target)) {
        setAccountMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [accountMenuOpen]);

  return (
    <>
      <style>{`
        /* ===== Liquid glass navbar ===== */
        /* NOTE: deliberately NOT setting "position" here — keep whatever
           base.css already uses (fixed/sticky). The glass effect only
           reads as "glass" when the nav floats over scrolling content. */
        .liquid-nav {
        background: linear-gradient(135deg, rgba(var(--glass-rgb),0.62), rgba(var(--glass-rgb),0.38)) !important;
        backdrop-filter: blur(18px) saturate(180%) !important;
        -webkit-backdrop-filter: blur(18px) saturate(180%) !important;
        border-bottom: 1px solid var(--border-light) !important;
        box-shadow: 0 8px 32px rgba(124,92,232,0.12), inset 0 1px 0 rgba(var(--glass-rgb),0.65) !important;
        }
        .liquid-nav::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(180deg, rgba(var(--glass-rgb),0.45) 0%, rgba(var(--glass-rgb),0) 55%);
          pointer-events: none;
          z-index: 0;
        }
        .liquid-nav::after {
          content: '';
          position: absolute; left: 0; right: 0; bottom: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(124,92,232,0.45), transparent);
          pointer-events: none;
        }
        .liquid-nav > * { position: relative; z-index: 1; }

        .liquid-nav .nav-cta {
          backdrop-filter: blur(4px);
        }

        /* mobile dropdown gets the same glass treatment */
        .mobile-menu {
          background: rgba(var(--glass-rgb),0.92) !important;
          backdrop-filter: blur(22px) saturate(180%) !important;
          -webkit-backdrop-filter: blur(22px) saturate(180%) !important;
          border-top: 1px solid var(--border-light) !important;
          box-shadow: 0 12px 28px rgba(124,92,232,0.15) !important;
        }

        .vinu-cart-btn-wrapper {
          position: relative !important; display: inline-flex !important;
          align-items: center !important; justify-content: center !important;
          background: none !important; border: none !important;
          padding: 6px !important; cursor: pointer !important;
        }
        .vinu-cart-icon { font-size: 1.5rem !important; line-height: 1 !important; position: relative !important; }
        .vinu-amazon-badge {
          position: absolute !important; top: -6px !important; left: 62% !important;
          transform: translateX(-50%) !important; background-color: #7C5CE8 !important;
          color: white !important; font-size: 10px !important; font-weight: 700 !important;
          min-width: 14px !important; height: 14px !important; padding: 0 !important;
          border-radius: 50% !important; display: flex !important; align-items: center !important;
          justify-content: center !important; line-height: 1 !important;
          box-shadow: 0 1px 2px rgba(0,0,0,0.15) !important;
          transition: transform 0.2s ease-in-out !important; pointer-events: none !important;
        }
        .vinu-amazon-badge.pop-bump { animation: amazonBounce 0.4s ease-in-out; }
        @keyframes amazonBounce {
          0% { transform: translateX(-50%) scale(1); }
          50% { transform: translateX(-50%) scale(1.3); }
          100% { transform: translateX(-50%) scale(1); }
        }
        .nav-account-wrap { display: flex; align-items: center; gap: 8px; position: relative; }
        .nav-account-btn {
          display: flex; align-items: center; gap: 7px;
          background: rgba(124,92,232,0.14); border: 1px solid rgba(124,92,232,0.3);
          backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
          color: #7C5CE8; border-radius: 20px; padding: 5px 14px 5px 5px;
          font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s;
        }
        .nav-account-btn:hover { background: rgba(124,92,232,0.22); }
        .nav-account-btn.active { background: rgba(124,92,232,0.26); }

        .nav-account-dropdown {
        position: absolute; top: calc(100% + 10px); right: 0;
        min-width: 230px; z-index: 300;
        /* Opacity raised from .72/.46 and blur from 22px — the low end
           of that gradient let whatever was scrolled underneath show
           straight through the bottom of the menu. */
        background: linear-gradient(135deg, rgba(var(--glass-rgb),0.96), rgba(var(--glass-rgb),0.9));
        backdrop-filter: blur(32px) saturate(180%);
        -webkit-backdrop-filter: blur(32px) saturate(180%);
        border: 1px solid var(--border-light);
        border-radius: 18px;
        box-shadow: 0 20px 48px rgba(124,92,232,0.18), 0 4px 14px rgba(30,27,46,0.12), inset 0 1px 0 rgba(var(--glass-rgb),0.7);
        padding: 8px;
        overflow: hidden;
        animation: nav-dropdown-in 0.15s ease;
      }
      .nav-account-dropdown::before {
        content: '';
        position: absolute; inset: 0;
        background: linear-gradient(180deg, rgba(var(--glass-rgb),0.5) 0%, rgba(var(--glass-rgb),0) 60%);
        pointer-events: none;
      }
      .nav-account-dropdown::after {
        content: '';
        position: absolute; top: 0; left: 12%; right: 12%; height: 1px;
        background: linear-gradient(90deg, transparent, rgba(124,92,232,0.55), transparent);
        pointer-events: none;
      }
      .nav-account-dropdown > * { position: relative; z-index: 1; }
        @keyframes nav-dropdown-in {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .nav-account-dropdown-header {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 12px 8px; border-bottom: 1px solid var(--border-light); margin-bottom: 6px;
        }
        .nav-account-dropdown-name { font-weight: 700; font-size: 0.92rem; color: var(--text-dark); }
        .nav-account-dropdown-email { font-size: 0.76rem; color: var(--text-light); margin-top: 1px; word-break: break-all; }
        .nav-account-dropdown-item {
          display: flex; align-items: center; justify-content: space-between; gap: 10px;
          width: 100%; text-align: left; background: none; border: none;
          padding: 10px 12px; border-radius: 10px; cursor: pointer;
          font-size: 0.86rem; font-weight: 600; color: var(--text-dark);
          transition: background 0.15s ease;
        }
        .nav-account-dropdown-item:hover { background: rgba(124,92,232,0.12); }
        .nav-account-dropdown-item .item-icon-label { display: flex; align-items: center; gap: 9px; }
        .nav-account-dropdown-item.danger { color: #d64545; }
        .nav-account-dropdown-item.danger:hover { background: rgba(214,69,69,0.1); }
        .nav-account-dropdown-divider { height: 1px; background: var(--border-light); margin: 6px 4px; }
        .nav-logout-btn {
          background: none; border: 1px solid var(--border); color: var(--text-light);
          border-radius: 20px; padding: 6px 12px; font-size: 0.8rem;
          cursor: pointer; transition: all 0.2s;
        }
        .nav-logout-btn:hover { border-color: #e55; color: #e55; }

        /* Appearance toggle switch inside the account dropdown */
        .nav-theme-switch {
          position: relative;
          width: 40px;
          height: 22px;
          border-radius: 999px;
          border: none;
          cursor: pointer;
          flex-shrink: 0;
          padding: 0;
          background: var(--border);
          transition: background 0.2s ease;
        }
        .nav-theme-switch.on {
          background: #7C5CE8;
        }
        .nav-theme-switch-knob {
          position: absolute;
          top: 2px;
          left: 2px;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #fff;
          box-shadow: 0 1px 3px rgba(0,0,0,0.25);
          transition: transform 0.2s ease;
        }
        .nav-theme-switch.on .nav-theme-switch-knob {
          transform: translateX(18px);
        }
      `}</style>

      <nav className="liquid-nav">
        <a className="logo" onClick={() => goTo('home')}>
          <div className="logo-mark">
            <img
              src={vinuLogo}
              alt="VinuCare"
              style={{ width: '40px', height: '40px', borderRadius: '10px', display: 'block' }}
            />
          </div>
          <div>
            <div className="logo-text">Vinu<span>Care</span></div>
            <span className="logo-sub">Veterinary &amp; Pet Care</span>
          </div>
        </a>

        <ul className="nav-links">
          {NAV_LINKS.map((link) => (
            <li key={link.key}>
              <a onClick={() => goTo(link.key)} className={activePage === link.key ? 'active' : ''}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="nav-right">
          {!user && <ThemeToggle />}
          <button className="nav-cta" onClick={() => goTo('appointments')}>Book Now</button>

          <button className="vinu-cart-btn-wrapper" id="nav-cart-icon" onClick={() => goTo('cart')} title="View Cart">
            <span className="vinu-cart-icon">
              <CartIcon size={22} />
              <span className={`vinu-amazon-badge ${isAnimating ? 'pop-bump' : ''}`}>{cartCount}</span>
            </span>
          </button>

          {user ? (
            <div className="nav-account-wrap" ref={accountMenuRef}>
              <button
                className={`nav-account-btn ${accountMenuOpen ? 'active' : ''}`}
                onClick={() => setAccountMenuOpen((o) => !o)}
                aria-haspopup="true"
                aria-expanded={accountMenuOpen}
              >
                <Avatar avatar={user.avatar} name={user.name} size={24} />
                {user.name ? user.name.split(' ')[0] : 'Account'} <span style={{ fontSize: '0.7rem' }}>{accountMenuOpen ? '▲' : '▼'}</span>
              </button>

              {accountMenuOpen && (
                <div className="nav-account-dropdown">
                  <div className="nav-account-dropdown-header">
                    <Avatar avatar={user.avatar} name={user.name} size={40} />
                    <div>
                      <div className="nav-account-dropdown-name">{user.name || 'Account'}</div>
                      {user.email && <div className="nav-account-dropdown-email">{user.email}</div>}
                    </div>
                  </div>

                  <div className="nav-account-dropdown-item" style={{ cursor: 'default' }}>
                    <span className="item-icon-label">{theme === 'dark' ? <MoonIcon size={15} /> : <SunIcon size={15} />} Appearance</span>
                    <button
                      type="button"
                      className={`nav-theme-switch ${theme === 'dark' ? 'on' : ''}`}
                      onClick={toggleTheme}
                      role="switch"
                      aria-checked={theme === 'dark'}
                      aria-label="Toggle dark mode"
                    >
                      <span className="nav-theme-switch-knob" />
                    </button>
                  </div>

                  {!isStaff && (
                    <button className="nav-account-dropdown-item" onClick={() => goTo('profile')}>
                      <span className="item-icon-label"><ReceiptIcon size={15} /> View Profile</span>
                    </button>
                  )}

                  {isStaff && (
                    <button className="nav-account-dropdown-item" onClick={goToDashboard}>
                      <span className="item-icon-label"><ChartIcon size={15} /> My Dashboard</span>
                    </button>
                  )}

                  <div className="nav-account-dropdown-divider" />

                  <button className="nav-account-dropdown-item danger" onClick={handleLogout}>
                    <span className="item-icon-label"><LogoutIcon size={15} /> Log Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button className="nav-login-btn" onClick={() => goTo('login')}>Log In</button>
          )}

          <button className="hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="Menu" aria-expanded={menuOpen}>
            <MenuIcon size={22} />
          </button>
        </div>
      </nav>

      <div className={`mobile-menu${menuOpen ? ' open' : ''}`}>
        {NAV_LINKS.map((link) => (
          <a key={link.key} onClick={() => goTo(link.key)}>{link.label}</a>
        ))}
        {user && (
          <>
            {!isStaff && <a onClick={() => goTo('profile')}>View Profile</a>}
            {isStaff && <a onClick={goToDashboard}>My Dashboard</a>}
            <a onClick={handleLogout}>Log Out</a>
          </>
        )}
      </div>
    </>
  );
}