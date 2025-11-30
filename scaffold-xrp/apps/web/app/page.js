"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { BlockchainBackground } from "../components/BlockchainBackground";
import Image from "next/image";

export default function Home() {
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;

    setIsLoading(true);

    // Simulation pour localhost (dev)
    if (process.env.NODE_ENV === "development") {
      localStorage.setItem("xrpl_username", username);

      if (username.toLowerCase() === "admin") {
        setTimeout(() => {
          router.push("/admin");
        }, 500);
      } else {
        setTimeout(() => {
          router.push("/lobby");
        }, 500);
      }
      return;
    }

    try {
      // 1. Register user immediately so they appear in Admin Dashboard
      await fetch("/api/community/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: username,
          address: "Pending...", // Placeholder until wallet is created in Level 1
          avatar: "👤",
          level: "0",
          status: "joining"
        })
      });

      // Secure the username immediately
      localStorage.setItem("xrpl_username", username);

      // 2. Join Lobby (Legacy/Redis Set)
      const res = await fetch("/api/lobby/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      if (res.ok) {
        router.push("/lobby");
      } else {
        alert("Erreur lors de la connexion. Réessaie !");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error joining:", error);
      alert("Erreur de connexion.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-content-primary dark:text-content-light relative overflow-hidden bg-surface-light dark:bg-surface-dark transition-colors duration-500 selection:bg-primary/20">
      {/* Admin Access Button */}
      <div className="absolute top-6 right-6 z-50">
        <button
          onClick={() => {
            localStorage.setItem("xrpl_username", "admin");
            router.push("/admin");
          }}
          className="text-[10px] font-bold tracking-[0.2em] text-content-secondary/50 hover:text-primary dark:text-content-muted/50 dark:hover:text-content-light transition-all duration-300 uppercase hover:tracking-[0.25em]"
        >
          Admin Access
        </button>
      </div>

      <BlockchainBackground />

      <div className="max-w-md w-full relative z-20 flex flex-col items-center">
        <div className="text-center mb-8 w-full">
          <div className="flex justify-center mb-4 relative h-48 w-full">
            <Image
              src="/logo.png"
              alt="UnBlock Logo"
              width={1120}
              height={268}
              className="h-48 w-auto object-contain dark:hidden"
              priority
            />
            <Image
              src="/logo-dark.png"
              alt="UnBlock Logo"
              width={1120}
              height={268}
              className="h-48 w-auto object-contain hidden dark:block"
              priority
            />
          </div>
          <p className="text-lg md:text-xl text-content-secondary dark:text-content-muted font-display tracking-tight font-medium leading-relaxed">
            Initialize Sequence
          </p>
        </div>

        <div className="bg-surface-glass dark:bg-surface-glassDark backdrop-blur-2xl border border-white/40 dark:border-white/5 p-8 md:p-10 rounded-[2rem] shadow-2xl shadow-primary/5 dark:shadow-none relative group transition-all duration-500 hover:shadow-3xl hover:scale-[1.005] w-full">
          {/* Corner Accents - Subtle */}
          <div className="absolute -top-1 -left-1 w-6 h-6 border-t-2 border-l-2 border-primary/50 rounded-tl-xl"></div>
          <div className="absolute -top-1 -right-1 w-6 h-6 border-t-2 border-r-2 border-primary/50 rounded-tr-xl"></div>
          <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-2 border-l-2 border-primary/50 rounded-bl-xl"></div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-2 border-r-2 border-primary/50 rounded-br-xl"></div>

          <form onSubmit={handleJoin} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="username" className="block text-xs font-bold text-content-secondary dark:text-content-muted mb-3 uppercase tracking-[0.15em] text-center font-display">
                Identity Protocol
              </label>
              <div className="relative">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="w-full bg-white/40 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl px-6 py-5 text-content-primary dark:text-content-light placeholder-content-secondary/30 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all duration-300 font-display text-xl text-center tracking-tight backdrop-blur-md shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
                  placeholder="Enter Codename"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="off"
                />
                <div className="absolute inset-0 rounded-xl bg-purple-500/5 pointer-events-none"></div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full relative overflow-hidden group py-4 px-6 rounded-xl font-bold text-lg tracking-wider uppercase transition-all duration-300 ${isLoading
                ? "bg-gray-300 dark:bg-gray-700 cursor-not-allowed text-gray-500 dark:text-gray-400"
                : "bg-primary hover:bg-purple-600 text-white shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-0.5 active:scale-[0.98]"
                }`}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isLoading ? (
                  <>Processing...</>
                ) : (
                  <>
                    Connect to Ledger <span className="text-xl">→</span>
                  </>
                )}
              </span>
              {/* Button Glare Effect */}
              {!isLoading && (
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"></div>
              )}
            </button>
          </form>
        </div>

        <div className="mt-8 text-center w-full">
          <p className="text-xs text-gray-500 font-mono">
            <span className="opacity-50">SYSTEM STATUS:</span> <span className="text-secondary font-bold">ONLINE</span> <span className="mx-2 opacity-30">|</span> <span className="opacity-50">NODES:</span> <span className="text-accent font-bold">ACTIVE</span>
          </p>
        </div>
      </div>
    </div>
  );
}