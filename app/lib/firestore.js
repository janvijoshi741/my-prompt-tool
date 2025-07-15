import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

// Save user data to Firestore

export const saveUserToFirestore = async (user, additionalData = {}) => {
  if (!user) return;

  const userRef = doc(db, "users", user.uid);

  // Check if user document already exists
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
    // Update last login time for existing user
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

/**
 * Get user data from Firestore
 *  userId - User ID
 *  User data or null if not found
 */
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
