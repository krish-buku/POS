import { test, expect } from '@playwright/test';

/**
 * AI Image Service API Tests
 * Base path: /api/images
 *
 * AI-powered image generation for menu items.
 * Job statuses: PENDING, PROCESSING, COMPLETED, FAILED
 */
test.describe('AI Image Service - /api/images', () => {
  test('POST /api/images/generate - should create image generation job', async ({ request }) => {
    const response = await request.post('/api/images/generate', {
      data: {
        prompt: 'A delicious plate of nasi goreng with egg and vegetables, food photography',
        menuItemId: 'item-001',
        menuItemName: 'Nasi Goreng Spesial',
        businessId: 'biz-001',
      },
    });

    expect(response.status()).toBe(201);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.message).toBe('Image generation job created');
    expect(body.data).toBeDefined();
    expect(body.data.id).toBeDefined();
    expect(body.data.prompt).toBeDefined();
    expect(body.data.menuItemId).toBe('item-001');
    expect(body.data.menuItemName).toBe('Nasi Goreng Spesial');
    expect(body.data.status).toBeDefined();
    expect(body.data.businessId).toBe('biz-001');
    expect(body.data.createdAt).toBeDefined();
  });

  test('GET /api/images/jobs/{id} - should get job status', async ({ request }) => {
    // First create a job to retrieve
    const createResponse = await request.post('/api/images/generate', {
      data: {
        prompt: 'A bowl of bakso with noodles',
        menuItemId: 'item-002',
        menuItemName: 'Bakso Spesial',
        businessId: 'biz-001',
      },
    });
    const created = await createResponse.json();
    const jobId = created.data.id;

    const response = await request.get(`/api/images/jobs/${jobId}`);

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
    expect(body.data.id).toBe(jobId);
    expect(body.data.prompt).toBeDefined();
    expect(body.data.menuItemId).toBe('item-002');
    expect(body.data.status).toBeDefined();
  });

  test('GET /api/images/jobs - should list all image generation jobs', async ({ request }) => {
    const response = await request.get('/api/images/jobs');

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
    expect(Array.isArray(body.data)).toBe(true);

    // Validate job structure if jobs exist
    if (body.data.length > 0) {
      const job = body.data[0];
      expect(job.id).toBeDefined();
      expect(job.prompt).toBeDefined();
      expect(job.menuItemId).toBeDefined();
      expect(job.status).toBeDefined();
      expect(job.businessId).toBeDefined();
      expect(job.createdAt).toBeDefined();
    }
  });
});
