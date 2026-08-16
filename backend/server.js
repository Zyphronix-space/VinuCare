const express = require('express');
const http    = require('http');
const cors    = require('cors');
const cookieParser = require('cookie-parser');
const path    = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const authRoutes         = require('./routes/auth');
const appointmentRoutes  = require('./routes/appointments');
const reviewRoutes       = require('./routes/reviews');
const orderRoutes        = require('./routes/orders');
const adminRoutes        = require('./routes/admin');
const doctorRoutes = require('./routes/doctor');
const chatbotRoutes = require('./routes/chatbot');
const paymentRoutes = require('./routes/payments');
const messageRoutes = require('./routes/messages');
const { initSocket } = require('./socket');
const { installErrorReporting } = require('./errorLog');
const { startReminderScheduler } = require('./appointmentReminders');

// Installed before anything else runs so every error from this point on —
// including ones during startup — flows into the admin error log.
installErrorReporting();
process.on('unhandledRejection', (reason) => console.error('Unhandled promise rejection:', reason));
process.on('uncaughtException', (err) => console.error('Uncaught exception:', err));

const app  = express();
// Railway (and most PaaS hosts) sit behind a reverse proxy that terminates
// TLS and forwards plain HTTP, adding X-Forwarded-For/-Proto headers.
// Without trusting the proxy, express-rate-limit sees those headers and
// throws (it looks like a spoofed IP), and req.ip resolves to the proxy's
// address for every user instead of their real one.
app.set('trust proxy', 1);
// Socket.IO needs the raw http.Server, not the Express app, so it can
// upgrade connections to WebSockets on the same port Express listens on.
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/auth',         authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews',      reviewRoutes);
app.use('/api/orders',       orderRoutes);
app.use('/api/doctor', doctorRoutes); 
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/messages', messageRoutes);

app.get('/', (req, res) => res.send('VinuCare API running ✅'));

// Catch-all — routes already handle their own errors, but anything that
// slips past them (a thrown error passed to next(), a bug in middleware)
// still gets logged and answered instead of hanging the request.
app.use((err, req, res, next) => {
  console.error(`Unhandled error [${req.method} ${req.originalUrl}]:`, err);
  if (res.headersSent) return next(err);
  res.status(500).json({ message: 'Server error' });
});

initSocket(server);
startReminderScheduler();

server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));