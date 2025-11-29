"use client";

import "./globals.css";
import { WalletProvider } from "../components/providers/WalletProvider";
import { ThemeToggle } from "../components/ThemeToggle";

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <ThemeToggle />
        <WalletProvider>{children}</WalletProvider>
      </body>
    </html>
  );
}
