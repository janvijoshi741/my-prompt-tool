import "../styles/globals.css";
import { ThemeProvider } from "./components/ThemeProvider";

export const metadata = {
  title: "Theme Toggle Example",
  description: "Next.js with custom theme toggler",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
