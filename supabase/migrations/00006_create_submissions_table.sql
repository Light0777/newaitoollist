-- Create submissions table for public tool submissions
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT NOT NULL,
  website_url TEXT NOT NULL,
  category TEXT NOT NULL,
  pricing TEXT NOT NULL DEFAULT 'Free',
  tags TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitter_ip TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID
);

CREATE INDEX idx_submissions_status ON submissions (status);
CREATE INDEX idx_submissions_created_at ON submissions (created_at DESC);
CREATE INDEX idx_submissions_submitter_ip ON submissions (submitter_ip);

ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert on submissions"
  ON submissions FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated select on submissions"
  ON submissions FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update on submissions"
  ON submissions FOR UPDATE USING (auth.role() = 'authenticated');
