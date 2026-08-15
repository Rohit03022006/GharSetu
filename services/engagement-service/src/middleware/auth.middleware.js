import jwt from 'jsonwebtoken';

export const authenticateJwt = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Access token required' } });
  }

  const token = authHeader.split(' ')[1];

  try {
    const secret = process.env.JWT_SECRET || 'gharsetu-super-secret-jwt-access-key-2026';
    const decoded = jwt.verify(token, secret);
    req.user = {
      ...decoded,
      id: decoded.userId || decoded.id,
      userId: decoded.userId || decoded.id
    };
    next();
  } catch (error) {
    return res.status(401).json({ error: { code: 'INVALID_TOKEN', message: 'Token is invalid or expired' } });
  }
};

export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: { code: 'FORBIDDEN', message: `Access denied. Requires one of roles: ${allowedRoles.join(', ')}` }
      });
    }
    next();
  };
};
