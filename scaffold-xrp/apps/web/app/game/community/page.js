"use client";

import { useState, useEffect } from "react";
import { Wallet, Client, xrpToDrops } from "xrpl";
import { ExplorerSidebar } from "../../../components/ExplorerSidebar";
import { useRouter } from "next/navigation";
import { useWallet } from "../../../components/providers/WalletProvider";

export default function Community() {
    const router = useRouter();
    const { addLog } = useWallet();
    const [wallet, setWallet] = useState(null);
    const [balance, setBalance] = useState(0);
    const [inventory, setInventory] = useState({ red: 0, green: 0, blue: 0 });
    const [members, setMembers] = useState([]);
    const [selectedMember, setSelectedMember] = useState(null);
    const [amount, setAmount] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const seed = localStorage.getItem("xrpl_seed");
        if (!seed) {
            router.push("/game/level1");
            return;
        }
        const _wallet = Wallet.fromSeed(seed);
        setWallet(_wallet);
        fetchBalance(_wallet);
        fetchMembers();
    }, [router]);

    // TODO: In the future, this should fetch from a real backend/database
    // API Endpoint: GET /api/players
    const fetchMembers = async () => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const fakeMembers = [
            { name: "CryptoKing", address: Wallet.generate().address, avatar: "👑", level: "Guardian (Lvl 3)", status: "online" },
            { name: "XRP_Fan", address: Wallet.generate().address, avatar: "🚀", level: "Trader (Lvl 2)", status: "away" },
            { name: "LedgerMaster", address: Wallet.generate().address, avatar: "📒", level: "Novice (Lvl 1)", status: "online" },
            { name: "ToTheMoon", address: Wallet.generate().address, avatar: "🌙", level: "Guardian (Lvl 3)", status: "online" },
            { name: "SatoshiNakamoto", address: Wallet.generate().address, avatar: "🕵️", level: "Admin", status: "busy" },
            { name: "Vitalik", address: Wallet.generate().address, avatar: "🦄", level: "Trader (Lvl 2)", status: "online" },
        ];
        setMembers(fakeMembers);
    };

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

    const handleSend = async (e) => {
        e.preventDefault();
        if (!wallet || !selectedMember) return;

        const val = parseFloat(amount);
        if (isNaN(val) || val <= 0) {
            addLog("Invalid amount", "error");
            return;
        }

        setIsLoading(true);
        addLog(`Sending ${val} XRP to ${selectedMember.name}...`, "tx");

        const client = new Client("wss://s.altnet.rippletest.net:51233");
        try {
            await client.connect();
            const tx = {
                TransactionType: "Payment",
                Account: wallet.address,
                Amount: xrpToDrops(val),
                Destination: selectedMember.address,
            };

            const result = await client.submitAndWait(tx, { wallet });

            if (result.result.meta.TransactionResult === "tesSUCCESS") {
                addLog(`Sent ${val} XRP to ${selectedMember.name}`, "success", result.result.hash);
                setBalance(prev => prev - val - 0.000012);
                setAmount("");
                setSelectedMember(null);
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

    return (
        <main className="min-h-screen flex bg-gray-900 text-white">
            <div className="flex-1 p-8 flex flex-col items-center mr-80 overflow-y-auto">
                <h1 className="text-4xl font-bold mb-2 text-blue-400">Simulation Community</h1>
                <p className="text-gray-400 mb-12 text-center max-w-2xl">
                    These are the other members of the simulation.
                    <br />
                    Click on a member to send them a transaction and practice your skills!
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
                    {members.map((member, index) => (
                        <div
                            key={index}
                            onClick={() => setSelectedMember(member)}
                            className="bg-gray-800 border border-gray-700 rounded-xl p-6 cursor-pointer hover:bg-gray-700 hover:border-blue-500 transition-all transform hover:-translate-y-1 shadow-lg group"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="text-4xl bg-gray-900 rounded-full w-16 h-16 flex items-center justify-center border-2 border-gray-600 group-hover:border-blue-400 transition-colors">
                                    {member.avatar}
                                </div>
                                <div>
                                    <h3 className="font-bold text-xl text-white group-hover:text-blue-300">{member.name}</h3>
                                    <div className="flex gap-2 mt-1">
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${member.status === 'online' ? 'bg-green-900/50 text-green-400' : 'bg-yellow-900/50 text-yellow-400'}`}>
                                            {member.status}
                                        </span>
                                        <span className="text-xs bg-blue-900/50 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/30">
                                            {member.level}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-black/30 p-3 rounded text-xs font-mono text-gray-400 break-all border border-gray-700 group-hover:border-gray-600">
                                {member.address}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Transaction Modal */}
                {selectedMember && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-gray-800 border border-gray-600 rounded-2xl p-8 max-w-md w-full shadow-2xl animate-fade-in">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                <span>💸</span>
                                Send to {selectedMember.name}
                            </h2>

                            <div className="mb-6 flex justify-center">
                                <div className="text-6xl animate-bounce">{selectedMember.avatar}</div>
                            </div>

                            <form onSubmit={handleSend} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Recipient Address</label>
                                    <div className="bg-black/50 p-3 rounded text-xs font-mono text-gray-300 break-all">
                                        {selectedMember.address}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Amount (XRP)</label>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white font-mono text-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        autoFocus
                                    />
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedMember(null)}
                                        className="flex-1 py-3 rounded-lg font-bold text-gray-300 hover:bg-gray-700 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className={`flex-1 py-3 rounded-lg font-bold text-white ${isLoading ? "bg-blue-800 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"} transition-colors`}
                                    >
                                        {isLoading ? "Sending..." : "Send XRP"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>

            <ExplorerSidebar wallet={wallet} balance={balance} inventory={inventory} />
        </main>
    );
}
