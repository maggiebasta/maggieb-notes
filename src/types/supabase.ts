export interface Database {
  public: {
    Tables: {
      notes: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string;
          template_id?: string;
          created_at: string;
          updated_at: string;
          embedding?: number[];
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          content: string;
          template_id?: string;
          created_at?: string;
          updated_at?: string;
          embedding?: number[];
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          content?: string;
          template_id?: string;
          created_at?: string;
          updated_at?: string;
          embedding?: number[];
        };
      };
      templates: {
        Row: {
          id: string;
          name: string;
          content: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          content: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          content?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
