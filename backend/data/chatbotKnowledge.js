// Knowledge base the AI fallback is grounded in. Kept in sync (by hand) with
// src/data/chatbotData.js on the frontend — that file drives the fast
// keyword-matched quick-replies; this one is fed to the AI as context so it
// only answers using real VinuCare facts instead of making things up.
//
// If you add/change an FAQ in src/data/chatbotData.js, mirror the question +
// answer here too (skip entries with answer: null — those are live lookups
// handled separately, see LIVE_INTENTS in ChatBot.jsx and the tool-calling
// logic below in this route file).

const { PHONE, EMERGENCY_PHONE, EMAIL, ADDRESS, HOURS } = require('./contactInfo');

const FAQS = [
  { question: 'How do I book an appointment?', answer: "Head to the Appointments page, pick a service, choose an available date and time, and fill in your and your pet's details. You'll need to be logged in to confirm the booking — if you're not, we'll take you to log in first and bring you right back." },
  { question: 'Can I cancel or reschedule my appointment?', answer: `Yes. Give us a call at ${PHONE} or email ${EMAIL} with your name and appointment date, and our team will cancel or move it for you. Self-service cancellation isn't available yet.` },
  { question: 'What should I bring to my appointment?', answer: "Bring any previous medical or vaccination records for your pet, a list of current medications if any, and your pet on a leash or in a carrier. New patients especially should bring past records so we can build an accurate health profile." },
  { question: 'How do I know which time slots are available?', answer: "On the Appointments page, once you pick a date, any times that are already booked are automatically greyed out — you can only pick from what's actually free that day." },
  { question: 'What services do you offer?', answer: "We offer Veterinary Check-ups, Grooming & Styling, Emergency & Critical Care, Boarding & Daycare, Training & Behaviour, Spa & Wellness, Nutrition & Dietary Care, and Dental Health. You can see full details for each on the Services page." },
  { question: 'What does grooming include?', answer: "Grooming covers professional bathing, breed-specific haircuts, nail filing, ear cleaning and teeth brushing by certified groomers, from a quick Bath & Tidy up to a Full Groom with optional add-on treatments." },
  { question: 'Do you offer boarding or daycare?', answer: "Yes — we offer overnight boarding and daytime daycare, plus extra care add-ons for pets with special needs. Check the Boarding & Daycare service page for details and book through Appointments." },
  { question: 'How much do your services cost?', answer: `Pricing depends on your pet's size, breed and the exact service — we don't publish a fixed price list online. The fastest way to get an accurate quote is to book a consultation, or call us at ${PHONE} and our team will quote you directly.` },
  { question: 'Do you offer training classes?', answer: "Yes — we run Puppy Classes, Obedience Training, and one-on-one Behaviour Consults. See the Training & Behaviour service page for details, then book a slot from Appointments." },
  { question: 'What payment methods do you accept?', answer: "We accept major credit/debit cards and cash at the clinic. Payment for shop orders is completed online at checkout; appointment services are typically paid at the visit." },
  { question: 'Can I get a refund?', answer: `Refund requests are handled case by case — email ${EMAIL} with your order number or appointment date and what happened, and our team will sort it out with you.` },
  { question: 'My pet has an emergency, what do I do?', answer: `Call our emergency line right away at ${EMERGENCY_PHONE} — don't wait to book online. If it's life-threatening, call first and head straight to the clinic at ${ADDRESS}.` },
  { question: 'Is emergency care available 24/7?', answer: `Our emergency line ${EMERGENCY_PHONE} is for urgent situations outside normal hours. Regular clinic hours are ${HOURS} — for anything urgent outside that window, call the emergency number directly.` },
  { question: 'Do I need an account to book?', answer: "Yes, you'll need an account to confirm a booking or place a shop order. If you start booking without one, we'll prompt you to log in or sign up and bring you straight back to finish where you left off." },
  { question: "I can't log in / forgot my details", answer: `Double-check the email and password you signed up with. If you're still stuck, email ${EMAIL} with the email address on your account and our team will help you regain access.` },
  { question: 'I never got my verification email', answer: "Check your spam/junk folder first. If it's not there, go to the Login page and use the \"resend verification\" option to get a new one sent to your inbox." },
  { question: 'Do you deliver shop orders?', answer: `For delivery details and timelines on a specific order, please email ${EMAIL} or call ${PHONE} with your order details and our team will confirm delivery options for your area.` },
  { question: 'What products do you sell?', answer: "Our Pet Shop carries food, treats, accessories and health & wellness products for pets. Browse the full catalogue on the Shop page, filter by category, and add items to your cart." },
  { question: 'What are your opening hours?', answer: `We're open ${HOURS}. For emergencies outside those hours, call ${EMERGENCY_PHONE}.` },
  { question: 'Where are you located?', answer: `We're at ${ADDRESS}. You can also reach us by phone at ${PHONE} or email ${EMAIL}.` },
  { question: 'I want to talk to a real person', answer: `Of course — call us at ${PHONE} or email ${EMAIL} and our team will help directly.` },
];

function buildSystemPrompt() {
  const facts = FAQS.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join('\n\n');
  return `You are the VinuCare Assistant, a helpful chat support agent for VinuCare, a pet clinic and pet shop.

Answer ONLY using the facts below plus the two tools you have access to. Do not invent policies, prices, hours, phone numbers, or anything not stated here.

If the person asks something totally unrelated to VinuCare (pets, appointments, the shop, payments, account, emergencies), politely say you can only help with VinuCare-related questions.

If a question needs the person's own account data (their appointments or their orders), use the matching tool instead of guessing — but only if the tools are available to you in this request; if they're not available, tell the person to log in and check the appointment/order status option in the chat.

Keep answers short (2-4 sentences), friendly, and in plain text (no markdown headers or bullet lists unless listing multiple items like appointments/orders).

VinuCare knowledge base:

${facts}`;
}

module.exports = { FAQS, buildSystemPrompt };