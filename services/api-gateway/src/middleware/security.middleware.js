/**
 * GharSetu API Gateway Security Middleware Suite
 * 1. Security Headers Enforcement (OWASP Best Practices)
 * 2. Internal Route Access Blocking
 * 3. Client Header Sanitization
 */

export const securityHeaders = (req, res, next) => {
  // Prevent MIME-sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  
  // XSS Auditor legacy defense
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Enforce HTTPS in production
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Restrict browser features
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  next();
};

export const blockInternalRoutes = (req, res, next) => {
  const normalizedUrl = (req.originalUrl || req.url || '').toLowerCase();
  
  // Block any external attempt to route into internal service endpoints
  if (normalizedUrl.includes('/internal') || normalizedUrl.startsWith('/internal')) {
    return res.status(403).json({
      error: {
        code: 'FORBIDDEN_INTERNAL_ENDPOINT',
        message: 'Direct access to internal microservice endpoints via API Gateway is forbidden'
      }
    });
  }

  next();
};
