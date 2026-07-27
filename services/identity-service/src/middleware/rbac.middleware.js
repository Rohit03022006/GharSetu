/**
 * Role-Based Access Control (RBAC) Middleware
 * @param  {...string} allowedRoles Roles allowed to access the route
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Forbidden: Access restricted to [${allowedRoles.join(', ')}] roles. Your role: ${req.user.role}`,
      });
    }

    next();
  };
};
