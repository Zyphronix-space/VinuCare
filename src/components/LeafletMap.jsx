import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Leaflet's default marker image paths assume a bundler that copies
// assets to fixed URLs, which Vite doesn't do automatically — without
// this, markers render as broken images.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const DEFAULT_ADDRESS = 'VINU Care Agency, Kamburugamuwa';

// OpenStreetMap's Nominatim geocoder — free, no API key or billing,
// subject to a fair-use rate limit (fine for a single lookup on page load).
async function geocode(address) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address)}`
  );
  if (!res.ok) throw new Error('Geocoding failed');
  const results = await res.json();
  if (!results.length) throw new Error('Address not found');
  return { lat: parseFloat(results[0].lat), lon: parseFloat(results[0].lon) };
}

// Interactive map built on Leaflet + OpenStreetMap tiles — entirely free,
// no API key, no signup, no billing. Falls back to the old Google Maps
// iframe embed (also free, no key) if the address can't be geocoded.
export default function LeafletMap({ address = DEFAULT_ADDRESS, title = 'VinuCare Veterinary & Pet Care' }) {
  const containerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return undefined;
    let cancelled = false;

    geocode(address)
      .then(({ lat, lon }) => {
        if (cancelled || !containerRef.current) return;

        const map = L.map(containerRef.current, { zoomControl: true }).setView([lat, lon], 16);
        mapInstanceRef.current = map;

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map);

        L.marker([lat, lon]).addTo(map).bindPopup(title);
      })
      .catch(() => { if (!cancelled) setFailed(true); });

    return () => {
      cancelled = true;
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
  }, [address, title]);

  if (failed) {
    return (
      <iframe
        title={title}
        src={`https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
      />
    );
  }

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
}
