import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  onSnapshot,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

// Save user data to Firestore
export const saveUserToFirestore = async (user, additionalData = {}) => {
  if (!user) return;

  const userRef = doc(db, "users", user.uid);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    const userData = {
      uid: user.uid,
      email: additionalData.email || user.email || "",
      name: additionalData.name || user.displayName || "",
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    };

    try {
      await setDoc(userRef, userData);
      console.log("User saved to Firestore successfully");
    } catch (error) {
      console.error("Error saving user to Firestore:", error);
      throw error;
    }
  } else {
    try {
      await setDoc(
        userRef,
        {
          lastLoginAt: serverTimestamp(),
          ...additionalData,
        },
        { merge: true }
      );
    } catch (error) {
      console.error("Error updating user login time:", error);
      throw error;
    }
  }
};

// Get user by userId
export const getUserFromFirestore = async (userId) => {
  if (!userId) return null;

  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      return userDoc.data();
    } else {
      console.log("No user document found");
      return null;
    }
  } catch (error) {
    console.error("Error getting user from Firestore:", error);
    throw error;
  }
};

// Chat service using subcollections under users
export const chatService = {
  // Create new chat under user
  async createChat(userId, title) {
    const chatData = {
      title,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: true,
    };

    const chatsRef = collection(db, "users", userId, "chats");
    const docRef = await addDoc(chatsRef, chatData);
    return docRef.id;
  },

  // Get user's chats (only active)
  async getUserChats(userId) {
    const q = query(
      collection(db, "users", userId, "chats"),
      where("isActive", "==", true)
      // orderBy("updatedAt", "desc")
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  },

  // Add message to chat (nested under user's chat)
  async addMessage(userId, chatId, message) {
    const messageData = {
      ...message,
      timestamp: serverTimestamp(),
    };

    const messagesRef = collection(
      db,
      "users",
      userId,
      "chats",
      chatId,
      "messages"
    );
    await addDoc(messagesRef, messageData);

    // Update chat's updatedAt
    await updateDoc(doc(db, "users", userId, "chats", chatId), {
      updatedAt: serverTimestamp(),
    });
  },

  // Get chat messages
  async getChatMessages(userId, chatId) {
    const q = query(
      collection(db, "users", userId, "chats", chatId, "messages"),
      orderBy("timestamp", "asc")
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  },

  // Subscribe to chat messages
  subscribeToMessages(userId, chatId, callback) {
    if (!userId || !chatId) {
      console.error("subscribeToMessages called with missing userId or chatId");
      return () => {};
    }
    // console.log("subscribeToMessages userId:", userId, typeof userId);
    // console.log("subscribeToMessages chatId:", chatId, typeof chatId);
    const q = query(
      collection(db, "users", userId, "chats", chatId, "messages")
      // orderBy("timestamp", "asc")
    );

    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(messages);
    });
  },

  // Soft delete chat (mark inactive)
  async deleteChat(userId, chatId) {
    await updateDoc(doc(db, "users", userId, "chats", chatId), {
      isActive: false,
    });
  },
};
