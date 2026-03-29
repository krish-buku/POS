import { test, expect } from '@playwright/test';

/**
 * Table Service API Tests
 * Base path: /api/tables
 *
 * Manages restaurant tables, status updates, transfers, and merges.
 */
test.describe('Table Service - /api/tables', () => {
  test('GET /api/tables - should list all tables', async ({ request }) => {
    const response = await request.get('/api/tables');

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);

    // Validate table structure
    const table = body.data[0];
    expect(table.id).toBeDefined();
    expect(table.name).toBeDefined();
    expect(typeof table.capacity).toBe('number');
    expect(table.status).toBeDefined();
    expect(table.businessId).toBeDefined();
  });

  test('POST /api/tables - should create a new table', async ({ request }) => {
    const response = await request.post('/api/tables', {
      data: {
        name: 'T-E2E',
        capacity: 6,
        areaId: 'area-001',
        floorId: 'floor-001',
        businessId: 'biz-001',
      },
    });

    expect(response.status()).toBe(201);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.message).toBe('Table created');
    expect(body.data).toBeDefined();
    expect(body.data.id).toBeDefined();
    expect(body.data.name).toBe('T-E2E');
    expect(body.data.capacity).toBe(6);
    expect(body.data.status).toBeDefined();
  });

  test('PUT /api/tables/{id}/status - should update table status', async ({ request }) => {
    const response = await request.put('/api/tables/table-001/status', {
      data: {
        status: 'OCCUPIED',
      },
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.message).toBe('Status updated');
    expect(body.data).toBeDefined();
    expect(body.data.id).toBe('table-001');
    expect(body.data.status).toBe('OCCUPIED');

    // Reset table status back to AVAILABLE
    await request.put('/api/tables/table-001/status', {
      data: { status: 'AVAILABLE' },
    });
  });

  test('POST /api/tables/transfer - should transfer between tables', async ({ request }) => {
    // Ensure source table is OCCUPIED and target table is AVAILABLE before transfer
    await request.put('/api/tables/table-001/status', {
      data: { status: 'OCCUPIED' },
    });
    await request.put('/api/tables/table-005/status', {
      data: { status: 'AVAILABLE' },
    });

    const response = await request.post('/api/tables/transfer', {
      data: {
        fromTableId: 'table-001',
        toTableId: 'table-005',
      },
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.message).toBe('Table transferred');
  });

  test('POST /api/tables/merge - should merge tables', async ({ request }) => {
    const response = await request.post('/api/tables/merge', {
      data: {
        tableIds: ['table-001', 'table-002'],
        targetTableId: 'table-001',
      },
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.message).toBe('Tables merged');
    expect(body.data).toBeDefined();
    expect(body.data.id).toBe('table-001');
  });
});
