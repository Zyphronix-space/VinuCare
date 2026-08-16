import { getAvatarPreset } from '../../lib/avatarPresets';

function initialsFor(name) {
  return (name || '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

// Renders whatever `avatar` (from users.avatar) resolves to: a preset
// animal photo ("preset:dog"), an uploaded photo (data: URL), or a
// gradient initials fallback when there's nothing set yet. One place for
// this so Nav and Profile don't each reimplement the same three-way
// branch differently.
export default function Avatar({ avatar, name, size = 40, className = '' }) {
  const preset = getAvatarPreset(avatar);
  const style = { width: size, height: size, borderRadius: '50%', flexShrink: 0 };

  if (preset) {
    return <img className={className} src={preset.img} alt={preset.label} style={{ ...style, objectFit: 'cover', display: 'block' }} />;
  }

  if (avatar) {
    return <img className={className} src={avatar} alt="" style={{ ...style, objectFit: 'cover', display: 'block' }} />;
  }

  return (
    <span
      className={`avatar-badge ${className}`}
      style={{
        ...style,
        background: 'linear-gradient(135deg, #7C5CE8, #9B7FF0)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontWeight: 800, fontSize: Math.round(size * 0.38),
      }}
    >
      {initialsFor(name)}
    </span>
  );
}
