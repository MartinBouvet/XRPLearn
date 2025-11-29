"use client";
import { useState, useEffect } from "react";
import { useGame } from "../../context/GameContext";
import { useRouter } from "next/navigation";

export default function Level3_Blockchain() {
    const { gameState, awardBadge } = useGame();
    const [step, setStep] = useState("VISUALIZER");
    const router = useRouter();

    useEffect(() => {
        if (step === "VISUALIZER") setTimeout(() => setStep("QUIZ"), 5000);
    }, [step]);

    return (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-8">
            {step === "VISUALIZER" && (
                <div className="p-8 bg-gray-800 rounded-xl border border-green-500 animate-pulse">
                    <h2 className="text-2xl mb-4">Création du Bloc...</h2>
                    {gameState.history.map((tx, i) => <div key={i} className="font-mono text-green-400">{tx.hash}</div>)}
                </div>
            )}

            {step === "QUIZ" && (
                <div className="space-y-4">
                    <h3 className="text-2xl">Pourquoi le Hash ?</h3>
                    <button onClick={() => { awardBadge("Architect"); setStep("SUCCESS"); }} className="block w-full p-4 bg-gray-700 hover:bg-green-600 rounded">
                        Pour rendre l'historique immuable
                    </button>
                    <button onClick={() => alert("Faux")} className="block w-full p-4 bg-gray-700 hover:bg-red-600 rounded">
                        Pour faire joli
                    </button>
                </div>
            )}

            {step === "SUCCESS" && (
                <div className="text-center">
                    <h1 className="text-4xl font-bold mb-8">Bravo {gameState.username} !</h1>
                    <div className="flex justify-center gap-4 text-4xl mb-8">
                        {gameState.badges.map(b => <span key={b}>🏅</span>)}
                    </div>
                    <button onClick={() => router.push('/')} className="text-blue-400 underline">Retour Accueil</button>
                </div>
            )}
        </div>
    );
}
