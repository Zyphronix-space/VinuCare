import { useState, useEffect } from 'react';
import { getAdminSocket } from '../../lib/adminSocket';
import { API_BASE_URL } from '../../config/api';
import SkeletonList from '../../components/ui/SkeletonList';

const API_BASE = `${API_BASE_URL}/api/admin/error-logs`;

function formatTime(iso) {
  const d = new Date(iso);
  const sameDay = d.toDateString() === new Date().toDateString();
  return sameDay
    ? d.toLocaleTimeString('en-LK', { hour: '2-digit', minute: '2-digit' })
    : d.toLocaleDateString('en-LK', { month: 'short', day: 'numeric' });
}

// Plain inline panel on the Overview tab — same shell as the "Live
// activity" panel next to it, no bell/dropdown involved.
export default function ErrorLogsPanel() {
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(API_BASE, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : []))
      .then(setErrors)
      .catch(() => {})
      .finally(() => setLoading(false));

    const socket = getAdminSocket();
    const handleNew = (entry) => setErrors((prev) => [entry, ...prev].slice(0, 50));
    socket.on('error:new', handleNew);
    return () => socket.off('error:new', handleNew);
  }, []);

  return (
    <div className="admin-panel">
      <div className="admin-panel-head">
        <h2>System Errors</h2>
      </div>
      {loading ? (
        <SkeletonList rows={4} />
      ) : errors.length === 0 ? (
        <p style={{ color: 'var(--admin-muted)' }}>No errors — all clear.</p>
      ) : (
        <ul className="admin-live-feed">
          {errors.slice(0, 10).map((e) => (
            <li key={e.id}>
              <span>{e.message}</span>
              <time>{formatTime(e.createdAt)}</time>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
