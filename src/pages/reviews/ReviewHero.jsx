import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config/api';

const DEFAULT_IMG = 'https://images.unsplash.com/photo-1522276498395-f4f68f7f8454?w=1400&auto=format&fit=crop&q=70';

function ReviewHero() {
  // Admin-customizable via Admin > Banners (reviews_hero slot). Falls back
  // to the bundled default image/copy whenever it hasn't been customized.
  const [banner, setBanner] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/admin/banners`)
      .then(res => res.json())
      .then(data => {
        const found = (Array.isArray(data) ? data : []).find(b => b.bannerKey === 'reviews_hero');
        if (found) setBanner(found);
      })
      .catch(() => {});
  }, []);

  const img = banner?.image || DEFAULT_IMG;
  const tag = banner?.tag || 'Customer Love';
  const title = banner?.title || 'What Our Pet Families Say';
  const subtitle = banner?.description || 'Real stories from real pet owners who trust VinuCare with the animals they love.';

  return (
    <div className="page-hero-wrap">
      <div className="page-hero-img">
        <img src={img} alt={banner?.alt || 'Happy dog owner'} />
      </div>

      <div className="page-hero-overlay"></div>

      <div className="page-hero-content">
        <span
          className="pill-tag"
          style={{
            background: "rgba(255,255,255,.2)",
            color: "#fff",
          }}
        >
          {tag}
        </span>

        <h1>{title}</h1>

        <p>{subtitle}</p>
      </div>
    </div>
  );
}

export default ReviewHero;
