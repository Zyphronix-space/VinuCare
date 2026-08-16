import { useState, useEffect } from 'react';
import { useUIFeedback } from '../../context/UIFeedbackContext';
import { API_BASE_URL } from '../../config/api';
import SkeletonTableRows from '../../components/ui/SkeletonTableRows';

const ROLES = ['Admin', 'Doctor', 'Nurse', 'Customer'];
const API_BASE = `${API_BASE_URL}/api/admin/users`;

const EMPTY_FORM = { name: '', email: '', role: 'Doctor', specialty: '', phone: '', status: 'Active' };

function badgeClass(value) {
  return 'admin-badge badge-' + value.toLowerCase().replace(/\s+/g, '');
}

// New signups default to role "user" in the database; the admin panel's
// own "Add User" form uses "Customer" for the same concept. Normalize so
// the role filter/badge treats them as one thing instead of splitting
// self-signed-up customers away from manually-added ones.
function roleLabel(role) {
  return !role || role === 'user' ? 'Customer' : role;
}

// Accounts that haven't confirmed their email yet shouldn't read as a
// normal active user — regardless of the stored `status` column (which
// defaults to "Active" at signup), show them as Pending until verified.
function statusLabel(u) {
  return !u.is_verified ? 'Pending' : u.status;
}

export default function AdminUsers() {
  const { confirm, success, error: notifyError } = useUIFeedback();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_BASE, { credentials: 'include' });
      if (!res.ok) throw new Error('Server responded ' + res.status);
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users:', err);
      setError('Failed to load users: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  const filtered = users.filter(u => {
    const matchesQuery = (u.name + u.email).toLowerCase().includes(query.toLowerCase());
    const matchesRole = roleFilter === 'all' || roleLabel(u.role) === roleFilter;
    return matchesQuery && matchesRole;
  });

  function openAdd() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEdit(user) {
    setEditingId(user.id);
    setForm({
      name: user.name,
      email: user.email,
      // Raw DB role is "user" for anyone who self-signed-up (never one
      // of the dropdown's own option values: Admin/Doctor/Nurse/
      // Customer). A <select> whose value doesn't match any option
      // just visually falls back to showing the first one ("Admin")
      // while the real state stays "user" — so the field looked
      // already set to Admin, nothing fired onChange, and Save
      // silently resubmitted the unchanged "user" role. Normalizing
      // here keeps the form's real state in sync with what's shown.
      role: roleLabel(user.role),
      specialty: user.specialty || '',
      phone: user.phone || '',
      status: user.status,
    });
    setModalOpen(true);
  }

  async function handleDelete(id) {
    const ok = await confirm({
      title: 'Remove user?',
      message: 'Remove this user? This cannot be undone.',
      confirmLabel: 'Remove',
      danger: true,
    });
    if (!ok) return;
    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || 'Server responded ' + res.status);
      }
      setUsers(prev => prev.filter(u => u.id !== id));
      success('User removed.');
    } catch (err) {
      console.error('Failed to delete user:', err);
      notifyError('Failed to delete user: ' + err.message);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;

    try {
      if (editingId) {
        const res = await fetch(`${API_BASE}/${editingId}`, {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error('Server responded ' + res.status);
        setUsers(prev => prev.map(u => (u.id === editingId ? { ...u, ...form } : u)));
      } else {
        const res = await fetch(API_BASE, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error('Server responded ' + res.status);
        const created = await res.json();
        const newUser = { joined: new Date().toISOString().slice(0, 10), ...created };
        setUsers(prev => [newUser, ...prev]);
      }
      setModalOpen(false);
      success(editingId ? 'User updated.' : 'User added.');
    } catch (err) {
      console.error('Failed to save user:', err);
      notifyError('Failed to save user: ' + err.message);
    }
  }

  return (
    <>
      <div className="admin-topbar">
        <div>
          <h1>Users & Doctors</h1>
          <p>Add new doctors or staff, manage roles, and remove accounts.</p>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={openAdd}>+ Add Doctor / User</button>
      </div>

      <div className="admin-panel">
        <div className="admin-panel-head">
          <input
            className="admin-search"
            placeholder="Search by name or email…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <div className="admin-tabs">
            <button
              type="button"
              className={`admin-tab-btn${roleFilter === 'all' ? ' active' : ''}`}
              onClick={() => setRoleFilter('all')}
            >
              All roles
            </button>
            {ROLES.map(r => (
              <button
                key={r}
                type="button"
                className={`admin-tab-btn${roleFilter === r ? ' active' : ''}`}
                onClick={() => setRoleFilter(r)}
              >
                {r}
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
                  <th>Name</th>
                  <th>Role</th>
                  <th>Specialty</th>
                  <th>Contact</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th></th>
                </tr>
              </thead>
              {loading ? <SkeletonTableRows columns={7} /> : (
              <tbody>
                {filtered.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div className="admin-cell-main">{u.name}</div>
                      <div className="admin-cell-sub">{u.id}</div>
                    </td>
                    <td><span className={badgeClass(roleLabel(u.role))}>{roleLabel(u.role)}</span></td>
                    <td>{u.specialty || '—'}</td>
                    <td>
                      <div>{u.email}</div>
                      <div className="admin-cell-sub">{u.phone}</div>
                    </td>
                    <td><span className={badgeClass(statusLabel(u))}>{statusLabel(u)}</span></td>
                    <td>{u.joined ? String(u.joined).slice(0, 10) : ''}</td>
                    <td>
                      <div className="admin-table-actions">
                        <button className="admin-btn admin-btn-outline admin-btn-sm" onClick={() => openEdit(u)}>Edit</button>
                        <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => handleDelete(u.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              )}
            </table>
            {!loading && filtered.length === 0 && <div className="admin-empty">No users match that search.</div>}
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="admin-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <h3>{editingId ? 'Edit User' : 'Add Doctor / User'}</h3>
            <form onSubmit={handleSave}>
              <div className="admin-field">
                <label>Full name</label>
                <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="admin-field">
                <label>Email</label>
                <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="admin-field-row">
                <div className="admin-field">
                  <label>Role</label>
                  <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="admin-field">
                  <label>Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option>Active</option>
                    <option>On Leave</option>
                    <option>Suspended</option>
                  </select>
                </div>
              </div>
              {form.role === 'Doctor' && (
                <div className="admin-field">
                  <label>Specialty</label>
                  <input value={form.specialty} onChange={e => setForm({ ...form, specialty: e.target.value })} placeholder="e.g. Small Animal Surgery" />
                </div>
              )}
              <div className="admin-field">
                <label>Phone</label>
                <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="admin-modal-actions">
                <button type="button" className="admin-btn admin-btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="admin-btn admin-btn-primary">{editingId ? 'Save Changes' : 'Add User'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}