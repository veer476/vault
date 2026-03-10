
ALTER TABLE vault_items ADD COLUMN ssh_public_key TEXT;
ALTER TABLE vault_items ADD COLUMN ssh_private_key TEXT;
ALTER TABLE vault_items ADD COLUMN ssh_passphrase TEXT;
ALTER TABLE vault_items ADD COLUMN ssh_key_type TEXT;
ALTER TABLE vault_items ADD COLUMN ssh_fingerprint TEXT;
ALTER TABLE vault_items ADD COLUMN tags TEXT;
