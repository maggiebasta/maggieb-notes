import { MessageCircle } from "lucide-react";
export function ChatBubble({ onOpenChat }: { onOpenChat: () => void }) {
  return (
    <button
      className="fixed bottom-6 right-6 bg-blue-500 text-white p-3 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-600"
      onClick={onOpenChat}
    >
      <MessageCircle className="w-5 h-5" />
    </button>
  );
}
