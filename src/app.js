const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const BacklogService = require('./services/backlogService');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const backlogService = new BacklogService();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Git Backlog API',
    version: '1.0.0',
    status: 'running'
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Backlog routes
app.get('/api/backlog', (req, res) => {
  try {
    const items = backlogService.getAllItems();
    res.json({ items });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/backlog/stats', (req, res) => {
  try {
    const stats = backlogService.getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/backlog/:id', (req, res) => {
  try {
    const item = backlogService.getItemById(req.params.id);
    res.json(item);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

app.post('/api/backlog', (req, res) => {
  try {
    const { title, priority } = req.body;
    const newItem = backlogService.createItem(title, priority);
    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/backlog/:id', (req, res) => {
  try {
    const updatedItem = backlogService.updateItem(req.params.id, req.body);
    res.json(updatedItem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/backlog/:id', (req, res) => {
  try {
    const deletedItem = backlogService.deleteItem(req.params.id);
    res.json({ message: 'Item deleted successfully', item: deletedItem });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, _next) => {
  console.error(err.stack); // eslint-disable-line no-console
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found'
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`); // eslint-disable-line no-console
  });
}

module.exports = app;
