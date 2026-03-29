import { test, expect } from '@playwright/test';

/**
 * Staff Service API Tests
 * Base path: /api/staff
 *
 * Manages staff members, roles, and PINs.
 */
test.describe('Staff Service - /api/staff', () => {
  test('GET /api/staff - should list all staff', async ({ request }) => {
    const response = await request.get('/api/staff');

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);

    // Validate staff member structure
    const staff = body.data[0];
    expect(staff.id).toBeDefined();
    expect(staff.name).toBeDefined();
    expect(staff.role).toBeDefined();
    expect(staff.businessId).toBeDefined();
    expect(typeof staff.active).toBe('boolean');
    expect(staff.createdAt).toBeDefined();
  });

  test('POST /api/staff - should create a new staff member', async ({ request }) => {
    const response = await request.post('/api/staff', {
      data: {
        name: 'Test Staff E2E',
        email: 'teststaff@warung.com',
        phone: '+62-812-0000-0000',
        role: 'CASHIER',
        businessId: 'biz-001',
        pin: '4321',
        permissions: ['MANAGE_ORDERS', 'MANAGE_MENU'],
        active: true,
      },
    });

    expect(response.status()).toBe(201);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.message).toBe('Staff created');
    expect(body.data).toBeDefined();
    expect(body.data.id).toBeDefined();
    expect(body.data.name).toBe('Test Staff E2E');
    expect(body.data.role).toBe('CASHIER');
    expect(body.data.businessId).toBe('biz-001');
    expect(body.data.active).toBe(true);
    expect(body.data.permissions).toBeDefined();
  });

  test('PUT /api/staff/{id} - should update staff member', async ({ request }) => {
    const response = await request.put('/api/staff/staff-003', {
      data: {
        name: 'Ahmad Wijaya Updated',
        email: 'ahmad.updated@warung.com',
        phone: '+62-812-3456-7890',
        role: 'CASHIER',
        businessId: 'biz-001',
        pin: '1111',
        permissions: ['MANAGE_ORDERS', 'MANAGE_MENU', 'VIEW_REPORTS'],
        active: true,
      },
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.message).toBe('Staff updated');
    expect(body.data).toBeDefined();
    expect(body.data.id).toBe('staff-003');
    expect(body.data.name).toBe('Ahmad Wijaya Updated');
  });

  test('POST /api/staff/{id}/reset-pin - should reset staff PIN', async ({ request }) => {
    const response = await request.post('/api/staff/staff-003/reset-pin');

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.message).toBe('PIN reset successfully');
    expect(body.data).toBeDefined();
    expect(body.data.staffId).toBe('staff-003');
    expect(body.data.newPin).toBeDefined();
    // PIN should be 4-6 digits
    expect(body.data.newPin).toMatch(/^\d{4,6}$/);
  });
});
