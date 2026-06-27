-- Replace old categories with coding-focused categories
DELETE FROM categories;
INSERT INTO categories (name, slug) VALUES
  ('AI Coding Agents', 'ai-coding-agents'),
  ('AI Code Editors', 'ai-code-editors'),
  ('Code Generation', 'code-generation'),
  ('Debugging', 'debugging'),
  ('Code Review', 'code-review'),
  ('Testing', 'testing');
