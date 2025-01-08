import { Note } from '../types';
import { supabase } from './supabase';
import { 
  generateEmbedding, 
  isAIChatEnabled, 
  parseNaturalLanguageQuery,
  type ParsedQuery,
  type ParsedTimeRange 
} from './openai';

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
 * Finds similar notes based on a natural language query by combining
 * vector similarity search with date filtering and text search.
 */
// Helper function to parse common time expressions
function parseRelativeTime(query: string): { start: string; end: string } | null {
  const now = new Date();
  const lowerQuery = query.toLowerCase();
  
  // Common time expressions
  if (lowerQuery.includes('last week')) {
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    const start = new Date(end);
    start.setDate(end.getDate() - 7);
    start.setHours(0, 0, 0, 0);
    return { start: start.toISOString(), end: end.toISOString() };
  }
  
  if (lowerQuery.includes('yesterday')) {
    const start = new Date(now);
    start.setDate(start.getDate() - 1);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setHours(23, 59, 59, 999);
    return { start: start.toISOString(), end: end.toISOString() };
  }
  
  if (lowerQuery.includes('last month')) {
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    const start = new Date(end);
    start.setMonth(end.getMonth() - 1);
    start.setHours(0, 0, 0, 0);
    return { start: start.toISOString(), end: end.toISOString() };
  }
  
  if (lowerQuery.includes('today')) {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    return { start: start.toISOString(), end: end.toISOString() };
  }
  
  return null;
}

export async function findSimilarNotes(query: string, notes: Note[], limit: number = 5): Promise<Note[]> {
  try {
    // Parse the natural language query
    const parsedQuery = isAIChatEnabled() ? await parseNaturalLanguageQuery(query) : null;
    const timeRange = parsedQuery?.timeRange;

    // Try to parse time range from query if not provided by AI
    const effectiveTimeRange = timeRange || (!isAIChatEnabled() ? parseRelativeTime(query) : null);

    // Filter notes by date range if specified
    let filteredNotes = notes;
    if (effectiveTimeRange) {
      filteredNotes = notes.filter(note => {
        const noteDate = new Date(note.updated_at);
        const startDate = new Date(effectiveTimeRange.start);
        const endDate = new Date(effectiveTimeRange.end);
        return noteDate >= startDate && noteDate <= endDate;
      });
    }

    if (!isAIChatEnabled()) {
      // Enhanced fallback text search with better term extraction
      const searchTerms = query
        .toLowerCase()
        // Remove time-related terms to improve matching
        .replace(/last (week|month|year)|yesterday|today/g, '')
        .trim()
        .split(/\s+/)
        .filter(term => term.length > 2) // Filter out short words
        .map(term => term.toLowerCase()); // Convert to lowercase for case-insensitive matching

      // Score results by match count and sort
      const scored = filteredNotes.map(note => {
        const matchCount = searchTerms.filter(term => 
          note.title.toLowerCase().includes(term) ||
          note.content.toLowerCase().includes(term)
        ).length;
        return { ...note, score: matchCount };
      });

      return scored
        .filter(note => note.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(({ score, ...note }) => note);
    }

    // Generate embedding for semantic search
    const queryEmbedding = await generateEmbedding(
      parsedQuery ? parsedQuery.topics.join(' ') : query
    );
    
    if (!queryEmbedding) {
      console.warn('Failed to generate embedding for query, falling back to text search');
      return findSimilarNotes(query, filteredNotes, limit);
    }
    
    // Perform vector similarity search with in-memory notes
    const results = await Promise.all(
      filteredNotes.map(async (note) => {
        // Skip notes without embeddings
        if (!note.embedding) return null;

        // Calculate cosine similarity
        const similarity = 1 - (
          note.embedding.reduce((sum: number, a: number, i: number) => 
            sum + (a - queryEmbedding[i]) ** 2, 0
          ) / 2
        );

        return { ...note, similarity };
      })
    );

    // Filter out notes without embeddings and sort by similarity
    return results
      .filter((result): result is Note & { similarity: number } => 
        result !== null && result.similarity > 0.5
      )
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
      .map(({ similarity, ...note }) => note);
  } catch (error) {
    console.error('Error in findSimilarNotes:', error);
    return [];
  }
}
