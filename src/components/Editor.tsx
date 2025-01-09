import React, { useCallback } from 'react';
import { Note } from '../types';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import BulletList from '@tiptap/extension-bullet-list';
import ListItem from '@tiptap/extension-list-item';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Underline from '@tiptap/extension-underline';

interface EditorProps {
  note: Note | null;
  onNoteChange: (note: Note) => void;
}

export function Editor({ note, onNoteChange }: EditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      BulletList,
      ListItem,
      TaskList,
      TaskItem,
      Underline,
    ],
    content: note?.content || '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      if (!note) return;
      onNoteChange({
        ...note,
        content: editor.getHTML(),
        updated_at: new Date().toISOString()
      });
    },
    onCreate: ({ editor }) => {
      editor.commands.focus();
    },
  });

  // Update editor content when note changes
  React.useEffect(() => {
    if (editor && note) {
      if (editor.getHTML() !== note.content) {
        editor.commands.setContent(note.content);
      }
    }
  }, [editor, note]);

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!note) return;
    onNoteChange({
      ...note,
      title: e.target.value,
      updated_at: new Date().toISOString()
    });
  }, [note, onNoteChange]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!editor) return;

    // Handle bullet points
    if (e.key === '-' && e.target instanceof HTMLElement && e.target.tagName === 'DIV') {
      e.preventDefault();
      editor.commands.toggleBulletList();
    }

    // Handle indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey) {
        editor.commands.liftListItem('listItem');
      } else {
        editor.commands.sinkListItem('listItem');
      }
    }
  }, [editor]);

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
      <div 
        className="w-full h-[calc(100vh-200px)] p-4 bg-white rounded-lg border border-gray-200 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent overflow-y-auto"
        onKeyDown={handleKeyDown}
      >
        <EditorContent 
          editor={editor} 
          className="h-full focus:outline-none"
        />
      </div>
    </div>
  );
}