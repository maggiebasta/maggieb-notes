import { useState, useEffect } from 'react';
import { Note, Template } from './types';
import { NoteList } from './components/NoteList';
import { TiptapEditor } from './components/TiptapEditor';
import { TemplateSelector } from './components/TemplateSelector';
import { supabase } from './lib/supabase';
import { AuthForm } from './components/AuthForm';
import { User } from '@supabase/supabase-js';

/**
 * App - Main application component for MaggieB's Notes
 * 
 * This component serves as the root of the application, managing:
 * - User authentication state
 * - Notes CRUD operations
 * - Template selection and application
 * - Real-time updates with Supabase
 * 
 * The component conditionally renders either the authentication form
 * or the main application interface based on user login status.
 */
function App() {
  // State management for notes, templates, selected note, and user
  const [notes, setNotes] = useState<Note[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // Set up authentication listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load templates and notes when user is authenticated
  useEffect(() => {
    if (user) {
      loadTemplates();
      loadNotes();
    }
  }, [user]);

  // Fetch templates from Supabase
  const loadTemplates = async () => {
    const { data } = await supabase
      .from('templates')
      .select('*')
      .order('name');
    if (data) setTemplates(data);
  };

  // Fetch notes from Supabase
  const loadNotes = async () => {
    const { data } = await supabase
      .from('notes')
      .select('*')
      .order('updated_at', { ascending: false });
    if (data) {
      // Ensure all loaded notes have HTML-formatted content
      const formattedData = data.map(note => ({
        ...note,
        content: note.content.startsWith('<p>') ? note.content : `<p>${note.content.replace(/\n/g, '<br/>')}</p>`
      }));
      setNotes(formattedData);
    }
  };

  // Create a new note, optionally from a template
  const createNote = async (template?: Template) => {
    if (!user) return;

    // Add current date to note content and format as HTML
    const today = new Date().toLocaleDateString();
    const plainContent = template 
      ? `${today}\n\n${template.content}`
      : `${today}\n\n`;
    
    // Convert to HTML format
    const content = `<p>${plainContent.replace(/\n/g, '<br/>')}</p>`;

    const newNote = {
      user_id: user.id,
      title: template ? template.name : 'Untitled Note',
      content,
      template_id: template?.id,
    };

    const { data, error } = await supabase
      .from('notes')
      .insert([newNote])
      .select()
      .single();

    if (error) {
      console.error('Error creating note:', error);
      return;
    }

    setNotes(prevNotes => [data, ...prevNotes]);
    setSelectedNote(data);
  };

  // Update an existing note
  const updateNote = async (updatedNote: Note) => {
    setSelectedNote(updatedNote);
    setNotes(prevNotes => 
      prevNotes.map(note => note.id === updatedNote.id ? updatedNote : note)
    );

    const { error } = await supabase
      .from('notes')
      .update({
        title: updatedNote.title,
        content: updatedNote.content,
        updated_at: new Date().toISOString(),
      })
      .eq('id', updatedNote.id);

    if (error) {
      console.error('Error updating note:', error);
    }
  };

  // Delete a note
  const deleteNote = async (note: Note) => {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', note.id);

    if (error) {
      console.error('Error deleting note:', error);
      return;
    }

    // Update local state after successful deletion
    setNotes(prevNotes => prevNotes.filter(n => n.id !== note.id));
    if (selectedNote?.id === note.id) {
      setSelectedNote(null);
    }
  };

  // Show auth form if user is not logged in
  if (!user) {
    return <AuthForm />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex flex-1 relative">
        <NoteList
          notes={notes}
          onNoteSelect={setSelectedNote}
          selectedNoteId={selectedNote?.id}
          onDeleteNote={deleteNote}
        />
        <TemplateSelector
          templates={templates}
          onCreateFromTemplate={createNote}
          onCreateBlankNote={() => createNote()}
        />
        <TiptapEditor 
          content={selectedNote ? selectedNote.content.split('\n\n')
            .map(para => `<p>${para.split('\n').join('<br/>')}</p>`)
            .join('') : ''} 
          title={selectedNote?.title || ''}
          onUpdate={(newHTML) => {
            if (!selectedNote) return;
            // Convert HTML back to plaintext for storage, preserving line breaks
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = newHTML;
            // Replace <br> and </p><p> with newlines, then clean up any extra newlines
            const plainText = tempDiv.innerHTML
              .replace(/<br\s*\/?>/g, '\n')
              .replace(/<\/p>\s*<p>/g, '\n\n')
              .replace(/<\/?p>/g, '')
              .replace(/\n{3,}/g, '\n\n')
              .trim();
            updateNote({ ...selectedNote, content: plainText });
          }}
          onTitleChange={(newTitle) => {
            if (!selectedNote) return;
            updateNote({ ...selectedNote, title: newTitle });
          }}
        />
      </div>
    </div>
  );
}

export default App;
