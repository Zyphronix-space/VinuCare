import Skeleton from './Skeleton';

// Mirrors .admin-stat-card's label/value/sub-line structure so swapping
// in the real numbers doesn't reflow the grid.
export default function SkeletonStatGrid({ count = 4 }) {
  return (
    <div className="admin-stat-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div className="admin-stat-card" key={i}>
          <Skeleton width="60%" height="0.78rem" style={{ marginBottom: 10 }} />
          <Skeleton width="45%" height="1.6rem" style={{ marginBottom: 8 }} />
          <Skeleton width="70%" height="0.72rem" />
        </div>
      ))}
    </div>
  );
}
