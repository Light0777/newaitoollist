CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE tools ADD COLUMN IF NOT EXISTS embedding vector(768);
ALTER TABLE tools ADD COLUMN IF NOT EXISTS embedding_status TEXT NOT NULL DEFAULT 'pending' CHECK (embedding_status IN ('pending', 'done', 'failed'));

CREATE INDEX IF NOT EXISTS idx_tools_embedding ON tools USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

CREATE OR REPLACE FUNCTION find_similar_tools(
  p_tool_id UUID,
  p_embedding TEXT,
  p_limit INT DEFAULT 6
)
RETURNS TABLE(
  id UUID,
  name TEXT,
  slug TEXT,
  description TEXT,
  website_url TEXT,
  category TEXT,
  pricing TEXT,
  tags TEXT[],
  logo_url TEXT,
  created_at TIMESTAMPTZ,
  embedding_status TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id,
    t.name,
    t.slug,
    t.description,
    t.website_url,
    t.category,
    t.pricing,
    t.tags,
    t.logo_url,
    t.created_at,
    t.embedding_status
  FROM tools t
  WHERE t.id != p_tool_id
    AND t.embedding_status = 'done'
    AND t.embedding IS NOT NULL
  ORDER BY t.embedding <=> p_embedding::vector
  LIMIT p_limit;
END;
$$;
