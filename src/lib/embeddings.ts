import { Note } from '../types';
import { supabase } from './supabase';
import { generateEmbedding } from './openai';

/**
 * Updates the embedding for a note by generating a new embedding from its content
 * and storing it in the database.
 */
export async function updateNoteEmbedding(note: Note): Promise<void> {
  try {
    // Combine title and content for better semantic search
    const text = `${note.title}\n\n${note.content}`;
    const embedding = await generateEmbedding(text);

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
    throw error;
  }
}

/**
 * Finds similar notes based on a query string by comparing embeddings.
 * Returns the top k most similar notes.
 */
export async function findSimilarNotes(query: string, userId: string, limit: number = 5): Promise<Note[]> {
  try {
    const queryEmbedding = await generateEmbedding(query);
    
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
    throw error;
  }
}
