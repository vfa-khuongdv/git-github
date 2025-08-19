const request = require('supertest');
const app = require('../../src/app');

describe('Integration Tests - Complete API Flow', () => {
  let server;

  beforeAll((done) => {
    server = app.listen(0, () => {
      done();
    });
  });

  afterAll((done) => {
    server.close(done);
  });

  it('should handle complete backlog workflow', async () => {
    // Test health endpoint
    await request(app)
      .get('/health')
      .expect(200);

    // Get initial backlog
    const initialResponse = await request(app)
      .get('/api/backlog')
      .expect(200);

    expect(initialResponse.body.items).toBeInstanceOf(Array);
    const initialCount = initialResponse.body.items.length;

    // Get stats
    const statsResponse = await request(app)
      .get('/api/backlog/stats')
      .expect(200);

    expect(statsResponse.body.total).toBe(initialCount);

    // Create new backlog item
    const newItem = {
      title: 'Integration test task',
      priority: 'medium'
    };

    const createResponse = await request(app)
      .post('/api/backlog')
      .send(newItem)
      .expect(201);

    expect(createResponse.body.title).toBe(newItem.title);
    expect(createResponse.body.priority).toBe(newItem.priority);
    const createdItemId = createResponse.body.id;

    // Get the created item
    const getItemResponse = await request(app)
      .get(`/api/backlog/${createdItemId}`)
      .expect(200);

    expect(getItemResponse.body.id).toBe(createdItemId);

    // Update the item
    const updateData = { status: 'done', title: 'Updated integration test task' };
    const updateResponse = await request(app)
      .put(`/api/backlog/${createdItemId}`)
      .send(updateData)
      .expect(200);

    expect(updateResponse.body.status).toBe('done');
    expect(updateResponse.body.title).toBe('Updated integration test task');

    // Delete the item
    await request(app)
      .delete(`/api/backlog/${createdItemId}`)
      .expect(200);

    // Verify item is deleted
    await request(app)
      .get(`/api/backlog/${createdItemId}`)
      .expect(404);
  });

  it('should handle error cases properly', async () => {
    // Test invalid POST request
    await request(app)
      .post('/api/backlog')
      .send({})
      .expect(400);

    // Test invalid PUT request
    await request(app)
      .put('/api/backlog/1')
      .send({ invalidField: 'test' })
      .expect(400);

    // Test 404 route
    await request(app)
      .get('/nonexistent-route')
      .expect(404);

    // Test non-existent item
    await request(app)
      .get('/api/backlog/999')
      .expect(404);

    // Test delete non-existent item
    await request(app)
      .delete('/api/backlog/999')
      .expect(404);
  });

  it('should maintain API consistency', async () => {
    // Test API info endpoint
    const apiResponse = await request(app)
      .get('/')
      .expect(200);

    expect(apiResponse.body.message).toBe('Git Backlog API');
    expect(apiResponse.body.version).toBe('1.0.0');
    expect(apiResponse.body.status).toBe('running');
  });
});
