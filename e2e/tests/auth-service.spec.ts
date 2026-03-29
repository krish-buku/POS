import { test, expect } from '@playwright/test';

/**
 * Auth Service API Tests
 * Base path: /api/auth
 * Port: 8081 (via gateway at 8080)
 *
 * PIN-based authentication for BukuKasir staff.
 */
test.describe('Auth Service - /api/auth', () => {
  test('POST /api/auth/verify-pin - should verify with correct PIN', async ({ request }) => {
    const response = await request.post('/api/auth/verify-pin', {
      data: {
        businessId: 'biz-001',
        pin: '1234',
      },
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.message).toBe('PIN verified successfully');
    expect(body.data).toBeDefined();
    expect(body.data.sessionId).toBeDefined();
    expect(body.data.staffId).toBeDefined();
    expect(body.data.staffName).toBeDefined();
    expect(body.data.role).toBeDefined();
    expect(body.data.businessId).toBe('biz-001');
    expect(body.data.expiresAt).toBeDefined();
    expect(body.timestamp).toBeDefined();
  });

  test('POST /api/auth/verify-pin - should reject with wrong PIN', async ({ request }) => {
    const response = await request.post('/api/auth/verify-pin', {
      data: {
        businessId: 'biz-001',
        pin: '9999',
      },
    });

    // Expect 401 or 400 for invalid PIN
    expect([400, 401]).toContain(response.status());

    const body = await response.json();
    // Error responses use ErrorResponse format (code, message, status) not ApiResponse
    expect(body.code).toBeDefined();
    expect(body.message).toBeDefined();
  });

  test('POST /api/auth/change-pin - should change PIN successfully', async ({ request }) => {
    const response = await request.post('/api/auth/change-pin', {
      data: {
        staffId: 'staff-001',
        currentPin: '1234',
        newPin: '5678',
      },
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.message).toBe('PIN changed successfully');

    // Change PIN back to original for test idempotency
    await request.post('/api/auth/change-pin', {
      data: {
        staffId: 'staff-001',
        currentPin: '5678',
        newPin: '1234',
      },
    });
  });

  test('POST /api/auth/reset-pin - should reset staff PIN (manager action)', async ({ request }) => {
    const response = await request.post('/api/auth/reset-pin', {
      data: {
        staffId: 'staff-003',
        managerStaffId: 'staff-001',
      },
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.message).toBe('PIN reset successfully');
    expect(body.data).toBeDefined();
    expect(body.data.newPin).toBeDefined();
    expect(body.data.staffId).toBe('staff-003');
  });

  test('GET /api/auth/roles - should list all available roles', async ({ request }) => {
    const response = await request.get('/api/auth/roles');

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.message).toBe('Roles retrieved successfully');
    expect(body.data).toBeDefined();
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);
    // Expect at least OWNER role to exist
    expect(body.data).toContain('OWNER');
  });
});
