// TEMPORARY admin check — until your backend adds a `role` column to
// the users table and returns it from /api/auth/login, we treat any
// account whose email is in this list as an admin.
//
// Replace ADMIN_EMAILS.includes(...) everywhere with a real
// `user.role === 'admin'` check once the backend supports it, and
// delete this file.

export const ADMIN_EMAILS = [
  'stephanwasalathanthrige@gmail.com',
];

export function isAdminEmail(email) {
  return !!email && ADMIN_EMAILS.includes(email.toLowerCase());
}