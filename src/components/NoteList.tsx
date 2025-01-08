import React from 'react';
import { Note } from '../types';
import { FileText, Calendar, Trash2 } from 'lucide-react';

interface NoteListProps {
  notes: Note[];
  onNoteSelect: (note: Note) => void;
  selectedNoteId?: string;
  onDeleteNote: (note: Note) => void;
}

export function NoteList({ notes, onNoteSelect, selectedNoteId, onDeleteNote }: NoteListProps) {
  // Format date to local string
  const formatDate = (date: string | Date | undefined) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString();
  };

  // Truncate long titles with ellipsis
  const truncateTitle = (title: string) => {
    return title.length > 20 ? title.substring(0, 20) + '...' : title;
  };

  return (
    <div className="w-76 bg-white border-r border-gray-200 overflow-y-auto flex flex-col h-full">
      <div className="p-4 flex-1">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-700">Notes</h2>
        </div>
        <div className="space-y-2">
          {notes.map((note) => (
            // Note item container with hover state
            <div
              key={note.id}
              className={`group relative rounded-lg transition-colors ${
                selectedNoteId === note.id
                  ? 'bg-blue-50'
                  : 'hover:bg-gray-50'
              }`}
            >
              {/* Note content button */}
              <button
                onClick={() => onNoteSelect(note)}
                className="w-full text-left p-3 pr-12"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span className="font-medium" title={note.title}>{truncateTitle(note.title)}</span>
                </div>
                <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(note.updated_at)}</span>
                </div>
              </button>
              {/* Delete button - visible on hover */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('Are you sure you want to delete this note?')) {
                    onDeleteNote(note);
                  }
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={async () => {
            const { supabase } = await import('../lib/supabase');
            await supabase.auth.signOut();
          }}
          className="w-full text-gray-500 hover:text-gray-700 text-sm py-2 flex items-center justify-center gap-2 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Sign out
        </button>
      </div>
    </div>
  );
}
