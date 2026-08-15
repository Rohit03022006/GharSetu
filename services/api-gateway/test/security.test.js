import test from 'node:test';
import assert from 'node:assert';
import jwt from 'jsonwebtoken';
import { securityHeaders, blockInternalRoutes } from '../src/middleware/security.middleware.js';
import { validateGatewayJwt } from '../src/middleware/auth.middleware.js';

const JWT_SECRET = 'gharsetu-super-secret-jwt-access-key-2026';

test('API Gateway Security Suite', async (t) => {
  await t.test('SECURITY HEADERS: Attaches OWASP recommended security headers', () => {
    const headers = {};
    const req = {};
    const res = {
      setHeader: (key, value) => {
        headers[key] = value;
      }
    };
    let nextCalled = false;
    const next = () => { nextCalled = true; };

    securityHeaders(req, res, next);

    assert.strictEqual(nextCalled, true);
    assert.strictEqual(headers['X-Content-Type-Options'], 'nosniff');
    assert.strictEqual(headers['X-Frame-Options'], 'SAMEORIGIN');
    assert.strictEqual(headers['X-XSS-Protection'], '1; mode=block');
    assert.strictEqual(headers['Referrer-Policy'], 'strict-origin-when-cross-origin');
    assert.strictEqual(headers['Permissions-Policy'], 'geolocation=(), microphone=(), camera=()');
  });

  await t.test('INTERNAL ROUTE BLOCKER: Blocks direct /internal requests', () => {
    const testCases = [
      '/internal/prop-123',
      '/auth/internal/user-status/user-456',
      '/engagement/internal/bookings/verify-completed',
      '/INTERNAL/admin-bypass'
    ];

    for (const url of testCases) {
      const req = { originalUrl: url, url };
      let statusCode = null;
      let jsonBody = null;
      const res = {
        status: (code) => {
          statusCode = code;
          return {
            json: (body) => { jsonBody = body; }
          };
        }
      };
      let nextCalled = false;
      const next = () => { nextCalled = true; };

      blockInternalRoutes(req, res, next);

      assert.strictEqual(nextCalled, false, `Route ${url} should have been blocked`);
      assert.strictEqual(statusCode, 403, `Route ${url} should return 403`);
      assert.strictEqual(jsonBody?.error?.code, 'FORBIDDEN_INTERNAL_ENDPOINT');
    }
  });

  await t.test('INTERNAL ROUTE BLOCKER: Allows legitimate public routes', () => {
    const publicUrls = ['/properties/search', '/auth/login', '/finance/emi', '/wishlist'];

    for (const url of publicUrls) {
      const req = { originalUrl: url, url };
      const res = {};
      let nextCalled = false;
      const next = () => { nextCalled = true; };

      blockInternalRoutes(req, res, next);
      assert.strictEqual(nextCalled, true, `Route ${url} should have been allowed`);
    }
  });

  await t.test('HEADER SPOOFING: Strips spoofed client headers when no/invalid token provided', () => {
    const req = {
      headers: {
        'x-user-id': 'spoofed-admin-id',
        'x-user-role': 'ADMIN',
        'x-user-email': 'admin@gharsetu.com',
        'x-internal-service-key': 'attacker-fake-key'
      }
    };
    const res = {};
    let nextCalled = false;
    const next = () => { nextCalled = true; };

    validateGatewayJwt(req, res, next);

    assert.strictEqual(nextCalled, true);
    assert.strictEqual(req.headers['x-user-id'], undefined);
    assert.strictEqual(req.headers['x-user-role'], undefined);
    assert.strictEqual(req.headers['x-user-email'], undefined);
    assert.strictEqual(req.headers['x-internal-service-key'], undefined);
  });

  await t.test('HEADER SPOOFING: Strips spoofed headers and applies verified claims for valid JWT', () => {
    const token = jwt.sign(
      { userId: 'real-buyer-id-999', role: 'BUYER', email: 'buyer@example.com' },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    const req = {
      headers: {
        'authorization': `Bearer ${token}`,
        'x-user-id': 'attacker-spoofed-id',
        'x-user-role': 'ADMIN',
        'x-internal-service-key': 'malicious-key'
      }
    };
    const res = {};
    let nextCalled = false;
    const next = () => { nextCalled = true; };

    validateGatewayJwt(req, res, next);

    assert.strictEqual(nextCalled, true);
    assert.strictEqual(req.headers['x-user-id'], 'real-buyer-id-999');
    assert.strictEqual(req.headers['x-user-role'], 'BUYER');
    assert.strictEqual(req.headers['x-user-email'], 'buyer@example.com');
    assert.strictEqual(req.headers['x-internal-service-key'], undefined);
  });
});
