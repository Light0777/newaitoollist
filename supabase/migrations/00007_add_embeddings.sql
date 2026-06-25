CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE tools ADD COLUMN IF NOT EXISTS embedding vector(768);
ALTER TABLE tools ADD COLUMN IF NOT EXISTS embedding_status TEXT NOT NULL DEFAULT 'pending' CHECK (embedding_status IN ('pending', 'done', 'failed'));

CREATE INDEX IF NOT EXISTS idx_tools_embedding ON tools USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

CREATE OR REPLACE FUNCTION find_similar_tools(
  p_tool_id UUID,
  p_embedding vector(768),
  p_limit INT DEFAULT 6
)
RETURNS SETOF tools
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM tools
  WHERE id != p_tool_id
    AND embedding_status = 'done'
    AND embedding IS NOT NULL
  ORDER BY embedding <=> p_embedding
  LIMIT p_limit;
END;
$$;
