"use client";
import { useState } from "react";
import { useGame } from "../../context/GameContext";

export default function Level1_Identity() {
    const { generateWallet, claimFaucet, awardBadge, nextLevel } = useGame();
    const [step, setStep] = useState("INTRO");
    const [generatedWallet, setGeneratedWallet] = useState(null);

    const handleCardSelect = (type) => {
        if (type === "PRIVATE") {
            setTimeout(() => {
                setGeneratedWallet(generateWallet());
                setStep("REVEAL");
            }, 500);
        } else {
            alert("Mauvaise carte ! Cherche la clé secrète.");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-8 animate-fade-in">
            {step === "INTRO" && (
                <button onClick={() => setStep("GAME")} className="px-8 py-4 bg-primary rounded-lg font-bold text-xl text-white hover:bg-purple-700 transition-colors">
                    Générer mon Identité
                </button>
            )}
            {step === "GAME" && (
                <div className="flex gap-8">
                    <div onClick={() => handleCardSelect("PUBLIC")} className="cursor-pointer w-64 h-96 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 p-6 rounded-xl hover:border-accent transition-colors shadow-lg dark:shadow-none">
                        <div className="text-6xl mb-4">📬</div>
                        <h4 className="text-xl font-bold text-gray-900 dark:text-white">Publique</h4>
                    </div>
                    <div onClick={() => handleCardSelect("PRIVATE")} className="cursor-pointer w-64 h-96 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 p-6 rounded-xl hover:border-primary transition-colors shadow-lg dark:shadow-none">
                        <div className="text-6xl mb-4">🔑</div>
                        <h4 className="text-xl font-bold text-gray-900 dark:text-white">Privée</h4>
                    </div>
                </div>
            )}
            {step === "REVEAL" && generatedWallet && (
                <div className="bg-white dark:bg-gray-800 p-8 rounded-xl border border-primary shadow-xl dark:shadow-none">
                    <h3 className="text-2xl font-bold text-secondary mb-4">Wallet Généré !</h3>
                    <p className="font-mono text-primary dark:text-purple-300 mb-2">{generatedWallet.address}</p>
                    <button onClick={() => setStep("FAUCET")} className="mt-4 px-6 py-2 bg-secondary text-white rounded hover:bg-green-700 transition-colors">Suivant</button>
                </div>
            )}
            {step === "FAUCET" && (
                <button onClick={() => { claimFaucet(); awardBadge("Key Keeper"); setStep("SUCCESS"); }} className="px-8 py-4 bg-yellow-600 rounded-lg font-bold text-xl">
                    Réclamer 100 Tokens
                </button>
            )}
            {step === "SUCCESS" && (
                <button onClick={nextLevel} className="px-8 py-4 bg-primary text-white rounded-lg font-bold text-xl hover:bg-purple-700 transition-colors">
                    Niveau Suivant ➡️
                </button>
            )}
        </div>
    );
}
