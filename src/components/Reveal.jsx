import { useEffect, useRef, useState } from "react";

/**
 * Wraps any block of content and fades/slides it in the first time it
 * scrolls into view. Cheap (single shared-pattern IntersectionObserver
 * per instance, unobserves itself once triggered) and safe to sprinkle
 * around freely on a page.
 *
 * Usage: <Reveal><section>...</section></Reveal>
 *        <Reveal delay={120} direction="left">...</Reveal>
 */
export default function Reveal({
  children,
  className = "",
  delay = 0,
  direction = "up", // "up" | "left" | "right" | "none"
  as: Tag = "div",
  style,
  ...rest
}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect users who've asked for less motion.
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={`reveal reveal-${direction} ${visible ? "reveal-visible" : ""} ${className}`}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms", ...style }}
      {...rest}
    >
      {children}
    </Tag>
  );
}