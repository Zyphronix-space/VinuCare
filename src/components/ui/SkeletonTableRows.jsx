import Skeleton from './Skeleton';

// Drop-in <tbody> shown in place of real rows while an admin table's data
// is still loading — pass the same column count as the real <thead> so
// the header doesn't jump when the real rows swap in.
export default function SkeletonTableRows({ columns, rows = 6 }) {
  return (
    <tbody>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r}>
          {Array.from({ length: columns }).map((_, c) => (
            <td key={c}>
              <Skeleton width={`${55 + ((r + c) % 4) * 12}%`} height="0.85rem" />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}
