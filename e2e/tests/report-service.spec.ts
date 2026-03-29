import { test, expect } from '@playwright/test';

/**
 * Report Service API Tests
 * Base path: /api/reports
 *
 * Reporting and analytics - daily summaries, sales reports, top items.
 */
test.describe('Report Service - /api/reports', () => {
  test('GET /api/reports/daily-summary - should return daily summary', async ({ request }) => {
    const response = await request.get('/api/reports/daily-summary');

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
    expect(body.data.date).toBeDefined();
    expect(body.data.totalRevenue).toBeDefined();
    expect(typeof body.data.totalOrders).toBe('number');
    expect(typeof body.data.totalItems).toBe('number');
    expect(body.data.averageOrderValue).toBeDefined();
    expect(typeof body.data.voidedOrders).toBe('number');
    expect(body.data.taxCollected).toBeDefined();
  });

  test('GET /api/reports/sales - should return sales report', async ({ request }) => {
    const response = await request.get('/api/reports/sales?period=today');

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
    expect(body.data.period).toBeDefined();
    expect(body.data.totalSales).toBeDefined();
    expect(typeof body.data.totalTransactions).toBe('number');
    expect(body.data.dailyBreakdown).toBeDefined();
    expect(Array.isArray(body.data.dailyBreakdown)).toBe(true);
  });

  test('GET /api/reports/top-items - should return top selling items', async ({ request }) => {
    const response = await request.get('/api/reports/top-items?limit=5');

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeLessThanOrEqual(5);

    // Validate top item structure (Map<String, Object>)
    if (body.data.length > 0) {
      const item = body.data[0];
      expect(item.menuItemName || item.name).toBeDefined();
      expect(item.quantitySold || item.quantity).toBeDefined();
    }
  });

  test('GET /api/reports/staff-performance - should return staff performance', async ({ request }) => {
    const response = await request.get('/api/reports/staff-performance');

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
    expect(Array.isArray(body.data)).toBe(true);

    // Validate staff performance structure (Map<String, Object>)
    if (body.data.length > 0) {
      const staff = body.data[0];
      expect(staff.staffName || staff.name).toBeDefined();
      expect(staff.ordersHandled || staff.totalOrders).toBeDefined();
    }
  });
});
