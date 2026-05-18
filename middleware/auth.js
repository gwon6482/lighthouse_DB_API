const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'lighthouse-dev-secret';

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: '인증 토큰이 필요합니다' });
  }

  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, error: '토큰이 만료되었습니다' });
    }
    return res.status(401).json({ success: false, error: '유효하지 않은 토큰입니다' });
  }
};

module.exports = { authenticate, JWT_SECRET };
