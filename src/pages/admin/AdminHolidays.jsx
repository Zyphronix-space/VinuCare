import { useState, useEffect } from 'react';
import { useUIFeedback } from '../../context/UIFeedbackContext';
import { API_BASE_URL } from '../../config/api';
import SkeletonTableRows from '../../components/ui/SkeletonTableRows';

const API_BASE = `${API_BASE_URL}/api/admin/holidays`;
const EMPTY_FORM = { date: '', name: '' };

export default function AdminHolidays() {
  const { confirm, success, error: notifyError } = useUIFeedback();
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    loadHolidays();
  }, []);

  async function loadHolidays() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_BASE, { credentials: 'include' });
      if (!res.ok) throw new Error('Server responded ' + res.status);
      setHolidays(await res.json());
    } catch (err) {
      console.error('Failed to load holidays:', err);
      setError('Failed to load holidays: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  function openAdd() {
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.date || !form.name.trim()) return;
    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Server responded ' + res.status);
      setHolidays(prev => [...prev, body].sort((a, b) => a.date.localeCompare(b.date)));
      setModalOpen(false);
      success('Holiday added.');
    } catch (err) {
      console.error('Failed to add holiday:', err);
      notifyError('Failed to add holiday: ' + err.message);
    }
  }

  async function handleDelete(h) {
    const ok = await confirm({
      title: 'Remove holiday?',
      message: `Remove "${h.name}" (${h.date})? Customers will be able to book that day again.`,
      confirmLabel: 'Remove',
      danger: true,
    });
    if (!ok) return;
    try {
      const res = await fetch(`${API_BASE}/${h.id}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) throw new Error('Server responded ' + res.status);
      setHolidays(prev => prev.filter(x => x.id !== h.id));
      success('Holiday removed.');
    } catch (err) {
      console.error('Failed to delete holiday:', err);
      notifyError('Failed to delete holiday: ' + err.message);
    }
  }

  return (
    <>
      <div className="admin-topbar">
        <div>
          <h1>Holidays</h1>
          <p>Days the clinic is closed — grayed out on the booking calendar for every doctor. Synced with the full 2026 Sri Lankan public holiday calendar, including Poya days. These dates shift every year, so 2027 onward will need a refresh here.</p>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={openAdd}>+ Add Holiday</button>
      </div>

      <div className="admin-panel">
        {error && <div className="admin-error" style={{ color: 'red', padding: '12px' }}>{error}</div>}

        {!error && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Name</th>
                  <th></th>
                </tr>
              </thead>
              {loading ? <SkeletonTableRows columns={3} /> : (
              <tbody>
                {holidays.map(h => (
                  <tr key={h.id}>
                    <td className="admin-cell-main">{h.date}</td>
                    <td>{h.name}</td>
                    <td>
                      <div className="admin-table-actions">
                        <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => handleDelete(h)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              )}
            </table>
            {!loading && holidays.length === 0 && <div className="admin-empty">No holidays added yet.</div>}
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="admin-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <h3>Add Holiday</h3>
            <form onSubmit={handleSave}>
              <div className="admin-field">
                <label>Date</label>
                <input required type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
              </div>
              <div className="admin-field">
                <label>Name</label>
                <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Vesak Full Moon Poya Day" />
              </div>
              <div className="admin-modal-actions">
                <button type="button" className="admin-btn admin-btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="admin-btn admin-btn-primary">Add Holiday</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
