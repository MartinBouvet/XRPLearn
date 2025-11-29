"use client";
import { useState } from "react";
import { useGame } from "../../context/GameContext";

export default function Level2_Transaction() {
    const { gameState, swapTokens, payDoor, awardBadge, nextLevel } = useGame();
    const [step, setStep] = useState("MARKET");

    return (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-8">
            <div className="flex gap-8 text-2xl font-mono bg-gray-800 p-4 rounded-lg">
                <span>🟡 {gameState.balance.yellow}</span>
                <span>🔴 {gameState.balance.red}</span>
            </div>

            {step === "MARKET" && (
                <button
                    onClick={() => { if (swapTokens()) setTimeout(() => setStep("DOOR"), 1000); }}
                    disabled={gameState.balance.yellow < 100}
                    className="px-8 py-4 bg-gradient-to-r from-yellow-600 to-red-600 rounded-lg font-bold text-xl disabled:opacity-50"
                >
                    Echanger 100 Jaunes contre 100 Rouges
                </button>
            )}

            {step === "DOOR" && (
                <button
                    onClick={() => { if (payDoor()) { awardBadge("Trader"); setStep("SUCCESS"); } }}
                    className="px-8 py-4 bg-red-600 rounded-lg font-bold text-xl"
                >
                    Payer la Porte (100 Rouges) 🚀
                </button>
            )}

            {step === "SUCCESS" && (
                <button onClick={nextLevel} className="px-8 py-4 bg-purple-600 rounded-lg font-bold text-xl">
                    Niveau Suivant ➡️
                </button>
            )}
        </div>
    );
}
