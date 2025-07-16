"use client";
import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./lib/firebase";
import AuthForm from "./components/AuthForm";
import ChatUI from "./components/chat/ChatUI";
import { useTheme } from "./components/ThemeProvider";
import { HiLightBulb } from "react-icons/hi";
import { HiOutlineLightBulb } from "react-icons/hi";
import { BiLoaderCircle } from "react-icons/bi";

export default function Page() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);

      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      } else {
        localStorage.removeItem("user");
      }
    });
    return () => unsub();
  }, []);

  if (loading)
    return (
      <p className="text-center text-white p-6">
        <BiLoaderCircle className="animate-spin w-10 h-10" />
      </p>
    );

  if (!user) return <AuthForm onAuth={setUser} />;

  return (
    <main className="min-h-screen bg-primary p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Ask Your Queries</h1>

        <div className="flex items-center gap-4">
          <button onClick={toggleTheme} className="px-3 py-1 rounded">
            {theme === "dark" ? (
              <HiLightBulb className="text-primary w-6 h-6" />
            ) : (
              <HiOutlineLightBulb className="text-gray-800 dark:text-white w-6 h-6" />
            )}
          </button>

          <button
            onClick={() => signOut(auth)}
            className="shrink-0 bg-[#ffa500] px-4 py-2 rounded hover:bg-[#ff9500] text-black cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>

      <ChatUI />
    </main>
  );
}
