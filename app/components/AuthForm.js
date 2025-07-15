"use client";
import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { auth } from "../lib/firebase";
import { saveUserToFirestore } from "../lib/firestore";

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Basic validation
    if (!email || !password || (!isLogin && !name)) {
      setError("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        // Assuming saveUserToFirestore can handle login without extra data
        await saveUserToFirestore(userCredential.user);
      } else {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        if (name.trim()) {
          await updateProfile(userCredential.user, {
            displayName: name.trim(),
          });
        }
        await saveUserToFirestore(userCredential.user, {
          name: name.trim(),
          email: email.trim(),
        });
      }
      // On success, you'd typically redirect the user
      // router.push('/dashboard');
    } catch (error) {
      // Provide more user-friendly error messages
      if (error.code === "auth/user-not-found") {
        setError("No account found with this email.");
      } else if (error.code === "auth/wrong-password") {
        setError("Incorrect password. Please try again.");
      } else if (error.code === "auth/email-already-in-use") {
        setError("This email is already registered. Please sign in.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 transition-colors">
      <div className=" max-w-md p-6 space-y-6 bg-white rounded-2xl shadow-2xl">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            {isLogin ? "Welcome Back!" : "Create an Account"}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {isLogin
              ? "Sign in to continue to your dashboard."
              : "Let's get you started."}
          </p>
        </div>

        {/* --- MODIFIED FORM LAYOUT --- */}
        <form
          className="mt-8 flex flex-col items-center gap-y-4 border border-gray-800"
          onSubmit={handleSubmit}
        >
          {/* Name Input */}
          {!isLogin && (
            <div className="relative  max-w-sm">
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="appearance-none block w-40 pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
                placeholder="Your Name"
              />
            </div>
          )}

          {/* Email Input */}
          <div className="relative max-w-sm">
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="appearance-none block w-20 pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
              placeholder="Email address"
            />
          </div>

          {/* Password Input */}
          <div className="relative  max-w-sm">
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="appearance-none block w-20 pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
              placeholder="Password"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="w-full max-w-sm flex items-center p-3 mt-2 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 dark:border-red-600 rounded-md text-sm text-red-700 dark:text-red-300">
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <div className=" max-w-sm pt-4">
            <button
              type="submit"
              disabled={loading}
              className="group relative w-20 flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 dark:disabled:bg-indigo-800 disabled:cursor-not-allowed transition-all"
            >
              {loading && <FiLoader className="animate-spin h-5 w-5 mr-3" />}
              {loading ? (
                <BiLoaderCircle className="animate-spin" />
              ) : isLogin ? (
                "Sign In"
              ) : (
                "Sign Up"
              )}
            </button>
          </div>

          {/* Auth Switch */}
          <div className="text-center pt-4">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
                setEmail("");
                setPassword("");
                setName("");
              }}
              className="font-medium text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 focus:outline-none focus:underline transition-colors"
            >
              {isLogin
                ? "Don't have an account? Sign Up"
                : "Already have an account? Sign In"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
