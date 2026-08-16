import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config/api';

const DEFAULT_IMG = 'https://images.unsplash.com/photo-1601758125946-6ec2ef64daf8?w=1400&auto=format&fit=crop&q=70';

export default function ShopHero() {
  // Admin-customizable via Admin > Banners (shop_hero slot). Falls back to
  // the bundled default image/copy whenever it hasn't been customized.
  const [banner, setBanner] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/admin/banners`)
      .then(res => res.json())
      .then(data => {
        const found = (Array.isArray(data) ? data : []).find(b => b.bannerKey === 'shop_hero');
        if (found) setBanner(found);
      })
      .catch(() => {});
  }, []);

  const img = banner?.image || DEFAULT_IMG;
  const tag = banner?.tag || 'Pet Shop';
  const title = banner?.title || 'Premium Pet Products';
  const subtitle = banner?.description || 'Vet-approved food, accessories, health supplements and more — delivered to your door.';

  return (
    <div className="page-hero-wrap">
      <div className="page-hero-img">
        <img src={img} alt={banner?.alt || 'Pet store'} />
      </div>
      <div className="page-hero-overlay"></div>
      <div className="page-hero-content">
        <span className="pill-tag" style={{ background: "rgba(255,255,255,.2)", color: "#fff" }}>{tag}</span>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
    </div>
  );
}
