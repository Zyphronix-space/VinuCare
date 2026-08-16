import drNimali from '../../assets/images/dr_nimali.jpeg';
import drAthukorala from '../../assets/images/dr_athu.png';

import nimaliStethoscope from '../../assets/images/team/nimali-stethoscope.jpg';
import nimaliVaccinatingCat from '../../assets/images/team/nimali-vaccinating-cat.jpg';
import nimaliTalkingOwner from '../../assets/images/team/nimali-talking-owner.jpg';
import athukoralaOperatingRoom from '../../assets/images/team/athukorala-operating-room.webp';
import athukoralaSurgicalTeam from '../../assets/images/team/athukorala-surgical-team.png';
import athukoralaOrthopedicSurgery from '../../assets/images/team/athukorala-orthopedic-surgery.jpg';

import nimaliAreasFocus from '../../assets/images/team/nimali-areas-focus.jpg';
import nimaliBackground from '../../assets/images/team/nimali-background.jpg';
import athukoralaAreasFocus from '../../assets/images/team/athukorala-areas-focus.jpg';
import athukoralaBackground from '../../assets/images/team/athukorala-background.jpg';

// `matchKeyword` is how a team member here gets linked back to a real
// doctor row from the backend (`GET /api/appointments/doctors`, which
// reads from the `users` table). It must be a lowercase substring of
// that doctor's `name` column — the same matching strategy the
// appointment form's own auto-assign-by-service logic uses, so booking
// via a profile and booking via "service" auto-assign never disagree.
const teamData = [
  {
    id: 1,
    tag: 'Lead Veterinarian',
    bg: '#4C1D95',
    icon: 'stethoscope',
    name: 'Dr. Nimali Ekanayake',
    role: 'DVM · Small Animal Medicine · 12 yrs experience',
    specialty: 'Small Animal Medicine',
    img: drNimali,
    gallery: [
      { src: nimaliStethoscope, alt: 'Dr. Ekanayake checking a dog with a stethoscope' },
      { src: nimaliVaccinatingCat, alt: 'Dr. Ekanayake vaccinating a cat' },
      { src: nimaliTalkingOwner, alt: 'Dr. Ekanayake talking with a pet owner at the clinic' },
    ],
    matchKeyword: 'ekanayake',
    bio: 'Specializes in preventive care and wellness exams for dogs and cats. Based at our Colombo main clinic, Dr. Ekanayake has led over 4,000 successful treatments.',
    intro: 'Dr. Nimali Ekanayake leads our small animal medicine team, focusing on preventive care that catches problems early — from routine wellness exams to nutrition and vaccination planning. Her calm, thorough approach has made her a favourite with anxious first-time pet owners.',
    highlights: [
      {
        title: 'Areas of Focus',
        image: nimaliAreasFocus,
        position: 'top',
        points: [
          'Wellness exams & vaccinations',
          'Nutrition & weight management',
          'Chronic condition monitoring',
          'Senior pet care',
        ],
      },
      {
        title: 'Background',
        image: nimaliBackground,
        points: [
          'DVM, University of Peradeniya',
          '12 years in small animal practice',
          'Over 4,000 treatments led',
          'Based at the Colombo main clinic',
        ],
      },
    ],
    info: 'Dr. Ekanayake is the default doctor assigned for general check-ups and most routine services — you can always request her by name when booking.',
    btnText: 'Book with Dr. Ekanayake',
  },
  {
    id: 2,
    tag: 'Surgeon',
    bg: '#1E3A8A',
    icon: 'scalpel',
    name: 'Dr. Athukorala',
    role: 'DVM · Veterinary Surgery · 9 yrs experience',
    specialty: 'Veterinary Surgery',
    img: drAthukorala,
    gallery: [
      { src: athukoralaOperatingRoom, alt: 'Dr. Athukorala in the operating room' },
      { src: athukoralaSurgicalTeam, alt: 'Dr. Athukorala with the surgical team in scrubs', position: 'top' },
      { src: athukoralaOrthopedicSurgery, alt: 'Dr. Athukorala performing orthopedic surgery on a dog' },
    ],
    matchKeyword: 'athukorala',
    bio: 'Specializes in orthopedic and soft-tissue surgery. Based at our Colombo main clinic, Dr. Athukorala has performed over 1,200 surgical procedures.',
    intro: 'Dr. Athukorala heads our surgical team, with a focus on orthopedic and soft-tissue procedures. He also leads emergency and critical care cases, bringing over 1,200 successful surgeries of experience to every operating table.',
    highlights: [
      {
        title: 'Areas of Focus',
        image: athukoralaAreasFocus,
        points: [
          'Orthopedic surgery',
          'Soft-tissue surgery',
          'Emergency & critical care',
          'Dental surgery',
        ],
      },
      {
        title: 'Background',
        image: athukoralaBackground,
        points: [
          'DVM, University of Peradeniya',
          '9 years in veterinary surgery',
          'Over 1,200 procedures performed',
          'Based at the Colombo main clinic',
        ],
      },
    ],
    info: 'Dr. Athukorala is automatically assigned for emergency and dental bookings, since those need a surgeon on hand — you can also request him directly for any other service.',
    btnText: 'Book with Dr. Athukorala',
  },
];

export default teamData;