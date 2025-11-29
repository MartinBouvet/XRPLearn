"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Lobby() {
    const router = useRouter();
    const [pseudo, setPseudo] = useState("");
    const [players, setPlayers] = useState([]);

    const [isMock, setIsMock] = useState(false);

    useEffect(() => {
        const storedPseudo = localStorage.getItem("xrpl_username");
        if (!storedPseudo) {
            router.push("/");
            return;
        }
        setPseudo(storedPseudo);

        // Fetch real players from API
        const fetchPlayers = async () => {
            try {
                const res = await fetch("/api/lobby/players");
                if (res.ok) {
                    const data = await res.json();
                    if (data.isMock) setIsMock(true);

                    const otherPlayers = data.players.filter(p => p !== storedPseudo);
                    setPlayers(otherPlayers);
                }
            } catch (error) {
                console.error("Failed to fetch players:", error);
            }
        };

        // Initial fetch
        fetchPlayers();

        // Poll every 3 seconds
        const interval = setInterval(fetchPlayers, 3000);

        return () => clearInterval(interval);
    }, [router]);

    return (
        <main className="min-h-screen flex flex-col items-center p-8 bg-gray-900 text-white relative">
            {isMock && (
                <div className="absolute top-0 left-0 w-full bg-yellow-600/90 text-white text-center p-2 font-bold z-50 animate-pulse">
                    ⚠️ DEMO MODE (NO DATABASE) - PLAYERS WILL NOT SYNC ⚠️
                </div>
            )}
            <h1 className="text-4xl font-bold mb-8 text-blue-400">Waiting Room</h1>

            <div className="text-2xl mb-12">
                Welcome, <span className="font-bold text-white">{pseudo}</span>!
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12 w-full max-w-4xl">
                {/* Current Player */}
                <div className="bg-blue-900/50 border-2 border-blue-500 rounded-full py-3 px-6 text-center animate-pulse">
                    {pseudo} (Me)
                </div>

                {/* Other Players */}
                {players.map((player, index) => (
                    <div
                        key={index}
                        className="bg-gray-800 border border-gray-700 rounded-full py-3 px-6 text-center animate-bounce"
                        style={{ animationDelay: `${index * 0.2}s` }}
                    >
                        {player}
                    </div>
                ))}
            </div>

            <div className="mt-auto">
                <button
                    onClick={() => router.push("/game/level1")}
                    className="btn-primary text-2xl px-12 py-4 animate-pulse"
                >
                    LAUNCH MISSION 🚀
                </button>
            </div>
        </main>
    );
}
