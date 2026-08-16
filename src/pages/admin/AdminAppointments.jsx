import { useState, useEffect } from 'react';
import { useUIFeedback } from '../../context/UIFeedbackContext';
import { API_BASE_URL } from '../../config/api';
import GlassSelect from '../appointments/GlassSelect';
import SkeletonTableRows from '../../components/ui/SkeletonTableRows';

const API_BASE = `${API_BASE_URL}/api/admin/appointments`;
const STATUS_OPTIONS = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];

function badgeClass(status) {
  return 'admin-badge badge-' + status.toLowerCase();
}

export default function AdminAppointments({
  hideDoctorColumn = false,
  canDelete = true,
  showNotesAction = false,
  showCheckInAction = false,
}) {
  const { confirm, success, error: notifyError } = useUIFeedback();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [notesTarget, setNotesTarget] = useState(null); // appointment being viewed/edited, or null
  const [notesForm, setNotesForm] = useState({ doctorNotes: '', prescription: '' });

  useEffect(() => {
    loadAppointments();
  }, []);

  async function loadAppointments() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_BASE, { credentials: 'include' });
      if (!res.ok) throw new Error('Server responded ' + res.status);
      const data = await res.json();
      setAppointments(data);
    } catch (err) {
      console.error('Failed to load appointments:', err);
      setError('Failed to load appointments: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  const filtered = appointments.filter(a => {
    const matchesQuery = (a.petName + a.ownerName + a.service).toLowerCase().includes(query.toLowerCase());
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  async function updateStatus(id, status) {
    const prev = appointments;
    setAppointments(cur => cur.map(a => (a.id === id ? { ...a, status } : a)));
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Server responded ' + res.status);
    } catch (err) {
      console.error('Failed to update status:', err);
      notifyError('Failed to update status: ' + err.message);
      setAppointments(prev); // revert on failure
    }
  }

  async function handleDelete(id) {
    const ok = await confirm({
      title: 'Remove appointment?',
      message: 'Remove this appointment record? This cannot be undone.',
      confirmLabel: 'Remove',
      danger: true,
    });
    if (!ok) return;
    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) throw new Error('Server responded ' + res.status);
      setAppointments(prev => prev.filter(a => a.id !== id));
      success('Appointment removed.');
    } catch (err) {
      console.error('Failed to delete appointment:', err);
      notifyError('Failed to delete appointment: ' + err.message);
    }
  }

  async function handleCheckIn(id) {
    try {
      const res = await fetch(`${API_BASE}/${id}/checkin`, { method: 'PATCH', credentials: 'include' });
      if (!res.ok) throw new Error('Server responded ' + res.status);
      const data = await res.json();
      setAppointments(cur => cur.map(a => (a.id === id ? { ...a, checkedInAt: data.checkedInAt } : a)));
      success('Patient checked in.');
    } catch (err) {
      console.error('Failed to check in patient:', err);
      notifyError('Failed to check in patient: ' + err.message);
    }
  }

  function openNotes(a) {
    setNotesTarget(a);
    setNotesForm({ doctorNotes: a.doctorNotes || '', prescription: a.prescription || '' });
  }

  async function saveNotes(e) {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/${notesTarget.id}/notes`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notesForm),
      });
      if (!res.ok) throw new Error('Server responded ' + res.status);
      setAppointments(cur => cur.map(a => (a.id === notesTarget.id ? { ...a, ...notesForm } : a)));
      setNotesTarget(null);
      success('Notes saved.');
    } catch (err) {
      console.error('Failed to save notes:', err);
      notifyError('Failed to save notes: ' + err.message);
    }
  }

  return (
    <>
      <div className="admin-topbar">
        <div>
          <h1>Appointments</h1>
          <p>Confirm, reassign, or cancel bookings coming in from the appointments page.</p>
        </div>
      </div>

      <div className="admin-panel">
        <div className="admin-panel-head">
          <input
            className="admin-search"
            placeholder="Search by pet, owner, or service…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <div className="admin-tabs">
            <button
              type="button"
              className={`admin-tab-btn${statusFilter === 'all' ? ' active' : ''}`}
              onClick={() => setStatusFilter('all')}
            >
              All statuses
            </button>
            {STATUS_OPTIONS.map(s => (
              <button
                key={s}
                type="button"
                className={`admin-tab-btn${statusFilter === s ? ' active' : ''}`}
                onClick={() => setStatusFilter(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {error && <div className="admin-error" style={{ color: 'red', padding: '12px' }}>{error}</div>}

        {!error && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Pet / Owner</th>
                  <th>Service</th>
                  {!hideDoctorColumn && <th>Doctor</th>}
                  <th>Date & Time</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              {loading ? <SkeletonTableRows columns={hideDoctorColumn ? 5 : 6} /> : (
              <tbody>
                {filtered.map(a => (
                  <tr key={a.id}>
                    <td>
                      <div className="admin-cell-main">{a.petName}</div>
                      <div className="admin-cell-sub">{a.ownerName}</div>
                    </td>
                    <td>{a.service}</td>
                    {!hideDoctorColumn && <td>{a.doctor || '—'}</td>}
                    <td>
                      {a.date}<div className="admin-cell-sub">{a.time}</div>
                      {a.checkedInAt && <div className="admin-cell-sub">Checked in {new Date(a.checkedInAt).toLocaleTimeString('en-LK', { hour: '2-digit', minute: '2-digit' })}</div>}
                    </td>
                    <td><span className={badgeClass(a.status)}>{a.status}</span></td>
                    <td>
                      <div className="admin-table-actions">
                        <GlassSelect
                          value={a.status}
                          onChange={e => updateStatus(a.id, e.target.value)}
                          options={STATUS_OPTIONS.map(s => ({ value: s, label: s }))}
                        />
                        {showCheckInAction && !a.checkedInAt && (
                          <button className="admin-btn admin-btn-outline admin-btn-sm" onClick={() => handleCheckIn(a.id)}>Check In</button>
                        )}
                        {(showNotesAction || a.doctorNotes || a.prescription) && (
                          <button className="admin-btn admin-btn-outline admin-btn-sm" onClick={() => openNotes(a)}>Notes</button>
                        )}
                        {canDelete && (
                          <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => handleDelete(a.id)}>Delete</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              )}
            </table>
            {!loading && filtered.length === 0 && <div className="admin-empty">No appointments match that search.</div>}
          </div>
        )}
      </div>

      {notesTarget && (
        <div className="admin-modal-overlay" onClick={() => setNotesTarget(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <h3>{notesTarget.petName} — {notesTarget.service}</h3>
            <form onSubmit={saveNotes}>
              <div className="admin-field">
                <label>Visit notes</label>
                <textarea
                  value={notesForm.doctorNotes}
                  readOnly={!showNotesAction}
                  onChange={e => setNotesForm(f => ({ ...f, doctorNotes: e.target.value }))}
                />
              </div>
              <div className="admin-field">
                <label>Prescription</label>
                <textarea
                  value={notesForm.prescription}
                  readOnly={!showNotesAction}
                  onChange={e => setNotesForm(f => ({ ...f, prescription: e.target.value }))}
                />
              </div>
              <div className="admin-modal-actions">
                <button type="button" className="admin-btn admin-btn-outline" onClick={() => setNotesTarget(null)}>Close</button>
                {showNotesAction && <button type="submit" className="admin-btn admin-btn-primary">Save</button>}
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
