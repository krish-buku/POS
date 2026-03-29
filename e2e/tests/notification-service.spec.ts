import { test, expect } from '@playwright/test';

/**
 * Notification Service API Tests
 * Base path: /api/notifications
 *
 * Manages in-app notifications for staff.
 * Types: TABLE_TRANSFER, KITCHEN_READY, ORDER_VOID, PAYMENT_RECEIVED, STAFF_LOGIN
 */
test.describe('Notification Service - /api/notifications', () => {
  test('GET /api/notifications - should list all notifications', async ({ request }) => {
    const response = await request.get('/api/notifications');

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);

    // Validate notification structure
    const notification = body.data[0];
    expect(notification.id).toBeDefined();
    expect(notification.type).toBeDefined();
    expect(['TABLE_TRANSFER', 'KITCHEN_READY', 'ORDER_VOID', 'PAYMENT_RECEIVED', 'STAFF_LOGIN']).toContain(notification.type);
    expect(notification.title).toBeDefined();
    expect(notification.message).toBeDefined();
    expect(typeof notification.read).toBe('boolean');
    expect(notification.createdAt).toBeDefined();
  });

  test('POST /api/notifications/send - should send a notification', async ({ request }) => {
    const response = await request.post('/api/notifications/send', {
      data: {
        type: 'ORDER_VOID',
        title: 'Order Voided - E2E',
        message: 'Order ORD-E2E has been voided by test',
        targetStaffId: 'staff-001',
        businessId: 'biz-001',
      },
    });

    expect(response.status()).toBe(201);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.message).toBe('Notification sent');
    expect(body.data).toBeDefined();
    expect(body.data.id).toBeDefined();
    expect(body.data.type).toBe('ORDER_VOID');
    expect(body.data.title).toBe('Order Voided - E2E');
    expect(body.data.message).toBe('Order ORD-E2E has been voided by test');
    expect(body.data.targetStaffId).toBe('staff-001');
    expect(body.data.businessId).toBe('biz-001');
    expect(body.data.read).toBe(false);
  });

  test('PUT /api/notifications/{id}/read - should mark notification as read', async ({ request }) => {
    // Get a notification first
    const listResponse = await request.get('/api/notifications');
    const listBody = await listResponse.json();
    const notificationId = listBody.data[0].id;

    const response = await request.put(`/api/notifications/${notificationId}/read`);

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.message).toBe('Marked as read');
    expect(body.data).toBeDefined();
    expect(body.data.id).toBe(notificationId);
    expect(body.data.read).toBe(true);
  });
});
