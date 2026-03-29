import { test, expect } from '@playwright/test';

/**
 * Payment Service API Tests
 * Base path: /api/payments
 *
 * Manages payment methods and payment transactions.
 */
test.describe('Payment Service - /api/payments', () => {
  test('GET /api/payments/methods - should list payment methods', async ({ request }) => {
    const response = await request.get('/api/payments/methods');

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);

    // Validate payment method structure
    const method = body.data[0];
    expect(method.id).toBeDefined();
    expect(method.name).toBeDefined();
    expect(method.type).toBeDefined();
    expect(typeof method.active).toBe('boolean');
  });

  test('POST /api/payments/methods - should create a payment method', async ({ request }) => {
    const response = await request.post('/api/payments/methods', {
      data: {
        name: 'E2E Test Payment',
        type: 'DIGITAL_WALLET',
        active: true,
        businessId: 'biz-001',
      },
    });

    expect(response.status()).toBe(201);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.message).toBe('Payment method created');
    expect(body.data).toBeDefined();
    expect(body.data.id).toBeDefined();
    expect(body.data.name).toBe('E2E Test Payment');
    expect(body.data.type).toBe('DIGITAL_WALLET');
    expect(body.data.active).toBe(true);
  });

  test('POST /api/payments - should record a payment', async ({ request }) => {
    const response = await request.post('/api/payments', {
      data: {
        orderId: 'order-001',
        orderNumber: 'ORD-001',
        amount: 60000,
        amountPaid: 100000,
        paymentMethodId: 'pm-001',
        paymentMethodName: 'Cash',
        staffId: 'staff-003',
        businessId: 'biz-001',
      },
    });

    expect(response.status()).toBe(201);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.message).toBe('Payment recorded');
    expect(body.data).toBeDefined();
    expect(body.data.id).toBeDefined();
    expect(body.data.orderId).toBe('order-001');
    expect(body.data.amount).toBeDefined();
    expect(body.data.amountPaid).toBeDefined();
    expect(body.data.paymentMethodId).toBe('pm-001');
  });

  test('GET /api/payments/order/{orderId} - should get payments by order', async ({ request }) => {
    const response = await request.get('/api/payments/order/order-001');

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
    expect(Array.isArray(body.data)).toBe(true);

    // All returned payments should belong to the specified order
    for (const payment of body.data) {
      expect(payment.orderId).toBe('order-001');
      expect(payment.id).toBeDefined();
      expect(payment.amount).toBeDefined();
    }
  });

  test('DELETE /api/payments/methods/{id} - should delete a payment method', async ({ request }) => {
    // First create a method to delete
    const createResponse = await request.post('/api/payments/methods', {
      data: {
        name: 'Method To Delete',
        type: 'OTHER',
        active: false,
        businessId: 'biz-001',
      },
    });
    const created = await createResponse.json();
    const methodId = created.data.id;

    // Delete it
    const response = await request.delete(`/api/payments/methods/${methodId}`);

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.message).toBe('Payment method deleted');
  });
});
