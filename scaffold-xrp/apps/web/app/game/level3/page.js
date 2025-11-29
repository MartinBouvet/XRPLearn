"use client";

import { useState, useEffect } from "react";
import { Wallet, Client, convertStringToHex } from "xrpl";
import { ExplorerSidebar } from "../../../components/ExplorerSidebar";
import { useRouter } from "next/navigation";
import { useWallet } from "../../../components/providers/WalletProvider";

export default function Level3() {
    const router = useRouter();
    const { addLog } = useWallet();
    const [step, setStep] = useState("intro"); // intro, validating, quiz, minting, complete
    const [wallet, setWallet] = useState(null);
    const [balance, setBalance] = useState(0);
    const [inventory, setInventory] = useState({ red: 0, green: 0, blue: 0 });

    // Animation states
    const [transactionsInBlock, setTransactionsInBlock] = useState(false);
    const [validatorsVoting, setValidatorsVoting] = useState(false);
    const [blockSealed, setBlockSealed] = useState(false);
    const [chainLinked, setChainLinked] = useState(false);

    useEffect(() => {
        const seed = localStorage.getItem("xrpl_seed");
        if (!seed) {
            router.push("/game/level1");
            return;
        }
        const _wallet = Wallet.fromSeed(seed);
        setWallet(_wallet);
        fetchBalance(_wallet);
    }, [router]);

    const fetchBalance = async (_wallet) => {
        const client = new Client("wss://s.altnet.rippletest.net:51233");
        try {
            await client.connect();
            const bal = await client.getXrpBalance(_wallet.address);
            setBalance(parseFloat(bal));
        } catch (error) {
            console.error("Error fetching balance:", error);
        } finally {
            client.disconnect();
        }
    };

    const handleValidateBlock = async () => {
        addLog("Transactions entering the block...", "system");
        setTransactionsInBlock(true);

        await new Promise(r => setTimeout(r, 2000));
        addLog("Validators voting on the block...", "net");
        setValidatorsVoting(true);

        await new Promise(r => setTimeout(r, 2500));
        addLog("Consensus reached! Sealing block...", "success");
        setBlockSealed(true);

        await new Promise(r => setTimeout(r, 1500));
        addLog("Block #482910 added to the chain!", "success");
        setChainLinked(true);

        await new Promise(r => setTimeout(r, 1000));
        setStep("quiz");
    };

    const handleQuizAnswer = (answer) => {
        if (answer === "immutability") {
            addLog("Correct! The blockchain is immutable.", "success");
            setStep("minting");
            handleMintBadge();
        } else {
            addLog("Incorrect. Try again.", "error");
        }
    };

    const handleMintBadge = async () => {
        addLog("Minting 'Guardian' Badge...", "tx");

        const client = new Client("wss://s.altnet.rippletest.net:51233");
        try {
            await client.connect();

            const transactionBlob = {
                TransactionType: "NFTokenMint",
                Account: wallet.address,
                URI: convertStringToHex("ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi"), // Placeholder URI
                Flags: 8,
                NFTokenTaxon: 0,
            };

            const tx = await client.submitAndWait(transactionBlob, { wallet: wallet });

            if (tx.result.meta.TransactionResult === "tesSUCCESS") {
                addLog("Badge 'Guardian' Minted!", "success", tx.result.hash);
                setStep("complete");
            } else {
                addLog(`Minting Failed: ${tx.result.meta.TransactionResult}`, "error");
                setStep("complete"); // Proceed anyway for demo
            }
        } catch (error) {
            console.error(error);
            addLog(`Minting Error: ${error.message}`, "error");
            setStep("complete");
        } finally {
            client.disconnect();
        }
    };

    return (
        <main className="min-h-screen flex bg-gray-900 text-white">
            <div className="flex-1 p-8 flex flex-col items-center justify-center overflow-hidden mr-80">
                {/* Progress Bar */}
                <div className="w-full max-w-4xl mb-8 bg-gray-700 rounded-full h-4 z-10">
                    <div
                        className="bg-green-500 h-4 rounded-full transition-all duration-500"
                        style={{
                            width:
                                step === "intro" ? "10%" :
                                    step === "validating" ? "40%" :
                                        step === "quiz" ? "70%" :
                                            "100%",
                        }}
                    ></div>
                </div>

                {step === "intro" && (
                    <div className="text-center max-w-2xl animate-fade-in z-10">
                        <h1 className="text-4xl font-bold mb-6 text-green-400">Level 3: The Blockchain</h1>
                        <p className="text-xl mb-8">
                            You've made transactions. But where do they go?
                            <br />
                            They are collected into <strong>Blocks</strong> and validated by the network.
                        </p>
                        <button
                            onClick={() => setStep("validating")}
                            className="btn-primary text-xl bg-green-600 hover:bg-green-700"
                        >
                            Enter the Consensus Chamber
                        </button>
                    </div>
                )}

                {step === "validating" && (
                    <div className="w-full max-w-4xl z-10 flex flex-col items-center">
                        <h2 className="text-3xl font-bold mb-12">The Consensus Chamber</h2>

                        <div className="flex items-center justify-center gap-8 mb-12 relative h-80 w-full">
                            {/* Previous Block */}
                            <div className={`w-32 h-32 bg-gray-800 border-4 border-gray-600 rounded flex items-center justify-center transition-all duration-1000 ${chainLinked ? "opacity-100 translate-x-0" : "opacity-50 -translate-x-12"}`}>
                                <div className="text-4xl">📦</div>
                                <div className="absolute -bottom-6 text-xs text-gray-500">Block #482909</div>
                            </div>

                            {/* Chain Link */}
                            <div className={`text-4xl text-gray-500 transition-all duration-1000 ${chainLinked ? "opacity-100 scale-100" : "opacity-0 scale-0"}`}>
                                🔗
                            </div>

                            {/* Current Block */}
                            <div className={`relative w-64 h-64 bg-gray-800 border-4 ${blockSealed ? "border-green-500" : "border-yellow-500"} rounded-xl flex flex-col items-center justify-center transition-all duration-500`}>

                                {/* Transactions entering the block */}
                                <div className={`absolute inset-0 flex flex-col items-center justify-center gap-2 transition-all duration-500 ${blockSealed ? "opacity-0 scale-50" : "opacity-100"}`}>
                                    {transactionsInBlock && (
                                        <>
                                            <div className="bg-blue-900/80 px-3 py-1 rounded border border-blue-500 text-xs animate-slide-in-right">
                                                Tx: 50 YC ➡️ Vendor
                                            </div>
                                            <div className="bg-red-900/80 px-3 py-1 rounded border border-red-500 text-xs animate-slide-in-left" style={{ animationDelay: "0.2s" }}>
                                                Tx: 100 RC ➡️ Door
                                            </div>
                                            <div className="bg-gray-700/80 px-3 py-1 rounded border border-gray-500 text-xs animate-slide-in-right" style={{ animationDelay: "0.4s" }}>
                                                Tx: Others...
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Sealed Block Icon */}
                                <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${blockSealed ? "opacity-100 scale-100" : "opacity-0 scale-0"}`}>
                                    <div className="text-8xl">🔒</div>
                                </div>

                                {/* Validators */}
                                {validatorsVoting && !blockSealed && (
                                    <>
                                        <div className="absolute -top-10 left-10 text-3xl animate-bounce" style={{ animationDelay: "0s" }}>🤖 <span className="text-xs bg-green-500 text-black px-1 rounded">VOTE</span></div>
                                        <div className="absolute -top-10 right-10 text-3xl animate-bounce" style={{ animationDelay: "0.3s" }}>🤖 <span className="text-xs bg-green-500 text-black px-1 rounded">VOTE</span></div>
                                        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-3xl animate-bounce" style={{ animationDelay: "0.6s" }}>🤖 <span className="text-xs bg-green-500 text-black px-1 rounded">VOTE</span></div>
                                    </>
                                )}

                                <div className="absolute -bottom-8 text-sm text-gray-400 w-full text-center">
                                    {blockSealed ? "Sealed & Verified" : validatorsVoting ? "Validators Voting..." : transactionsInBlock ? "Collecting Transactions..." : "Waiting for Tx..."}
                                </div>
                            </div>
                        </div>

                        {!transactionsInBlock ? (
                            <button
                                onClick={handleValidateBlock}
                                className="btn-primary text-xl bg-blue-600 hover:bg-blue-700 animate-pulse"
                            >
                                📡 Propose Block
                            </button>
                        ) : (
                            <div className="text-xl font-mono text-green-400 h-8">
                                {chainLinked ? "Block added to the chain!" : blockSealed ? "Consensus Reached!" : validatorsVoting ? "Validating..." : "Packing transactions..."}
                            </div>
                        )}
                    </div>
                )}

                {step === "quiz" && (
                    <div className="text-center max-w-2xl animate-fade-in z-10">
                        <h2 className="text-3xl font-bold mb-8">Security Check</h2>
                        <p className="text-xl mb-8">
                            Why did the validators vote on the block?
                        </p>
                        <div className="grid grid-cols-1 gap-4">
                            <button
                                onClick={() => handleQuizAnswer("warm")}
                                className="p-4 bg-gray-800 hover:bg-gray-700 rounded-xl border border-gray-600 text-left transition-all"
                            >
                                A. To decide who gets the transaction fees
                            </button>
                            <button
                                onClick={() => handleQuizAnswer("immutability")}
                                className="p-4 bg-gray-800 hover:bg-gray-700 rounded-xl border border-gray-600 text-left transition-all"
                            >
                                B. To reach consensus on the correct history (Immutability)
                            </button>
                            <button
                                onClick={() => handleQuizAnswer("hide")}
                                className="p-4 bg-gray-800 hover:bg-gray-700 rounded-xl border border-gray-600 text-left transition-all"
                            >
                                C. To encrypt the data so no one can see it
                            </button>
                        </div>
                    </div>
                )}

                {step === "minting" && (
                    <div className="text-center w-full max-w-2xl z-10">
                        <h2 className="text-3xl font-bold mb-8">Perfect!</h2>
                        <div className="text-6xl mb-8 animate-bounce">🛡️</div>
                        <div className="animate-pulse text-green-400 text-xl mb-8">
                            Minting 'Guardian' Badge...
                        </div>
                        <div className="flex justify-center">
                            <div className="animate-spin text-4xl">⚙️</div>
                        </div>
                    </div>
                )}

                {step === "complete" && (
                    <div className="text-center w-full max-w-2xl z-10 animate-fade-in">
                        <h2 className="text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
                            Mission Accomplished! 🚀
                        </h2>

                        <div className="mb-12">
                            <div className="inline-block bg-gradient-to-r from-green-600 to-green-800 border border-green-500 rounded-xl px-8 py-4 text-white font-bold shadow-lg transform hover:scale-105 transition-transform">
                                <div className="text-4xl mb-2">🛡️</div>
                                <div className="text-xl">Final Badge</div>
                                <div className="text-sm text-green-200">"Guardian"</div>
                            </div>
                        </div>

                        <p className="text-gray-300 mb-8 text-lg">
                            You have mastered the basics of XRPL:
                            <br />
                            <span className="text-blue-400">Wallets</span> • <span className="text-yellow-400">Transactions</span> • <span className="text-green-400">Blockchain</span>
                        </p>

                        <button
                            className="btn-primary w-full bg-blue-600 hover:bg-blue-700"
                            onClick={() => router.push("/game/community")}
                        >
                            Join the Community
                        </button>
                    </div>
                )}
            </div>

            <ExplorerSidebar wallet={wallet} balance={balance} inventory={inventory} />
        </main>
    );
}
