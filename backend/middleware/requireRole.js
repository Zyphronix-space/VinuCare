// Restricts a route to specific user roles. Must run AFTER authMiddleware,
// since it reads req.user.role which authMiddleware sets from the JWT.
//
// Usage:
//   router.get('/appointments', auth, requireRole('Doctor'), async (req, res) => { ... });
//   router.get('/summary', auth, requireRole('Doctor', 'Admin'), async (req, res) => { ... });

module.exports = function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Login required' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have access to this resource' });
    }
    next();
  };
};