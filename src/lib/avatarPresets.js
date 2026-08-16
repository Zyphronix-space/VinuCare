// Preset "pick an animal" avatars — same idea as the icon-avatar pickers
// on modern apps (Slack, Discord, Duolingo), themed to a vet clinic
// instead of generic faces. Real photos, not icons — same Unsplash URLs
// already used for the category thumbnails in Shop.jsx's sidebar, reused
// here so there's one already-verified image source instead of a second,
// untested one.
// Stored as the string "preset:<id>" in users.avatar — cheap, no image
// bytes at all, and instantly recognizable as distinct from an uploaded
// photo (which is stored as a data: URL) wherever avatar is rendered.
export const AVATAR_PRESET_PREFIX = 'preset:';

// Flat illustrated "pick a person" avatars, same spirit as the animal
// photos above but for anyone who'd rather not have a pet photo — built
// as inline SVG (data: URL) instead of a third-party image so there's no
// external request at all, styled in the app's own lavender/teal palette
// instead of generic stock-illustration colors.
const INK = '#241C4D';
function personSVG({ bg, collar, hair, glasses = false }) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <defs><clipPath id="c"><circle cx="50" cy="50" r="50"/></clipPath></defs>
    <g clip-path="url(#c)">
      <rect width="100" height="100" fill="${bg}"/>
      ${hair.back || ''}
      <path d="M50 58 q24 0 24 42 h-48 q0 -42 24 -42z" fill="${collar}"/>
      <circle cx="50" cy="45" r="21" fill="#fff"/>
      ${hair.front || ''}
      <circle cx="43" cy="44" r="2.5" fill="${INK}"/>
      <circle cx="57" cy="44" r="2.5" fill="${INK}"/>
      <path d="M43 53 q7 6 14 0" stroke="${INK}" stroke-width="2.3" fill="none" stroke-linecap="round"/>
      ${glasses ? `<circle cx="43" cy="44" r="7" fill="none" stroke="${INK}" stroke-width="1.6"/><circle cx="57" cy="44" r="7" fill="none" stroke="${INK}" stroke-width="1.6"/><line x1="50" y1="44" x2="50" y2="44" stroke="${INK}" stroke-width="1.6"/><line x1="36" y1="42" x2="29" y2="40" stroke="${INK}" stroke-width="1.6"/><line x1="64" y1="42" x2="71" y2="40" stroke="${INK}" stroke-width="1.6"/>` : ''}
    </g>
  </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const PURPLE = '#7C5CE8';
const TEAL = '#0F9488';
const HAIR = '#241C4D';
const SILVER = '#D8D3EC';

const PEOPLE_PRESETS = [
  {
    id: 'person-short', label: 'Short Hair',
    img: personSVG({ bg: PURPLE, collar: TEAL, hair: {
      front: `<path d="M28 40 q0 -22 22 -22 q22 0 22 22 q-4 -8 -22 -8 q-18 0 -22 8z" fill="${HAIR}"/>`,
    } }),
  },
  {
    id: 'person-curly', label: 'Curly Hair',
    img: personSVG({ bg: TEAL, collar: PURPLE, hair: {
      back: `<circle cx="50" cy="34" r="26" fill="${HAIR}"/>` +
        Array.from({ length: 10 }).map((_, i) => {
          const a = (i / 10) * Math.PI * 2;
          return `<circle cx="${50 + Math.cos(a) * 25}" cy="${30 + Math.sin(a) * 22}" r="6" fill="${HAIR}"/>`;
        }).join(''),
    } }),
  },
  {
    id: 'person-part', label: 'Long Hair',
    img: personSVG({ bg: PURPLE, collar: TEAL, hair: {
      back: `<circle cx="50" cy="34" r="24" fill="${HAIR}"/>
        <path d="M26 34 q-5 22 3 44 q7 -1 7 -9 q-5 -16 -2 -33 z" fill="${HAIR}"/>
        <path d="M74 34 q5 22 -3 44 q-7 -1 -7 -9 q5 -16 2 -33 z" fill="${HAIR}"/>`,
    } }),
  },
  {
    id: 'person-glasses', label: 'Glasses',
    img: personSVG({ bg: TEAL, collar: PURPLE, glasses: true, hair: {
      front: `<path d="M28 38 q0 -21 22 -21 q22 0 22 21 q-5 -7 -22 -7 q-17 0 -22 7z" fill="${HAIR}"/>`,
    } }),
  },
  {
    id: 'person-bun', label: 'Bun',
    img: personSVG({ bg: PURPLE, collar: TEAL, hair: {
      back: `<circle cx="50" cy="14" r="9" fill="${HAIR}"/><path d="M25 40 q0 -20 25 -20 q25 0 25 20 q-6 -6 -25 -6 q-19 0 -25 6z" fill="${HAIR}"/>`,
    } }),
  },
  {
    id: 'person-classic', label: 'Classic',
    img: personSVG({ bg: TEAL, collar: PURPLE, hair: {
      front: `<path d="M29 36 q1 -18 21 -18 q20 0 21 18 q-6 -5 -21 -5 q-15 0 -21 5z" fill="${HAIR}"/>`,
    } }),
  },
  {
    id: 'person-silver', label: 'Silver Fox',
    img: personSVG({ bg: PURPLE, collar: TEAL, glasses: true, hair: {
      back: `<path d="M23 46 q-3 -34 27 -34 q30 0 27 34 q-5 -12 -13 -13 q3 8 -1 15 q-3 -12 -13 -14 q3 8 -1 15 q-3 -12 -13 -14 q-9 1 -13 11z" fill="${SILVER}"/>`,
    } }),
  },
  {
    id: 'person-afro', label: 'Afro',
    img: personSVG({ bg: TEAL, collar: PURPLE, hair: {
      back: `<circle cx="50" cy="32" r="29" fill="${HAIR}"/>`,
    } }),
  },
];

export const AVATAR_PRESETS = [
  { id: 'dog',    label: 'Dog',    img: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=100&h=100&fit=crop' },
  { id: 'cat',    label: 'Cat',    img: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=100&h=100&fit=crop' },
  { id: 'bird',   label: 'Bird',   img: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=100&h=100&fit=crop' },
  { id: 'rabbit', label: 'Rabbit', img: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=100&h=100&fit=crop' },
  { id: 'fish',   label: 'Fish',   img: 'https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=100&h=100&fit=crop' },
  { id: 'cow',    label: 'Cow',    img: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=100&h=100&fit=crop' },
  { id: 'goat',   label: 'Goat',   img: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=100&h=100&fit=crop' },
  ...PEOPLE_PRESETS,
];

export function getAvatarPreset(avatar) {
  if (!avatar || !avatar.startsWith(AVATAR_PRESET_PREFIX)) return null;
  const id = avatar.slice(AVATAR_PRESET_PREFIX.length);
  return AVATAR_PRESETS.find((p) => p.id === id) || null;
}
