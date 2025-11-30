"use client";

import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "../components/providers/WalletProvider";
import { ThemeToggle } from "../components/ThemeToggle";

const inter = Inter({
  subsets: ["latin"],
  variable: '--font-inter',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: '--font-space',
  display: 'swap',
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="bg-[#FDFBF7] dark:bg-[#0A0A0B] text-[#1A1A1C] dark:text-[#E1E1E3] transition-colors duration-500 antialiased selection:bg-primary/20 selection:text-primary">
        <ThemeToggle />
        <WalletProvider>{children}</WalletProvider>
      </body>
    </html>
  );
}
