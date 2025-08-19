const request = require('supertest');
const app = require('../../src/app');

describe('Unit Tests - App Routes', () => {
  describe('GET /', () => {
    it('should return API information', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body).toEqual({
        message: 'Git Backlog API',
        version: '1.0.0',
        status: 'running'
      });
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('healthy');
      expect(response.body.timestamp).toBeDefined();
    });
  });

  describe('GET /api/backlog', () => {
    it('should return backlog items', async () => {
      const response = await request(app)
        .get('/api/backlog')
        .expect(200);

      expect(response.body.items).toBeInstanceOf(Array);
      expect(response.body.items.length).toBeGreaterThan(0);
      expect(response.body.items[0]).toHaveProperty('id');
      expect(response.body.items[0]).toHaveProperty('title');
      expect(response.body.items[0]).toHaveProperty('priority');
      expect(response.body.items[0]).toHaveProperty('status');
    });
  });

  describe('GET /api/backlog/stats', () => {
    it('should return backlog statistics', async () => {
      const response = await request(app)
        .get('/api/backlog/stats')
        .expect(200);

      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('byStatus');
      expect(response.body).toHaveProperty('byPriority');
    });
  });

  describe('GET /api/backlog/:id', () => {
    it('should return a specific backlog item', async () => {
      const response = await request(app)
        .get('/api/backlog/1')
        .expect(200);

      expect(response.body.id).toBe(1);
      expect(response.body).toHaveProperty('title');
    });

    it('should return 404 for non-existent item', async () => {
      const response = await request(app)
        .get('/api/backlog/999')
        .expect(404);

      expect(response.body.error).toBe('Item not found');
    });
  });

  describe('POST /api/backlog', () => {
    it('should create a new backlog item', async () => {
      const newItem = {
        title: 'Test task',
        priority: 'high'
      };

      const response = await request(app)
        .post('/api/backlog')
        .send(newItem)
        .expect(201);

      expect(response.body.title).toBe(newItem.title);
      expect(response.body.priority).toBe(newItem.priority);
      expect(response.body.id).toBeDefined();
      expect(response.body.status).toBe('todo');
    });

    it('should return 400 if title is missing', async () => {
      const invalidItem = {
        priority: 'high'
      };

      const response = await request(app)
        .post('/api/backlog')
        .send(invalidItem)
        .expect(400);

      expect(response.body.error).toContain('Title is required');
    });

    it('should return 400 if priority is missing', async () => {
      const invalidItem = {
        title: 'Test task'
      };

      const response = await request(app)
        .post('/api/backlog')
        .send(invalidItem)
        .expect(400);

      expect(response.body.error).toContain('Priority is required');
    });
  });

  describe('PUT /api/backlog/:id', () => {
    it('should update a backlog item', async () => {
      const updates = {
        title: 'Updated task',
        status: 'done'
      };

      const response = await request(app)
        .put('/api/backlog/1')
        .send(updates)
        .expect(200);

      expect(response.body.title).toBe(updates.title);
      expect(response.body.status).toBe(updates.status);
    });

    it('should return 400 for invalid update', async () => {
      const invalidUpdate = {
        invalidField: 'test'
      };

      const response = await request(app)
        .put('/api/backlog/1')
        .send(invalidUpdate)
        .expect(400);

      expect(response.body.error).toContain('Invalid update fields');
    });
  });

  describe('DELETE /api/backlog/:id', () => {
    it('should delete a backlog item', async () => {
      const response = await request(app)
        .delete('/api/backlog/1')
        .expect(200);

      expect(response.body.message).toBe('Item deleted successfully');
      expect(response.body.item.id).toBe(1);
    });

    it('should return 404 for non-existent item', async () => {
      const response = await request(app)
        .delete('/api/backlog/999')
        .expect(404);

      expect(response.body.error).toBe('Item not found');
    });
  });

  describe('404 handler', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app)
        .get('/unknown-route')
        .expect(404);

      expect(response.body.error).toBe('Route not found');
    });
  });

  describe('Error handling middleware', () => {
    it('should handle errors gracefully', async () => {
      // Temporarily set NODE_ENV to development to see error details
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      // Create a route that throws an error for testing
      const express = require('express');
      const testApp = express();
      
      // Add the same middleware as main app
      testApp.use(express.json());
      
      // Add a route that throws an error
      testApp.get('/test-error', (req, res, next) => {
        const error = new Error('Test error');
        next(error);
      });
      
      // Add the same error handler as main app
      testApp.use((err, req, res, _next) => {
        res.status(500).json({
          error: 'Something went wrong!',
          message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
        });
      });

      const response = await request(testApp)
        .get('/test-error')
        .expect(500);

      expect(response.body.error).toBe('Something went wrong!');
      expect(response.body.message).toBe('Test error');
      
      // Restore original NODE_ENV
      process.env.NODE_ENV = originalNodeEnv;
    });

    it('should hide error details in production', async () => {
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      const express = require('express');
      const testApp = express();
      
      testApp.use(express.json());
      
      testApp.get('/test-error', (req, res, next) => {
        const error = new Error('Test error');
        next(error);
      });
      
      testApp.use((err, req, res, _next) => {
        res.status(500).json({
          error: 'Something went wrong!',
          message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
        });
      });

      const response = await request(testApp)
        .get('/test-error')
        .expect(500);

      expect(response.body.error).toBe('Something went wrong!');
      expect(response.body.message).toBe('Internal server error');
      
      // Restore original NODE_ENV
      process.env.NODE_ENV = originalNodeEnv;
    });
  });
});
