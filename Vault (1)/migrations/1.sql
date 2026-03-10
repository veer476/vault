
CREATE TABLE vault_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  username TEXT,
  password TEXT,
  website TEXT,
  card_number TEXT,
  card_expiry TEXT,
  card_cvv TEXT,
  note_content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vault_items_user_id ON vault_items(user_id);
