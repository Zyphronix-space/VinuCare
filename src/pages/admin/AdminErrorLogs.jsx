import { useState, useEffect } from 'react';
import { getAdminSocket } from '../../lib/adminSocket';
import { API_BASE_URL } from '../../config/api';
import SkeletonTableRows from '../../components/ui/SkeletonTableRows';

const API_BASE = `${API_BASE_URL}/api/admin/error-logs`;

function formatTime(iso) {
  return new Date(iso).toLocaleString('en-LK', { dateStyle: 'medium', timeStyle: 'short' });
}

export default function AdminErrorLogs() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(API_BASE, { credentials: 'include' });
        if (!res.ok) throw new Error('Server responded ' + res.status);
        setEntries(await res.json());
      } catch (err) {
        console.error('Failed to load error logs:', err);
        setError('Failed to load error logs: ' + err.message);
      } finally {
        setLoading(false);
      }
    })();

    const socket = getAdminSocket();
    const handleNew = (entry) => setEntries((prev) => [entry, ...prev].slice(0, 200));
    socket.on('error:new', handleNew);
    return () => socket.off('error:new', handleNew);
  }, []);

  const filtered = entries.filter((e) =>
    `${e.message} ${e.route || ''}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      <div className="admin-topbar">
        <div>
          <h1>Error Logs</h1>
          <p>Backend errors as they happen — from failed requests, unhandled exceptions, and crashes.</p>
        </div>
      </div>

      <div className="admin-panel">
        <div className="admin-panel-head">
          <input
            className="admin-search"
            placeholder="Search error messages…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {error && <div className="admin-error" style={{ color: 'red', padding: '12px' }}>{error}</div>}

        {!error && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Message</th>
                </tr>
              </thead>
              {loading ? <SkeletonTableRows columns={2} /> : (
              <tbody>
                {filtered.map((e) => (
                  <tr key={e.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>{formatTime(e.createdAt)}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '.82rem', wordBreak: 'break-word' }}>{e.message}</td>
                  </tr>
                ))}
              </tbody>
              )}
            </table>
            {!loading && filtered.length === 0 && <div className="admin-empty">No errors logged yet — good sign.</div>}
          </div>
        )}
      </div>
    </>
  );
}
