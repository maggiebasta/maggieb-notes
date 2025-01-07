/*
  # Add template creation policy
  
  1. Security Changes
    - Add policy to allow authenticated users to create templates
*/

CREATE POLICY "Authenticated users can create templates"
  ON templates
  FOR INSERT
  TO authenticated
  WITH CHECK (true);