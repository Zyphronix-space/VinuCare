import { StethoscopeIcon, UserIcon, CheckBadgeIcon } from '../../components/ui/Icons';

// Small deterministic hash so the same doctor always gets the same
// avatar color, instead of a random one that shifts on every render.
function colorIndex(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return Math.abs(hash) % 4;
}

function initials(name) {
  return name
    .replace(/^Dr\.?\s*/i, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export default function DoctorPreviewCard({ doctor, autoAssigned, fromProfile }) {
  if (!doctor) {
    return (
      <div className="doc-preview-card doc-preview-empty">
        <div className="doc-avatar doc-avatar-any"><StethoscopeIcon size={20} /></div>
        <div>
          <div className="doc-preview-name">No preference</div>
          <div className="doc-preview-specialty">We'll assign any available doctor</div>
        </div>
      </div>
    );
  }

  return (
    <div className="doc-preview-card">
      <div className={`doc-avatar doc-avatar-${colorIndex(doctor.name)}`}>
        {initials(doctor.name)}
      </div>
      <div>
        <div className="doc-preview-name">{doctor.name}</div>
        <div className="doc-preview-specialty">{doctor.specialty || "General Practice"}</div>
        {fromProfile && (
          <div className="doc-preview-tag" style={{ display: 'flex', alignItems: 'center', gap: 5 }}><UserIcon size={13} /> Selected from doctor profile</div>
        )}
        {autoAssigned && (
          <div className="doc-preview-tag" style={{ display: 'flex', alignItems: 'center', gap: 5 }}><CheckBadgeIcon size={13} /> Auto-assigned for this service</div>
        )}
      </div>
    </div>
  );
}