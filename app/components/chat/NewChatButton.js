"use client";

import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

export const NewChatButton = ({ onCreateChat }) => {
  const router = useRouter();

  const handleNewChat = async () => {
    const chatId = await onCreateChat();
    if (chatId) {
      router.push(`/chat/${chatId}`);
    }
  };

  return (
    <button
      onClick={handleNewChat}
      className="w-full flex items-center gap-2 p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
    >
      <Plus size={20} />
      New Chat
    </button>
  );
};
