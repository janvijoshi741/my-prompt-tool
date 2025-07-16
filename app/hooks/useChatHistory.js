import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";
import { chatService } from "@/app/lib/firestore";

export const useChatHistory = () => {
  const [user, setUser] = useState(null);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  //  auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setChats([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const loadChats = async () => {
      try {
        const userChats = await chatService.getUserChats(user.uid);
        setChats(userChats);
      } catch (error) {
        console.error("Error loading chats:", error);
      } finally {
        setLoading(false);
      }
    };

    loadChats();
  }, [user]);

  const createNewChat = async (title = "New Chat") => {
    if (!user) return null;

    try {
      const chatId = await chatService.createChat(user.uid, title);
      const updatedChats = await chatService.getUserChats(user.uid);
      setChats(updatedChats);
      return chatId;
    } catch (error) {
      console.error("Error creating chat:", error);
      return null;
    }
  };

  const deleteChat = async (chatId) => {
    try {
      await chatService.deleteChat(chatId);
      setChats(chats.filter((chat) => chat.id !== chatId));
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  };

  return { chats, loading, createNewChat, deleteChat, user };
};
