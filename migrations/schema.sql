CREATE TABLE IF NOT EXISTS api_keys (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL,
  expires_at TEXT,
  revoked BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS api_key_usage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key_id INTEGER NOT NULL,
  endpoint TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  FOREIGN KEY (key_id) REFERENCES api_keys(id)
);