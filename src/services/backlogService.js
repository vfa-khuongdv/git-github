/**
 * Backlog Service
 * Handles business logic for backlog item management
 */

class BacklogService {
  constructor() {
    this.items = [
      { id: 1, title: 'Setup CI/CD pipeline', priority: 'high', status: 'todo' },
      { id: 2, title: 'Add authentication', priority: 'medium', status: 'in-progress' },
      { id: 3, title: 'Write documentation', priority: 'low', status: 'done' }
    ];
    this.nextId = 4;
  }

  getAllItems() {
    return this.items;
  }

  getItemById(id) {
    const item = this.items.find(item => item.id === parseInt(id));
    if (!item) {
      throw new Error('Item not found');
    }
    return item;
  }

  createItem(title, priority) {
    if (!title || typeof title !== 'string' || title.trim() === '') {
      throw new Error('Title is required and must be a non-empty string');
    }

    if (!priority || !this.isValidPriority(priority)) {
      throw new Error('Priority is required and must be one of: high, medium, low');
    }

    const newItem = {
      id: this.nextId++,
      title: title.trim(),
      priority: priority.toLowerCase(),
      status: 'todo',
      createdAt: new Date().toISOString()
    };

    this.items.push(newItem);
    return newItem;
  }

  updateItem(id, updates) {
    const itemIndex = this.items.findIndex(item => item.id === parseInt(id));
    
    if (itemIndex === -1) {
      throw new Error('Item not found');
    }

    const allowedUpdates = ['title', 'priority', 'status'];
    const updateKeys = Object.keys(updates);
    
    // Validate update keys
    const invalidKeys = updateKeys.filter(key => !allowedUpdates.includes(key));
    if (invalidKeys.length > 0) {
      throw new Error(`Invalid update fields: ${invalidKeys.join(', ')}`);
    }

    // Validate values
    if (updates.title !== undefined) {
      if (typeof updates.title !== 'string' || updates.title.trim() === '') {
        throw new Error('Title must be a non-empty string');
      }
      updates.title = updates.title.trim();
    }

    if (updates.priority !== undefined && !this.isValidPriority(updates.priority)) {
      throw new Error('Priority must be one of: high, medium, low');
    }

    if (updates.status !== undefined && !this.isValidStatus(updates.status)) {
      throw new Error('Status must be one of: todo, in-progress, done');
    }

    // Apply updates
    this.items[itemIndex] = {
      ...this.items[itemIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    return this.items[itemIndex];
  }

  deleteItem(id) {
    const itemIndex = this.items.findIndex(item => item.id === parseInt(id));
    
    if (itemIndex === -1) {
      throw new Error('Item not found');
    }

    const deletedItem = this.items.splice(itemIndex, 1)[0];
    return deletedItem;
  }

  getItemsByStatus(status) {
    if (!this.isValidStatus(status)) {
      throw new Error('Invalid status. Must be one of: todo, in-progress, done');
    }
    return this.items.filter(item => item.status === status);
  }

  getItemsByPriority(priority) {
    if (!this.isValidPriority(priority)) {
      throw new Error('Invalid priority. Must be one of: high, medium, low');
    }
    return this.items.filter(item => item.priority === priority);
  }

  isValidPriority(priority) {
    const validPriorities = ['high', 'medium', 'low'];
    return validPriorities.includes(priority.toLowerCase());
  }

  isValidStatus(status) {
    const validStatuses = ['todo', 'in-progress', 'done'];
    return validStatuses.includes(status.toLowerCase());
  }

  getStats() {
    const stats = {
      total: this.items.length,
      byStatus: {
        todo: 0,
        'in-progress': 0,
        done: 0
      },
      byPriority: {
        high: 0,
        medium: 0,
        low: 0
      }
    };

    this.items.forEach(item => {
      stats.byStatus[item.status]++;
      stats.byPriority[item.priority]++;
    });

    return stats;
  }
}

module.exports = BacklogService;
