import { useState } from 'react';
import AdminAppointments from '../admin/AdminAppointments';
import DoctorCalendar from './DoctorCalendar';
import StaffMessages from '../../components/StaffMessages';
import StaffSettings from '../../components/StaffSettings';
import { CalendarIcon, ChatIcon, SettingsIcon } from '../../components/ui/Icons';
import '../../styles/admin.css';
import vinuLogo from '../../assets/logo/vinucare-logo.png';

const NAV_ITEMS = [
  { id: 'appointments', label: 'Appointments', icon: <CalendarIcon size={17} /> },
  { id: 'calendar', label: 'Calendar', icon: <CalendarIcon size={17} /> },
  { id: 'messages', label: 'Message Admin', icon: <ChatIcon size={17} /> },
  { id: 'settings', label: 'Settings', icon: <SettingsIcon size={17} /> },
];

export default function DoctorDashboard({ onNavigate, user, setUser }) {
  const [tab, setTab] = useState('appointments');
  const doctorName = user?.name || 'Doctor';

  return (
    <div id="page-admin">
      <aside className="admin-sidebar">
        <div className="admin-brand" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img src={vinuLogo} alt="" style={{ width: 22, height: 22, borderRadius: 6, display: 'block' }} /> VinuCare <span className="admin-brand-badge">DOCTOR</span>
        </div>
        <nav className="admin-nav">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`admin-nav-btn ${tab === item.id ? 'active' : ''}`}
              onClick={() => setTab(item.id)}
            >
              <span className="admin-nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          Signed in as<br /><strong style={{ color: '#fff' }}>{doctorName}</strong>
          <button className="admin-exit-btn" onClick={() => onNavigate && onNavigate('home')}>
            ← Back to site
          </button>
        </div>
      </aside>

      <main className="admin-main">
        {/* Appointments are scoped to this doctor server-side (by JWT
            identity), so no doctorId prop needs to be passed here — the
            Doctor column would be redundant since every row is theirs. */}
        {tab === 'appointments' && (
          <AdminAppointments hideDoctorColumn canDelete={false} showNotesAction />
        )}
        {tab === 'calendar' && <DoctorCalendar />}
        {tab === 'messages' && <StaffMessages user={user} />}
        {tab === 'settings' && <StaffSettings user={user} setUser={setUser} />}
      </main>
    </div>
  );
}
