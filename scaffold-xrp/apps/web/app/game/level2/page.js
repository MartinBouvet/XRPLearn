"use client";

import { useState, useEffect } from "react";
import { Wallet, Client, xrpToDrops, convertStringToHex } from "xrpl";
import { WalletIcon } from "../../../components/WalletIcon";
import { ExplorerSidebar } from "../../../components/ExplorerSidebar";
import { useRouter } from "next/navigation";
import { useWallet } from "../../../components/providers/WalletProvider";

const DOOR_ADDRESS = "raDzvtC56NT4Ae5jEjpnbAeDMbHK9fSgdC"; // Valid Testnet Address

export default function Level2() {
    const router = useRouter();
    const { addLog } = useWallet();
    const [step, setStep] = useState("intro"); // intro, market, door, success, minting, level_complete
    const [wallet, setWallet] = useState(null);
    const [balance, setBalance] = useState(0); // XRP (Yellow Coins)
    const [inventory, setInventory] = useState({ red: 0, green: 0, blue: 0 });
    const [isLoading, setIsLoading] = useState(false);

    // Transaction Form State
    const [inputAddress, setInputAddress] = useState("");
    const [inputAmount, setInputAmount] = useState("");

    // Vendors State
    const [vendors, setVendors] = useState([]);

    useEffect(() => {
        // Initialize Wallet
        const seed = localStorage.getItem("xrpl_seed");
        if (!seed) {
            alert("No wallet found. Please complete Level 1 first.");
            router.push("/game/level1");
            return;
        }
        const _wallet = Wallet.fromSeed(seed);
        setWallet(_wallet);
        fetchBalance(_wallet);

        // Initialize Vendors with random addresses
        const v = [
            { id: "red", name: "Red Vendor", color: "red", price: 50, sells: 100, address: Wallet.generate().address },
            { id: "green", name: "Green Vendor", color: "green", price: 50, sells: 100, address: Wallet.generate().address },
            { id: "blue", name: "Blue Vendor", color: "blue", price: 50, sells: 100, address: Wallet.generate().address },
        ];
        setVendors(v);
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

    const handleSendTransaction = async (e) => {
        e.preventDefault();
        if (!wallet) return;

        const amount = parseFloat(inputAmount);
        const address = inputAddress.trim();

        if (isNaN(amount) || amount <= 0) {
            addLog("Invalid amount.", "error");
            return;
        }
        if (!address) {
            addLog("Invalid address.", "error");
            return;
        }

        // Identify Vendor
        const vendor = vendors.find(v => v.address === address);

        if (!vendor) {
            addLog("Warning: Unknown recipient address. Funds may be lost.", "warning");
        } else {
            if (amount !== vendor.price) {
                addLog(`Incorrect amount for ${vendor.name}. Expected ${vendor.price} YC.`, "warning");
            }
        }

        setIsLoading(true);
        addLog(`Sending ${amount} YC to ${address.substring(0, 8)}...`, "tx");

        const client = new Client("wss://s.altnet.rippletest.net:51233");
        try {
            await client.connect();

            // 1. Send Payment to Vendor
            const tx = {
                TransactionType: "Payment",
                Account: wallet.address,
                Amount: xrpToDrops(amount),
                Destination: address,
            };

            const result = await client.submitAndWait(tx, { wallet });

            if (result.result.meta.TransactionResult === "tesSUCCESS") {
                addLog(`Sent ${amount} YC`, "success", result.result.hash);

                // Update Balance locally (User spent YC)
                setBalance(prev => prev - amount - 0.000012);

                // 2. Vendor sends back coins (Simulated via Faucet)
                if (vendor && amount === vendor.price) {
                    addLog(`Vendor '${vendor.name}' verifying payment...`, "net");

                    // Trigger Faucet to simulate incoming transaction
                    addLog(`Vendor sending ${vendor.sells} ${vendor.color.toUpperCase()} Coins...`, "tx");

                    try {
                        // We use the faucet to send funds to the user. 
                        // IMPORTANT: These incoming XRP are the "Red Coins". 
                        // We do NOT update the 'balance' (Yellow Coins) state, so they remain "hidden" as XRP 
                        // and appear only as Red Coins in the inventory.
                        await client.fundWallet(wallet);

                        setInventory(prev => ({
                            ...prev,
                            [vendor.color]: prev[vendor.color] + vendor.sells
                        }));

                        addLog(`Received ${vendor.sells} ${vendor.color.toUpperCase()} Coins!`, "success");
                    } catch (faucetError) {
                        console.error("Faucet error:", faucetError);
                        addLog("Vendor tried to send coins but network failed.", "error");
                    }
                } else if (vendor) {
                    addLog(`Vendor '${vendor.name}' received payment but amount was wrong. No refund!`, "error");
                } else {
                    addLog("Funds sent to unknown address. No coins received.", "error");
                }

            } else {
                addLog(`Transaction Failed: ${result.result.meta.TransactionResult}`, "error");
            }
        } catch (error) {
            console.error(error);
            addLog(`Error: ${error.message}`, "error");
        } finally {
            client.disconnect();
            setIsLoading(false);
        }
    };

    const handlePayDoor = async () => {
        // Requirement: 100 Red Coins
        if (inventory.red < 100) {
            addLog("Access Denied: Requires 100 RED Coins.", "error");
            return;
        }

        setIsLoading(true);
        addLog("Initiating Door Payment (100 RC)...", "tx");

        const client = new Client("wss://s.altnet.rippletest.net:51233");
        try {
            await client.connect();

            // 3. Send Payment to Door
            // We send 100 XRP. These are the "Red Coins" (Hidden XRP) we received earlier.
            // We do NOT deduct this from the 'balance' state because that tracks Yellow Coins.
            const tx = {
                TransactionType: "Payment",
                Account: wallet.address,
                Amount: xrpToDrops(100), // Sending the 100 "Red Coins" (Real XRP)
                Destination: DOOR_ADDRESS,
                Memos: [
                    {
                        Memo: {
                            MemoData: convertStringToHex("100 Red Coins Payment"),
                            MemoType: convertStringToHex("DoorAccess"),
                        }
                    }
                ]
            };

            const result = await client.submitAndWait(tx, { wallet });

            if (result.result.meta.TransactionResult === "tesSUCCESS") {
                addLog("Sent 100 Red Coins to Door", "success", result.result.hash);

                setInventory(prev => ({ ...prev, red: prev.red - 100 }));
                // We do NOT update setBalance here, as we are spending Red Coins (Hidden XRP)

                addLog("Payment Accepted. Door Opening...", "success");
                setStep("success");

                handleMintBadge();
            } else {
                addLog(`Door Payment Failed: ${result.result.meta.TransactionResult}`, "error");
            }
        } catch (error) {
            console.error(error);
            addLog(`Error: ${error.message}`, "error");
        } finally {
            client.disconnect();
            setIsLoading(false);
        }
    };

    const handleMintBadge = async () => {
        setStep("minting");
        addLog("Minting 'Trader' Badge...", "tx");

        const client = new Client("wss://s.altnet.rippletest.net:51233");
        try {
            await client.connect();

            const transactionBlob = {
                TransactionType: "NFTokenMint",
                Account: wallet.address,
                URI: convertStringToHex("ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi"),
                Flags: 8,
                NFTokenTaxon: 0,
            };

            const tx = await client.submitAndWait(transactionBlob, { wallet: wallet });

            if (tx.result.meta.TransactionResult === "tesSUCCESS") {
                addLog("Badge 'Trader' Minted!", "success", tx.result.hash);
                setStep("level_complete");
            } else {
                addLog(`Minting Failed: ${tx.result.meta.TransactionResult}`, "error");
                setStep("level_complete");
            }
        } catch (error) {
            console.error(error);
            addLog(`Minting Error: ${error.message}`, "error");
            setStep("level_complete");
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
                        className="bg-purple-500 h-4 rounded-full transition-all duration-500"
                        style={{
                            width:
                                step === "intro" ? "10%" :
                                    step === "market" ? "50%" :
                                        step === "door" ? "80%" :
                                            "100%",
                        }}
                    ></div>
                </div>

                {step === "intro" && (
                    <div className="text-center max-w-2xl animate-fade-in z-10">
                        <h1 className="text-4xl font-bold mb-6 text-purple-400">Level 2: The Transaction</h1>
                        <p className="text-xl mb-8">
                            You have funds, but they are in <strong>Yellow Coins (XRP)</strong>.
                            <br />
                            To pass the next door, you need <strong>100 Red Coins</strong>.
                        </p>
                        <button
                            onClick={() => setStep("market")}
                            className="btn-primary text-xl bg-purple-600 hover:bg-purple-700"
                        >
                            Go to the Market
                        </button>
                    </div>
                )}

                {step === "market" && (
                    <div className="w-full max-w-6xl z-10 flex flex-col items-center">
                        <h2 className="text-3xl font-bold mb-8">The Exchange Market</h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 w-full">
                            {vendors.map((vendor) => (
                                <div key={vendor.id} className={`bg-gray-800 border-2 border-${vendor.color}-500 rounded-xl p-6 flex flex-col items-center shadow-lg transform hover:scale-105 transition-all`}>
                                    <div className={`w-16 h-16 rounded-full bg-${vendor.color}-600 mb-4 flex items-center justify-center text-2xl border-2 border-white`}>
                                        {vendor.color === "red" ? "👺" : vendor.color === "green" ? "🐸" : "🧞"}
                                    </div>
                                    <h3 className={`text-xl font-bold text-${vendor.color}-400 mb-2`}>{vendor.name}</h3>
                                    <p className="text-gray-300 mb-4 text-center">
                                        Sells: <strong>{vendor.sells} {vendor.color.toUpperCase()} Coins</strong>
                                        <br />
                                        Price: <strong>{vendor.price} YC</strong>
                                    </p>
                                    <div className="bg-black/50 p-2 rounded w-full mb-4 font-mono text-xs break-all text-gray-400 text-center select-all">
                                        {vendor.address}
                                    </div>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(vendor.address);
                                            addLog(`Copied ${vendor.name} address`, "info");
                                        }}
                                        className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-white"
                                    >
                                        Copy Address
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Transaction Form */}
                        <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700 w-full max-w-md">
                            <h3 className="text-xl font-bold mb-6 text-center">Make a Transaction</h3>
                            <form onSubmit={handleSendTransaction} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Destination Address</label>
                                    <input
                                        type="text"
                                        value={inputAddress}
                                        onChange={(e) => setInputAddress(e.target.value)}
                                        placeholder="r..."
                                        className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white font-mono text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Amount (Yellow Coins)</label>
                                    <input
                                        type="number"
                                        value={inputAmount}
                                        onChange={(e) => setInputAmount(e.target.value)}
                                        placeholder="0"
                                        className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white font-mono text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`w-full py-3 rounded-lg font-bold text-lg ${isLoading ? "bg-gray-600 cursor-not-allowed" : "bg-yellow-600 hover:bg-yellow-700"} transition-colors`}
                                >
                                    {isLoading ? "Processing..." : "Sign & Send Transaction ✍️"}
                                </button>
                            </form>
                        </div>



                        <button
                            onClick={() => setStep("door")}
                            className="mt-8 btn-primary bg-purple-600 hover:bg-purple-700 w-full max-w-md"
                        >
                            Go to Door &gt;
                        </button>
                    </div>
                )}

                {(step === "door") && (
                    <div className="text-center w-full max-w-4xl z-10 flex flex-col items-center">
                        <h2 className="text-3xl font-bold mb-8">The Locked Door</h2>

                        <div className="relative w-64 h-80 bg-gray-800 rounded-t-full border-8 border-gray-600 flex items-center justify-center mb-12 shadow-2xl">
                            <div className="absolute inset-0 bg-black opacity-50 rounded-t-full"></div>
                            <div className="z-10 flex flex-col items-center">
                                <div className="text-6xl mb-4">🔒</div>
                                <div className="text-red-500 font-bold bg-black/80 px-4 py-1 rounded">
                                    REQUIRES 100 RED COINS
                                </div>
                            </div>
                            <div className="absolute bottom-10 w-12 h-2 bg-black rounded-full"></div>
                        </div>



                        <button
                            onClick={handlePayDoor}
                            className="btn-primary text-xl bg-red-600 hover:bg-red-700 mb-4"
                        >
                            Insert 100 Red Coins
                        </button>

                        <button
                            onClick={() => setStep("market")}
                            className="btn-secondary bg-gray-600 hover:bg-gray-500"
                        >
                            &lt; Back to Market
                        </button>
                    </div>
                )}

                {(step === "minting") && (
                    <div className="text-center w-full max-w-2xl z-10">
                        <h2 className="text-3xl font-bold mb-8">Door Unlocked!</h2>
                        <div className="text-6xl mb-8 animate-bounce">🔓</div>
                        <div className="animate-pulse text-purple-400 text-xl mb-8">
                            Minting 'Trader' Badge...
                        </div>
                        <div className="flex justify-center">
                            <div className="animate-spin text-4xl">⚙️</div>
                        </div>
                    </div>
                )}

                {step === "level_complete" && (
                    <div className="text-center w-full max-w-2xl z-10 animate-fade-in">
                        <h2 className="text-4xl font-bold mb-6 text-green-400">
                            Level 2 Complete! 🏆
                        </h2>

                        <div className="mb-8 animate-bounce">
                            <div className="inline-block bg-gradient-to-r from-purple-600 to-purple-800 border border-purple-500 rounded-xl px-8 py-4 text-white font-bold shadow-lg transform hover:scale-105 transition-transform cursor-pointer">
                                <div className="text-3xl mb-2">⚖️</div>
                                <div className="text-xl">Badge Received</div>
                                <div className="text-sm text-purple-200">"Trader"</div>
                            </div>
                        </div>

                        <p className="text-gray-300 mb-8">
                            You've learned how to exchange assets and make payments on the network.
                        </p>

                        <button
                            className="btn-primary w-full bg-green-600 hover:bg-green-700"
                            onClick={() => router.push("/game/level3")}
                        >
                            Continue to Level 3
                        </button>
                    </div>
                )}
            </div>

            {/* Explorer Sidebar */}
            <ExplorerSidebar wallet={wallet} balance={balance} inventory={inventory} />
        </main>
    );
}
