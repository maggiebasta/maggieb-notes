import React, { useState, useEffect } from 'react';
import { Note, Template } from './types';
import { NoteList } from './components/NoteList';
import { Editor } from './components/Editor';
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
    if (data) setNotes(data);
  };

  // Create a new note, optionally from a template
  const createNote = async (template?: Template) => {
    if (!user) return;

    // Add current date to note content and convert text to HTML
    const today = new Date().toLocaleDateString();
    const text = template ? template.content : "";
    // Wrap newlines in <p> tags, preserving empty lines
    const contentHtml = text
      .split("\n")
      .map(line => line.trim() ? `<p>${line}</p>` : "<p><br/></p>")
      .join("");
    const content = `<p>${today}</p><p><br/></p>${contentHtml}`;

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
        <Editor note={selectedNote} onNoteChange={updateNote} />
      </div>
    </div>
  );
}

export default App;
