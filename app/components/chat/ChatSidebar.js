"use client";
import { useState } from "react";
import {
  BiPlus,
  BiTrash,
  BiChat,
  BiDotsVertical,
  BiEdit,
} from "react-icons/bi";
import { useChatHistory } from "@/app/hooks/useChatHistory";

export const ChatSidebar = ({
  currentChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
}) => {
  const { chats, loading, createNewChat, deleteChat } = useChatHistory();
  const [editingChatId, setEditingChatId] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  const handleNewChat = async () => {
    const newChatId = await createNewChat();
    if (newChatId && onNewChat) {
      onNewChat(newChatId);
    }
  };

  const handleDeleteChat = async (chatId) => {
    if (window.confirm("Are you sure you want to delete this chat?")) {
      await deleteChat(chatId);
      if (onDeleteChat) {
        onDeleteChat(chatId);
      }
    }
  };

  const handleEditTitle = (chatId, currentTitle) => {
    setEditingChatId(chatId);
    setEditTitle(currentTitle || "New Chat");
  };

  const handleSaveTitle = async (chatId) => {
    // You would implement this in your chatService
    // await chatService.updateChatTitle(chatId, editTitle);
    setEditingChatId(null);
    setEditTitle("");
  };

  const handleCancelEdit = () => {
    setEditingChatId(null);
    setEditTitle("");
  };

  return (
    <div className="w-80 bg-[#1a1a1a] border-r border-[#333] h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[#333]">
        <h2 className="text-lg font-semibold text-[#e8e8e8] mb-4">
          Chat History
        </h2>

        {/* New Chat Button */}
        <button
          onClick={handleNewChat}
          className="w-full flex items-center gap-3 px-4 py-3 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-lg transition-colors border border-[#404040] group"
        >
          <BiPlus className="w-5 h-5 text-[#ffa500] group-hover:scale-110 transition-transform" />
          <span className="font-medium text-[#e8e8e8]">New Chat</span>
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4">
            <div className="animate-pulse space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 bg-[#2a2a2a] rounded-lg"></div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-2">
            {chats.length === 0 ? (
              <div className="text-center py-8">
                <BiChat className="w-12 h-12 text-[#666] mx-auto mb-3" />
                <p className="text-[#888] text-sm">No chats yet</p>
                <p className="text-[#666] text-xs mt-1">
                  Start a new conversation
                </p>
              </div>
            ) : (
              chats.map((chat) => (
                <div
                  key={chat.id}
                  className={`group relative p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                    chat.id === currentChatId
                      ? "bg-[#ffa500] bg-opacity-10 border border-[#ffa500] border-opacity-30"
                      : "hover:bg-[#2a2a2a] border border-transparent"
                  }`}
                  onClick={() => onSelectChat && onSelectChat(chat.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      {editingChatId === chat.id ? (
                        <input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onBlur={() => handleSaveTitle(chat.id)}
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              handleSaveTitle(chat.id);
                            }
                            if (e.key === "Escape") {
                              handleCancelEdit();
                            }
                          }}
                          className="w-full bg-[#2a2a2a] text-[#e8e8e8] px-2 py-1 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#ffa500]"
                          autoFocus
                        />
                      ) : (
                        <div>
                          <p
                            className={`text-sm font-medium truncate ${
                              chat.id === currentChatId
                                ? "text-[#ffa500]"
                                : "text-[#e8e8e8]"
                            }`}
                          >
                            {chat.title || "New Chat"}
                          </p>
                          <p className="text-xs text-[#888] mt-1">
                            {chat.createdAt?.toDate?.()?.toLocaleDateString() ||
                              "Recently"}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditTitle(chat.id, chat.title);
                        }}
                        className="p-1.5 hover:bg-[#404040] rounded transition-colors"
                        title="Edit title"
                      >
                        <BiEdit className="w-3.5 h-3.5 text-[#888] hover:text-[#e8e8e8]" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteChat(chat.id);
                        }}
                        className="p-1.5 hover:bg-[#404040] rounded transition-colors"
                        title="Delete chat"
                      >
                        <BiTrash className="w-3.5 h-3.5 text-[#ff6b6b] hover:text-[#ff5252]" />
                      </button>
                    </div>
                  </div>

                  {/* Chat Preview */}
                  <div className="mt-2 text-xs text-[#666] truncate">
                    {chat.lastMessage || "No messages yet"}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-[#333]">
        <div className="text-xs text-[#666] text-center">
          <p>
            {chats.length} chat{chats.length !== 1 ? "s" : ""} total
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar;
