const BacklogService = require('../../src/services/backlogService');

describe('Unit Tests - BacklogService', () => {
  let backlogService;

  beforeEach(() => {
    backlogService = new BacklogService();
  });

  describe('getAllItems', () => {
    it('should return all backlog items', () => {
      const items = backlogService.getAllItems();
      expect(items).toHaveLength(3);
      expect(items[0]).toHaveProperty('id');
      expect(items[0]).toHaveProperty('title');
      expect(items[0]).toHaveProperty('priority');
      expect(items[0]).toHaveProperty('status');
    });
  });

  describe('getItemById', () => {
    it('should return item by id', () => {
      const item = backlogService.getItemById(1);
      expect(item.id).toBe(1);
      expect(item.title).toBe('Setup CI/CD pipeline');
    });

    it('should throw error for non-existent id', () => {
      expect(() => {
        backlogService.getItemById(999);
      }).toThrow('Item not found');
    });
  });

  describe('createItem', () => {
    it('should create a new item with valid data', () => {
      const newItem = backlogService.createItem('Test task', 'high');
      
      expect(newItem).toHaveProperty('id');
      expect(newItem.title).toBe('Test task');
      expect(newItem.priority).toBe('high');
      expect(newItem.status).toBe('todo');
      expect(newItem).toHaveProperty('createdAt');
    });

    it('should trim whitespace from title', () => {
      const newItem = backlogService.createItem('  Test task  ', 'medium');
      expect(newItem.title).toBe('Test task');
    });

    it('should normalize priority to lowercase', () => {
      const newItem = backlogService.createItem('Test task', 'HIGH');
      expect(newItem.priority).toBe('high');
    });

    it('should throw error for empty title', () => {
      expect(() => {
        backlogService.createItem('', 'high');
      }).toThrow('Title is required and must be a non-empty string');
    });

    it('should throw error for null title', () => {
      expect(() => {
        backlogService.createItem(null, 'high');
      }).toThrow('Title is required and must be a non-empty string');
    });

    it('should throw error for whitespace-only title', () => {
      expect(() => {
        backlogService.createItem('   ', 'high');
      }).toThrow('Title is required and must be a non-empty string');
    });

    it('should throw error for invalid priority', () => {
      expect(() => {
        backlogService.createItem('Test task', 'invalid');
      }).toThrow('Priority is required and must be one of: high, medium, low');
    });

    it('should throw error for missing priority', () => {
      expect(() => {
        backlogService.createItem('Test task', null);
      }).toThrow('Priority is required and must be one of: high, medium, low');
    });
  });

  describe('updateItem', () => {
    it('should update item title', () => {
      const updated = backlogService.updateItem(1, { title: 'Updated title' });
      expect(updated.title).toBe('Updated title');
      expect(updated).toHaveProperty('updatedAt');
    });

    it('should update item priority', () => {
      const updated = backlogService.updateItem(1, { priority: 'low' });
      expect(updated.priority).toBe('low');
    });

    it('should update item status', () => {
      const updated = backlogService.updateItem(1, { status: 'done' });
      expect(updated.status).toBe('done');
    });

    it('should update multiple fields', () => {
      const updates = { title: 'New title', priority: 'low', status: 'done' };
      const updated = backlogService.updateItem(1, updates);
      expect(updated.title).toBe('New title');
      expect(updated.priority).toBe('low');
      expect(updated.status).toBe('done');
    });

    it('should throw error for non-existent item', () => {
      expect(() => {
        backlogService.updateItem(999, { title: 'Test' });
      }).toThrow('Item not found');
    });

    it('should throw error for invalid field', () => {
      expect(() => {
        backlogService.updateItem(1, { invalidField: 'test' });
      }).toThrow('Invalid update fields: invalidField');
    });

    it('should throw error for invalid title', () => {
      expect(() => {
        backlogService.updateItem(1, { title: '' });
      }).toThrow('Title must be a non-empty string');
    });

    it('should throw error for invalid priority', () => {
      expect(() => {
        backlogService.updateItem(1, { priority: 'invalid' });
      }).toThrow('Priority must be one of: high, medium, low');
    });

    it('should throw error for invalid status', () => {
      expect(() => {
        backlogService.updateItem(1, { status: 'invalid' });
      }).toThrow('Status must be one of: todo, in-progress, done');
    });
  });

  describe('deleteItem', () => {
    it('should delete item by id', () => {
      const initialLength = backlogService.getAllItems().length;
      const deleted = backlogService.deleteItem(1);
      
      expect(deleted.id).toBe(1);
      expect(backlogService.getAllItems()).toHaveLength(initialLength - 1);
    });

    it('should throw error for non-existent item', () => {
      expect(() => {
        backlogService.deleteItem(999);
      }).toThrow('Item not found');
    });
  });

  describe('getItemsByStatus', () => {
    it('should return items by status', () => {
      const todoItems = backlogService.getItemsByStatus('todo');
      expect(todoItems).toHaveLength(1);
      expect(todoItems[0].status).toBe('todo');
    });

    it('should throw error for invalid status', () => {
      expect(() => {
        backlogService.getItemsByStatus('invalid');
      }).toThrow('Invalid status. Must be one of: todo, in-progress, done');
    });
  });

  describe('getItemsByPriority', () => {
    it('should return items by priority', () => {
      const highItems = backlogService.getItemsByPriority('high');
      expect(highItems).toHaveLength(1);
      expect(highItems[0].priority).toBe('high');
    });

    it('should throw error for invalid priority', () => {
      expect(() => {
        backlogService.getItemsByPriority('invalid');
      }).toThrow('Invalid priority. Must be one of: high, medium, low');
    });
  });

  describe('validation methods', () => {
    it('should validate priority correctly', () => {
      expect(backlogService.isValidPriority('high')).toBe(true);
      expect(backlogService.isValidPriority('HIGH')).toBe(true);
      expect(backlogService.isValidPriority('medium')).toBe(true);
      expect(backlogService.isValidPriority('low')).toBe(true);
      expect(backlogService.isValidPriority('invalid')).toBe(false);
    });

    it('should validate status correctly', () => {
      expect(backlogService.isValidStatus('todo')).toBe(true);
      expect(backlogService.isValidStatus('TODO')).toBe(true);
      expect(backlogService.isValidStatus('in-progress')).toBe(true);
      expect(backlogService.isValidStatus('done')).toBe(true);
      expect(backlogService.isValidStatus('invalid')).toBe(false);
    });
  });

  describe('getStats', () => {
    it('should return correct statistics', () => {
      const stats = backlogService.getStats();
      
      expect(stats.total).toBe(3);
      expect(stats.byStatus.todo).toBe(1);
      expect(stats.byStatus['in-progress']).toBe(1);
      expect(stats.byStatus.done).toBe(1);
      expect(stats.byPriority.high).toBe(1);
      expect(stats.byPriority.medium).toBe(1);
      expect(stats.byPriority.low).toBe(1);
    });

    it('should update stats after creating items', () => {
      backlogService.createItem('New task', 'high');
      const stats = backlogService.getStats();
      
      expect(stats.total).toBe(4);
      expect(stats.byStatus.todo).toBe(2);
      expect(stats.byPriority.high).toBe(2);
    });
  });
});
