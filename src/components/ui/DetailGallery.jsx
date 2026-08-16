import { useEffect, useRef, useState } from 'react';
import '../../styles/detail-gallery.css';

// Auto-advancing, endlessly looping photo slideshow used on both the
// team member and service detail pages. Crossfades between slides
// (rather than sliding left/right) so the loop-back from the last
// photo to the first never produces a visible reverse-jump.
function DetailGallery({ images = [], interval = 4000, accent }) {
  const slides = images.filter((img) => img && img.src);
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (slides.length <= 1 || isPaused) return undefined;
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, interval);
    return () => clearInterval(timerRef.current);
  }, [slides.length, isPaused, interval]);

  if (slides.length === 0) return null;

  const goTo = (i) => setIndex(((i % slides.length) + slides.length) % slides.length);

  return (
    <div
      className="detail-gallery-slideshow"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="detail-gallery-viewport">
        {slides.map((img, i) => (
          <img
            key={img.src + i}
            src={img.src}
            alt={img.alt || ''}
            loading={i === 0 ? 'eager' : 'lazy'}
            style={img.position ? { objectPosition: img.position } : undefined}
            className={`detail-gallery-slide${i === index ? ' active' : ''}`}
          />
        ))}

        {slides.length > 1 && (
          <>
            <button
              type="button"
              className="detail-gallery-arrow detail-gallery-arrow-prev"
              onClick={() => goTo(index - 1)}
              aria-label="Previous photo"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              type="button"
              className="detail-gallery-arrow detail-gallery-arrow-next"
              onClick={() => goTo(index + 1)}
              aria-label="Next photo"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </>
        )}
      </div>

      {slides.length > 1 && (
        <div className="detail-gallery-dots">
          {slides.map((_, i) => (
            <button
              type="button"
              key={i}
              className={`detail-gallery-dot${i === index ? ' active' : ''}`}
              style={i === index && accent ? { background: accent } : undefined}
              onClick={() => goTo(i)}
              aria-label={`Go to photo ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default DetailGallery;