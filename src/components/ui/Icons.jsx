// Shared line-icon set — replaces emoji used as icons across the site.
// Same visual language as the icons already in ServiceMeta.jsx: 22x22
// viewBox, currentColor stroke, rounded caps/joins, no fill unless noted.
// Usage: <PawIcon size={18} /> — colour follows the surrounding text via
// currentColor, so no per-icon colour props are needed.

function Base({ size = 18, children, viewBox = '0 0 22 22', ...rest }) {
  return (
    <svg
      viewBox={viewBox}
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

export function HomeIcon(props) {
  return (
    <Base {...props}>
      <path d="M3.5 10.5 11 3.5l7.5 7" />
      <path d="M5.5 8.7V18h11V8.7" />
      <line x1="8.5" y1="18" x2="8.5" y2="13" />
      <line x1="13.5" y1="18" x2="13.5" y2="13" />
    </Base>
  );
}

export function PawIcon(props) {
  // Filled, not outlined — a paw print only reads as a paw print as a
  // solid silhouette. Every other icon here is stroke-only, but this one
  // needs the exception to actually look like what it's supposed to be.
  return (
    <Base {...props} fill="currentColor" stroke="none">
      <ellipse cx="11" cy="15.4" rx="4.6" ry="3.7" />
      <ellipse cx="4.8" cy="9.3" rx="2.2" ry="2.9" transform="rotate(-30 4.8 9.3)" />
      <ellipse cx="8.6" cy="4.9" rx="1.9" ry="2.5" transform="rotate(-10 8.6 4.9)" />
      <ellipse cx="13.4" cy="4.9" rx="1.9" ry="2.5" transform="rotate(10 13.4 4.9)" />
      <ellipse cx="17.2" cy="9.3" rx="2.2" ry="2.9" transform="rotate(30 17.2 9.3)" />
    </Base>
  );
}

export function CalendarIcon(props) {
  return (
    <Base {...props}>
      <rect x="3" y="4.5" width="16" height="14" rx="2.4" />
      <line x1="3" y1="9" x2="19" y2="9" />
      <line x1="7" y1="2.5" x2="7" y2="6" />
      <line x1="15" y1="2.5" x2="15" y2="6" />
    </Base>
  );
}

export function CardIcon(props) {
  return (
    <Base {...props}>
      <rect x="2.5" y="5" width="17" height="12" rx="2" />
      <line x1="2.5" y1="9" x2="19.5" y2="9" />
      <line x1="5.5" y1="13.3" x2="9.5" y2="13.3" />
    </Base>
  );
}

export function AlertIcon(props) {
  return (
    <Base {...props}>
      <path d="M11 3.2 L19.5 18 H2.5 Z" />
      <line x1="11" y1="9" x2="11" y2="13" />
      <circle cx="11" cy="15.6" r="0.15" fill="currentColor" strokeWidth="1.4" />
    </Base>
  );
}

export function UserIcon(props) {
  return (
    <Base {...props}>
      <circle cx="11" cy="7" r="3.5" />
      <path d="M4 18.5c0-3.6 3.1-6.2 7-6.2s7 2.6 7 6.2" />
    </Base>
  );
}

export function BagIcon(props) {
  return (
    <Base {...props}>
      <path d="M5.5 8h11l1 11H4.5z" />
      <path d="M8 8V6a3 3 0 0 1 6 0v2" />
    </Base>
  );
}

export function ImageIcon(props) {
  return (
    <Base {...props}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="8.5" cy="9.5" r="1.5" />
      <path d="M21 15.5 16 10.5 5.5 21" />
    </Base>
  );
}

export function BoxIcon(props) {
  return (
    <Base {...props}>
      <path d="M11 3 3.5 7v8L11 19l7.5-4V7z" />
      <path d="M3.5 7 11 11l7.5-4" />
      <line x1="11" y1="11" x2="11" y2="19" />
    </Base>
  );
}

export function CartIcon(props) {
  return (
    <Base {...props}>
      <circle cx="8.5" cy="18.5" r="1.3" />
      <circle cx="16" cy="18.5" r="1.3" />
      <path d="M2.5 3.5h2.4l2 11.4h10.4l1.7-8.4H6" />
    </Base>
  );
}

export function PinIcon(props) {
  return (
    <Base {...props}>
      <path d="M11 20s6.5-6.1 6.5-11A6.5 6.5 0 0 0 4.5 9c0 4.9 6.5 11 6.5 11z" />
      <circle cx="11" cy="9" r="2.2" />
    </Base>
  );
}

export function PhoneIcon(props) {
  return (
    <Base {...props}>
      <path d="M5 3.5h3.2l1.3 4-2 1.6a11.5 11.5 0 0 0 5.4 5.4l1.6-2 4 1.3V17a1.7 1.7 0 0 1-1.9 1.7A15.5 15.5 0 0 1 3.3 5.4 1.7 1.7 0 0 1 5 3.5z" />
    </Base>
  );
}

export function MailIcon(props) {
  return (
    <Base {...props}>
      <rect x="2.5" y="5" width="17" height="12" rx="2" />
      <path d="M3 6l8 6.2L19 6" />
    </Base>
  );
}

export function ClockIcon(props) {
  return (
    <Base {...props}>
      <circle cx="11" cy="11" r="8" />
      <path d="M11 6.5V11l3.2 2" />
    </Base>
  );
}

export function SunIcon(props) {
  return (
    <Base {...props}>
      <circle cx="11" cy="11" r="4" />
      <line x1="11" y1="1.6" x2="11" y2="3.6" />
      <line x1="11" y1="18.4" x2="11" y2="20.4" />
      <line x1="1.6" y1="11" x2="3.6" y2="11" />
      <line x1="18.4" y1="11" x2="20.4" y2="11" />
      <line x1="4.4" y1="4.4" x2="5.8" y2="5.8" />
      <line x1="16.2" y1="16.2" x2="17.6" y2="17.6" />
      <line x1="4.4" y1="17.6" x2="5.8" y2="16.2" />
      <line x1="16.2" y1="5.8" x2="17.6" y2="4.4" />
    </Base>
  );
}

export function MoonIcon(props) {
  return (
    <Base {...props}>
      <path d="M18 13.5A7.5 7.5 0 1 1 8.5 4a6 6 0 0 0 9.5 9.5z" />
    </Base>
  );
}

export function ReceiptIcon(props) {
  return (
    <Base {...props}>
      <path d="M5 2.5h12v17l-2.2-1.5L12.6 19l-2.2-1.5L8.2 19 6 17.5 5 19V2.5z" />
      <line x1="7.5" y1="7" x2="14.5" y2="7" />
      <line x1="7.5" y1="10.5" x2="14.5" y2="10.5" />
    </Base>
  );
}

export function ChartIcon(props) {
  return (
    <Base {...props}>
      <line x1="4" y1="19" x2="19" y2="19" />
      <rect x="5.5" y="12" width="3" height="7" />
      <rect x="11" y="7.5" width="3" height="11.5" />
      <rect x="16.5" y="3.5" width="3" height="15.5" />
    </Base>
  );
}

export function TrendIcon(props) {
  return (
    <Base {...props}>
      <polyline points="3.5 15 8.5 9.5 12.5 12.5 18.5 5" />
      <polyline points="13.5 5 18.5 5 18.5 10" />
    </Base>
  );
}

export function LogoutIcon(props) {
  return (
    <Base {...props}>
      <path d="M9.5 3.5H5a1.5 1.5 0 0 0-1.5 1.5v12A1.5 1.5 0 0 0 5 18.5h4.5" />
      <line x1="18.5" y1="11" x2="9" y2="11" />
      <polyline points="15 7.3 18.7 11 15 14.7" />
    </Base>
  );
}

export function KeyIcon(props) {
  return (
    <Base {...props}>
      <circle cx="7" cy="14.5" r="3.3" />
      <line x1="9.3" y1="12.2" x2="18.5" y2="3" />
      <line x1="14.5" y1="7" x2="17.5" y2="10" />
      <line x1="17" y1="4.5" x2="19" y2="6.5" />
    </Base>
  );
}

export function StethoscopeIcon(props) {
  return (
    <Base {...props}>
      <path d="M5.5 3v5.5a4 4 0 0 0 8 0V3" />
      <line x1="5.5" y1="3" x2="4" y2="3" />
      <line x1="13.5" y1="3" x2="12" y2="3" />
      <path d="M9.5 12.5v2.3a4.2 4.2 0 0 0 8.4 0v-1.3" />
      <circle cx="18.4" cy="12.2" r="1.6" />
    </Base>
  );
}

export function ScalpelIcon(props) {
  return (
    <Base {...props}>
      <line x1="4" y1="18" x2="13" y2="9" />
      <path d="M13 9 19 3l-1.5-1.5L11 8" />
      <line x1="4" y1="18" x2="6.5" y2="18" />
    </Base>
  );
}

export function MicroscopeIcon(props) {
  return (
    <Base {...props}>
      <path d="M8 19h9" />
      <path d="M10.5 19a5.5 5.5 0 1 1 6-9" />
      <path d="M13 5l3.5-2 2 3.5-3.5 2" />
      <line x1="9" y1="13" x2="6" y2="16" />
    </Base>
  );
}

export function ScissorsIcon(props) {
  return (
    <Base {...props}>
      <circle cx="6" cy="6" r="2.2" />
      <circle cx="6" cy="16" r="2.2" />
      <line x1="7.8" y1="7.4" x2="18" y2="17" />
      <line x1="7.8" y1="14.6" x2="18" y2="5" />
    </Base>
  );
}

export function BuildingIcon(props) {
  return (
    <Base {...props}>
      <path d="M4 19V5.5L11 2l7 3.5V19" />
      <line x1="2.5" y1="19" x2="19.5" y2="19" />
      <line x1="9" y1="9" x2="9" y2="9.01" />
      <line x1="13" y1="9" x2="13" y2="9.01" />
      <line x1="9" y1="13" x2="9" y2="13.01" />
      <line x1="13" y1="13" x2="13" y2="13.01" />
    </Base>
  );
}

export function CarIcon(props) {
  return (
    <Base {...props}>
      <path d="M3.5 14.5 5 8.8a2 2 0 0 1 2-1.3h8a2 2 0 0 1 2 1.3l1.5 5.7" />
      <path d="M3 14.5h16v3H3z" />
      <circle cx="7" cy="17.7" r="1.3" />
      <circle cx="15" cy="17.7" r="1.3" />
    </Base>
  );
}

export function CheckBadgeIcon(props) {
  return (
    <Base {...props}>
      <path d="M11 2.7l2 1.6 2.5-.4 1 2.3 2.3 1-.4 2.5 1.6 2-1.6 2 .4 2.5-2.3 1-1 2.3-2.5-.4-2 1.6-2-1.6-2.5.4-1-2.3-2.3-1 .4-2.5-1.6-2 1.6-2-.4-2.5 2.3-1 1-2.3 2.5.4z" />
      <path d="M7.8 11.2l2.1 2.1 4.3-4.3" />
    </Base>
  );
}

export function DiagnosticsIcon(props) {
  return (
    <Base {...props}>
      <path d="M8 2.5v5.2L4.3 15a2 2 0 0 0 1.8 3h9.8a2 2 0 0 0 1.8-3L14 7.7V2.5" />
      <line x1="6.6" y1="2.5" x2="15.4" y2="2.5" />
      <line x1="6.6" y1="12" x2="15.4" y2="12" />
    </Base>
  );
}

export function DeviceIcon(props) {
  return (
    <Base {...props}>
      <rect x="6" y="2.5" width="10" height="17" rx="2" />
      <line x1="9.5" y1="16" x2="12.5" y2="16" />
    </Base>
  );
}

export function ChatIcon(props) {
  return (
    <Base {...props}>
      <path d="M3 4.5h16v10.5H8.5L4 18.5V15H3z" />
    </Base>
  );
}

export function HeartIcon(props) {
  return (
    <Base {...props}>
      <path d="M11 18.5s-7.5-4.6-7.5-10A4.2 4.2 0 0 1 11 6a4.2 4.2 0 0 1 7.5 2.5c0 5.4-7.5 10-7.5 10z" />
    </Base>
  );
}

export function BoltIcon(props) {
  return (
    <Base {...props}>
      <path d="M12 2.5 4.5 12.5H10L9 19.5 17.5 9H12z" />
    </Base>
  );
}

export function BellIcon(props) {
  return (
    <Base {...props}>
      <path d="M6 9a5 5 0 0 1 10 0c0 4 1.5 5.5 1.5 5.5h-13S6 13 6 9z" />
      <path d="M9 17.5a2 2 0 0 0 4 0" />
    </Base>
  );
}

export function RefreshIcon(props) {
  return (
    <Base {...props}>
      <path d="M18 11a7 7 0 0 1-12.9 3.7" />
      <path d="M4 11a7 7 0 0 1 12.9-3.7" />
      <polyline points="17.5 6.5 18 11 13.5 10.5" />
      <polyline points="4.5 15.5 4 11 8.5 11.5" />
    </Base>
  );
}

export function TruckIcon(props) {
  return (
    <Base {...props}>
      <rect x="2" y="7" width="11" height="8.5" rx="1" />
      <path d="M13 10h3.5L19.5 13v2.5H13z" />
      <circle cx="6" cy="17.5" r="1.5" />
      <circle cx="16" cy="17.5" r="1.5" />
    </Base>
  );
}

export function CashIcon(props) {
  return (
    <Base {...props}>
      <rect x="2.5" y="6" width="17" height="10" rx="1.5" />
      <circle cx="11" cy="11" r="2.5" />
      <line x1="5" y1="8.5" x2="5" y2="8.51" />
      <line x1="17" y1="13.5" x2="17" y2="13.51" />
    </Base>
  );
}

export function SearchIcon(props) {
  return (
    <Base {...props}>
      <circle cx="9.5" cy="9.5" r="6" />
      <line x1="14" y1="14" x2="19" y2="19" />
    </Base>
  );
}

export function MenuIcon(props) {
  return (
    <Base {...props}>
      <line x1="3" y1="6" x2="19" y2="6" />
      <line x1="3" y1="11" x2="19" y2="11" />
      <line x1="3" y1="16" x2="19" y2="16" />
    </Base>
  );
}

export function AwardIcon(props) {
  return (
    <Base {...props}>
      <circle cx="11" cy="8" r="5" />
      <path d="M7.8 12.5 6.5 19l4.5-2.3 4.5 2.3-1.3-6.5" />
    </Base>
  );
}

export function ThermometerIcon(props) {
  return (
    <Base {...props}>
      <path d="M12 13.2V4.5a2 2 0 0 0-4 0v8.7a3.5 3.5 0 1 0 4 0z" />
    </Base>
  );
}

export function TagIcon(props) {
  return (
    <Base {...props}>
      <path d="M11 2.5h6.5V9L9 17.5a1.7 1.7 0 0 1-2.4 0l-4.6-4.6a1.7 1.7 0 0 1 0-2.4z" />
      <circle cx="15" cy="6.5" r="1.3" />
    </Base>
  );
}

export function SpaIcon(props) {
  return (
    <Base {...props}>
      <path d="M11 3 L12.4 9.4 L19 11 L12.4 12.6 L11 19 L9.6 12.6 L3 11 L9.6 9.4 Z" />
    </Base>
  );
}

export function DogIcon(props) {
  return (
    <Base {...props}>
      <path d="M5 8c-1.5-2-3-1.8-3-.5 0 1.8 1.8 3 3 3.3" />
      <path d="M17 8c1.5-2 3-1.8 3-.5 0 1.8-1.8 3-3 3.3" />
      <path d="M6 10.2C6 6.8 8.3 4.5 11 4.5s5 2.3 5 5.7c0 3.7-2.2 8.3-5 8.3s-5-4.6-5-8.3z" />
      <circle cx="9" cy="10.5" r="0.6" fill="currentColor" />
      <circle cx="13" cy="10.5" r="0.6" fill="currentColor" />
      <path d="M10 13.2c.5.5 1.5.5 2 0" />
    </Base>
  );
}

export function CatIcon(props) {
  return (
    <Base {...props}>
      <path d="M6.5 8 5 3.8 8.7 6.5" />
      <path d="M15.5 8 17 3.8 13.3 6.5" />
      <path d="M6 10.5c0-3.3 2.3-5.3 5-5.3s5 2 5 5.3c0 3.7-2.2 8-5 8s-5-4.3-5-8z" />
      <circle cx="9" cy="10.8" r="0.6" fill="currentColor" />
      <circle cx="13" cy="10.8" r="0.6" fill="currentColor" />
      <path d="M9.3 13.3h3.4" />
      <line x1="4.5" y1="11.5" x2="7.2" y2="11.8" />
      <line x1="17.5" y1="11.5" x2="14.8" y2="11.8" />
    </Base>
  );
}

export function BirdIcon(props) {
  return (
    <Base {...props}>
      <path d="M4 13.5c0-4.5 3.6-8 8-8 3.9 0 7 3 7 6.3 0 3.6-3 6.2-6.7 6.2-1 0-2-.2-2.9-.6" />
      <path d="M19 11.8 21.5 11 19.3 13" />
      <circle cx="14.5" cy="8.5" r="0.6" fill="currentColor" />
      <path d="M4 13.5c-1 .8-1.5 2-1.5 3.2 1.6 0 2.9-.6 3.7-1.6" />
      <path d="M9.5 17.7 8.7 20M13 18l-.3 2.2" />
    </Base>
  );
}

export function RabbitIcon(props) {
  return (
    <Base {...props}>
      <path d="M8 9.5 7 2.8a1.4 1.4 0 0 1 2.6-.9L11 8" />
      <path d="M14 9.5 15 2.8a1.4 1.4 0 0 0-2.6-.9L11 8" />
      <path d="M6 12.3C6 9 8.3 7 11 7s5 2 5 5.3c0 3.7-2.2 7.2-5 7.2s-5-3.5-5-7.2z" />
      <circle cx="9" cy="12.3" r="0.6" fill="currentColor" />
      <circle cx="13" cy="12.3" r="0.6" fill="currentColor" />
      <path d="M10 14.8c.5.5 1.5.5 2 0" />
    </Base>
  );
}

export function FishIcon(props) {
  return (
    <Base {...props}>
      <path d="M3 11c3-4 8-5.5 12-3.5 2 1 3.5 2.3 3.5 3.5S17 13.5 15 14.5C11 16.5 6 15 3 11z" />
      <path d="M18.5 11 21.5 8.5 21 11 21.5 13.5z" />
      <circle cx="8" cy="10" r="0.6" fill="currentColor" />
      <path d="M3 11c-.8.3-1.5 1-2 1.8M3 11c-.8-.3-1.5-1-2-1.8" />
    </Base>
  );
}

export function CowIcon(props) {
  return (
    <Base {...props}>
      <path d="M5.5 6.5 3.5 3.8 M16.5 6.5 18.5 3.8" />
      <path d="M4.5 9c0-3 2.8-5.3 6.5-5.3S17.5 6 17.5 9c0 4-2.9 8.3-6.5 8.3S4.5 13 4.5 9z" />
      <path d="M3 9.8c-1 .2-1.7 1-1.7 2s1 1.6 2.2 1.3M19 9.8c1 .2 1.7 1 1.7 2s-1 1.6-2.2 1.3" />
      <circle cx="8.7" cy="9.8" r="0.6" fill="currentColor" />
      <circle cx="13.3" cy="9.8" r="0.6" fill="currentColor" />
      <path d="M9.3 12.5h3.4M10.4 6.3h1.2" />
    </Base>
  );
}

export function GoatIcon(props) {
  return (
    <Base {...props}>
      <path d="M7.5 5.5C6 3.8 6.5 2.5 8 3.2c1 .5 1.3 1.6 1.3 2.6" />
      <path d="M14.5 5.5c1.5-1.7 1-3 -.5-2.3-1 .5-1.3 1.6-1.3 2.6" />
      <path d="M6 10c0-3.3 2.3-5.5 5-5.5s5 2.2 5 5.5c0 3.8-2.2 8-5 8s-5-4.2-5-8z" />
      <circle cx="9" cy="10.3" r="0.6" fill="currentColor" />
      <circle cx="13" cy="10.3" r="0.6" fill="currentColor" />
      <path d="M10.3 17.8c-.2 1-.8 1.7-.8 1.7M11.7 17.8c.2 1 .8 1.7.8 1.7" />
    </Base>
  );
}

export function SendIcon(props) {
  return (
    <Base {...props}>
      <line x1="19" y1="3" x2="9.5" y2="12.5" />
      <path d="M19 3 12.8 19l-3.3-6.5L3 9.2z" />
    </Base>
  );
}

export function SettingsIcon(props) {
  return (
    <Base {...props}>
      <path d="M9.3 3.4h3.4l.5 2.2a6.6 6.6 0 0 1 1.8 1l2.1-.8 1.7 3-1.7 1.4a6.6 6.6 0 0 1 0 2l1.7 1.4-1.7 3-2.1-.8a6.6 6.6 0 0 1-1.8 1l-.5 2.2H9.3l-.5-2.2a6.6 6.6 0 0 1-1.8-1l-2.1.8-1.7-3 1.7-1.4a6.6 6.6 0 0 1 0-2L3.2 8.8l1.7-3 2.1.8a6.6 6.6 0 0 1 1.8-1z" />
      <circle cx="11" cy="11" r="2.6" />
    </Base>
  );
}

export function EditIcon(props) {
  return (
    <Base {...props}>
      <path d="M14 3.8 18.2 8 8 18.2H3.8V14z" />
      <line x1="12.3" y1="5.5" x2="16.5" y2="9.7" />
    </Base>
  );
}

export function TrashIcon(props) {
  return (
    <Base {...props}>
      <path d="M4.5 6.5h13" />
      <path d="M8.5 6.5V4.3a1.2 1.2 0 0 1 1.2-1.2h2.6a1.2 1.2 0 0 1 1.2 1.2v2.2" />
      <path d="M6 6.5 6.9 18a1.5 1.5 0 0 0 1.5 1.4h5.2a1.5 1.5 0 0 0 1.5-1.4l.9-11.5" />
      <line x1="9.3" y1="9.8" x2="9.3" y2="15.5" />
      <line x1="12.7" y1="9.8" x2="12.7" y2="15.5" />
    </Base>
  );
}
