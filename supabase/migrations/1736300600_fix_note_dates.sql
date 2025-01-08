-- Update existing notes to use current timestamps
UPDATE notes 
SET 
  created_at = NOW(),
  updated_at = NOW()
WHERE 
  EXTRACT(YEAR FROM created_at) > 2024 OR
  EXTRACT(YEAR FROM updated_at) > 2024;

-- Ensure new notes use current timestamps
ALTER TABLE notes 
  ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP,
  ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP;

-- Add trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_notes_updated_at
    BEFORE UPDATE ON notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
