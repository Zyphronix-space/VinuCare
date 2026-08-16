// Thin wrapper around Socket.IO so any route file can emit a real-time
// event without needing to know about the underlying HTTP server.
//
// Usage:
//   const { initSocket, emitToAdmin, emitToUser } = require('../socket');
//   initSocket(httpServer);           // once, in server.js
//   emitToAdmin('appointment:new', {...});   // from any route
//   emitToUser(userId, 'message:new', {...});

const jwt = require('jsonwebtoken');
const bootId = require('./bootId');

let io = null;

// Every connected socket counts as one "online" visitor — the public site
// opens one of these per tab (see src/lib/visitorPresence.js) purely for
// this presence count, and the admin/doctor/nurse dashboards already open
// one each for their own live-update features, so staff with a dashboard
// open are counted too. This is a count of open connections, not unique
// people — two tabs from the same visitor count as two, which is fine for
// an "activity right now" number.
const onlineSockets = new Set();

function broadcastOnlineCount() {
  if (!io) return;
  io.to('admin').emit('online:count', onlineSockets.size);
}

// The auth cookie is httpOnly (frontend JS can't read it to send as a
// socket payload), but the browser still sends it automatically on the
// socket.io handshake request — same as any other credentialed request —
// so identity is read straight off that, not trusted from the client.
function getUserFromHandshake(socket) {
  const cookieHeader = socket.handshake.headers.cookie;
  if (!cookieHeader) return null;
  const match = cookieHeader.split(';').map((s) => s.trim()).find((s) => s.startsWith('token='));
  if (!match) return null;
  try {
    const token = decodeURIComponent(match.slice('token='.length));
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.bootId !== bootId) return null;
    return decoded;
  } catch {
    return null;
  }
}

function initSocket(httpServer) {
  const { Server } = require('socket.io');

  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    onlineSockets.add(socket.id);
    broadcastOnlineCount();

    const user = getUserFromHandshake(socket);

    // The admin dashboard joins this room on mount so it only receives
    // events relevant to it (not every connected browser tab). Verified
    // against the real session now instead of trusting any caller.
    socket.on('join:admin', () => {
      if (user?.role === 'Admin') {
        socket.join('admin');
        // Send the current count immediately — otherwise the dashboard
        // shows nothing until the next connect/disconnect elsewhere.
        socket.emit('online:count', onlineSockets.size);
      }
    });

    // A Doctor/Nurse's own dashboard joins their personal room so a
    // reply from Admin reaches them live, without exposing anyone
    // else's room name or requiring the client to assert an id.
    socket.on('join:user', () => {
      if (user?.id) socket.join(`user:${user.id}`);
    });

    socket.on('disconnect', () => {
      // Socket.IO removes the socket from all rooms automatically — the
      // one thing that does need manual cleanup is our own presence set.
      onlineSockets.delete(socket.id);
      broadcastOnlineCount();
    });
  });

  console.log('Socket.IO initialised');
  return io;
}

// Emits an event to every connected admin-dashboard client.
// Safe to call even if a socket somehow isn't connected — it just no-ops
// instead of throwing, so a missing/late socket connection never breaks
// the underlying HTTP request that triggered the event.
function emitToAdmin(event, payload) {
  if (!io) return;
  io.to('admin').emit(event, payload);
}

// Emits an event to one specific logged-in user's own room (see
// join:user above) — used to push a new DM reply straight to the
// recipient's dashboard.
function emitToUser(userId, event, payload) {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, payload);
}

module.exports = { initSocket, emitToAdmin, emitToUser };
