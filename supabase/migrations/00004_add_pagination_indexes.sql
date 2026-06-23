-- Add indexes for cursor-based pagination and query performance
-- These prevent full table scans on all paginated queries

-- Composite index for cursor-based pagination (created_at DESC, id DESC)
-- Covers: ORDER BY created_at DESC, id DESC with cursor filtering
CREATE INDEX idx_tools_created_at_id ON tools (created_at DESC, id DESC);

-- Composite index for category page queries
-- Covers: WHERE category = ? ORDER BY created_at DESC
CREATE INDEX idx_tools_category_created_at ON tools (category, created_at DESC);
