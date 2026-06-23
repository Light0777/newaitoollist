-- Create categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE
);

-- Create tools table
CREATE TABLE tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  website_url TEXT NOT NULL,
  category TEXT NOT NULL,
  pricing TEXT NOT NULL DEFAULT 'Free',
  tags TEXT[] NOT NULL DEFAULT '{}',
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access on categories"
  ON categories FOR SELECT USING (true);

CREATE POLICY "Allow public read access on tools"
  ON tools FOR SELECT USING (true);

-- Allow authenticated users full access
CREATE POLICY "Allow authenticated insert on categories"
  ON categories FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update on categories"
  ON categories FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated delete on categories"
  ON categories FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated insert on tools"
  ON tools FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update on tools"
  ON tools FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated delete on tools"
  ON tools FOR DELETE USING (auth.role() = 'authenticated');

-- Create indexes for search
CREATE INDEX idx_tools_name ON tools USING gin (to_tsvector('english', name));
CREATE INDEX idx_tools_description ON tools USING gin (to_tsvector('english', description));
CREATE INDEX idx_tools_tags ON tools USING gin (tags);
CREATE INDEX idx_tools_category ON tools (category);
CREATE INDEX idx_tools_slug ON tools (slug);
CREATE INDEX idx_categories_slug ON categories (slug);

-- Insert sample categories
INSERT INTO categories (name, slug) VALUES
  ('AI Agents', 'ai-agents'),
  ('Image AI', 'image-ai'),
  ('Video AI', 'video-ai'),
  ('Coding AI', 'coding-ai'),
  ('Writing AI', 'writing-ai'),
  ('Audio AI', 'audio-ai'),
  ('Productivity AI', 'productivity-ai'),
  ('Research AI', 'research-ai');
