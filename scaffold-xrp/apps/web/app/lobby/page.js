"use client";

import useSWR from "swr";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function Lobby() {
    const router = useRouter();
    const [myUsername, setMyUsername] = useState("");

    // Poll every 2 seconds
    const { data, error } = useSWR("/api/lobby/players", fetcher, {
        refreshInterval: 2000,
    });

    useEffect(() => {
        const storedUsername = localStorage.getItem("xrpl_username");
        if (!storedUsername) {
            router.push("/");
        } else {
            setMyUsername(storedUsername);
        }
    }, [router]);

    const players = data?.players || [];

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-6xl mx-auto">
                <header className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
                            Lobby
                        </h1>
                        <p className="text-gray-400 mt-2">En attente des autres joueurs...</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push('/game')}
                            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-full transition-transform hover:scale-105 shadow-lg animate-pulse"
                        >
                            Lancer la Partie ▶️
                        </button>
                        <div className="bg-gray-800 px-6 py-3 rounded-full border border-gray-700">
                            <span className="text-gray-400 mr-2">Joueurs connectés:</span>
                            <span className="text-2xl font-bold text-blue-400">{players.length}</span>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {players.map((player, index) => (
                        <div
                            key={`${player}-${index}`}
                            className={`transform transition-all duration-500 hover:scale-105 ${player === myUsername
                                ? "bg-gradient-to-br from-blue-600 to-blue-800 border-blue-400 shadow-blue-500/50"
                                : "bg-gray-800 border-gray-700 hover:border-gray-500"
                                } p-6 rounded-xl border shadow-lg flex flex-col items-center justify-center aspect-video relative overflow-hidden group animate-fade-in-up`}
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                            <div className="text-4xl mb-2">
                                {/* Random avatar or icon based on name length could go here */}
                                👾
                            </div>
                            <span className="text-xl font-bold truncate max-w-full px-2">
                                {player}
                            </span>
                            {player === myUsername && (
                                <span className="absolute top-2 right-2 text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
                                    Moi
                                </span>
                            )}
                        </div>
                    ))}
                </div>

                {players.length === 0 && !error && (
                    <div className="text-center text-gray-500 mt-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                        <p>Chargement du lobby...</p>
                    </div>
                )}

                {error && (
                    <div className="text-center text-red-400 mt-20">
                        <p>Erreur de connexion au serveur.</p>
                    </div>
                )}
            </div>

            {/* Simple animation styles */}
            <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.5s ease-out forwards;
        }
      `}</style>
        </div>
    );
}
