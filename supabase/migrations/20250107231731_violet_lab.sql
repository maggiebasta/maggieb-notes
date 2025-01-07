/*
  # Add template management policies
  
  1. Security Changes
    - Add policies to allow authenticated users to update and delete templates
*/

CREATE POLICY "Authenticated users can update templates"
  ON templates
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete templates"
  ON templates
  FOR DELETE
  TO authenticated
  USING (true);