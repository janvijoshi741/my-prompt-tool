"use client";

import { useParams } from "next/navigation";
import { useChat } from "@/app/hooks/useChat";
import { ChatSidebar } from "@/app/components/chat/ChatSidebar";
import ChatUI from "@/app/components/chat/ChatUI";

export default function ChatPage() {
  const { chatId } = useParams();
  const { messages, loading, sendMessage } = useChat(chatId);

  return (
    <div className="flex h-screen">
      {/* <ChatSidebar messages={messages} /> */}
      <div className="flex-1 flex flex-col">
        <ChatUI chatId={chatId} />
      </div>
    </div>
  );
}
