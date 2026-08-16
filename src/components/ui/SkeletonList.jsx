import Skeleton from './Skeleton';

// Matches .admin-live-feed's row shape (a line of text + a time stamp) —
// used for any feed-style list while its first fetch is in flight.
export default function SkeletonList({ rows = 5 }) {
  return (
    <ul className="admin-live-feed">
      {Array.from({ length: rows }).map((_, i) => (
        <li key={i}>
          <Skeleton width={`${50 + (i % 3) * 15}%`} height="0.85rem" />
          <Skeleton width="50px" height="0.75rem" />
        </li>
      ))}
    </ul>
  );
}
