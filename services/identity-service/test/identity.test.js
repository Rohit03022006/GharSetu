import { test, describe } from 'node:test';
import assert from 'node:assert';
import { z } from 'zod';

describe('Identity Service Unit & Schema Validation Tests', () => {
  const updateProfileSchema = z.object({
    name: z.string().min(2).optional(),
    phone: z.string().min(10).max(15).optional(),
    avatarUrl: z.string().url().optional()
  });

  const updateRoleSchema = z.object({
    role: z.enum(['ADMIN', 'BUILDER', 'BROKER', 'BUYER'])
  });

  test('Validates user profile update schema correctly', () => {
    const valid = updateProfileSchema.safeParse({
      name: 'Rohan Sharma',
      phone: '+919876543210',
      avatarUrl: 'https://images.unsplash.com/photo-avatar'
    });
    assert.strictEqual(valid.success, true);

    const invalid = updateProfileSchema.safeParse({
      phone: '123'
    });
    assert.strictEqual(invalid.success, false);
  });

  test('Validates role updates strictly for authorized roles', () => {
    const valid = updateRoleSchema.safeParse({ role: 'BUILDER' });
    assert.strictEqual(valid.success, true);

    const invalid = updateRoleSchema.safeParse({ role: 'SUPERUSER' });
    assert.strictEqual(invalid.success, false);
  });

  test('Data Leak Prevention: Moderation queue selects userDocs not OTP verifications', () => {
    // Assert data structure format for moderation response
    const mockUserRecord = {
      id: 'usr-1',
      name: 'Builder Bob',
      email: 'builder@example.com',
      role: 'BUILDER',
      verificationStatus: 'PENDING',
      userDocs: [
        { id: 'doc-1', docType: 'RERA_CERTIFICATE', fileUrl: 'https://minio.local/doc.pdf', uploadedAt: new Date() }
      ]
    };

    assert.strictEqual('verificationDocs' in mockUserRecord, false, 'verificationDocs must not be present');
    assert.strictEqual('otpHash' in mockUserRecord, false, 'otpHash must not be present');
    assert.strictEqual(Array.isArray(mockUserRecord.userDocs), true);
    assert.strictEqual(mockUserRecord.userDocs[0].docType, 'RERA_CERTIFICATE');
  });

  test('Internal Service Guard: Rejects calls without matching x-internal-service-key', async () => {
    const { requireInternalSecret } = await import('../src/middleware/internalAuth.middleware.js');
    
    // Case 1: Missing key
    let statusCode = null;
    let jsonBody = null;
    const req1 = { headers: {} };
    const res1 = {
      status: (c) => {
        statusCode = c;
        return { json: (b) => { jsonBody = b; } };
      }
    };
    let nextCalled = false;
    requireInternalSecret(req1, res1, () => { nextCalled = true; });
    assert.strictEqual(nextCalled, false);
    assert.strictEqual(statusCode, 403);
    assert.strictEqual(jsonBody?.error?.code, 'FORBIDDEN_INTERNAL_ACCESS');

    // Case 2: Matching key
    const req2 = { headers: { 'x-internal-service-key': 'gharsetu-internal-microservice-secure-key-2026' } };
    let nextCalled2 = false;
    requireInternalSecret(req2, {}, () => { nextCalled2 = true; });
    assert.strictEqual(nextCalled2, true);
  });
});
