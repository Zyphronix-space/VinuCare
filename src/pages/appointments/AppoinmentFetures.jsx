import { StethoscopeIcon, ClockIcon, CalendarIcon, CardIcon } from '../../components/ui/Icons';

const FEATURES = [
  {
    icon: StethoscopeIcon,
    title: 'Verified Vets',
    text: 'Every doctor on our roster is licensed and experienced with a wide range of species.',
  },
  {
    icon: ClockIcon,
    title: 'Fast Confirmation',
    text: 'We review and confirm your booking within 2 hours during business hours.',
  },
  {
    icon: CalendarIcon,
    title: 'Flexible Rescheduling',
    text: 'Plans change — reschedule or update your appointment anytime from your account.',
  },
  {
    icon: CardIcon,
    title: 'Secure Payment',
    text: 'Pay your booking fee online with a secure, encrypted checkout.',
  },
];

export default function AppointmentFeatures() {
  return (
    <>
      <h2>Why Book With VinuCare?</h2>
      <p>
        Our streamlined booking system lets you select your preferred service,
        vet and time slot in under 2 minutes — all from your phone or computer.
      </p>

      <div className="appt-img-main">
        <img
          src="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&auto=format&fit=crop&q=70"
          alt="Vet with dog"
          loading="lazy"
        />
      </div>

      <div className="appt-feats">
        {FEATURES.map(({ icon: Icon, title, text }) => (
          <div className="appt-feat" key={title}>
            <div className="appt-feat-icon"><Icon size={20} /></div>
            <div>
              <h4>{title}</h4>
              <p>{text}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}