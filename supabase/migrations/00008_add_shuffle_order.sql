ALTER TABLE tools ADD COLUMN IF NOT EXISTS shuffle_order INT NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_tools_shuffle_order ON tools (shuffle_order);
