import { Note } from '../types';
import { supabase } from './supabase';
import { generateEmbedding, isAIChatEnabled } from './openai';

/**
 * Updates the embedding for a note by generating a new embedding from its content
 * and storing it in the database.
 */
export async function updateNoteEmbedding(note: Note): Promise<void> {
  if (!isAIChatEnabled()) {
    console.warn('Skipping note embedding update: AI chat is disabled');
    return;
  }

  try {
    // Combine title and content for better semantic search
    const text = `${note.title}\n\n${note.content}`;
    const embedding = await generateEmbedding(text);

    if (!embedding) {
      console.warn('No embedding generated for note:', note.id);
      return;
    }

    // Update the note with the new embedding
    const { error } = await supabase
      .from('notes')
      .update({ embedding })
      .eq('id', note.id);

    if (error) {
      console.error('Error updating note embedding:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in updateNoteEmbedding:', error);
    // Don't throw error to prevent app from crashing
    return;
  }
}

/**
 * Finds similar notes based on a query string by comparing embeddings.
 * Returns the top k most similar notes, or matches based on text search if AI is disabled.
 */
export async function findSimilarNotes(query: string, userId: string, limit: number = 5): Promise<Note[]> {
  try {
    if (!isAIChatEnabled()) {
      // Fallback to basic text search when AI is disabled
      const searchTerm = `%${query.replace(/[%_]/g, '')}%`; // Escape special characters
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', userId)
        .or(`title.ilike.${searchTerm},content.ilike.${searchTerm}`)
        .limit(limit);

      if (error) {
        console.error('Error in text search:', error);
        return [];
      }

      // Ensure results are unique by ID
      const uniqueData = data ? Array.from(new Map(data.map(note => [note.id, note])).values()) : [];
      return uniqueData;
    }

    const queryEmbedding = await generateEmbedding(query);
    if (!queryEmbedding) {
      console.warn('Failed to generate embedding for query, falling back to text search');
      return findSimilarNotes(query, userId, limit);
    }
    
    // Perform vector similarity search using dot product
    const { data, error } = await supabase
      .rpc('match_notes', {
        query_embedding: queryEmbedding,
        match_threshold: 0.5,
        match_count: limit,
        p_user_id: userId
      });

    if (error) {
      console.error('Error finding similar notes:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in findSimilarNotes:', error);
    return [];
  }
}
