import { useState, useEffect } from 'react';
import { useUIFeedback } from '../../context/UIFeedbackContext';
import { API_BASE_URL } from '../../config/api';
import GlassSelect from '../appointments/GlassSelect';
import SkeletonTableRows from '../../components/ui/SkeletonTableRows';
import SkeletonStatGrid from '../../components/ui/SkeletonStatGrid';

const API_BASE = `${API_BASE_URL}/api/admin/transactions`;
const STATUS_OPTIONS = ['Paid', 'Pending', 'Failed', 'Refunded'];
const TYPE_OPTIONS = ['Appointment', 'Product'];

function badgeClass(status) {
  return 'admin-badge badge-' + status.toLowerCase();
}
function money(n) {
  return 'Rs. ' + Number(n).toLocaleString('en-LK');
}

export default function AdminTransactions() {
  // Transactions are a financial record, so this view is mostly read-only
  // by design — the only mutation is the guided "record a refund" flow
  // below, which never edits amount/customer/etc. directly. Actually
  // moving money still happens through the PayHere merchant portal; this
  // just records that it was done.
  const { success, error: notifyError } = useUIFeedback();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [refundTarget, setRefundTarget] = useState(null);
  const [refundReason, setRefundReason] = useState('');

  useEffect(() => {
    loadTransactions();
  }, []);

  async function loadTransactions() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_BASE, { credentials: 'include' });
      if (!res.ok) throw new Error('Server responded ' + res.status);
      const data = await res.json();
      setTransactions(data);
    } catch (err) {
      console.error('Failed to load transactions:', err);
      setError('Failed to load transactions: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  const filtered = transactions.filter(t => {
    const matchesQuery = (t.customer + t.reference + t.id).toLowerCase().includes(query.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesType = typeFilter === 'all' || t.type === typeFilter;
    return matchesQuery && matchesStatus && matchesType;
  });

  const totalShown = filtered.filter(t => t.status === 'Paid').reduce((sum, t) => sum + Number(t.amount), 0);

  function openRefund(t) {
    setRefundTarget(t);
    setRefundReason('');
  }

  async function submitRefund(e) {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/${refundTarget.id}/refund`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: refundReason }),
      });
      if (!res.ok) throw new Error('Server responded ' + res.status);
      setTransactions(prev => prev.map(t => (
        t.id === refundTarget.id ? { ...t, status: 'Refunded', refundReason } : t
      )));
      setRefundTarget(null);
      success('Transaction marked as refunded. Remember to process the actual refund through the PayHere merchant portal.');
    } catch (err) {
      console.error('Failed to record refund:', err);
      notifyError('Failed to record refund: ' + err.message);
    }
  }

  return (
    <>
      <div className="admin-topbar">
        <div>
          <h1>Transaction History</h1>
          <p>Payments made through the website for appointments and shop orders.</p>
        </div>
      </div>

      {loading ? <SkeletonStatGrid count={2} /> : (
      <div className="admin-stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: 20 }}>
        <div className="admin-stat-card">
          <div className="admin-stat-label">Paid (filtered view)</div>
          <div className="admin-stat-value">{money(totalShown)}</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-label">Transactions shown</div>
          <div className="admin-stat-value">{filtered.length}</div>
        </div>
      </div>
      )}

      <div className="admin-panel">
        <div className="admin-panel-head">
          <input
            className="admin-search"
            placeholder="Search by customer or reference…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <div style={{ display: 'flex', gap: 10 }}>
            <GlassSelect
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All types' },
                ...TYPE_OPTIONS.map(t => ({ value: t, label: t })),
              ]}
            />
            <GlassSelect
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All statuses' },
                ...STATUS_OPTIONS.map(s => ({ value: s, label: s })),
              ]}
            />
          </div>
        </div>

        {error && <div className="admin-error" style={{ color: 'red', padding: '12px' }}>{error}</div>}

        {!error && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Transaction</th>
                  <th>Customer</th>
                  <th>Type</th>
                  <th>Reference</th>
                  <th>Method</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              {loading ? <SkeletonTableRows columns={8} /> : (
              <tbody>
                {filtered.map(t => (
                  <tr key={t.id}>
                    <td>
                      <div className="admin-cell-main">T-{t.id}</div>
                      <div className="admin-cell-sub">{t.date}</div>
                    </td>
                    <td>{t.customer || '—'}</td>
                    <td>{t.type}</td>
                    <td>{t.reference}</td>
                    <td>{t.method}</td>
                    <td>{money(t.amount)}</td>
                    <td><span className={badgeClass(t.status)}>{t.status}</span></td>
                    <td>
                      {t.status === 'Paid' && (
                        <button className="admin-btn admin-btn-outline admin-btn-sm" onClick={() => openRefund(t)}>Refund</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              )}
            </table>
            {!loading && filtered.length === 0 && <div className="admin-empty">No transactions match that search.</div>}
          </div>
        )}
      </div>

      {refundTarget && (
        <div className="admin-modal-overlay" onClick={() => setRefundTarget(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <h3>Mark T-{refundTarget.id} as refunded?</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--admin-muted)' }}>
              This only records the refund in VinuCare — it does not call PayHere. Process the
              actual refund through the PayHere merchant portal, then confirm it here.
            </p>
            <form onSubmit={submitRefund}>
              <div className="admin-field">
                <label>Reason (optional)</label>
                <textarea value={refundReason} onChange={e => setRefundReason(e.target.value)} />
              </div>
              <div className="admin-modal-actions">
                <button type="button" className="admin-btn admin-btn-outline" onClick={() => setRefundTarget(null)}>Cancel</button>
                <button type="submit" className="admin-btn admin-btn-primary">Mark Refunded</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
