/*
  # Notes App Schema

  1. New Tables
    - `notes`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `title` (text)
      - `content` (text)
      - `template_id` (text)
      - `created_at` (timestamp with time zone)
      - `updated_at` (timestamp with time zone)
    
    - `templates`
      - `id` (text, primary key)
      - `name` (text)
      - `content` (text)
      - `created_at` (timestamp with time zone)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their notes
    - Add policies for all users to read templates
*/

-- Create notes table
CREATE TABLE IF NOT EXISTS notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  title text NOT NULL,
  content text NOT NULL DEFAULT '',
  template_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create templates table
CREATE TABLE IF NOT EXISTS templates (
  id text PRIMARY KEY,
  name text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

-- Notes policies
CREATE POLICY "Users can manage their own notes"
  ON notes
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Templates policies
CREATE POLICY "Anyone can read templates"
  ON templates
  FOR SELECT
  TO authenticated
  USING (true);

-- Insert default templates
INSERT INTO templates (id, name, content) VALUES
  ('meeting', 'Meeting Notes', '# Meeting Notes\n\n## Attendees\n\n## Agenda\n\n## Action Items\n\n## Notes'),
  ('daily', 'Daily Journal', '# Daily Journal\n\n## Goals for Today\n\n## Accomplishments\n\n## Thoughts\n\n## Tomorrow''s Plan')
ON CONFLICT (id) DO NOTHING;