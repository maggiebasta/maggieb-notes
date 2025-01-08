import { useState } from "react";
import { Note } from "../types";

export function ChatPanel({ notes, onClose }: { notes: Note[]; onClose: () => void }) {
  const [messages, setMessages] = useState<Array<{ text: string; isUser: boolean }>>([]);
  const [userQuestion, setUserQuestion] = useState("");

  async function handleSend() {
    if (!userQuestion.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { text: userQuestion, isUser: true }]);
    
    // TODO: Implement RAG in step 004
    // 1) Convert question to embedding
    // 2) Search similar notes using notes array
    // 3) Generate response with context
    console.log('Available notes:', notes.length);
    setMessages(prev => [...prev, { 
      text: "This feature is coming soon! For now, try searching your notes manually.", 
      isUser: false 
    }]);
    
    setUserQuestion("");
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
          className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600"
        >
          Send
        </button>
      </div>
    </div>
  );
}
