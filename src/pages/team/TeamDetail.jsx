import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import DetailGallery from '../../components/ui/DetailGallery';
import { StethoscopeIcon, ScalpelIcon } from '../../components/ui/Icons';

// teamData.js is plain data (no JSX allowed there), so its `icon` field is
// a short key resolved to a real icon component here.
const TEAM_ICONS = { stethoscope: StethoscopeIcon, scalpel: ScalpelIcon };

// Generic "life at the clinic" filler photos so the gallery looks
// finished immediately. Swap these for real clinic photos whenever
// you have them — either edit the URLs below, or pass a
// `gallery: [{ src, alt }, ...]` array on a specific team member in
// teamData.js and it will be used instead of this default.
const DEFAULT_GALLERY = [
  { src: 'https://images.unsplash.com/photo-1584982751601-97dcc096659c?w=700&auto=format&fit=crop&q=70', alt: 'Vet examining a dog in the clinic' },
  { src: 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=700&auto=format&fit=crop&q=70', alt: 'Veterinary team consulting together' },
  { src: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=700&auto=format&fit=crop&q=70', alt: 'Happy pet owner with their dog at the vet' },
];

function CalendarIcon() {
  return (
    <svg viewBox="0 0 22 22" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4.5" width="16" height="14" rx="2.4" />
      <line x1="3" y1="9" x2="19" y2="9" />
      <line x1="7" y1="2.5" x2="7" y2="6" />
      <line x1="15" y1="2.5" x2="15" y2="6" />
      <path d="M7.5 13l1.8 1.8L13.5 11.6" />
    </svg>
  );
}

function TeamDetail({ member, onBack, onBookClick }) {
  const {
    tag, bg, icon, name, role, img, intro, highlights = [], info, btnText, gallery,
  } = member;

  const MemberIcon = TEAM_ICONS[icon];
  const heroRef = useRef(null);
  const [showFloatingBtn, setShowFloatingBtn] = useState(false);

  // Floating "Book Now" stays fixed on screen once the hero has
  // scrolled out of view, so people reading the highlights further
  // down never lose access to the booking button.
  useEffect(() => {
    const heroEl = heroRef.current;
    if (!heroEl) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Same fix as ServiceDetail.jsx: a hidden (kept-alive,
        // display:none) hero has no layout box, which reports as "not
        // intersecting" the same as scrolling past it — without this
        // check the button (portaled to <body>) shows forever on top
        // of whatever page you navigate to after leaving this one.
        const isRendered = heroEl.offsetParent !== null;
        setShowFloatingBtn(isRendered && !entry.isIntersecting);
      },
      { threshold: 0 }
    );
    observer.observe(heroEl);
    return () => observer.disconnect();
  }, []);

  // "DVM · Small Animal Medicine · 12 yrs experience" -> quick stat chips,
  // reusing data that's already there instead of asking for more.
  const roleChips = role ? role.split('·').map((r) => r.trim()).filter(Boolean) : [];
  const galleryImages = gallery && gallery.length > 0 ? gallery : DEFAULT_GALLERY;

  return (
    <div className="team-detail">
      {/* Hero */}
      <div className="team-detail-hero" style={{ background: bg }} ref={heroRef}>
        <div className="team-detail-hero-content">
          <button className="breadcrumb-link" onClick={onBack}>
            ← Our Team
          </button>
          <div className="team-detail-icon" style={{ background: 'rgba(255,255,255,.18)' }}>
            {MemberIcon && <MemberIcon size={24} />}
          </div>
          <span className="pill-tag" style={{ background: 'rgba(255,255,255,.2)', color: '#fff' }}>
            {tag}
          </span>
          <h1>{name}</h1>
          {roleChips.length > 0 && (
            <div className="team-detail-stat-row">
              {roleChips.map((chip, i) => (
                <span className="team-detail-stat-chip" key={i}>{chip}</span>
              ))}
            </div>
          )}
          <button
            className="btn btn-white team-detail-hero-cta"
            onClick={onBookClick}
          >
            <CalendarIcon />
            {btnText}
          </button>
        </div>
        <div className="team-detail-hero-photo">
          <img src={img} alt={name} />
        </div>
      </div>

      {/* Intro */}
      {intro && (
        <div className="discover-section">
          <span className="pill-tag">About</span>
          <h2>Meet {name}</h2>
          <p>{intro}</p>
        </div>
      )}

      {/* Photo gallery — endless-loop slideshow, breaks up the text with real imagery */}
      <DetailGallery images={galleryImages} accent={bg} />

      {/* Focus / background */}
      {highlights.length > 0 && (
        <div className="highlights-section">
          <div className="highlight-grid">
            {highlights.map((h, i) => (
              <div className="highlight-card" key={i}>
                {h.image ? (
                  <div className="highlight-card-media">
                    <img
                      src={h.image}
                      alt={h.title}
                      loading="lazy"
                      style={h.position ? { objectPosition: h.position } : undefined}
                    />
                  </div>
                ) : (
                  <div className="highlight-card-media highlight-card-media-fallback" style={{ background: `linear-gradient(135deg, ${bg}22, ${bg}0d)` }}>
                    <span className="highlight-card-fallback-icon" style={{ color: bg }}>{MemberIcon && <MemberIcon size={26} />}</span>
                  </div>
                )}
                <div className="highlight-card-body">
                  <h3>{h.title}</h3>
                  <ul>
                    {h.points.map((p, j) => (
                      <li key={j}>
                        <span className="check-icon" style={{ color: bg }}>✓</span>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Good to know */}
      {info && (
        <div className="info-callout" style={{ borderLeftColor: bg }}>
          <h4>Good to know</h4>
          <p>{info}</p>
        </div>
      )}

      {/* CTA */}
      <div className="detail-cta-banner" style={{ background: bg }}>
        <h2>Ready to book with {name}?</h2>
        <p>Pick a service and time — we'll pencil {name} straight into your appointment.</p>
        <button className="btn" style={{ background: '#fff', color: bg, fontWeight: 700 }} onClick={onBookClick}>
          {btnText}
        </button>
      </div>

      {/* Floating persistent Book Now — portaled straight to <body>.
          .page-mount has a CSS animation with `transform` in its
          keyframes (fill-mode `both`), which never lets go once played
          — that makes it a permanent containing block for any
          `position: fixed` descendant, so a fixed button nested inside
          it pins to the page instead of the viewport. Same root cause
          as the CompareBar/CompareModal fix — same fix here. */}
      {createPortal(
        <button
          className={`floating-book-btn${showFloatingBtn ? ' visible' : ''}`}
          style={{ background: bg }}
          onClick={onBookClick}
          aria-hidden={!showFloatingBtn}
          tabIndex={showFloatingBtn ? 0 : -1}
        >
          <CalendarIcon />
          {btnText}
        </button>,
        document.body
      )}
    </div>
  );
}

export default TeamDetail;