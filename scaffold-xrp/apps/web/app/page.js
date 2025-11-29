"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [pseudo, setPseudo] = useState("");
  const router = useRouter();

  const handleJoin = (e) => {
    e.preventDefault();
    if (pseudo.trim()) {
      localStorage.setItem("playerPseudo", pseudo);
      router.push("/lobby");
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        <h1 className="text-6xl font-bold text-blue-500 mb-2">XRPLearn</h1>
        <p className="text-xl text-gray-300 mb-8">
          The adventure starts here.
        </p>

        <form onSubmit={handleJoin} className="space-y-6">
          <div>
            <input
              type="text"
              value={pseudo}
              onChange={(e) => setPseudo(e.target.value)}
              placeholder="Choose your nickname..."
              className="w-full px-6 py-4 bg-gray-800 border-2 border-gray-700 rounded-xl text-white text-lg focus:border-blue-500 focus:outline-none transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full btn-primary text-xl transform hover:scale-105 transition-all"
          >
            Join the Adventure
          </button>
        </form>
      </div>
    </main>
  );
}
