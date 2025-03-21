-- Migration for API key management system

-- API keys table with expanded fields for the new system
CREATE TABLE IF NOT EXISTS api_keys (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key_value TEXT NOT NULL UNIQUE,
  total_requests INTEGER DEFAULT 0,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TEXT NOT NULL,
  last_used_at TEXT,
  expires_at TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  rate_limit INTEGER DEFAULT 100,
  notes TEXT
);

-- Index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_api_keys_email ON api_keys(email);
-- Index on key_value for faster authentication
CREATE INDEX IF NOT EXISTS idx_api_keys_value ON api_keys(key_value);
