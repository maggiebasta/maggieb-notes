-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to notes table
ALTER TABLE notes ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- Create an index for similarity search
CREATE INDEX IF NOT EXISTS notes_embedding_idx ON notes USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
