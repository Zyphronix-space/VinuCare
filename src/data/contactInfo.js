// Single source of truth for VinuCare's contact details.
// Everything that displays a phone number, email, address, or hours —
// footers, service pages, the chatbot — should import from here instead of
// hardcoding the value. Update it in exactly one place when it changes.
//
// NOTE: backend/data/contactInfo.js is a separate (CommonJS) copy for the
// Node server / chatbot AI system prompt, kept in sync with this file by
// hand. If you change a value here, mirror it there too.

export const PHONE = '+94 11 234 5678';
export const PHONE_TEL = 'tel:+94112345678';

export const EMERGENCY_PHONE = '+94 77 999 0000';
export const EMERGENCY_PHONE_TEL = 'tel:+94779990000';

export const EMAIL = 'vinuagency@gmail.com';

export const ADDRESS = 'VINU Care Agency, Thathsara, Kamburugamuwa';

export const HOURS = 'Mon–Sat: 8AM – 7PM';