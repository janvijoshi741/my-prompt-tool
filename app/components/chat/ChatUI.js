"use client";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { auth } from "@/app/lib/firebase";
import { getUserFromFirestore } from "@/app/lib/firestore";
import { BiLoaderCircle, BiSend, BiPlus, BiTrash } from "react-icons/bi";
import { useChat } from "@/app/hooks/useChat";
import { useChatHistory } from "@/app/hooks/useChatHistory";
import { chatService } from "@/app/lib/firestore";
import { useRouter } from "next/navigation";

export default function ChatUI({ chatId }) {
  const [input, setInput] = useState("");
  const [userName, setUserName] = useState("");
  const [greeting, setGreeting] = useState("");
  const [quote, setQuote] = useState("");
  const [currentChatId, setCurrentChatId] = useState(chatId);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();

  // Use the hooks
  const {
    messages,
    loading: messagesLoading,
    sendMessage,
    user,
  } = useChat(currentChatId);
  const { chats, createNewChat, deleteChat } = useChatHistory();

  // Handle sending message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    try {
      let chatIdToUse = currentChatId;

      if (!chatIdToUse) {
        chatIdToUse = await chatService.createChat(user.uid, "New Chat");
        setCurrentChatId(chatIdToUse);
        router.push(`/chat/${chatIdToUse}`);
      }

      await sendMessage(input, chatIdToUse);
      setInput("");
    } catch (err) {
      alert("Failed to send message.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle new chat creation
  const handleNewChat = async () => {
    const newChatId = await createNewChat();
    console.log("NewChatIS", newChatId);
    if (newChatId) {
      setCurrentChatId(newChatId);
      router.push(`/chat/${newChatId}`);
    }
  };

  // Handle chat selection
  const handleSelectChat = (selectedChatId) => {
    setCurrentChatId(selectedChatId);
    router.push(`/chat/${selectedChatId}`);
  };

  // Handle chat deletion
  const handleDeleteChat = async (chatIdToDelete) => {
    await deleteChat(chatIdToDelete);
    console.log("ChatId", currentChatId);
    if (chatIdToDelete === currentChatId) {
      setCurrentChatId(null);
      router.push("/");
    }
  };

  // Fetch user data and greeting
  useEffect(() => {
    const fetchUserDataAndSetGreeting = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          const userData = await getUserFromFirestore(currentUser.uid);
          const userName = userData?.name || currentUser.displayName || "there";
          setUserName(userName);

          const hour = new Date().getHours();
          let greet = "";

          if (hour >= 1 && hour < 12) {
            greet = `Good morning, ${userName}!`;
          } else if (hour >= 12 && hour < 17) {
            greet = `Good afternoon, ${userName}!`;
          } else if (hour >= 17 && hour < 21) {
            greet = `Good evening, ${userName}!`;
          } else {
            greet = `Good night, ${userName}!`;
          }

          setGreeting(greet);

          // Fetch quote
          try {
            const quoteRes = await fetch(
              "https://api.freeapi.app/api/v1/public/quotes/quote/random"
            );
            const quoteData = await quoteRes.json();
            const quoteText = quoteData?.data?.content || "";
            const quoteAuthor = quoteData?.data?.author || "Unknown";
            setQuote(`"${quoteText}"`);
          } catch (quoteErr) {
            console.error("Failed to fetch quote:", quoteErr);
          }
        } catch (err) {
          console.error("Failed to fetch user data:", err);
        }
      }
    };

    fetchUserDataAndSetGreeting();
  }, []);

  return (
    <div className="flex h-screen bg-[#0f0f0f] text-white">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-90" : "w-0"
        } transition-all duration-300 bg-[#1a1a1a] border-r border-[#333] overflow-hidden`}
      >
        <div className="p-4">
          {/* New Chat Button */}
          <button
            onClick={handleNewChat}
            className="w-full flex items-center gap-3 px-4 py-3 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-lg transition-colors border border-[#404040]"
          >
            <BiPlus className="w-5 h-5" />
            <span className="font-medium">New Chat</span>
          </button>

          {/* Chat History */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-[#888] mb-3 px-2">
              Recent Chats
            </h3>
            <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                    chat.id === currentChatId
                      ? "bg-[#2a2a2a] border border-[#444]"
                      : "hover:bg-[#2a2a2a] border border-transparent"
                  }`}
                  onClick={() => handleSelectChat(chat.id)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#e8e8e8] truncate">
                      {chat.title || "New Chat"}
                    </p>
                    <p className="text-xs text-[#888] mt-1">
                      {chat.createdAt?.toDate?.()?.toLocaleDateString() ||
                        "Recently"}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteChat(chat.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#404040] rounded transition-all"
                  >
                    <BiTrash className="w-4 h-4 text-[#ff6b6b]" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#333]">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-[#2a2a2a] rounded-lg transition-colors"
          >
            <div className="w-5 h-5 flex flex-col justify-center space-y-1">
              <div className="w-full h-0.5 bg-[#e8e8e8]"></div>
              <div className="w-full h-0.5 bg-[#e8e8e8]"></div>
              <div className="w-full h-0.5 bg-[#e8e8e8]"></div>
            </div>
          </button>
          <h1 className="text-xl font-semibold">AI Assistant</h1>
          <div className="w-9"></div> {/* Spacer for centering */}
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 py-6">
            {/* Welcome Message */}
            {!currentChatId && (
              <div className="text-center py-12">
                <div className="max-w-2xl mx-auto">
                  <h2 className="text-3xl font-bold mb-4">
                    {greeting || (
                      <BiLoaderCircle className="animate-spin w-8 h-8 mx-auto" />
                    )}
                  </h2>
                  {quote && (
                    <p className="text-[#888] text-lg italic mb-8">{quote}</p>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                    <div className="p-4 bg-[#1a1a1a] rounded-lg border border-[#333]">
                      <h3 className="font-semibold mb-2">💡 Ask me anything</h3>
                      <p className="text-[#888] text-sm">
                        I can help with questions, explanations, coding, and
                        more.
                      </p>
                    </div>
                    <div className="p-4 bg-[#1a1a1a] rounded-lg border border-[#333]">
                      <h3 className="font-semibold mb-2">
                        🔍 Research & Analysis
                      </h3>
                      <p className="text-[#888] text-sm">
                        Get detailed information and insights on various topics.
                      </p>
                    </div>
                    <div className="p-4 bg-[#1a1a1a] rounded-lg border border-[#333]">
                      <h3 className="font-semibold mb-2">
                        💻 Code & Development
                      </h3>
                      <p className="text-[#888] text-sm">
                        Get help with programming, debugging, and technical
                        solutions.
                      </p>
                    </div>
                    <div className="p-4 bg-[#1a1a1a] rounded-lg border border-[#333]">
                      <h3 className="font-semibold mb-2">
                        ✍️ Writing & Creativity
                      </h3>
                      <p className="text-[#888] text-sm">
                        Assistance with writing, brainstorming, and creative
                        projects.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Messages */}
            {messagesLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-3 p-4 bg-[#1a1a1a] rounded-lg border border-[#333]">
                  <BiLoaderCircle className="animate-spin w-5 h-5 text-[#ffa500]" />
                  <p className="text-[#888]">Loading messages...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((msg, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          msg.role === "user"
                            ? "bg-[#ffa500] text-[#000]"
                            : "bg-[#2a2a2a] text-[#e8e8e8]"
                        }`}
                      >
                        {msg.role === "user" ? "U" : "AI"}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="mb-1">
                        <span className="text-sm font-medium text-[#e8e8e8]">
                          {msg.role === "user" ? "You" : "Assistant"}
                        </span>
                      </div>
                      <div className="prose prose-invert max-w-none">
                        {msg.role === "assistant" ? (
                          <ReactMarkdown
                            components={{
                              h1: ({ ...props }) => (
                                <h1
                                  className="text-xl font-semibold mt-6 mb-3 text-[#f4f4f4]"
                                  {...props}
                                />
                              ),
                              h2: ({ ...props }) => (
                                <h2
                                  className="text-lg font-semibold mt-4 mb-2 text-[#f4f4f4]"
                                  {...props}
                                />
                              ),
                              h3: ({ ...props }) => (
                                <h3
                                  className="text-base font-semibold mt-4 mb-2 text-[#f4f4f4]"
                                  {...props}
                                />
                              ),
                              p: ({ ...props }) => (
                                <p
                                  className="mb-4 text-[#e8e8e8] leading-relaxed"
                                  {...props}
                                />
                              ),
                              ul: ({ ...props }) => (
                                <ul
                                  className="list-disc ml-6 mb-4 text-[#e8e8e8] space-y-1"
                                  {...props}
                                />
                              ),
                              ol: ({ ...props }) => (
                                <ol
                                  className="list-decimal ml-6 mb-4 text-[#e8e8e8] space-y-1"
                                  {...props}
                                />
                              ),
                              li: ({ ...props }) => (
                                <li
                                  className="text-[#e8e8e8] leading-relaxed"
                                  {...props}
                                />
                              ),
                              strong: ({ ...props }) => (
                                <strong
                                  className="font-semibold text-[#f4f4f4]"
                                  {...props}
                                />
                              ),
                              code: ({ ...props }) => (
                                <code
                                  className="bg-[#2a2a2a] text-[#ffa500] px-2 py-1 rounded text-sm font-mono"
                                  {...props}
                                />
                              ),
                              pre: ({ ...props }) => (
                                <pre
                                  className="bg-[#1a1a1a] text-[#e8e8e8] p-4 rounded-lg overflow-x-auto font-mono text-sm border border-[#333] my-4"
                                  {...props}
                                />
                              ),
                              blockquote: ({ ...props }) => (
                                <blockquote
                                  className="border-l-4 border-[#ffa500] pl-4 italic text-[#d0d0d0] my-4"
                                  {...props}
                                />
                              ),
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        ) : (
                          <p className="text-[#e8e8e8] leading-relaxed">
                            {msg.content}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Loading indicator */}
            {loading && (
              <div className="flex gap-4 mt-6">
                <div className="w-8 h-8 rounded-full bg-[#2a2a2a] flex items-center justify-center">
                  <span className="text-sm font-medium">AI</span>
                </div>
                <div className="flex-1">
                  <div className="mb-1">
                    <span className="text-sm font-medium text-[#e8e8e8]">
                      Assistant
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BiLoaderCircle className="animate-spin w-5 h-5 text-[#ffa500]" />
                    <p className="text-[#888]">Thinking...</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-[#333] p-4">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSendMessage} className="flex gap-4">
              <div className="flex-1 relative">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#333] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffa500] focus:border-transparent text-[#e8e8e8] placeholder-[#888]"
                  placeholder="Type your message here..."
                  disabled={loading}
                />
              </div>
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="px-6 py-3 bg-[#ffa500] hover:bg-[#ff9500] disabled:bg-[#cc8400] disabled:cursor-not-allowed text-[#000] rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <BiSend className="w-4 h-4" />
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
