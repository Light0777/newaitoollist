ALTER TABLE tools ADD COLUMN trending BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE tools ADD COLUMN trending_position INTEGER;

CREATE INDEX idx_tools_trending ON tools (trending, trending_position)
  WHERE trending = TRUE;
