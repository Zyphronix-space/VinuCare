import { isAdminEmail } from '../config/adminAccess';

// Turns a raw backend user object into the shape the rest of the app
// actually keys off of (isAdmin/isDoctor/isNurse) — one place so every
// caller (login, signup, Google sign-in, email verification, and the
// session-restore check on page load) derives access the same way.
export function deriveUserAccess(user) {
  if (!user) return null;
  const isAdmin = isAdminEmail(user.email) || user.role === 'Admin';
  const isDoctor = user.role === 'Doctor';
  const isNurse = user.role === 'Nurse';
  return { ...user, isAdmin, isDoctor, isNurse };
}
