import { test, expect } from '@playwright/test';

/**
 * Menu Service API Tests
 * Base path: /api/menu
 *
 * Manages categories, menu items, and modifiers.
 */
test.describe('Menu Service - /api/menu', () => {
  // --- Categories ---

  test('GET /api/menu/categories - should list all categories', async ({ request }) => {
    const response = await request.get('/api/menu/categories');

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);

    // Validate category structure
    const category = body.data[0];
    expect(category.id).toBeDefined();
    expect(category.name).toBeDefined();
  });

  test('POST /api/menu/categories - should create a category', async ({ request }) => {
    const response = await request.post('/api/menu/categories', {
      data: {
        name: 'Test Category E2E',
        description: 'Category created by E2E test',
        businessId: 'biz-001',
        sortOrder: 99,
      },
    });

    expect(response.status()).toBe(201);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.message).toBe('Category created');
    expect(body.data).toBeDefined();
    expect(body.data.id).toBeDefined();
    expect(body.data.name).toBe('Test Category E2E');
  });

  test('DELETE /api/menu/categories/{id} - should delete a category', async ({ request }) => {
    // First create a category to delete
    const createResponse = await request.post('/api/menu/categories', {
      data: {
        name: 'Category To Delete',
        description: 'Will be deleted',
        businessId: 'biz-001',
        sortOrder: 100,
      },
    });
    const created = await createResponse.json();
    const categoryId = created.data.id;

    // Delete it
    const response = await request.delete(`/api/menu/categories/${categoryId}`);

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.message).toBe('Category deleted');
  });

  // --- Menu Items ---

  test('GET /api/menu/items - should list all menu items', async ({ request }) => {
    const response = await request.get('/api/menu/items');

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);

    // Validate menu item structure
    const item = body.data[0];
    expect(item.id).toBeDefined();
    expect(item.name).toBeDefined();
    expect(item.price).toBeDefined();
    expect(item.categoryId).toBeDefined();
    expect(typeof item.available).toBe('boolean');
  });

  test('POST /api/menu/items - should create a menu item', async ({ request }) => {
    const response = await request.post('/api/menu/items', {
      data: {
        name: 'Test Nasi Goreng E2E',
        description: 'Nasi goreng test dari E2E',
        price: 28000,
        categoryId: 'cat-001',
        businessId: 'biz-001',
        imageUrl: null,
      },
    });

    expect(response.status()).toBe(201);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.message).toBe('Menu item created');
    expect(body.data).toBeDefined();
    expect(body.data.id).toBeDefined();
    expect(body.data.name).toBe('Test Nasi Goreng E2E');
    expect(body.data.price).toBe(28000);
    expect(body.data.categoryId).toBe('cat-001');
    expect(body.data.available).toBe(true);
  });

  test('PATCH /api/menu/items/{id}/availability - should toggle item availability', async ({ request }) => {
    // First get an item to know a valid ID
    const listResponse = await request.get('/api/menu/items');
    const listBody = await listResponse.json();
    const itemId = listBody.data[0].id;

    // Toggle availability to false
    const response = await request.patch(`/api/menu/items/${itemId}/availability`, {
      data: {
        available: false,
      },
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.message).toBe('Availability updated');
    expect(body.data).toBeDefined();
    expect(body.data.id).toBe(itemId);
    expect(body.data.available).toBe(false);

    // Toggle back to true
    await request.patch(`/api/menu/items/${itemId}/availability`, {
      data: { available: true },
    });
  });

  test('GET /api/menu/items?categoryId={id} - should filter items by category', async ({ request }) => {
    const response = await request.get('/api/menu/items?categoryId=cat-001');

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
    expect(Array.isArray(body.data)).toBe(true);

    // All returned items should belong to the specified category
    for (const item of body.data) {
      expect(item.categoryId).toBe('cat-001');
    }
  });

  test('GET /api/menu/items/{id} - should get a single menu item', async ({ request }) => {
    // Get list first to obtain a valid ID
    const listResponse = await request.get('/api/menu/items');
    const listBody = await listResponse.json();
    const itemId = listBody.data[0].id;

    const response = await request.get(`/api/menu/items/${itemId}`);

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
    expect(body.data.id).toBe(itemId);
    expect(body.data.name).toBeDefined();
    expect(body.data.price).toBeDefined();
    expect(body.data.categoryId).toBeDefined();
    expect(typeof body.data.available).toBe('boolean');
  });
});
