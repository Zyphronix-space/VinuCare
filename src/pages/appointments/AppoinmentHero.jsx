import { useState, useEffect } from 'react';
import { AlertIcon } from '../../components/ui/Icons';
import { API_BASE_URL } from '../../config/api';

const DEFAULT_IMG = 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=1200&auto=format&fit=crop&q=70';

export default function AppointmentHero() {
  // Admin-customizable via Admin > Banners (appointments_hero slot). Falls
  // back to the bundled default image/copy whenever it hasn't been customized.
  const [banner, setBanner] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/admin/banners`)
      .then(res => res.json())
      .then(data => {
        const found = (Array.isArray(data) ? data : []).find(b => b.bannerKey === 'appointments_hero');
        if (found) setBanner(found);
      })
      .catch(() => {});
  }, []);

  const img = banner?.image || DEFAULT_IMG;
  const tag = banner?.tag || 'Online Booking';
  const title = banner?.title || 'Schedule Your Visit';
  const subtitle = banner?.description || 'Easy online booking — we confirm within 2 hours. Select your pet, service and preferred time.';

  return (
    <div className="page-hero-wrap">
      <div className="page-hero-img">
        <img
          src={img}
          alt={banner?.alt || 'Book appointment'}
        />
      </div>
      <div className="page-hero-overlay"></div>
      <div className="page-hero-content">
        <span className="pill-tag">{tag}</span>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
    </div>
  );
}

export function EmergencyStrip() {
  return (
    <a href="tel:+94789416906" className="appt-emergency-strip">
      <span className="appt-emergency-icon"><AlertIcon size={18} /></span>
      <span>Pet emergency? Call us now — <strong>+94 78 941 6906</strong></span>
    </a>
  );
}
