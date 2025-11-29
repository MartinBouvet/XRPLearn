"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Lobby() {
    const router = useRouter();
    const [pseudo, setPseudo] = useState("");
    const [players, setPlayers] = useState([]);

    useEffect(() => {
        const storedPseudo = localStorage.getItem("playerPseudo");
        if (!storedPseudo) {
            router.push("/");
            return;
        }
        setPseudo(storedPseudo);

        // Simulate other players joining
        const fakePlayers = ["CryptoKing", "XRP_Fan", "LedgerMaster", "ToTheMoon"];
        let delay = 0;
        fakePlayers.forEach((player) => {
            delay += Math.random() * 1000 + 500;
            setTimeout(() => {
                setPlayers((prev) => [...prev, player]);
            }, delay);
        });
    }, [router]);

    return (
        <main className="min-h-screen flex flex-col items-center p-8">
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
