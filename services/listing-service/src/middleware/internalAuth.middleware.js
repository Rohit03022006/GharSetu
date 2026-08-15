/**
 * Internal Microservice Authentication Guard
 * Protects inter-service communication from unauthorized external or internal callers.
 */
export const requireInternalSecret = (req, res, next) => {
  const internalKey = req.headers['x-internal-service-key'];
  const expectedKey = process.env.INTERNAL_SERVICE_KEY || 'gharsetu-internal-microservice-secure-key-2026';

  if (!internalKey || internalKey !== expectedKey) {
    return res.status(403).json({
      error: {
        code: 'FORBIDDEN_INTERNAL_ACCESS',
        message: 'Direct access to internal microservice endpoints is forbidden'
      }
    });
  }

  next();
};
