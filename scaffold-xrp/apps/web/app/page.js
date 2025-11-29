"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { BlockchainBackground } from "../components/BlockchainBackground";

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
      const res = await fetch("/api/lobby/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      if (res.ok) {
        // Store username in localStorage for persistence across pages if needed
        localStorage.setItem("xrpl_username", username);
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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-gray-900 dark:text-white relative overflow-hidden bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Admin Access Button */}
      <div className="absolute top-6 right-6 z-50">
        <button
          onClick={() => {
            localStorage.setItem("xrpl_username", "admin");
            router.push("/admin");
          }}
          className="bg-white/50 dark:bg-gray-900/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-white px-4 py-2 rounded-lg font-mono text-xs border border-blue-200 dark:border-blue-500/30 hover:border-blue-400 backdrop-blur-md transition-all tracking-widest uppercase shadow-sm"
        >
          Admin_Mode
        </button>
      </div>

      <BlockchainBackground />

      <div className="max-w-md w-full relative z-20">
        <div className="text-center mb-12">
          <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-blue-600 mb-4 glitch" data-text="XRPL OPERATOR">
            XRPL OPERATOR
          </h1>
          <p className="text-xl text-blue-600 dark:text-blue-200 font-mono tracking-widest uppercase opacity-80">
            &lt; Initialize Sequence /&gt;
          </p>
        </div>

        <div className="bg-white/80 dark:bg-gray-900/40 backdrop-blur-xl border border-blue-200 dark:border-blue-500/30 p-8 rounded-3xl shadow-2xl dark:shadow-[0_0_50px_rgba(0,170,228,0.2)] relative group transition-colors duration-300">
          {/* Corner Accents */}
          <div className="absolute -top-1 -left-1 w-8 h-8 border-t-2 border-l-2 border-blue-500 rounded-tl-xl"></div>
          <div className="absolute -top-1 -right-1 w-8 h-8 border-t-2 border-r-2 border-blue-500 rounded-tr-xl"></div>
          <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-2 border-l-2 border-blue-500 rounded-bl-xl"></div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-2 border-r-2 border-blue-500 rounded-br-xl"></div>

          <form onSubmit={handleJoin} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm font-mono text-blue-600 dark:text-blue-300 uppercase tracking-wider">
                Identity Protocol
              </label>
              <div className="relative">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="w-full bg-gray-100 dark:bg-gray-800/50 border border-blue-200 dark:border-blue-500/30 rounded-xl px-4 py-4 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all font-mono text-lg text-center tracking-widest"
                  placeholder="ENTER_CODENAME"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="off"
                />
                <div className="absolute inset-0 rounded-xl bg-blue-500/5 pointer-events-none"></div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full relative overflow-hidden group py-4 px-6 rounded-xl font-bold text-lg tracking-wider uppercase transition-all duration-300 ${isLoading
                ? "bg-gray-300 dark:bg-gray-700 cursor-not-allowed text-gray-500 dark:text-gray-400"
                : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg dark:shadow-[0_0_20px_rgba(37,99,235,0.5)] hover:shadow-xl dark:hover:shadow-[0_0_30px_rgba(37,99,235,0.7)]"
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

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500 font-mono">
            SYSTEM STATUS: <span className="text-green-400">ONLINE</span> | NODES: <span className="text-blue-400">ACTIVE</span>
          </p>
        </div>
      </div>
    </div>
  );
}
