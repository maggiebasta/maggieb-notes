export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  template_id?: string;
  created_at: string;
  updated_at: string;
  embedding?: number[];
}

export interface Template {
  id: string;
  name: string;
  content: string;
}
