import { test, expect } from '@playwright/test';

/**
 * File Storage Service API Tests
 * Base path: /api/files
 *
 * Manages file uploads and metadata. Uses query params for upload (not multipart).
 */
test.describe('File Storage Service - /api/files', () => {
  test('GET /api/files/business/{businessId} - should list files for business', async ({ request }) => {
    const response = await request.get('/api/files/business/biz-001');

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
    expect(Array.isArray(body.data)).toBe(true);

    // Validate file metadata structure if files exist
    if (body.data.length > 0) {
      const file = body.data[0];
      expect(file.id).toBeDefined();
      expect(file.fileName).toBeDefined();
      expect(file.originalName).toBeDefined();
      expect(file.contentType).toBeDefined();
      expect(file.url).toBeDefined();
      expect(file.businessId).toBe('biz-001');
      expect(file.createdAt).toBeDefined();
    }
  });

  test('POST /api/files/upload - should upload a file', async ({ request }) => {
    const response = await request.post(
      '/api/files/upload?originalName=test-image.jpg&contentType=image/jpeg&fileSize=1024&fileType=THUMBNAIL&businessId=biz-001&entityId=item-001'
    );

    expect(response.status()).toBe(201);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.message).toBe('File uploaded');
    expect(body.data).toBeDefined();
    expect(body.data.id).toBeDefined();
    expect(body.data.originalName).toBe('test-image.jpg');
    expect(body.data.contentType).toBe('image/jpeg');
    expect(body.data.fileSize).toBe(1024);
    expect(body.data.url).toBeDefined();
    expect(body.data.businessId).toBe('biz-001');
    expect(body.data.entityId).toBe('item-001');
  });

  test('DELETE /api/files/{id} - should delete a file', async ({ request }) => {
    // First upload a file to delete
    const uploadResponse = await request.post(
      '/api/files/upload?originalName=delete-me.jpg&contentType=image/jpeg&fileSize=512&fileType=THUMBNAIL&businessId=biz-001'
    );
    const uploaded = await uploadResponse.json();
    const fileId = uploaded.data.id;

    // Delete it
    const response = await request.delete(`/api/files/${fileId}`);

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.message).toBe('File deleted');
  });
});
