import { io } from 'socket.io-client';
import { API_BASE_URL } from '../config/api';

let socket = null;

// Opens one lightweight socket connection for the whole visit, purely so
// the admin "Users Online" count reflects every visitor on the site —
// logged in or not — not just staff with a dashboard open. No auth, no
// room to join; the backend just counts the open connection itself (see
// backend/socket.js). Call once, at the app root.
export function startVisitorPresence() {
  if (socket) return;
  socket = io(API_BASE_URL, { withCredentials: true });
}
