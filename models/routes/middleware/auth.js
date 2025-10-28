const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET || 'devsecret';

exports.authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ ok: false, error: 'No token' });
  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ ok: false, error: 'Invalid token' });
  }
};

exports.requireRole = (roles = []) => {
  return (req, res, next) => {
    exports.authenticate(req, res, () => {
      if (roles.includes(req.user.role)) next();
      else res.status(403).json({ ok: false, error: 'Forbidden' });
    });
  };
};
