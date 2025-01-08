import { useState, useEffect } from "react";
import { Note } from "../types";
import { findSimilarNotes } from "../lib/embeddings";
import { 
  generateChatResponse, 
  isAIChatEnabled, 
  parseNaturalLanguageQuery,
  type ParsedQuery 
} from "../lib/openai";
import { supabase } from "../lib/supabase";

export function ChatPanel({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<Array<{ text: string; isUser: boolean }>>([]);
  const [userQuestion, setUserQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [parsedQuery, setParsedQuery] = useState<ParsedQuery | null>(null);

  // Show initial message about AI status
  useEffect(() => {
    if (!isAIChatEnabled()) {
      setMessages([{
        text: "AI chat is currently in basic search mode. To enable all features, please configure the OpenAI API key.",
        isUser: false
      }]);
    }
  }, []);

  async function handleSend() {
    if (!userQuestion.trim()) return;
    if (isLoading) return; // Prevent duplicate submissions while loading
    setIsLoading(true);

    try {

      // Add user message
      setMessages(prev => [...prev, { text: userQuestion, isUser: true }]);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Parse the natural language query and find similar notes
      const parsed = await parseNaturalLanguageQuery(userQuestion);
      setParsedQuery(parsed);
      const similarNotes = await findSimilarNotes(userQuestion, user.id);
      
      // If AI is disabled, just show matching notes
      if (!isAIChatEnabled()) {
        // Ensure unique notes by title
        const uniqueNotes = Array.from(new Map(similarNotes.map(note => [note.title, note])).values());
        const response = uniqueNotes.length > 0
          ? `Found ${uniqueNotes.length} matching note${uniqueNotes.length === 1 ? '' : 's'}:\n\n${
              uniqueNotes.map(note => `- ${note.title}`).join('\n')
            }`
          : "No matching notes found.";
        
        setMessages(prev => [...prev, { text: response, isUser: false }]);
        return;
      }

      // For AI-enabled mode, use vector search results
      const allMatches = similarNotes;

      // Construct prompt with context from similar notes
      // Helper function to format dates in a friendly way
      const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'today';
        if (diffDays === 1) return 'yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 14) return 'last week';
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        if (diffDays < 60) return 'last month';
        return date.toLocaleDateString();
      };

      const context = allMatches
        .map(note => {
          const friendlyDate = formatDate(note.updated_at);
          return `Note "${note.title}" (Last updated: ${friendlyDate}):\n${note.content}`;
        })
        .join('\n\n');
      
      const prompt = `You are a helpful AI assistant helping a user search through their notes.
Your task is to answer questions about the user's notes, with special attention to temporal context.

Instructions:
1. If the user asks about a specific time period, focus on notes from that time frame
2. When discussing dates, use natural language (e.g., "last week", "2 days ago")
3. If multiple notes match the query, summarize the key points
4. If no notes match the specified time period, mention this explicitly

Notes for context:
${context}

Original user question: ${userQuestion}
Query analysis: ${JSON.stringify({
  topics: parsedQuery?.topics || [],
  timeRange: parsedQuery?.timeRange ? {
    type: parsedQuery.timeRange.type,
    original: parsedQuery.timeRange.original,
    humanReadable: `from ${formatDate(parsedQuery.timeRange.start)} to ${formatDate(parsedQuery.timeRange.end)}`
  } : null,
  action: parsedQuery?.action,
  contentType: parsedQuery?.contentType
}, null, 2)}

Please provide a natural, conversational response that directly addresses the user's question.`;

      // Generate response using context
      const response = await generateChatResponse(prompt);

      // Add AI response
      setMessages(prev => [...prev, { text: response, isUser: false }]);
    
    } catch (error) {
      console.error('Error in handleSend:', error);
      setMessages(prev => [...prev, { 
        text: "Sorry, there was an error processing your request. Please try again.", 
        isUser: false 
      }]);
    } finally {
      setIsLoading(false);
      setUserQuestion("");
    }
  }

  return (
    <div className="fixed top-0 right-0 w-96 h-screen bg-white border-l border-gray-200 flex flex-col shadow-lg">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-lg font-semibold">AI Chat</h2>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
      <div className="flex-1 p-4 overflow-auto">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`mb-4 p-3 rounded-lg ${
              msg.isUser
                ? "bg-blue-500 text-white ml-8"
                : "bg-gray-100 text-gray-800 mr-8"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>
      <div className="p-4 border-t flex">
        <input
          type="text"
          value={userQuestion}
          onChange={(e) => setUserQuestion(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-l"
          placeholder="Ask about your notes..."
        />
        <button
          onClick={handleSend}
          disabled={isLoading}
          className={`px-4 py-2 rounded-r text-white ${
            isLoading 
              ? "bg-blue-400 cursor-not-allowed" 
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {isLoading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}
