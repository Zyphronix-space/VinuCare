import Skeleton from '../../components/ui/Skeleton';

export default function ProductDetailSkeleton() {
  return (
    <div className="product-detail-page">
      <div className="detail-breadcrumb">
        <Skeleton width="220px" height="0.85rem" />
      </div>

      <div className="product-detail-grid">
        {/* GALLERY */}
        <div className="detail-gallery">
          <Skeleton width="90px" height="1.4rem" radius="20px" style={{ marginBottom: 14 }} />
          <div className="detail-main-img-wrap">
            <Skeleton width="100%" height="100%" radius={0} />
          </div>
          <div className="detail-thumbs">
            <Skeleton width="64px" height="64px" radius="10px" />
          </div>
        </div>

        {/* INFO */}
        <div className="detail-info">
          <Skeleton width="70%" height="1.8rem" style={{ marginBottom: 14 }} />
          <Skeleton width="140px" height="1rem" style={{ marginBottom: 18 }} />

          <Skeleton width="100%" height="0.9rem" style={{ marginBottom: 8 }} />
          <Skeleton width="100%" height="0.9rem" style={{ marginBottom: 8 }} />
          <Skeleton width="60%" height="0.9rem" style={{ marginBottom: 24 }} />

          <Skeleton width="160px" height="1.6rem" style={{ marginBottom: 24 }} />

          <Skeleton width="100%" height="46px" radius="999px" />
        </div>
      </div>
    </div>
  );
}
