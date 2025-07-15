/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#212121",
        secondary: "#FF6F61",
      },
      animation: {
        "spin-slow": "spin 2s linear infinite",
        "spin-fast": "spin 0.5s linear infinite",
      },
    },
  },
  plugins: [],
};
