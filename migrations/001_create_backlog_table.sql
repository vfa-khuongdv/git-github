-- Migration: Create backlog table
-- Created: 2025-08-19T01:42:50.464Z

CREATE TABLE IF NOT EXISTS backlog_items (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  priority VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'todo',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_backlog_status ON backlog_items(status);
CREATE INDEX IF NOT EXISTS idx_backlog_priority ON backlog_items(priority);
