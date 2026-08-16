import Skeleton from '../../components/ui/Skeleton';

export default function ReviewCardSkeleton() {
  return (
    <div className="rev-card-full" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div className="rev-card-body">
        <div className="rev-header" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
          <Skeleton circle width="46px" height="46px" />
          <div style={{ flex: 1 }}>
            <Skeleton width="55%" height="1rem" style={{ marginBottom: 6 }} />
            <Skeleton width="35%" height="0.82rem" />
          </div>
        </div>
        <Skeleton width="100px" height="1rem" style={{ marginBottom: 8 }} />
        <Skeleton width="100%" height="0.9rem" style={{ marginBottom: 6 }} />
        <Skeleton width="90%" height="0.9rem" style={{ marginBottom: 6 }} />
        <Skeleton width="60%" height="0.9rem" style={{ marginBottom: 12 }} />
        <Skeleton width="80px" height="1.3rem" radius="12px" />
      </div>
    </div>
  );
}
