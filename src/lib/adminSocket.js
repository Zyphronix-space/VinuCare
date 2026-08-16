import { io } from 'socket.io-client';
import { API_BASE_URL } from '../config/api';

const SOCKET_URL = API_BASE_URL;

// One shared connection for the whole admin dashboard, rather than each
// component opening its own socket. Components join with getAdminSocket()
// and just attach/detach their own event listeners in useEffect.
let socket = null;

export function getAdminSocket() {
  if (!socket) {
    // withCredentials so the httpOnly session cookie rides along on the
    // handshake request — the server now verifies the caller is really
    // an Admin before letting the socket into the 'admin' room.
    socket = io(SOCKET_URL, { autoConnect: false, withCredentials: true });
  }
  if (!socket.connected) {
    socket.connect();
    socket.on('connect', () => socket.emit('join:admin'));
  }
  return socket;
}