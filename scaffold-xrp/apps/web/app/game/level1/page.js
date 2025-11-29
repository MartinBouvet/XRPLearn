"use client";

import { useState, useEffect } from "react";
import { Wallet, Client } from "xrpl";
import { Card } from "../../../components/Card";
import { WalletIcon } from "../../../components/WalletIcon";
import { ExplorerSidebar } from "../../../components/ExplorerSidebar";
import { useRouter } from "next/navigation";

const QUESTIONS = [
    {
        text: "I want to receive funds from a friend. What do I give them?",
        answer: "public",
        explanation: "Correct! Your Public Address is used to receive funds.",
    },
    {
        text: "It's like the PIN code of my bank card.",
        answer: "private",
        explanation: "Yes! Your Private Address (Secret) is strictly confidential.",
    },
    {
        text: "I need to sign a transaction to prove it's me.",
        answer: "private",
        explanation: "Well done. Only your Private Address can sign transactions.",
    },
    {
        text: "It's like my IBAN or bank account number.",
        answer: "public",
        explanation: "That's it. You can share it without risk.",
    },
];

export default function Level1() {
    const router = useRouter();
    const [step, setStep] = useState("intro"); // intro, game, customization, generating, success, faucet
    const [wallet, setWallet] = useState(null);
    const [feedback, setFeedback] = useState("");
    const [balance, setBalance] = useState(0);
    const [walletColor, setWalletColor] = useState("slate");
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [logs, setLogs] = useState([]);

    const addLog = (message, type = "info", hash = null) => {
        const time = new Date().toLocaleTimeString();
        setLogs((prev) => [{ time, message, type, hash }, ...prev]);
    };

    const generateWallet = async () => {
        setStep("generating");
        addLog("Initiating Wallet Generation...", "system");

        // Simulate delay for effect
        await new Promise((resolve) => setTimeout(resolve, 1000));
        addLog("Generating Keypair (ed25519)...", "system");

        await new Promise((resolve) => setTimeout(resolve, 1000));
        const newWallet = Wallet.generate();
        setWallet(newWallet);

        addLog(`Wallet Created: ${newWallet.address}`, "success");
        addLog(`Secret Derived: ************`, "private");

        setStep("success");
    };

    const handleCardClick = (type) => {
        const currentQuestion = QUESTIONS[currentQuestionIndex];

        if (type === currentQuestion.answer) {
            setFeedback(currentQuestion.explanation);

            setTimeout(() => {
                setFeedback("");
                if (currentQuestionIndex < QUESTIONS.length - 1) {
                    setCurrentQuestionIndex(prev => prev + 1);
                } else {
                    setStep("customization");
                }
            }, 2000);
        } else {
            setFeedback("Oops, wrong card! Try the other one.");
        }
    };

    const handleFaucet = async () => {
        setStep("faucet_loading");
        addLog("Connecting to XRPL Testnet...", "net");

        const client = new Client("wss://s.altnet.rippletest.net:51233");

        try {
            await client.connect();
            addLog("Connected to Testnet Node", "success");

            addLog("Requesting funds from Faucet...", "net");

            // Use the wallet we generated
            const { balance: newBalance } = await client.fundWallet(wallet);

            addLog("Faucet Funding Successful!", "success");
            addLog(`Received ${newBalance} Yellow Coins`, "tx");

            setBalance(newBalance);

            // Simulate NFT Badge Minting (Now that wallet is funded)
            addLog("Minting 'Key Keeper' Badge...", "tx");
            await new Promise((resolve) => setTimeout(resolve, 1500));
            // In a real app, we would use client.submitAndWait(NFTokenMint...)
            addLog("Badge Minted Successfully!", "success", "NFT-TOKEN-ID-001");

            setStep("faucet_done");
        } catch (error) {
            console.error(error);
            addLog(`Error: ${error.message}`, "error");
            // Fallback for demo if network fails
            setBalance(1000);
            setStep("faucet_done");
        } finally {
            if (client.isConnected()) {
                await client.disconnect();
                addLog("Disconnected from Testnet", "net");
            }
        }
    };

    // Sober colors
    const colors = [
        { id: "slate", name: "Titanium", bg: "bg-slate-600" },
        { id: "stone", name: "Obsidian", bg: "bg-stone-800" },
        { id: "indigo", name: "Midnight", bg: "bg-indigo-900" },
        { id: "emerald", name: "Forest", bg: "bg-emerald-900" },
        { id: "amber", name: "Bronze", bg: "bg-amber-700" },
    ];

    return (
        <main className="min-h-screen flex">
            <div className="flex-1 p-8 flex flex-col items-center justify-center overflow-hidden mr-80">
                {/* Progress Bar */}
                <div className="w-full max-w-4xl mb-8 bg-gray-700 rounded-full h-4 z-10">
                    <div
                        className="bg-blue-500 h-4 rounded-full transition-all duration-500"
                        style={{
                            width:
                                step === "intro"
                                    ? "10%"
                                    : step === "game"
                                        ? `${30 + (currentQuestionIndex / QUESTIONS.length) * 15}%`
                                        : step === "customization"
                                            ? "45%"
                                            : step === "generating"
                                                ? "60%"
                                                : step === "success"
                                                    ? "80%"
                                                    : "100%",
                        }}
                    ></div>
                </div>

                {step === "intro" && (
                    <div className="text-center max-w-2xl animate-fade-in z-10">
                        <h1 className="text-4xl font-bold mb-6">Level 1: Identity</h1>
                        <p className="text-xl mb-8">
                            To interact with the blockchain, you need a digital identity.
                            This is called a <strong>Wallet</strong>.
                        </p>
                        <button
                            onClick={() => {
                                setCurrentQuestionIndex(0);
                                setStep("game");
                            }}
                            className="btn-primary text-xl"
                        >
                            Got it, let's go!
                        </button>
                    </div>
                )}

                {step === "game" && QUESTIONS[currentQuestionIndex] && (
                    <div className="text-center w-full max-w-4xl z-10 flex flex-col items-center">
                        <h2 className="text-3xl font-bold mb-4">
                            Question {currentQuestionIndex + 1}/{QUESTIONS.length}
                        </h2>
                        <p className="text-2xl mb-12 text-yellow-400 font-bold min-h-[4rem]">
                            "{QUESTIONS[currentQuestionIndex].text}"
                        </p>

                        {/* Visual Wallet Container */}
                        <div className="relative w-[600px] h-[300px] mt-10">
                            {/* Back of Wallet */}
                            <div className="absolute bottom-0 left-0 w-full h-48 bg-gray-800 rounded-b-3xl border-b-4 border-x-4 border-gray-600 shadow-2xl"></div>

                            {/* Cards Container - Positioned to look like they are inside */}
                            <div className="absolute bottom-10 left-0 w-full flex justify-center gap-16 px-10">
                                {/* Public Key Card */}
                                <div
                                    onClick={() => handleCardClick("public")}
                                    className="w-48 h-64 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl border-2 border-blue-400 shadow-xl cursor-pointer transform transition-all duration-300 hover:-translate-y-16 hover:rotate-[-5deg] hover:z-20 z-10 flex flex-col items-center justify-center p-4 group"
                                >
                                    <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">📢</div>
                                    <h3 className="text-xl font-bold text-white mb-2">Public Address</h3>
                                    <div className="w-full h-2 bg-blue-900/50 rounded mb-2"></div>
                                    <div className="w-2/3 h-2 bg-blue-900/50 rounded"></div>
                                    <p className="text-xs text-blue-200 mt-4">rAddress...</p>
                                </div>

                                {/* Private Key Card */}
                                <div
                                    onClick={() => handleCardClick("private")}
                                    className="w-48 h-64 bg-gradient-to-br from-red-600 to-red-800 rounded-xl border-2 border-red-400 shadow-xl cursor-pointer transform transition-all duration-300 hover:-translate-y-16 hover:rotate-[5deg] hover:z-20 z-10 flex flex-col items-center justify-center p-4 group"
                                >
                                    <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">🔑</div>
                                    <h3 className="text-xl font-bold text-white mb-2">Private Address</h3>
                                    <div className="w-full h-2 bg-red-900/50 rounded mb-2"></div>
                                    <div className="w-2/3 h-2 bg-red-900/50 rounded"></div>
                                    <p className="text-xs text-red-200 mt-4">sSecret...</p>
                                </div>
                            </div>

                            {/* Front of Wallet (Overlay to create depth) */}
                            <div className="absolute bottom-0 left-0 w-full h-24 bg-gray-700/90 backdrop-blur-sm rounded-b-3xl border-b-4 border-x-4 border-gray-500 pointer-events-none z-30">
                                <div className="w-full h-full flex items-center justify-center opacity-20">
                                    <span className="text-4xl font-bold tracking-widest">WALLET</span>
                                </div>
                            </div>
                        </div>

                        {feedback && (
                            <div className="mt-12 text-xl font-bold animate-bounce bg-gray-800/80 px-6 py-3 rounded-full border border-white/20 backdrop-blur-md z-40">
                                {feedback}
                            </div>
                        )}
                    </div>
                )}

                {step === "customization" && (
                    <div className="text-center w-full max-w-2xl animate-fade-in z-10">
                        <h2 className="text-3xl font-bold mb-8">Customize your Safe</h2>
                        <p className="text-gray-300 mb-8">
                            Choose the color of your future wallet. This is where your funds will be secured.
                        </p>

                        <div className="flex justify-center mb-12">
                            <WalletIcon color={walletColor} size="lg" className="drop-shadow-2xl" />
                        </div>

                        <div className="flex justify-center gap-4 mb-12">
                            {colors.map((c) => (
                                <button
                                    key={c.id}
                                    onClick={() => setWalletColor(c.id)}
                                    className={`w-12 h-12 rounded-full ${c.bg} transform hover:scale-110 transition-all ${walletColor === c.id ? "ring-4 ring-white scale-110" : ""
                                        }`}
                                    title={c.name}
                                />
                            ))}
                        </div>

                        <button
                            onClick={generateWallet}
                            className="btn-primary w-full text-xl"
                        >
                            Craft my Wallet
                        </button>
                    </div>
                )}

                {step === "generating" && (
                    <div className="text-center z-10">
                        <h2 className="text-3xl font-bold mb-8">Crafting in progress...</h2>
                        <div className="relative inline-block">
                            <WalletIcon color={walletColor} size="lg" className="animate-pulse" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="animate-spin text-4xl">⚙️</div>
                            </div>
                        </div>
                        <p className="text-gray-400 mt-8">Cryptographic key generation...</p>
                    </div>
                )}

                {step === "success" && wallet && (
                    <div className="text-center w-full max-w-2xl z-10">
                        <div className="flex justify-center mb-6">
                            <WalletIcon color={walletColor} size="md" />
                        </div>
                        <h2 className="text-4xl font-bold mb-6 text-green-400">
                            Wallet Generated! 🎉
                        </h2>

                        <div className="bg-gray-800 p-6 rounded-xl mb-8 text-left border border-green-500 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-2 opacity-10">
                                <WalletIcon color={walletColor} size="lg" />
                            </div>
                            <div className="mb-4 relative z-10">
                                <label className="text-gray-400 text-sm">Address (Public)</label>
                                <div className="font-mono text-lg break-all text-blue-300">
                                    {wallet.address}
                                </div>
                            </div>
                            <div className="relative z-10">
                                <label className="text-gray-400 text-sm">Secret (Private)</label>
                                <div className="font-mono text-lg break-all text-red-300 blur-sm hover:blur-none transition-all cursor-pointer">
                                    {wallet.seed || "sEd..."} (Hover to reveal)
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setStep("faucet")}
                            className="btn-primary w-full"
                        >
                            Claim my initial funds
                        </button>
                    </div>
                )}

                {(step === "faucet" || step === "faucet_loading" || step === "faucet_done") && (
                    <div className="text-center w-full max-w-2xl z-10">
                        <h2 className="text-3xl font-bold mb-8">The Faucet</h2>

                        <div className="flex justify-center items-end gap-4 mb-8 h-48">
                            <div className="text-6xl animate-bounce" style={{ animationDuration: '3s' }}>🚰</div>
                            {step === "faucet_loading" && (
                                <div className="flex flex-col gap-2">
                                    <div className="w-4 h-4 bg-yellow-400 rounded-full animate-bounce delay-100"></div>
                                    <div className="w-4 h-4 bg-yellow-400 rounded-full animate-bounce delay-200"></div>
                                    <div className="w-4 h-4 bg-yellow-400 rounded-full animate-bounce delay-300"></div>
                                </div>
                            )}
                            <WalletIcon color={walletColor} size="lg" className={step === "faucet_done" ? "scale-110 transition-transform" : ""} />
                        </div>

                        {step === "faucet" && (
                            <button
                                onClick={handleFaucet}
                                className="btn-primary w-full"
                            >
                                Open the faucet (100 Yellow Coins)
                            </button>
                        )}

                        {step === "faucet_loading" && (
                            <div className="animate-pulse text-yellow-400 text-xl">
                                Filling the safe... 💰
                            </div>
                        )}

                        {step === "faucet_done" && (
                            <div className="animate-fade-in">
                                <div className="text-5xl font-bold text-yellow-400 mb-4">
                                    +{balance} Yellow Coins
                                </div>
                                <p className="text-gray-300 mb-8">
                                    "Your {colors.find(c => c.id === walletColor)?.name} safe is full!"
                                </p>

                                <div className="mb-8 animate-bounce">
                                    <div className="inline-block bg-gradient-to-r from-yellow-600 to-yellow-800 border border-yellow-500 rounded-xl px-8 py-4 text-white font-bold shadow-lg transform hover:scale-105 transition-transform cursor-pointer">
                                        <div className="text-3xl mb-2">🏆</div>
                                        <div className="text-xl">NFT Badge Received</div>
                                        <div className="text-sm text-yellow-200">"Key Keeper"</div>
                                    </div>
                                </div>

                                <button
                                    className="btn-primary w-full bg-green-600 hover:bg-green-700"
                                    onClick={() => alert("Level 2 coming soon!")}
                                >
                                    Continue to Level 2
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Explorer Sidebar */}
            <ExplorerSidebar logs={logs} wallet={wallet} balance={balance} />
        </main>
    );
}
