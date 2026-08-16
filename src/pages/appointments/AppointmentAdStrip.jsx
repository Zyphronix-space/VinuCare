import { BoltIcon, BellIcon, RefreshIcon, CarIcon } from '../../components/ui/Icons';

const perks = [
  { icon: <BoltIcon size={18} />, label: "Instant Confirmation" },
  { icon: <BellIcon size={18} />, label: "Reminder Notifications" },
  { icon: <RefreshIcon size={18} />, label: "Free Rescheduling" },
  { icon: <CarIcon size={18} />, label: "Free Pick-up Available" }
];

// Compact "first impression" strip — sits right under the hero so the
// value props are visible without scrolling, before the booking form.
export default function AppointmentAdStrip() {
  return (
    <div className="appt-ad-strip">
      {perks.map((perk, index) => (
        <div className="appt-ad-item" key={index}>
          <span className="appt-ad-icon">{perk.icon}</span>
          <span className="appt-ad-label">{perk.label}</span>
        </div>
      ))}
    </div>
  );
}