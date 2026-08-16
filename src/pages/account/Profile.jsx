import { useState, useEffect, useRef } from 'react';
import '../../styles/auth.css';
import '../../styles/profile.css';
import { useUIFeedback } from '../../context/UIFeedbackContext';
import { API_BASE_URL } from '../../config/api';
import { ImageIcon, TrashIcon } from '../../components/ui/Icons';
import Avatar from '../../components/ui/Avatar';
import Skeleton from '../../components/ui/Skeleton';
import { AVATAR_PRESETS, AVATAR_PRESET_PREFIX } from '../../lib/avatarPresets';

const MAX_AVATAR_BYTES = 3 * 1024 * 1024; // 3MB — base64-inflated, stays well under the 10mb JSON body limit

export default function Profile({ onNavigate, setUser }) {
  const { success: notifySuccess, error: notifyError } = useUIFeedback();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [appointments, setAppointments] = useState([]);
  const [orders, setOrders] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);
  const avatarInputRef = useRef(null);
  const avatarPickerRef = useRef(null);

  const loggedIn = !!localStorage.getItem('user');

  useEffect(() => {
    if (!loggedIn) { onNavigate('login'); return; }
    fetch(`${API_BASE_URL}/api/auth/me`, { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error('Could not load profile');
        return res.json();
      })
      .then((data) => {
        setProfile(data);
        setName(data.name || '');
        setPhone(data.phone || '');
      })
      .catch(() => setLoadError('Could not load your profile. Please try again.'))
      .finally(() => setLoading(false));
  }, [loggedIn, onNavigate]);

  useEffect(() => {
    if (!loggedIn) return;
    Promise.all([
      fetch(`${API_BASE_URL}/api/appointments/my`, { credentials: 'include' })
        .then((res) => (res.ok ? res.json() : [])),
      fetch(`${API_BASE_URL}/api/orders/my`, { credentials: 'include' })
        .then((res) => (res.ok ? res.json() : [])),
    ])
      .then(([appts, ords]) => {
        setAppointments(Array.isArray(appts) ? appts : []);
        setOrders(Array.isArray(ords) ? ords : []);
      })
      .catch(() => { /* history is supplementary — a failed fetch just leaves the lists empty */ })
      .finally(() => setHistoryLoading(false));
  }, [loggedIn]);

  useEffect(() => {
    if (!avatarPickerOpen) return;
    const handleClickOutside = (e) => {
      if (avatarPickerRef.current && !avatarPickerRef.current.contains(e.target)) {
        setAvatarPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [avatarPickerOpen]);

  const cancelEdit = () => {
    setName(profile.name || '');
    setPhone(profile.phone || '');
    setEditing(false);
  };

  // Shared by the name/phone save and the avatar upload below — both PUT
  // the same /me endpoint and need to keep localStorage/Nav's `user` in
  // sync afterwards, not just this page's own `profile` state.
  const syncUserEverywhere = (data) => {
    setProfile(data);
    const stored = JSON.parse(localStorage.getItem('user') || '{}');
    const updated = { ...stored, name: data.name, avatar: data.avatar };
    localStorage.setItem('user', JSON.stringify(updated));
    setUser(updated);
  };

  const saveAvatar = async (avatarValue, successMessage) => {
    setUploadingAvatar(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: profile.name, phone: profile.phone, avatar: avatarValue }),
      });
      const data = await res.json();
      if (!res.ok) { notifyError(data.message || 'Could not update photo'); return; }

      syncUserEverywhere(data);
      notifySuccess(successMessage);
      setAvatarPickerOpen(false);
    } catch {
      notifyError('Cannot connect to server. Make sure the backend is running.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleAvatarPick = (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // let picking the same file again re-fire onChange
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      notifyError('Please choose an image file');
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      notifyError('Image is too large — please choose one under 3MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => saveAvatar(reader.result, 'Profile photo updated');
    reader.readAsDataURL(file);
  };

  const handlePickPreset = (presetId) => saveAvatar(`${AVATAR_PRESET_PREFIX}${presetId}`, 'Profile photo updated');
  const handleRemoveAvatar = () => saveAvatar(null, 'Profile photo removed');

  const saveProfile = async () => {
    if (!name.trim()) { notifyError('Name is required'); return; }
    setSavingProfile(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone }),
      });
      const data = await res.json();
      if (!res.ok) { notifyError(data.message || 'Could not save changes'); return; }

      syncUserEverywhere(data);
      setEditing(false);
      notifySuccess('Profile updated');
    } catch {
      notifyError('Cannot connect to server. Make sure the backend is running.');
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async () => {
    if (!currentPassword || !newPassword) { notifyError('Fill in both password fields'); return; }
    if (newPassword.length < 6) { notifyError('New password must be at least 6 characters'); return; }
    if (newPassword !== confirmPassword) { notifyError('New passwords do not match'); return; }

    setSavingPassword(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/me/password`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) { notifyError(data.message || 'Could not change password'); return; }

      notifySuccess('Password changed successfully');
      setShowPasswordForm(false);
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch {
      notifyError('Cannot connect to server. Make sure the backend is running.');
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div id="page-profile" className="page active">
        <div className="profile-wrap">
          <div className="profile-card">
            <div className="profile-header">
              <Skeleton circle width="58px" height="58px" />
              <div>
                <Skeleton width="160px" height="1.6rem" style={{ marginBottom: 8 }} />
                <Skeleton width="90px" height="1.1rem" radius="999px" />
              </div>
            </div>
            <div className="profile-layout">
              <div className="profile-col profile-col-left">
                <div className="profile-section">
                  <div className="profile-section-head"><h2>Account Information</h2></div>
                  <div className="profile-info-list">
                    {[1, 2, 3, 4].map((i) => (
                      <div className="profile-info-row" key={i}>
                        <Skeleton width="35%" height="0.85rem" />
                        <Skeleton width="40%" height="0.85rem" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="profile-col profile-col-right">
                <div className="profile-section">
                  <div className="profile-section-head"><h2>Booking History</h2></div>
                  <div className="profile-history-list">
                    {[1, 2].map((i) => (
                      <div className="profile-history-item" key={i}>
                        <div className="profile-history-main">
                          <Skeleton width="50%" height="0.95rem" style={{ marginBottom: 6 }} />
                          <Skeleton width="70%" height="0.8rem" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loadError || !profile) {
    return (
      <div id="page-profile" className="page active">
        <div className="profile-wrap"><p className="auth-api-error">{loadError || 'Profile unavailable.'}</p></div>
      </div>
    );
  }

  // Combine both payable sources (appointment fees + shop orders) into one
  // timeline. Falls back to createdAt when nothing has been paid yet, so
  // pending items still sort sensibly alongside paid ones.
  const paymentHistory = [
    ...appointments
      .filter((a) => a.amount != null)
      .map((a) => ({
        id: a.id,
        type: 'Appointment',
        label: a.service,
        amount: a.amount,
        status: a.paymentStatus,
        method: a.paymentMethod,
        date: a.paidAt || a.createdAt,
      })),
    ...orders.map((o) => ({
      id: o.id,
      type: 'Shop Order',
      label: `Order #${o.id}`,
      amount: o.total,
      status: o.paymentStatus,
      method: o.paymentMethod,
      date: o.paidAt || o.createdAt,
    })),
  ].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

  return (
    <div id="page-profile" className="page active">
      <div className="profile-wrap">
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar-wrap" ref={avatarPickerRef}>
              <Avatar avatar={profile.avatar} name={profile.name} size={58} className="profile-avatar" />
              <button
                type="button"
                className="profile-avatar-edit-btn"
                onClick={() => setAvatarPickerOpen((o) => !o)}
                disabled={uploadingAvatar}
                title={profile.avatar ? 'Change photo' : 'Add photo'}
                aria-label={profile.avatar ? 'Change photo' : 'Add photo'}
              >
                <ImageIcon size={13} />
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleAvatarPick}
              />

              {avatarPickerOpen && (
                <div className="avatar-picker-popover">
                  <div className="avatar-picker-title">Choose an avatar</div>
                  <div className="avatar-picker-grid">
                    {AVATAR_PRESETS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        className="avatar-picker-option"
                        title={p.label}
                        aria-label={p.label}
                        disabled={uploadingAvatar}
                        onClick={() => handlePickPreset(p.id)}
                      >
                        <Avatar avatar={`${AVATAR_PRESET_PREFIX}${p.id}`} size={38} />
                      </button>
                    ))}
                  </div>
                  <div className="avatar-picker-divider" />
                  <button
                    type="button"
                    className="avatar-picker-upload-btn"
                    disabled={uploadingAvatar}
                    onClick={() => avatarInputRef.current?.click()}
                  >
                    <ImageIcon size={14} /> Upload your own photo
                  </button>
                  {profile.avatar && (
                    <button type="button" className="avatar-picker-remove-btn" onClick={handleRemoveAvatar} disabled={uploadingAvatar}>
                      <TrashIcon size={14} /> Remove photo
                    </button>
                  )}
                </div>
              )}
            </div>
            <div>
              <h1>{profile.name}</h1>
              <span className={`profile-role-badge role-${(profile.role || 'customer').toLowerCase()}`}>
                {profile.role || 'Customer'}
              </span>
            </div>
          </div>

          <div className="profile-layout">
            <div className="profile-col profile-col-left">
              <div className="profile-section">
                <div className="profile-section-head">
                  <h2>Account Information</h2>
                  {!editing && (
                    <button className="auth-link-btn" onClick={() => setEditing(true)}>Edit</button>
                  )}
                </div>

                {!editing ? (
                  <div className="profile-info-list">
                    <div className="profile-info-row"><span>Full Name</span><strong>{profile.name}</strong></div>
                    <div className="profile-info-row"><span>Email</span><strong>{profile.email}</strong></div>
                    <div className="profile-info-row"><span>Phone</span><strong>{profile.phone || '—'}</strong></div>
                    <div className="profile-info-row"><span>Role</span><strong>{profile.role || 'Customer'}</strong></div>
                    {profile.created_at && (
                      <div className="profile-info-row">
                        <span>Member Since</span>
                        <strong>{new Date(profile.created_at).toLocaleDateString('en-LK', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="profile-edit-form">
                    <div className="auth-field">
                      <label>Full Name</label>
                      <input className="auth-input" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="auth-field">
                      <label>Phone Number</label>
                      <input className="auth-input" placeholder="+94 77 000 0000" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>
                    <div className="auth-field">
                      <label>Email Address</label>
                      <input className="auth-input" value={profile.email} disabled />
                      <span className="profile-field-hint">Email can't be changed here — contact support if needed.</span>
                    </div>
                    <div className="profile-form-actions">
                      <button className="auth-btn-primary" onClick={saveProfile} disabled={savingProfile}>
                        {savingProfile ? 'Saving…' : 'Save Changes'}
                      </button>
                      <button className="auth-link-btn" onClick={cancelEdit} disabled={savingProfile}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>

              <div className="profile-section">
                <div className="profile-section-head">
                  <h2>Password</h2>
                  {!showPasswordForm && (
                    <button className="auth-link-btn" onClick={() => setShowPasswordForm(true)}>Change Password</button>
                  )}
                </div>

                {showPasswordForm && (
                  <div className="profile-edit-form">
                    <div className="auth-field">
                      <label>Current Password</label>
                      <input className="auth-input" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                    </div>
                    <div className="auth-field">
                      <label>New Password</label>
                      <input className="auth-input" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                    </div>
                    <div className="auth-field">
                      <label>Confirm New Password</label>
                      <input className="auth-input" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                    </div>
                    <div className="profile-form-actions">
                      <button className="auth-btn-primary" onClick={savePassword} disabled={savingPassword}>
                        {savingPassword ? 'Updating…' : 'Update Password'}
                      </button>
                      <button
                        className="auth-link-btn"
                        disabled={savingPassword}
                        onClick={() => {
                          setShowPasswordForm(false);
                          setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button className="profile-back-btn" onClick={() => onNavigate('home')}>← Back to VinuCare</button>
            </div>

            <div className="profile-col profile-col-right">
              <div className="profile-section">
                <div className="profile-section-head">
                  <h2>Booking History</h2>
                </div>
                {historyLoading ? (
                  <div className="profile-history-list">
                    {[1, 2].map((i) => (
                      <div className="profile-history-item" key={i}>
                        <div className="profile-history-main">
                          <Skeleton width="50%" height="0.95rem" style={{ marginBottom: 6 }} />
                          <Skeleton width="70%" height="0.8rem" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : appointments.length === 0 ? (
                  <p className="profile-history-empty">You haven't booked an appointment yet.</p>
                ) : (
                  <div className="profile-history-list">
                    {appointments.map((a) => (
                      <div className="profile-history-item" key={a.id}>
                        <div className="profile-history-main">
                          <strong>{a.service}</strong>
                          <span className="profile-history-sub">
                            {a.petName ? `${a.petName} · ` : ''}
                            {a.doctorName ? `Dr. ${a.doctorName}` : 'No doctor preference'}
                          </span>
                          <span className="profile-history-sub">
                            {a.apptDate}{a.apptTime ? ` at ${a.apptTime}` : ''} · Ref: {a.referenceNumber}
                          </span>
                          {(a.doctorPhone || a.doctorEmail) && (
                            <span className="profile-history-sub profile-history-contact">
                              Contact Dr. {a.doctorName}:
                              {a.doctorPhone && <a href={`tel:${a.doctorPhone}`}> {a.doctorPhone}</a>}
                              {a.doctorPhone && a.doctorEmail && ' · '}
                              {a.doctorEmail && <a href={`mailto:${a.doctorEmail}`}>{a.doctorEmail}</a>}
                            </span>
                          )}
                        </div>
                        <div className="profile-history-side">
                          <span className={`profile-status-badge status-${(a.status || 'pending').toLowerCase()}`}>
                            {a.status || 'Pending'}
                          </span>
                          {a.amount != null && (
                            <span className="profile-history-amount">Rs. {Number(a.amount).toLocaleString('en-LK')}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="profile-section">
                <div className="profile-section-head">
                  <h2>Payment History</h2>
                </div>
                {historyLoading ? (
                  <div className="profile-history-list">
                    {[1, 2].map((i) => (
                      <div className="profile-history-item" key={i}>
                        <div className="profile-history-main">
                          <Skeleton width="50%" height="0.95rem" style={{ marginBottom: 6 }} />
                          <Skeleton width="60%" height="0.8rem" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : paymentHistory.length === 0 ? (
                  <p className="profile-history-empty">No payments yet.</p>
                ) : (
                  <div className="profile-history-list">
                    {paymentHistory.map((p) => (
                      <div className="profile-history-item" key={`${p.type}-${p.id}`}>
                        <div className="profile-history-main">
                          <strong>{p.label}</strong>
                          <span className="profile-history-sub">
                            {p.type} · {p.date ? new Date(p.date).toLocaleDateString('en-LK', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                            {p.method ? ` · ${p.method}` : ''}
                          </span>
                        </div>
                        <div className="profile-history-side">
                          <span className={`profile-status-badge status-${(p.status || 'pending').toLowerCase()}`}>
                            {p.status === 'paid' ? 'Paid' : 'Pending'}
                          </span>
                          <span className="profile-history-amount">Rs. {Number(p.amount || 0).toLocaleString('en-LK')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}