import { test, expect } from '@playwright/test';

/**
 * Receipt Service API Tests
 * Base path: /api/receipts
 *
 * Manages receipt templates and print jobs.
 */
test.describe('Receipt Service - /api/receipts', () => {
  test('GET /api/receipts/template - should get receipt template', async ({ request }) => {
    const response = await request.get('/api/receipts/template?businessId=biz-001');

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
    expect(body.data.id).toBeDefined();
    expect(body.data.businessId).toBe('biz-001');
    expect(body.data.headerText).toBeDefined();
    expect(body.data.footerText).toBeDefined();
    expect(typeof body.data.showLogo).toBe('boolean');
    expect(typeof body.data.showAddress).toBe('boolean');
    expect(typeof body.data.showTaxDetails).toBe('boolean');
    expect(body.data.paperWidth).toBeDefined();
  });

  test('PUT /api/receipts/template - should update receipt template', async ({ request }) => {
    const response = await request.put('/api/receipts/template', {
      data: {
        id: 'template-001',
        businessId: 'biz-001',
        headerText: 'Warung Nusantara - E2E Test',
        footerText: 'Terima kasih! - E2E',
        showLogo: true,
        showAddress: true,
        showTaxDetails: true,
        paperWidth: '80mm',
      },
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.message).toBe('Template updated');
    expect(body.data).toBeDefined();
    expect(body.data.headerText).toBe('Warung Nusantara - E2E Test');
    expect(body.data.footerText).toBe('Terima kasih! - E2E');
    expect(body.data.paperWidth).toBe('80mm');
    expect(body.data.showLogo).toBe(true);
  });

  test('POST /api/receipts/print - should create a print job', async ({ request }) => {
    const response = await request.post('/api/receipts/print', {
      data: {
        orderId: 'order-001',
        orderNumber: 'ORD-001',
        businessId: 'biz-001',
      },
    });

    expect(response.status()).toBe(201);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.message).toBe('Print job created');
    expect(body.data).toBeDefined();
    expect(body.data.id).toBeDefined();
    expect(body.data.orderId).toBe('order-001');
    expect(body.data.orderNumber).toBe('ORD-001');
    expect(body.data.status).toBeDefined();
    expect(body.data.businessId).toBe('biz-001');
    expect(body.data.createdAt).toBeDefined();
  });
});
