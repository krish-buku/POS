import { test, expect } from '@playwright/test';

/**
 * Kitchen Service API Tests
 * Base path: /api/kitchen
 *
 * Kitchen display system - manages kitchen tickets and their statuses.
 * Ticket statuses: NEW, PREPARING, READY
 */
test.describe('Kitchen Service - /api/kitchen', () => {
  test('GET /api/kitchen/tickets - should list all kitchen tickets', async ({ request }) => {
    const response = await request.get('/api/kitchen/tickets');

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);

    // Validate kitchen ticket structure
    const ticket = body.data[0];
    expect(ticket.id).toBeDefined();
    expect(ticket.ticketNumber).toBeDefined();
    expect(ticket.orderId).toBeDefined();
    expect(ticket.orderNumber).toBeDefined();
    expect(ticket.tableName).toBeDefined();
    expect(ticket.status).toBeDefined();
    expect(['NEW', 'PREPARING', 'READY']).toContain(ticket.status);
    expect(ticket.items).toBeDefined();
    expect(Array.isArray(ticket.items)).toBe(true);
    expect(ticket.businessId).toBeDefined();
    expect(ticket.createdAt).toBeDefined();
  });

  test('PUT /api/kitchen/tickets/{id}/status - should update ticket status', async ({ request }) => {
    // Get a ticket first
    const listResponse = await request.get('/api/kitchen/tickets');
    const listBody = await listResponse.json();
    const ticketId = listBody.data[0].id;

    const response = await request.put(`/api/kitchen/tickets/${ticketId}/status`, {
      data: {
        status: 'PREPARING',
      },
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.message).toBe('Status updated');
    expect(body.data).toBeDefined();
    expect(body.data.id).toBe(ticketId);
    expect(body.data.status).toBe('PREPARING');
  });

  test('POST /api/kitchen/tickets/{id}/reprint - should reprint a ticket', async ({ request }) => {
    // Get a ticket first
    const listResponse = await request.get('/api/kitchen/tickets');
    const listBody = await listResponse.json();
    const ticketId = listBody.data[0].id;

    const response = await request.post(`/api/kitchen/tickets/${ticketId}/reprint`);

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.message).toBe('Ticket reprinted');
    expect(body.data).toBeDefined();
    expect(body.data.id).toBe(ticketId);
    expect(body.data.ticketNumber).toBeDefined();
    expect(body.data.items).toBeDefined();
  });
});
