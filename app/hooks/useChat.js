import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";
import { chatService } from "@/app/lib/firestore";
import axios from "axios";

export const useChat = (chatId) => {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  // Subscribe to messages when chatId and user are available
  useEffect(() => {
    if (!chatId || !user) {
      setLoading(false);
      return;
    }

    const unsubscribe = chatService.subscribeToMessages(
      user.uid,
      chatId,
      (newMessages) => {
        console.log("chatId", chatId);
        const formattedMessages = newMessages.map((msg) => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp,
        }));
        setMessages(formattedMessages);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [chatId, user]);

  const sendMessage = async (messageContent, chatIdToUse) => {
    if (!user || !chatIdToUse || !messageContent.trim()) return;

    try {
      console.log("ChatId", chatIdToUse);

      // Add user message to Firestore
      await chatService.addMessage(user.uid, chatIdToUse, {
        role: "user",
        content: messageContent,
      });

      // Call Gemini API
      const res = await axios.post("/api/chat/gemini", {
        message: messageContent,
        chatId: chatIdToUse,
      });

      const aiResponse =
        res?.data?.reply?.candidates?.[0]?.content?.parts[0]?.text;
      console.log("Response in hooks", aiResponse);

      // Add AI response to Firestore
      await chatService.addMessage(user.uid, chatIdToUse, {
        role: "assistant",
        content: aiResponse,
      });
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  };

  return { messages, loading, sendMessage, user };
};
