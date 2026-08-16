import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CategoryIcon } from './ServiceMeta';
import DetailGallery from '../../components/ui/DetailGallery';

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

function ServiceDetail({ service, accent, onBack, onBookClick }) {
  const {
    category,
    title,
    tagline,
    intro,
    heroImage,
    image,
    tags,
    btnText,
    highlights = [],
    info,
    gallery,
  } = service;

  const bg = accent || '#3730A3';
  const heroRef = useRef(null);
  const [showFloatingBtn, setShowFloatingBtn] = useState(false);

  // Floating "Book Now" stays fixed on screen once the hero has
  // scrolled out of view, so people reading "What's Included" further
  // down never lose access to the booking button.
  useEffect(() => {
    const heroEl = heroRef.current;
    if (!heroEl) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        // This page stays mounted in the background after you navigate
        // away (App.jsx's keep-alive system just sets display:none on
        // an ancestor) — a hidden hero has no layout box, which
        // IntersectionObserver reports the same as "scrolled out of
        // view", so this would show the button forever on top of
        // whatever page you actually navigated to (it's portaled
        // straight to <body>). offsetParent is null while any ancestor
        // is display:none, so use it to tell "actually scrolled past"
        // apart from "this page isn't even showing right now".
        const isRendered = heroEl.offsetParent !== null;
        setShowFloatingBtn(isRendered && !entry.isIntersecting);
      },
      { threshold: 0 }
    );
    observer.observe(heroEl);
    return () => observer.disconnect();
  }, []);

  // Optional `gallery: [{ src, alt }, ...]` on a service in
  // servicesData.js. Falls back to the card's own thumbnail so the
  // strip never renders empty, but a real 2-3 photo gallery specific
  // to this service will look much better — see suggestions in chat.
  const galleryImages = gallery && gallery.length > 0 ? gallery : [{ src: image, alt: title }];

  return (
    <div className="service-detail">
      {/* Hero */}
      <div className="service-detail-hero" ref={heroRef}>
        <div className="service-detail-hero-img">
          <img src={heroImage || image} alt={title} />
        </div>
        <div
          className="service-detail-hero-overlay"
          style={{ background: `linear-gradient(180deg, rgba(0,0,0,.15) 0%, ${bg}CC 100%)` }}
        ></div>
        <div className="service-detail-hero-content">
          <button className="breadcrumb-link" onClick={onBack}>
            ← All Services
          </button>
          <span className="pill-tag" style={{ background: 'rgba(255,255,255,.2)', color: '#fff' }}>
            {category}
          </span>
          <h1>{title}</h1>
          {tagline && <p className="service-detail-tagline">{tagline}</p>}
          <div className="cat-tags-row" style={{ justifyContent: 'flex-start' }}>
            {tags.map((tag, index) => (
              <span key={index} className="cat-tag cat-tag-light">{tag}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Discover / intro */}
      {intro && (
        <div className="discover-section">
          <span className="pill-tag">Overview</span>
          <h2>Discover {title}</h2>
          <p>{intro}</p>
        </div>
      )}

      {/* Photo gallery — endless-loop slideshow, breaks up the text with real imagery */}
      <DetailGallery images={galleryImages} accent={bg} />

      {/* What's included */}
      {highlights.length > 0 && (
        <div className="highlights-section">
          <h2>What's Included</h2>
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
                    <CategoryIcon category={category} />
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
        <h2>Ready to book {title.toLowerCase()}?</h2>
        <p>Our team will confirm the details and get your pet scheduled in.</p>
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

export default ServiceDetail;