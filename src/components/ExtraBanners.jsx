import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';

// Renders any admin-added promo banners for a page (Admin > Banners > "+ Add
// Banner"). Renders nothing until an admin actually adds one for this page,
// so it's invisible/no-op on pages nobody has customized yet.
export default function ExtraBanners({ page, excludeKeys = [] }) {
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/admin/banners`)
      .then(res => res.json())
      .then(data => {
        const list = (Array.isArray(data) ? data : [])
          .filter(b => b.page === page && b.type === 'offer' && !excludeKeys.includes(b.bannerKey))
          .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
        setBanners(list);
      })
      .catch(() => {});
  }, [page]);

  if (banners.length === 0) return null;

  return (
    <section style={{ padding: '60px 5%' }}>
      <style>{`
        .extra-banner-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; max-width: 1300px; margin: 0 auto; }
        .extra-banner-card { border-radius: 18px; overflow: hidden; background: var(--white); box-shadow: 0 8px 24px rgba(0,0,0,.08); display: flex; flex-direction: column; }
        .extra-banner-card img { width: 100%; height: 180px; object-fit: cover; display: block; }
        .extra-banner-body { padding: 20px 22px; }
        .extra-banner-tag { display: inline-block; background: var(--lavender-100); color: var(--lavender-700); font-size: .72rem; font-weight: 700; padding: 4px 10px; border-radius: 20px; margin-bottom: 8px; }
        .extra-banner-body h3 { font-family: 'Cormorant Garamond', serif; font-size: 1.2rem; margin: 0 0 6px; }
        .extra-banner-body p { color: var(--text-light); font-size: .85rem; margin: 0 0 12px; line-height: 1.5; }
        .extra-banner-price-row { display: flex; align-items: baseline; gap: 8px; }
        .extra-banner-price-row strong { font-size: 1.3rem; color: var(--lavender-600); }
        .extra-banner-price-row s { color: var(--text-light); font-size: .85rem; }
      `}</style>
      <div className="extra-banner-grid">
        {banners.map(b => (
          <div className="extra-banner-card" key={b.bannerKey}>
            {b.image && <img src={b.image} alt={b.alt || b.title} />}
            <div className="extra-banner-body">
              {b.tag && <span className="extra-banner-tag">{b.tag}</span>}
              <h3>{b.title}</h3>
              {b.description && <p>{b.description}</p>}
              {(b.price || b.originalPrice) && (
                <div className="extra-banner-price-row">
                  {b.price && <strong>{b.price}</strong>}
                  {b.originalPrice && <s>{b.originalPrice}</s>}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
