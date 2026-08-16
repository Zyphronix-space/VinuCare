import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config/api';
import SkeletonTableRows from '../../components/ui/SkeletonTableRows';

const API_BASE = `${API_BASE_URL}/api/admin/audit-log`;

function formatTime(iso) {
  return new Date(iso).toLocaleString('en-LK', { dateStyle: 'medium', timeStyle: 'short' });
}

export default function AdminAuditLog() {
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
        console.error('Failed to load audit log:', err);
        setError('Failed to load audit log: ' + err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = entries.filter(e =>
    `${e.actorName} ${e.action} ${e.entityType}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      <div className="admin-topbar">
        <div>
          <h1>Audit Log</h1>
          <p>Who changed what, and when — covers user, product, and banner edits.</p>
        </div>
      </div>

      <div className="admin-panel">
        <div className="admin-panel-head">
          <input
            className="admin-search"
            placeholder="Search by actor, action, or entity…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>

        {error && <div className="admin-error" style={{ color: 'red', padding: '12px' }}>{error}</div>}

        {!error && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Actor</th>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>Details</th>
                </tr>
              </thead>
              {loading ? <SkeletonTableRows columns={5} /> : (
              <tbody>
                {filtered.map(e => (
                  <tr key={e.id}>
                    <td>{formatTime(e.createdAt)}</td>
                    <td>
                      <div className="admin-cell-main">{e.actorName || '—'}</div>
                      <div className="admin-cell-sub">{e.actorRole}</div>
                    </td>
                    <td>{e.action}</td>
                    <td>{e.entityType} #{e.entityId}</td>
                    <td>{e.details || '—'}</td>
                  </tr>
                ))}
              </tbody>
              )}
            </table>
            {!loading && filtered.length === 0 && <div className="admin-empty">No matching audit entries.</div>}
          </div>
        )}
      </div>
    </>
  );
}
