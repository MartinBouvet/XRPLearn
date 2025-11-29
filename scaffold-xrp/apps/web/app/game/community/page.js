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
    const [isMock, setIsMock] = useState(false);

    useEffect(() => {
        const seed = localStorage.getItem("xrpl_seed");
        const username = localStorage.getItem("xrpl_username");

        if (!seed || !username) {
            router.push("/game/level1");
            return;
        }

        const _wallet = Wallet.fromSeed(seed);
        setWallet(_wallet);
        fetchBalance(_wallet);

        // Register self in community
        registerMember(username, _wallet.address);

        // Start polling for members
        fetchMembers(username);
        const interval = setInterval(() => fetchMembers(username), 5000);

        return () => clearInterval(interval);
    }, [router]);

    const registerMember = async (name, address) => {
        try {
            await fetch("/api/community/members", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    address,
                    avatar: "👤", // Could be randomized
                    level: "3", // Assuming they reached here
                    status: "online"
                })
            });
        } catch (error) {
            console.error("Failed to register:", error);
        }
    };

    const fetchMembers = async (myUsername) => {
        try {
            const res = await fetch("/api/community/members");
            if (res.ok) {
                const data = await res.json();
                if (data.isMock) setIsMock(true);
                // Filter out self and duplicates (by address)
                const uniqueMembers = Array.from(new Map(data.members.map(m => [m.address, m])).values());
                setMembers(uniqueMembers.filter(m => m.name !== myUsername));
            }
        } catch (error) {
            console.error("Failed to fetch members:", error);
        }
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
        <main className="min-h-screen flex bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300">
            <div className="flex-1 p-8 flex flex-col items-center mr-80 overflow-y-auto">
                {isMock && (
                    <div className="w-full bg-yellow-600/90 text-white text-center p-2 font-bold mb-4 rounded-lg animate-pulse">
                        ⚠️ DEMO MODE - PLAYERS WILL NOT SYNC ⚠️
                    </div>
                )}
                <h1 className="text-4xl font-bold mb-2 text-blue-600 dark:text-blue-400">Simulation Community</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-12 text-center max-w-2xl">
                    These are the other members of the simulation.
                    <br />
                    Click on a member to send them a transaction and practice your skills!
                </p>

                {members.length === 0 ? (
                    <div className="text-center text-gray-500 dark:text-gray-400 italic animate-pulse">
                        Searching for other nodes in the network...
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
                        {members.map((member, index) => (
                            <div
                                key={index}
                                onClick={() => setSelectedMember(member)}
                                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-blue-500 transition-all transform hover:-translate-y-1 shadow-lg group"
                            >
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="text-4xl bg-gray-100 dark:bg-gray-900 rounded-full w-16 h-16 flex items-center justify-center border-2 border-gray-200 dark:border-gray-600 group-hover:border-blue-400 transition-colors">
                                        {member.avatar}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-xl text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-300">{member.name}</h3>
                                        <div className="flex gap-2 mt-1">
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${member.status === 'online' ? 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400' : 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600 dark:text-yellow-400'}`}>
                                                {member.status}
                                            </span>
                                            <span className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-500/30">
                                                Lvl {member.level}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-100 dark:bg-black/30 p-3 rounded text-xs font-mono text-gray-500 dark:text-gray-400 break-all border border-gray-200 dark:border-gray-700 group-hover:border-gray-300 dark:group-hover:border-gray-600">
                                    {member.address}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Transaction Modal */}
                {selectedMember && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-2xl p-8 max-w-md w-full shadow-2xl">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-900 dark:text-white">
                                <span>💸</span>
                                Send to {selectedMember.name}
                            </h2>

                            <div className="mb-6 flex justify-center">
                                <div className="text-6xl animate-bounce">{selectedMember.avatar}</div>
                            </div>

                            <form onSubmit={handleSend} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Recipient Address</label>
                                    <div className="bg-gray-100 dark:bg-black/50 p-3 rounded text-xs font-mono text-gray-600 dark:text-gray-300 break-all border border-gray-200 dark:border-gray-700">
                                        {selectedMember.address}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Amount (XRP)</label>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white font-mono text-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        autoFocus
                                    />
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedMember(null)}
                                        className="flex-1 py-3 rounded-lg font-bold text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className={`flex-1 py-3 rounded-lg font-bold text-white ${isLoading ? "bg-blue-400 dark:bg-blue-800 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"} transition-colors`}
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
