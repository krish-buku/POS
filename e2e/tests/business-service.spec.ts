import { test, expect } from '@playwright/test';

/**
 * Business Service API Tests (user-business-service)
 * Base path: /api/businesses
 *
 * Manages business profiles for BukuKasir.
 */
test.describe('Business Service - /api/businesses', () => {
  test('GET /api/businesses - should list all businesses', async ({ request }) => {
    const response = await request.get('/api/businesses');

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);

    // Validate structure of first business
    const business = body.data[0];
    expect(business.id).toBeDefined();
    expect(business.name).toBeDefined();
    expect(business.type).toBeDefined();
    expect(typeof business.active).toBe('boolean');
  });

  test('GET /api/businesses/{id} - should get specific business', async ({ request }) => {
    const response = await request.get('/api/businesses/biz-001');

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
    expect(body.data.id).toBe('biz-001');
    expect(body.data.name).toBeDefined();
    expect(body.data.type).toBeDefined();
    expect(body.data.address).toBeDefined();
    expect(body.data.phone).toBeDefined();
    expect(body.data.ownerId).toBeDefined();
    expect(body.data.currency).toBeDefined();
    expect(body.data.timezone).toBeDefined();
    expect(typeof body.data.active).toBe('boolean');
    expect(body.data.createdAt).toBeDefined();
  });

  test('POST /api/businesses - should create a new business', async ({ request }) => {
    const response = await request.post('/api/businesses', {
      data: {
        name: 'Test Cafe E2E',
        type: 'cafe',
        address: 'Jl. Testing No. 1, Jakarta',
        phone: '+62-21-9999999',
        ownerId: 'user-001',
        logoUrl: null,
      },
    });

    expect(response.status()).toBe(201);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.message).toBe('Business created');
    expect(body.data).toBeDefined();
    expect(body.data.id).toBeDefined();
    expect(body.data.name).toBe('Test Cafe E2E');
    expect(body.data.type).toBe('cafe');
    expect(body.data.address).toBe('Jl. Testing No. 1, Jakarta');
    expect(body.data.ownerId).toBe('user-001');
    expect(body.data.active).toBe(true);
  });

  test('PUT /api/businesses/{id} - should update existing business', async ({ request }) => {
    const response = await request.put('/api/businesses/biz-001', {
      data: {
        name: 'Warung Nusantara Updated',
        type: 'restaurant',
        address: 'Jl. Sudirman No. 123, Jakarta',
        phone: '+62-21-5551234',
        ownerId: 'user-001',
        logoUrl: null,
      },
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.message).toBe('Business updated');
    expect(body.data).toBeDefined();
    expect(body.data.id).toBe('biz-001');
    expect(body.data.name).toBe('Warung Nusantara Updated');
  });
});
