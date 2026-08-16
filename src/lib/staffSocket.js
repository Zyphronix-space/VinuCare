import { io } from 'socket.io-client';
import { API_BASE_URL } from '../config/api';

const SOCKET_URL = API_BASE_URL;

// One shared connection for the logged-in staff member's own dashboard —
// same pattern as adminSocket.js, joining a personal room instead of the
// shared 'admin' one so a reply from Admin reaches them live.
let socket = null;

export function getStaffSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, { autoConnect: false, withCredentials: true });
  }
  if (!socket.connected) {
    socket.connect();
    socket.on('connect', () => socket.emit('join:user'));
  }
  return socket;
}
