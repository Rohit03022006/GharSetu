import jwt from 'jsonwebtoken';

export const authenticateJwt = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Access token required' } });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'gharsetu-super-secret-jwt-access-key-2026');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: { code: 'INVALID_TOKEN', message: 'Token is invalid or expired' } });
  }
};
