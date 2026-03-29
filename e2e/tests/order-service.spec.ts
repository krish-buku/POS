import { test, expect } from '@playwright/test';

/**
 * Order Service API Tests
 * Base path: /api/orders
 *
 * Manages orders, order items, and order lifecycle.
 */
test.describe('Order Service - /api/orders', () => {
  let createdOrderId: string;

  test('POST /api/orders - should create a new order', async ({ request }) => {
    const response = await request.post('/api/orders', {
      data: {
        tableId: 'table-001',
        tableName: 'T1',
        staffId: 'staff-003',
        staffName: 'Ahmad Wijaya',
        businessId: 'biz-001',
        items: [
          {
            menuItemId: 'item-001',
            menuItemName: 'Nasi Goreng Spesial',
            quantity: 2,
            unitPrice: 25000,
            notes: 'Extra pedas',
            modifiers: [],
            variantName: null,
          },
          {
            menuItemId: 'item-002',
            menuItemName: 'Es Teh Manis',
            quantity: 2,
            unitPrice: 5000,
            notes: null,
            modifiers: [],
            variantName: null,
          },
        ],
        notes: 'E2E test order',
      },
    });

    expect(response.status()).toBe(201);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.message).toBe('Order created');
    expect(body.data).toBeDefined();
    expect(body.data.id).toBeDefined();
    expect(body.data.orderNumber).toBeDefined();
    expect(body.data.tableId).toBe('table-001');
    expect(body.data.staffId).toBe('staff-003');
    expect(body.data.businessId).toBe('biz-001');
    expect(body.data.items).toBeDefined();
    expect(body.data.items.length).toBe(2);
    expect(body.data.subtotal).toBeDefined();
    expect(body.data.total).toBeDefined();
    expect(body.data.status).toBeDefined();
    expect(body.data.createdAt).toBeDefined();

    // Store for subsequent tests
    createdOrderId = body.data.id;
  });

  test('GET /api/orders/{id} - should get order by ID', async ({ request }) => {
    // Use a known mock order ID or the previously created one
    const orderId = createdOrderId || 'order-001';
    const response = await request.get(`/api/orders/${orderId}`);

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
    expect(body.data.id).toBe(orderId);
    expect(body.data.orderNumber).toBeDefined();
    expect(body.data.tableId).toBeDefined();
    expect(body.data.staffId).toBeDefined();
    expect(body.data.items).toBeDefined();
    expect(Array.isArray(body.data.items)).toBe(true);
    expect(body.data.subtotal).toBeDefined();
    expect(body.data.tax).toBeDefined();
    expect(body.data.total).toBeDefined();
    expect(body.data.status).toBeDefined();
  });

  test('POST /api/orders/{id}/items - should add items to existing order', async ({ request }) => {
    const orderId = createdOrderId || 'order-001';
    const response = await request.post(`/api/orders/${orderId}/items`, {
      data: [
        {
          menuItemId: 'item-003',
          menuItemName: 'Ayam Bakar',
          quantity: 1,
          unitPrice: 35000,
          notes: 'Well done',
          modifiers: [],
          variantName: null,
        },
      ],
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.message).toBe('Items added');
    expect(body.data).toBeDefined();
    expect(body.data.id).toBe(orderId);
    expect(body.data.items.length).toBeGreaterThanOrEqual(3);
  });

  test('POST /api/orders/{id}/void - should void an order', async ({ request }) => {
    const orderId = createdOrderId || 'order-001';
    const response = await request.post(`/api/orders/${orderId}/void`, {
      data: {
        reason: 'E2E test void - customer request',
      },
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.message).toBe('Order voided');
    expect(body.data).toBeDefined();
    expect(body.data.id).toBe(orderId);
    expect(body.data.status).toBe('VOIDED');
  });

  test('GET /api/orders/table/{tableId} - should get orders by table', async ({ request }) => {
    const response = await request.get('/api/orders/table/table-001');

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
    expect(Array.isArray(body.data)).toBe(true);

    // All returned orders should belong to the specified table
    for (const order of body.data) {
      expect(order.tableId).toBe('table-001');
      expect(order.id).toBeDefined();
      expect(order.orderNumber).toBeDefined();
    }
  });
});
