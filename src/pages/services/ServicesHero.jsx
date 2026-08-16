import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config/api';

const DEFAULT_IMG = 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=1400&auto=format&fit=crop&q=70';

function ServicesHero() {
  // Admin-customizable via Admin > Banners (services_hero slot). Falls back
  // to the bundled default image/copy whenever it hasn't been customized.
  const [banner, setBanner] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/admin/banners`)
      .then(res => res.json())
      .then(data => {
        const found = (Array.isArray(data) ? data : []).find(b => b.bannerKey === 'services_hero');
        if (found) setBanner(found);
      })
      .catch(() => {});
  }, []);

  const img = banner?.image || DEFAULT_IMG;
  const tag = banner?.tag || 'All Services';
  const title = banner?.title || 'Comprehensive Pet Care Services';
  const subtitle = banner?.description || "From routine wellness to specialist procedures — we're your one-stop pet health destination.";

  return (
    <div className="page-hero-wrap">
      <div className="page-hero-img">
        <img src={img} alt={banner?.alt || 'Veterinary services'} />
      </div>
      <div className="page-hero-overlay"></div>
      <div className="page-hero-content">
        <span className="pill-tag" style={{ background: 'rgba(255,255,255,.2)', color: '#fff' }}>{tag}</span>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
    </div>
  );
}

export default ServicesHero;
