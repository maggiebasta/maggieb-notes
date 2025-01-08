-- Create a function to match notes using vector similarity
CREATE OR REPLACE FUNCTION match_notes(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  p_user_id uuid
)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  title text,
  content text,
  template_id text,
  created_at timestamptz,
  updated_at timestamptz,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    notes.id,
    notes.user_id,
    notes.title,
    notes.content,
    notes.template_id,
    notes.created_at,
    notes.updated_at,
    1 - (notes.embedding <=> query_embedding) as similarity
  FROM notes
  WHERE
    notes.user_id = p_user_id
    AND notes.embedding IS NOT NULL
    AND 1 - (notes.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;
