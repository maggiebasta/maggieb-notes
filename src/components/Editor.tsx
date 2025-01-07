import React, { useCallback } from 'react';
import { Note } from '../types';

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
      updatedAt: new Date()
    });
  }, [note, onNoteChange]);

  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!note) return;
    onNoteChange({
      ...note,
      content: e.target.value,
      updatedAt: new Date()
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
      <textarea
        value={note.content}
        onChange={handleContentChange}
        className="w-full h-[calc(100vh-200px)] p-4 bg-white rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="Start writing..."
      />
    </div>
  );
}