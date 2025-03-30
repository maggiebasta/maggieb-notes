import { useState, useEffect } from 'react';
import { Note, Template, CalendarEvent } from './types';
import { NoteList } from './components/NoteList';
import { Editor } from './components/Editor';
import { TemplateSelector } from './components/TemplateSelector';
import { supabase } from './lib/supabase';
import { AuthForm } from './components/AuthForm';
import { User } from '@supabase/supabase-js';
import { CalendarMenu } from './components/CalendarMenu';

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
    // Convert text to HTML, handling empty lines with br tags
    const contentHtml = text
      .split("\n")
      .map(line => line.trim() ? `<p>${line}</p>` : "<br/>")
      .join("");
    const content = `<p>${today}</p>${contentHtml}`;

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

  const createNoteFromCalendar = async (event: CalendarEvent, template?: Template) => {
    if (!user) return;

    const dateStr = event.start.dateTime || event.start.date || '';
    const eventDate = new Date(dateStr).toLocaleString();
    
    const attendees = event.attendees 
      ? event.attendees
          .map((a) => a.displayName || a.email)
          .join(", ")
      : "No attendees";

    // Add current date to note content and convert text to HTML
    const today = new Date().toLocaleDateString();
    const baseText = template ? template.content : "";
    
    const meetingInfo = `
      <h2>Meeting Details</h2>
      <p><strong>Date/Time:</strong> ${eventDate}</p>
      <p><strong>Attendees:</strong> ${attendees}</p>
      <br/>
    `;

    // Convert text to HTML, handling empty lines with br tags
    const contentHtml = baseText
      .split("\n")
      .map(line => line.trim() ? `<p>${line}</p>` : "<br/>")
      .join("");

    const content = `<p>${today}</p>${meetingInfo}${contentHtml}`;

    const newNote = {
      user_id: user.id,
      title: event.summary || 'Meeting Note',
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
        <div className="absolute top-4 right-4 z-10 flex gap-4">
          <CalendarMenu
            templates={templates}
            onCreateFromCalendar={createNoteFromCalendar}
          />
          <TemplateSelector
            templates={templates}
            onCreateFromTemplate={createNote}
            onCreateBlankNote={() => createNote()}
          />
        </div>
        <Editor note={selectedNote} onNoteChange={updateNote} />
      </div>
    </div>
  );
}

export default App;
