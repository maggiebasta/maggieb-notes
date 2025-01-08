export interface Note {
  id: string;
  title: string;
  content: string;  // Keep for backwards compatibility with existing notes
  editorState?: string;  // Optional JSON string for Lexical editor state
  template_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Template {
  id: string;
  name: string;
  content: string;
}
