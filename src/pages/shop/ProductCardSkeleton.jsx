import Skeleton from '../../components/ui/Skeleton';

export default function ProductCardSkeleton() {
  return (
    <div className="product-card">
      <div className="product-img-wrap">
        <Skeleton width="100%" height="100%" radius={0} />
      </div>
      <div className="product-body">
        <Skeleton width="80%" height="0.95rem" />
        <Skeleton width="60%" height="0.78rem" />
        <Skeleton width="45%" height="1.15rem" style={{ marginTop: 'auto' }} />
      </div>
    </div>
  );
}
