import { useState, useEffect } from "react";
import { Note } from "../types";
import { findSimilarNotes } from "../lib/embeddings";
import { generateChatResponse, isAIChatEnabled } from "../lib/openai";
import { supabase } from "../lib/supabase";

export function ChatPanel({ notes, onClose }: { notes: Note[]; onClose: () => void }) {
  const [messages, setMessages] = useState<Array<{ text: string; isUser: boolean }>>([]);
  const [userQuestion, setUserQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
    setIsLoading(true);

    try {
      // Add user message
      setMessages(prev => [...prev, { text: userQuestion, isUser: true }]);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Find similar notes using vector similarity or text search
      const similarNotes = await findSimilarNotes(userQuestion, user.id);
      
      // If AI is disabled, just show matching notes
      if (!isAIChatEnabled()) {
        const response = similarNotes.length > 0
          ? `Found ${similarNotes.length} matching notes:\n\n${
              similarNotes.map(note => `- ${note.title}`).join('\n')
            }`
          : "No matching notes found.";
        
        setMessages(prev => [...prev, { text: response, isUser: false }]);
        return;
      }

      // For AI-enabled mode, combine local and vector search results
      const localMatches = notes.filter(note => 
        note.content.toLowerCase().includes(userQuestion.toLowerCase()) ||
        note.title.toLowerCase().includes(userQuestion.toLowerCase())
      );
      
      // Combine and deduplicate results
      const allMatches = [...new Set([...localMatches, ...similarNotes])];

      // Construct prompt with context from similar notes
      const context = allMatches
        .map(note => `Note "${note.title}":\n${note.content}`)
        .join('\n\n');
      
      const prompt = `You are a helpful AI assistant helping a user search through their notes.
Based on the following notes, please answer the user's question.
If the notes don't contain relevant information, say so.

Notes for context:
${context}

User question: ${userQuestion}`;

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
