"use client";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import axios from "axios";
import { auth } from "../lib/firebase";
import { getUserFromFirestore } from "../lib/firestore";
import { BiLoaderCircle } from "react-icons/bi";

export default function ChatUI({ user }) {
  const [input, setInput] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState("");
  const [greeting, setGreeting] = useState("");
  const [quote, setQuote] = useState("");

  useEffect(() => {
    if (user) {
      // const user = localStorage.setItem("user", user)
    }
  }, [user]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { role: "user", content: input };
    setChat((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post("/api/chat", { message: input });
      const aiMsg = {
        role: "assistant",
        content: res.data.reply.candidates[0].content.parts[0].text,
      };
      setChat((prev) => [...prev, aiMsg]);
    } catch (err) {
      alert("Failed to get a response from the API.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchUserDataAndSetGreeting = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          const userData = await getUserFromFirestore(currentUser.uid);
          // console.log("Userdata", userData);
          const userName = userData?.name || currentUser.displayName || "there";
          // console.log("User Name", userData?.name);
          setUserName(userName);

          const hour = new Date().getHours();
          let greet = "";

          if (hour >= 1 && hour < 12) {
            greet = `Good morning, ${userName}!`;
          } else if (hour >= 12 && hour < 17) {
            greet = `It's Midday, ${userName}!`;
          } else if (hour >= 17 && hour < 21) {
            greet = `Good evening, ${userName}!`;
          } else {
            greet = `Good night, ${userName}!`;
          }

          setGreeting(greet);

          const quoteRes = await fetch(
            "https://api.freeapi.app/api/v1/public/quotes/quote/random"
          );
          const quoteData = await quoteRes.json();
          const quoteText = quoteData?.data?.content || "";
          const quoteAuthor = quoteData?.data?.author || "Unknown";

          setQuote(`${quoteText} `);
        } catch (err) {
          console.error("Failed to fetch user data:", err);
        }
      }
    };

    fetchUserDataAndSetGreeting();
  }, []);

  return (
    <main className="p-6 bg-primary min-h-screen grid grid-cols-[250px_1fr]">
      <div className="mx-auto w-full max-w-3xl">
        <aside className=" p-4 text-white">
          {/* Your sidebar content goes here */}
          <h2 className="text-xl font-semibold mb-4">Chat History</h2>
          {/* Example sidebar items */}
          <ul className="space-y-2 text-sm">
            <li className="hover:underline cursor-pointer">Conversation 1</li>
            <li className="hover:underline cursor-pointer">Conversation 2</li>
          </ul>
        </aside>
      </div>

      <div className="mx-auto w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-4 ">
          {greeting || <BiLoaderCircle className="animate-spin-fast w-6 h-6" />}
        </h1>
        {quote && <p className="text-center text-sm italic mb-6">{quote}</p>}
        <div className="space-y-4 max-w-60% mb-6">
          {chat.map((msg, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-lg ${
                msg.role === "user"
                  ? "bg-[#2a2a2a] border border-[#3a3a3a]"
                  : "bg-[#212121] border border-[#333333]"
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`font-medium text-xs px-2 py-1 rounded ${
                    msg.role === "user"
                      ? "bg-[#3a3a3a] text-[#e8e8e8]"
                      : "bg-[#333333] text-[#e8e8e8]"
                  }`}
                >
                  {msg.role === "user" ? "You" : "Assistant"}
                </span>
                <div className="flex-1 min-w-0">
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown
                        components={{
                          // Custom styling for different elements
                          h1: ({ node, ...props }) => (
                            <h1
                              className="text-xl font-semibold mt-4 mb-2 text-[#f4f4f4]"
                              {...props}
                            />
                          ),
                          h2: ({ node, ...props }) => (
                            <h2
                              className="text-lg font-semibold mt-4 mb-2 text-[#f4f4f4]"
                              {...props}
                            />
                          ),
                          h3: ({ node, ...props }) => (
                            <h3
                              className="text-base font-semibold mt-4 mb-2 text-[#f4f4f4]"
                              {...props}
                            />
                          ),
                          p: ({ node, ...props }) => (
                            <p
                              className="mb-3 text-[#e8e8e8] leading-relaxed"
                              {...props}
                            />
                          ),
                          ul: ({ node, ...props }) => (
                            <ul
                              className="list-disc ml-6 mb-3 text-[#e8e8e8] space-y-1"
                              {...props}
                            />
                          ),
                          ol: ({ node, ...props }) => (
                            <ol
                              className="list-decimal ml-6 mb-3 text-[#e8e8e8] space-y-1"
                              {...props}
                            />
                          ),
                          li: ({ node, ...props }) => (
                            <li
                              className="text-[#e8e8e8] leading-relaxed"
                              {...props}
                            />
                          ),
                          strong: ({ node, ...props }) => (
                            <strong
                              className="font-semibold text-[#f4f4f4]"
                              {...props}
                            />
                          ),
                          code: ({ node, ...props }) => (
                            <code
                              className="bg-[#2a2a2a] text-[#ffa500] px-1.5 py-0.5 rounded text-sm font-mono"
                              {...props}
                            />
                          ),
                          pre: ({ node, ...props }) => (
                            <pre
                              className="bg-[#2a2a2a] text-[#e8e8e8] p-3 rounded-lg overflow-x-auto font-mono text-sm border border-[#3a3a3a]"
                              {...props}
                            />
                          ),
                          hr: ({ node, ...props }) => (
                            <hr className="my-6 border-[#3a3a3a]" {...props} />
                          ),
                          blockquote: ({ node, ...props }) => (
                            <blockquote
                              className="border-l-4 border-[#4a4a4a] pl-4 italic text-[#d0d0d0] my-4"
                              {...props}
                            />
                          ),
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-[#e8e8e8] leading-relaxed">
                      {msg.content}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 p-4 bg-[#212121] rounded-lg border border-[#333333]">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#ffa500]"></div>
              <p className="italic text-[#b8b8b8]">
                Please wait while processing for data...
              </p>
            </div>
          )}
        </div>
        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-grow max-w-60% p-3 border border-[#3a3a3a] bg-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffa500]"
            placeholder="Ask me anything..."
            name="messageInput"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-[#ffa500] hover:bg-[#ff9500] disabled:bg-[#cc8400] text-[#1a1a1a] px-6 py-3 rounded-lg font-medium transition-colors cursor-pointer"
          >
            Send
          </button>
        </form>
      </div>
    </main>
  );
}
