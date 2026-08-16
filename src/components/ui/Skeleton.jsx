import '../../styles/skeleton.css';

/**
 * Generic shimmering placeholder block. Compose it into page-specific
 * skeleton layouts (product cards, detail pages, form fields, etc.)
 * wherever a `loading` flag is true — width/height/radius should mirror
 * the real content it's standing in for so the swap doesn't jump.
 */
export default function Skeleton({ width, height = '1em', radius, circle = false, className = '', style }) {
  return (
    <span
      className={`skeleton ${circle ? 'skeleton-circle' : ''} ${className}`.trim()}
      style={{ width, height, borderRadius: circle ? undefined : radius, ...style }}
      aria-hidden="true"
    />
  );
}
