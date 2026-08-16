import { CategoryIcon } from './ServiceMeta';

function ServiceCard({
  category,
  title,
  description,
  image,
  tags,
  btnText,
  onBookClick,
  onCardClick,
  accent,
}) {
  return (
    <div
      className="svc-card"
      onClick={onCardClick}
      role={onCardClick ? 'button' : undefined}
      tabIndex={onCardClick ? 0 : undefined}
    >
      <div className="svc-card-img">
        <img src={image} alt={title} loading="lazy" />
      </div>
      <div className="svc-card-scrim" />

      <div className="svc-card-icon" style={{ background: accent }}>
        <CategoryIcon category={category} />
      </div>

      <div className="svc-card-body">
        <span className="svc-card-category">{category}</span>
        <h3>{title}</h3>
        <p className="svc-card-desc">{description}</p>

        <div className="svc-card-tags">
          {tags.slice(0, 4).map((tag, i) => (
            <span key={i} className="svc-card-tag">{tag}</span>
          ))}
        </div>

        <div className="svc-card-actions">
          <button
            className="svc-card-btn"
            style={{ background: accent }}
            onClick={(e) => { e.stopPropagation(); onBookClick(); }}
          >
            {btnText}
          </button>
          {onCardClick && <span className="svc-card-link">View details →</span>}
        </div>
      </div>
    </div>
  );
}

export default ServiceCard;