import { useState, useEffect, useRef } from 'react';
import { useUIFeedback } from '../context/UIFeedbackContext';
import { useTheme } from '../context/ThemeContext';
import { API_BASE_URL } from '../config/api';
import { ImageIcon, SunIcon, MoonIcon, TrashIcon } from './ui/Icons';
import Avatar from './ui/Avatar';
import Skeleton from './ui/Skeleton';
import { AVATAR_PRESETS, AVATAR_PRESET_PREFIX } from '../lib/avatarPresets';
import '../styles/profile.css';

const MAX_AVATAR_BYTES = 3 * 1024 * 1024; // 3MB, same limit as the customer Profile page

// Shared "Settings" tab for Admin/Doctor/Nurse dashboards — theme
// preference plus the same self-service account fields (name, phone,
// avatar, password) the customer-facing Profile page offers. Deliberately
// does not expose email/role/status/specialty — those go through Admin's
// Users & Doctors page instead, same restriction /api/auth/me enforces
// server-side (a staff account can't quietly promote or reassign itself).
export default function StaffSettings({ setUser }) {
  const { success: notifySuccess, error: notifyError } = useUIFeedback();
  const { theme, toggleTheme } = useTheme();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);
  const avatarInputRef = useRef(null);
  const avatarPickerRef = useRef(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/auth/me`, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('Could not load settings'))))
      .then((data) => {
        setProfile(data);
        setName(data.name || '');
        setPhone(data.phone || '');
      })
      .catch(() => notifyError('Could not load your account settings.'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // Keeps localStorage/App's `user` in sync too, not just this component's
  // own state — otherwise the sidebar's "Signed in as {name}" would go
  // stale until the next full page load.
  const syncUserEverywhere = (data) => {
    setProfile(data);
    const stored = JSON.parse(localStorage.getItem('user') || '{}');
    const updated = { ...stored, name: data.name, avatar: data.avatar };
    localStorage.setItem('user', JSON.stringify(updated));
    setUser?.(updated);
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
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) { notifyError('Please choose an image file'); return; }
    if (file.size > MAX_AVATAR_BYTES) { notifyError('Image is too large — please choose one under 3MB'); return; }
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
      notifySuccess('Settings saved');
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
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch {
      notifyError('Cannot connect to server. Make sure the backend is running.');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <>
      <div className="admin-topbar">
        <div>
          <h1>Settings</h1>
          <p>Your theme preference and account details.</p>
        </div>
      </div>

      <div className="admin-panel">
        <div className="admin-panel-head"><h2>Appearance</h2></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button
            type="button"
            className="admin-btn admin-btn-outline"
            onClick={toggleTheme}
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            {theme === 'dark' ? <MoonIcon size={16} /> : <SunIcon size={16} />}
            {theme === 'dark' ? 'Dark mode' : 'Light mode'} — click to switch
          </button>
        </div>
      </div>

      {loading && (
        <>
          <div className="admin-panel">
            <div className="admin-panel-head"><h2>Account</h2></div>
            <Skeleton circle width="58px" height="58px" style={{ marginBottom: 18 }} />
            <div className="admin-field-row">
              <div className="admin-field"><Skeleton width="30%" height="0.75rem" style={{ marginBottom: 8 }} /><Skeleton width="100%" height="38px" radius="8px" /></div>
              <div className="admin-field"><Skeleton width="30%" height="0.75rem" style={{ marginBottom: 8 }} /><Skeleton width="100%" height="38px" radius="8px" /></div>
            </div>
          </div>
          <div className="admin-panel">
            <div className="admin-panel-head"><h2>Password</h2></div>
            <Skeleton width="140px" height="38px" radius="8px" />
          </div>
        </>
      )}

      {!loading && profile && (
        <>
          <div className="admin-panel">
            <div className="admin-panel-head"><h2>Account</h2></div>

            <div className="profile-avatar-wrap" ref={avatarPickerRef} style={{ marginBottom: 18 }}>
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
              <input ref={avatarInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarPick} />

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
                  <button type="button" className="avatar-picker-upload-btn" disabled={uploadingAvatar} onClick={() => avatarInputRef.current?.click()}>
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

            <div className="admin-field-row">
              <div className="admin-field">
                <label>Full name</label>
                <input autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="admin-field">
                <label>Phone</label>
                <input type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+94 77 000 0000" />
              </div>
            </div>
            <div className="admin-field-row">
              <div className="admin-field">
                <label>Email</label>
                <input type="email" autoComplete="email" value={profile.email} disabled />
              </div>
              <div className="admin-field">
                <label>Role</label>
                <input autoComplete="off" value={profile.role} disabled />
              </div>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--admin-muted)', marginTop: -6, marginBottom: 14 }}>
              Email and role can't be changed here — ask an Admin if either needs to change.
            </p>
            <button className="admin-btn admin-btn-primary" onClick={saveProfile} disabled={savingProfile}>
              {savingProfile ? 'Saving…' : 'Save Changes'}
            </button>
          </div>

          <div className="admin-panel">
            <div className="admin-panel-head"><h2>Password</h2></div>
            <div className="admin-field-row">
              <div className="admin-field">
                <label>Current password</label>
                <input type="password" autoComplete="current-password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
              </div>
              <div className="admin-field">
                <label>New password</label>
                <input type="password" autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              </div>
            </div>
            <div className="admin-field" style={{ maxWidth: 320 }}>
              <label>Confirm new password</label>
              <input type="password" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>
            <button className="admin-btn admin-btn-primary" onClick={savePassword} disabled={savingPassword}>
              {savingPassword ? 'Updating…' : 'Update Password'}
            </button>
          </div>
        </>
      )}
    </>
  );
}
