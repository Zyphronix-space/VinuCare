// Shared per-category accent colours and icons, so the services grid,
// service cards, and service detail page all speak the same visual language.

export const categoryColors = {
  Veterinary: '#3730A3',
  Grooming: '#0F766E',
  Emergency: '#B91C1C',
  Boarding: '#B45309',
  Training: '#5B21B6',
  Spa: '#9D174D',
  Nutrition: '#166534',
  Dental: '#1E3A8A',
};

// Small hand-drawn line icons (no external icon library dependency).
// Each is a 22x22 stroke icon, colour inherited via currentColor.
function IconBase({ children }) {
  return (
    <svg viewBox="0 0 22 22" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

const icons = {
  Veterinary: (
    <IconBase>
      <circle cx="11" cy="11" r="8.4" />
      <line x1="11" y1="7" x2="11" y2="15" />
      <line x1="7" y1="11" x2="15" y2="11" />
    </IconBase>
  ),
  Grooming: (
    <IconBase>
      <circle cx="6" cy="6" r="2.2" />
      <circle cx="6" cy="16" r="2.2" />
      <line x1="7.8" y1="7.4" x2="18" y2="17" />
      <line x1="7.8" y1="14.6" x2="18" y2="5" />
    </IconBase>
  ),
  Emergency: (
    <IconBase>
      <path d="M11 3.2 L19.5 18 H2.5 Z" />
      <line x1="11" y1="9" x2="11" y2="13" />
      <circle cx="11" cy="15.6" r="0.15" fill="currentColor" stroke="currentColor" strokeWidth="1.4" />
    </IconBase>
  ),
  Boarding: (
    <IconBase>
      <path d="M4 10 L11 4 L18 10" />
      <path d="M6 9 V18 H16 V9" />
    </IconBase>
  ),
  Training: (
    <IconBase>
      <circle cx="11" cy="14" r="3.6" />
      <circle cx="5.6" cy="7.6" r="1.6" />
      <circle cx="9.8" cy="5" r="1.6" />
      <circle cx="13.6" cy="5" r="1.6" />
      <circle cx="17" cy="7.9" r="1.6" />
    </IconBase>
  ),
  Spa: (
    <IconBase>
      <path d="M11 3 L12.4 9.4 L19 11 L12.4 12.6 L11 19 L9.6 12.6 L3 11 L9.6 9.4 Z" />
    </IconBase>
  ),
  Nutrition: (
    <IconBase>
      <path d="M5 17c0-7.2 4-12 12-12 0 8-4 13-12 12z" />
      <line x1="5" y1="17" x2="11.5" y2="10.5" />
    </IconBase>
  ),
  Dental: (
    <IconBase>
      <path d="M11 4c-2.2 0-3.9 1.5-4.6 3.5-.9 2.5-.6 5.7.4 8.5.5 1.5 1.2 2.4 1.9 2.4.9 0 1-2.3 2.3-2.3s1.4 2.3 2.3 2.3c.7 0 1.4-.9 1.9-2.4 1-2.8 1.3-6 .4-8.5C14.9 5.5 13.2 4 11 4z" />
    </IconBase>
  ),
};

export function CategoryIcon({ category }) {
  return icons[category] || icons.Veterinary;
}