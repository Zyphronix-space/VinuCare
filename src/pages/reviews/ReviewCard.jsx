import { PawIcon } from '../../components/ui/Icons';

function ReviewCard({ review }) {
  const initials = review.name
    ? review.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const colors = ['#7C5CE8', '#4F2FBD', '#a78bfa', '#6d4ed7', '#8b5cf6'];
  const color  = colors[review.name?.charCodeAt(0) % colors.length] || colors[0];

  return (
    <div className="rev-card-full" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

      <div className="rev-card-body">
        <div className="rev-header" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>

          {/* Initials Avatar */}
          <div style={{
            width: '46px', height: '46px', borderRadius: '50%',
            background: color, color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: '700', fontSize: '1rem', flexShrink: 0
          }}>
            {initials}
          </div>

          <div>
            <div className="rev-name" style={{ fontWeight: '600', fontSize: '1rem' }}>
              {review.name}
            </div>
            <div className="rev-pet" style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 5 }}>
              <PawIcon size={12} /> {review.pet}
            </div>
          </div>
        </div>

        <div className="rev-stars" style={{ fontSize: '1rem', marginBottom: '8px' }}>
          {'⭐'.repeat((review.stars?.match(/[★⭐]/g) || []).length || 5)}
        </div>

        <p className="rev-text" style={{ fontSize: '0.93rem', lineHeight: '1.6', margin: '0 0 12px 0' }}>
          {review.review}
        </p>

        <span className="rev-service" style={{ fontSize: '0.78rem' }}>
          {review.service}
        </span>
      </div>

    </div>
  );
}

export default ReviewCard;