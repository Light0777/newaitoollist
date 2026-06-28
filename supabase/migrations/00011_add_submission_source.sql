ALTER TABLE submissions ADD COLUMN source TEXT NOT NULL DEFAULT 'manual'
  CHECK (source IN ('manual', 'scraper_hn', 'scraper_ph'));

CREATE INDEX idx_submissions_source ON submissions (source);
