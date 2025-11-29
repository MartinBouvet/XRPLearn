"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;

    setIsLoading(true);

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
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4 text-white">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-2">
            XRPL Operator
          </h1>
          <p className="text-xl text-gray-400">Prêt à devenir un expert de la blockchain ?</p>
        </div>

        <form onSubmit={handleJoin} className="mt-8 space-y-6 bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-700">
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">
                Ton Pseudo
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-4 border border-gray-600 placeholder-gray-500 text-white bg-gray-700 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-lg text-center"
                placeholder="Choisis ton Pseudo"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-4 px-4 border border-transparent text-lg font-medium rounded-md text-white ${isLoading
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                } transition-all duration-200 transform hover:scale-105`}
            >
              {isLoading ? "Connexion..." : "Rejoindre l'aventure 🚀"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
