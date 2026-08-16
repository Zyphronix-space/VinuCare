// Fixed Q&A knowledge base for the VinuCare chatbot.
// Pure data — no logic here. The matching engine lives in ChatBot.jsx.
//
// To add a new question: copy an entry, give it a unique `id`, put it
// under the right `category`, and list a few `keywords` a user might
// actually type (lowercase, no punctuation needed).
//
// Contact details (phone/email/address/hours) are pulled from
// contactInfo.js, the single source of truth used site-wide — don't
// hardcode them here.

import { PHONE, EMERGENCY_PHONE, EMAIL, ADDRESS, HOURS } from './contactInfo';

// Casual small talk — greetings, thanks, goodbyes, etc. Matched before the
// FAQ list and answered instantly and locally (no network round-trip, no
// AI key needed). Keep patterns anchored to the *whole* message so a real
// question that happens to contain "hi" isn't hijacked — this is only for
// simple, human, one-line commands like "hi" or "thanks".
export const SMALL_TALK = [
  {
    id: 'greeting',
    pattern: /^(hi+|hey+|hello+|yo|howdy|greetings|sup|good\s?(morning|afternoon|evening))(\s?(there|vinucare|team))?[\s!.,]*$/i,
    replies: [
      "Hi there! How can I help you and your pet today?",
      "Hello! What can I do for you today?",
      "Hey! What would you like help with?",
    ],
    showTopics: true,
  },
  {
    id: 'how-are-you',
    pattern: /^how'?s?\s?(are you|it going|things|you doing)\??[\s!.,]*$/i,
    replies: [
      "I'm doing great, thanks for asking! How can I help you today?",
      "All good here! What can I help you with?",
    ],
    showTopics: true,
  },
  {
    id: 'thanks',
    // Covers casual/typo'd variants too — "thank u", "thanku", "tysm", "thnx"
    pattern: /^(thanks?( ?you|s? ?u)?|thank\s?(you|u)( so much| very much| a (bunch|lot))?|thanku|thnx+|tysm|thx+|ty|cheers|appreciate it)[\s!.,]*$/i,
    replies: [
      "You're welcome! Anything else I can help with?",
      "Anytime! Let me know if you need anything else.",
      "Happy to help!",
    ],
  },
  {
    id: 'youre-welcome',
    pattern: /^(np|no problem|no worries|(you'?re|ur) welcome|anytime|no probs)[\s!.,]*$/i,
    replies: [
      "Let me know if there's anything else I can help with.",
      "Glad to help!",
    ],
  },
  {
    id: 'bye',
    pattern: /^(bye+|goodbye|see ya|see you( later)?|cya|later|take care|gtg|got to go|gotta go)[\s!.,]*$/i,
    replies: [
      "Take care! Come back anytime you need us.",
      "Goodbye! Have a great day.",
    ],
  },
  {
    id: 'identity',
    pattern: /^(who are you|what are you|are you (a )?(bot|human|real|ai))\??[\s!.,]*$/i,
    replies: [
      "I'm the VinuCare virtual assistant — here to help with bookings, services, orders and more!",
    ],
    showTopics: true,
  },
  {
    id: 'affirmation',
    // "ok(ay)"/"kk" etc. — casual acknowledgements, not yes/no answers to a question
    pattern: /^(ok(ay)?|k+|kk|cool|nice|great|awesome|got ?it|sounds good|perfect|alright|fine|sure)[\s!.,]*$/i,
    replies: [
      "Great! Anything else I can help with?",
      "Let me know if there's anything else.",
    ],
  },
  {
    id: 'yes-no',
    pattern: /^(yes+|yeah+|yep+|yup+|ya|no+|nope+|nah+)[\s!.,]*$/i,
    replies: [
      "Got it! What would you like to do next?",
    ],
    showTopics: true,
  },
];

export const CATEGORIES = [
  { id: 'booking', label: 'Booking & Appointments' },
  { id: 'services', label: 'Services & Pricing' },
  { id: 'payments', label: 'Payments' },
  { id: 'emergency', label: 'Emergency Care' },
  { id: 'account', label: 'Account & Login' },
  { id: 'shop', label: 'Shop & Orders' },
  { id: 'contact', label: 'Contact & Hours' },
];

export const FAQS = [
  // ---------- Booking & Appointments ----------
  {
    id: 'book-how',
    category: 'booking',
    question: 'How do I book an appointment?',
    answer:
      "Head to the Appointments page, pick a service, choose an available date and time, and fill in your and your pet's details. You'll need to be logged in to confirm the booking — if you're not, we'll take you to log in first and bring you right back.",
    keywords: ['book', 'booking', 'appointment', 'schedule', 'make an appointment', 'reserve'],
  },
  {
    id: 'book-cancel',
    category: 'booking',
    question: 'Can I cancel or reschedule my appointment?',
    answer:
      `Yes. Give us a call at ${PHONE} or email ${EMAIL} with your name and appointment date, and our team will cancel or move it for you. Self-service cancellation isn't available yet.`,
    keywords: ['cancel', 'reschedule', 'change appointment', 'move appointment', 'postpone'],
  },
  {
    id: 'book-what-to-bring',
    category: 'booking',
    question: 'What should I bring to my appointment?',
    answer:
      "Bring any previous medical or vaccination records for your pet, a list of current medications if any, and your pet on a leash or in a carrier. New patients especially should bring past records so we can build an accurate health profile.",
    keywords: ['bring', 'what to bring', 'prepare', 'first visit', 'new patient'],
  },
  {
    id: 'book-status',
    category: 'booking',
    question: 'Check my appointment status',
    answer: null, // handled as a live lookup — see LIVE_INTENTS in ChatBot.jsx
    keywords: [
      'my appointment', 'appointment status', 'is my appointment confirmed',
      'upcoming appointment', 'when is my appointment', 'check appointment',
    ],
    liveIntent: 'appointment-status',
  },
  {
    id: 'book-slots',
    category: 'booking',
    question: 'How do I know which time slots are available?',
    answer:
      "On the Appointments page, once you pick a date, any times that are already booked are automatically greyed out — you can only pick from what's actually free that day.",
    keywords: ['time slots', 'available times', 'availability', 'free slot'],
  },

  // ---------- Services & Pricing ----------
  {
    id: 'services-list',
    category: 'services',
    question: 'What services do you offer?',
    answer:
      "We offer Veterinary Check-ups, Grooming & Styling, Emergency & Critical Care, Boarding & Daycare, Training & Behaviour, Spa & Wellness, Nutrition & Dietary Care, and Dental Health. You can see full details for each on the Services page.",
    keywords: ['services', 'what do you offer', 'what services', 'offerings'],
  },
  {
    id: 'services-grooming',
    category: 'services',
    question: 'What does grooming include?',
    answer:
      "Grooming covers professional bathing, breed-specific haircuts, nail filing, ear cleaning and teeth brushing by certified groomers, from a quick Bath & Tidy up to a Full Groom with optional add-on treatments.",
    keywords: ['grooming', 'groom', 'haircut', 'bath', 'nail', 'ear cleaning'],
  },
  {
    id: 'services-boarding',
    category: 'services',
    question: 'Do you offer boarding or daycare?',
    answer:
      "Yes — we offer overnight boarding and daytime daycare, plus extra care add-ons for pets with special needs. Check the Boarding & Daycare service page for details and book through Appointments.",
    keywords: ['boarding', 'daycare', 'overnight', 'stay', 'kennel'],
  },
  {
    id: 'services-pricing',
    category: 'services',
    question: "How much do your services cost?",
    answer:
      `Pricing depends on your pet's size, breed and the exact service — we don't publish a fixed price list online. The fastest way to get an accurate quote is to book a consultation, or call us at ${PHONE} and our team will quote you directly.`,
    keywords: ['price', 'pricing', 'cost', 'how much', 'fees', 'rates'],
  },
  {
    id: 'services-training',
    category: 'services',
    question: 'Do you offer training classes?',
    answer:
      "Yes — we run Puppy Classes, Obedience Training, and one-on-one Behaviour Consults. See the Training & Behaviour service page for details, then book a slot from Appointments.",
    keywords: ['training', 'puppy classes', 'obedience', 'behaviour', 'behavior'],
  },

  // ---------- Payments ----------
  {
    id: 'pay-methods',
    category: 'payments',
    question: 'What payment methods do you accept?',
    answer:
      "We accept major credit/debit cards and cash at the clinic. Payment for shop orders is completed online at checkout; appointment services are typically paid at the visit.",
    keywords: ['payment', 'pay', 'card', 'cash', 'checkout', 'how do i pay'],
  },
  {
    id: 'pay-order-status',
    category: 'payments',
    question: 'Where is my order?',
    answer: null, // live lookup
    keywords: [
      'where is my order', 'order status', 'my order', 'track order',
      'my purchase', 'did my order go through',
    ],
    liveIntent: 'order-status',
  },
  {
    id: 'pay-refund',
    category: 'payments',
    question: "Can I get a refund?",
    answer:
      `Refund requests are handled case by case — email ${EMAIL} with your order number or appointment date and what happened, and our team will sort it out with you.`,
    keywords: ['refund', 'money back', 'return', 'cancel order'],
  },

  // ---------- Emergency Care ----------
  {
    id: 'emergency-line',
    category: 'emergency',
    question: 'My pet has an emergency, what do I do?',
    answer:
      `Call our emergency line right away at ${EMERGENCY_PHONE} — don't wait to book online. If it's life-threatening, call first and head straight to the clinic at ${ADDRESS}.`,
    keywords: ['emergency', 'urgent', 'dying', 'bleeding', 'accident', 'poison', 'not breathing', 'critical'],
  },
  {
    id: 'emergency-hours',
    category: 'emergency',
    question: 'Is emergency care available 24/7?',
    answer:
      `Our emergency line ${EMERGENCY_PHONE} is for urgent situations outside normal hours. Regular clinic hours are ${HOURS} — for anything urgent outside that window, call the emergency number directly.`,
    keywords: ['24/7', '24 hours', 'after hours', 'night emergency', 'weekend emergency'],
  },

  // ---------- Account & Login ----------
  {
    id: 'account-signup',
    category: 'account',
    question: 'Do I need an account to book?',
    answer:
      "Yes, you'll need an account to confirm a booking or place a shop order. If you start booking without one, we'll prompt you to log in or sign up and bring you straight back to finish where you left off.",
    keywords: ['account', 'sign up', 'signup', 'register', 'need account'],
  },
  {
    id: 'account-forgot',
    category: 'account',
    question: "I can't log in / forgot my details",
    answer:
      `Double-check the email and password you signed up with. If you're still stuck, email ${EMAIL} with the email address on your account and our team will help you regain access.`,
    keywords: ['login', 'log in', 'cant log in', "can't log in", 'forgot password', 'locked out'],
  },
  {
    id: 'account-verify',
    category: 'account',
    question: "I never got my verification email",
    answer:
      "Check your spam/junk folder first. If it's not there, go to the Login page and use the \"resend verification\" option to get a new one sent to your inbox.",
    keywords: ['verification email', 'verify email', 'confirm email', 'no verification'],
  },

  // ---------- Shop & Orders ----------
  {
    id: 'shop-delivery',
    category: 'shop',
    question: 'Do you deliver shop orders?',
    answer:
      `For delivery details and timelines on a specific order, please email ${EMAIL} or call ${PHONE} with your order details and our team will confirm delivery options for your area.`,
    keywords: ['delivery', 'deliver', 'shipping', 'ship'],
  },
  {
    id: 'shop-catalogue',
    category: 'shop',
    question: 'What products do you sell?',
    answer:
      "Our Pet Shop carries food, treats, accessories and health & wellness products for pets. Browse the full catalogue on the Shop page, filter by category, and add items to your cart.",
    keywords: ['products', 'shop', 'buy', 'pet food', 'catalogue', 'catalog'],
  },

  // ---------- Contact & Hours ----------
  {
    id: 'contact-hours',
    category: 'contact',
    question: 'What are your opening hours?',
    answer: `We're open ${HOURS}. For emergencies outside those hours, call ${EMERGENCY_PHONE}.`,
    keywords: ['hours', 'open', 'opening hours', 'when are you open', 'closed'],
  },
  {
    id: 'contact-location',
    category: 'contact',
    question: 'Where are you located?',
    answer: `We're at ${ADDRESS}. You can also reach us by phone at ${PHONE} or email ${EMAIL}.`,
    keywords: ['location', 'address', 'where are you', 'directions'],
  },
  {
    id: 'contact-human',
    category: 'contact',
    question: 'I want to talk to a real person',
    answer: `Of course — call us at ${PHONE} or email ${EMAIL} and our team will help directly.`,
    keywords: ['human', 'real person', 'talk to someone', 'staff', 'representative'],
  },
];