import React, { useCallback } from 'react';
import { Note } from '../types';
import { LexicalEditor } from './LexicalEditor';

interface EditorProps {
  note: Note | null;
  onNoteChange: (note: Note) => void;
}

export function Editor({ note, onNoteChange }: EditorProps) {
  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!note) return;
    onNoteChange({
      ...note,
      title: e.target.value,
      updated_at: new Date().toISOString()
    });
  }, [note, onNoteChange]);

  if (!note) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        Select a note or create a new one
      </div>
    );
  }

  return (
    <div className="flex-1 p-6">
      <input
        type="text"
        value={note.title}
        onChange={handleTitleChange}
        className="w-full text-2xl font-bold mb-4 bg-transparent border-none outline-none"
        placeholder="Note title"
      />
      <LexicalEditor
        initialContent={note.editorState}
        onContentChange={(content, editorState) => {
          onNoteChange({
            ...note,
            content,
            editorState,
            updated_at: new Date().toISOString()
          });
        }}
      />
    </div>
  );
}
