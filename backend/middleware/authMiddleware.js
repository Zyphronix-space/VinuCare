const jwt = require('jsonwebtoken');
const bootId = require('../bootId');

module.exports = (req, res, next) => {
  // Cookie is the normal path (browser sends it automatically); the header
  // stays as a fallback for non-browser clients (e.g. API testing tools).
  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Login required' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Token was issued by a server process before the current restart —
    // treat it as expired so a backend restart forces everyone to log
    // back in (see bootId.js).
    if (decoded.bootId !== bootId) {
      return res.status(401).json({ message: 'Session expired — please log in again.' });
    }
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};