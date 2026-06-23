-- Create admins table
CREATE TABLE admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read (for checking)
CREATE POLICY "Allow authenticated read on admins"
  ON admins FOR SELECT USING (auth.role() = 'authenticated');

-- Insert admin user
INSERT INTO admins (email) VALUES ('lightyagami7502@gmail.com');
