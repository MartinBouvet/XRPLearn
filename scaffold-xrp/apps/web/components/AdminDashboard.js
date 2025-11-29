"use client";

import { useState, useEffect } from "react";
import { Client } from "xrpl";

export default function AdminDashboard() {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) return null;

    return <DashboardContent />;
}

function DashboardContent() {
    const [members, setMembers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Poll for members and balances
    useEffect(() => {
        fetchMembers();
        const interval = setInterval(fetchMembers, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchMembers = async () => {
        try {
            const res = await fetch("/api/community/members");
            if (res.ok) {
                const data = await res.json();

                // Deduplicate by NAME (taking the latest entry if possible, or just one)
                // Since the API returns a list, and we append to a Set, we might have duplicates if we don't clean up.
                // We'll use a Map keyed by name to keep the latest one (assuming order or just uniqueness).
                const uniqueMembersMap = new Map();
                data.members.forEach(m => {
                    // If we already have this name, check if the new one has a real address while the old one didn't
                    const existing = uniqueMembersMap.get(m.name);
                    if (!existing) {
                        uniqueMembersMap.set(m.name, m);
                    } else {
                        // Prefer the one with a real address over "Pending..."
                        if (existing.address === "Pending..." && m.address !== "Pending...") {
                            uniqueMembersMap.set(m.name, m);
                        }
                    }
                });
                const uniqueMembers = Array.from(uniqueMembersMap.values());

                // Fetch balances for each member (skip if Pending)
                const membersWithBalances = await Promise.all(uniqueMembers.map(async (m) => {
                    if (m.address === "Pending...") {
                        return { ...m, balance: "Waiting for Wallet..." };
                    }
                    try {
                        const client = new Client("wss://s.altnet.rippletest.net:51233");
                        await client.connect();
                        const bal = await client.getXrpBalance(m.address);
                        await client.disconnect();
                        return { ...m, balance: bal };
                    } catch (e) {
                        return { ...m, balance: "..." };
                    }
                }));

                setMembers(membersWithBalances);
            }
        } catch (error) {
            console.error("Failed to fetch members:", error);
        }
    };

    const handleReset = async () => {
        if (!confirm("Are you sure you want to restart the game? This will clear all connected students.")) return;

        setIsLoading(true);
        try {
            await fetch("/api/admin/reset", { method: "DELETE" });
            setMembers([]);
            alert("Game reset successfully!");
        } catch (error) {
            console.error("Failed to reset:", error);
            alert("Failed to reset game.");
        } finally {
            setIsLoading(false);
        }
    };

    // Calculate Stats
    const totalBalance = members.reduce((acc, m) => acc + (parseFloat(m.balance) || 0), 0);
    const activeUsers = members.filter(m => m.status === 'online').length;

    return (
        <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-sans overflow-hidden transition-colors duration-300">
            {/* --- HEADER --- */}
            <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center shadow-lg z-10 transition-colors duration-300">
                <div className="flex items-center gap-4 pl-16"> {/* Added padding-left for ThemeToggle */}
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-wider">XRPL ADMIN DASHBOARD</h1>
                </div>

                <div>
                    <button
                        onClick={handleReset}
                        disabled={isLoading}
                        className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-lg font-bold border border-red-500 shadow-lg flex items-center gap-2 disabled:opacity-50 transition-all"
                    >
                        {isLoading ? "RESETTING..." : "⚠️ RESET GAME"}
                    </button>
                </div>
            </header>

            {/* --- MAIN CONTENT --- */}
            <main className="flex-1 p-8 overflow-y-auto bg-gray-100 dark:bg-gray-900 relative transition-colors duration-300">
                {members.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                        <div className="text-6xl mb-4">🎓</div>
                        <h2 className="text-2xl font-bold">Waiting for students to join...</h2>
                        <p className="mt-2 text-gray-400">Ask them to enter their codename on the home page.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {members.map((member, idx) => (
                            <div
                                key={idx}
                                className={`relative bg-white dark:bg-gray-800 rounded-xl p-5 border-2 transition-all hover:scale-[1.02] shadow-xl ${member.status === "offline" ? "border-gray-200 dark:border-gray-700 opacity-60" : "border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500"
                                    }`}
                            >
                                {/* Status Dot */}
                                <div className={`absolute top-4 right-4 w-3 h-3 rounded-full ${member.status === 'online' ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' :
                                    member.status === 'busy' ? 'bg-yellow-500' : 'bg-red-500'
                                    }`} />

                                <div className="flex flex-col items-center text-center">
                                    <div className="text-5xl mb-3 bg-gray-100 dark:bg-gray-700/50 w-20 h-20 flex items-center justify-center rounded-full border border-gray-200 dark:border-gray-600">
                                        {member.avatar}
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{member.name}</h3>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border mb-4 ${member.level == "3" ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-500/30" :
                                        member.level == "2" ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-500/30" :
                                            "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/30"
                                        }`}>
                                        Level {member.level}
                                    </span>

                                    <div className="w-full bg-gray-100 dark:bg-black/30 rounded p-2 mb-2">
                                        <div className="text-xs text-gray-500 uppercase font-bold">Balance</div>
                                        <div className="text-lg font-mono text-yellow-600 dark:text-yellow-400">{member.balance ? `${member.balance} XRP` : "Loading..."}</div>
                                    </div>

                                    {/* Wallet Address */}
                                    <div className="bg-gray-100 dark:bg-black/30 rounded px-2 py-1 text-[10px] font-mono text-gray-500 dark:text-gray-400 w-full truncate select-all cursor-pointer hover:text-gray-900 dark:hover:text-white transition-colors" title={member.address}>
                                        {member.address}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* --- FOOTER --- */}
            <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between text-sm transition-colors duration-300">
                <div className="flex items-center gap-8">
                    <div>
                        <span className="block text-gray-500 text-xs uppercase font-bold">Total Network Balance</span>
                        <span className="text-xl font-bold text-gray-900 dark:text-white">
                            {totalBalance.toFixed(2)} XRP
                        </span>
                    </div>
                    <div className="border-l border-gray-200 dark:border-gray-600 pl-8">
                        <span className="block text-gray-500 text-xs uppercase font-bold">Active Nodes</span>
                        <span className="text-xl font-bold text-green-600 dark:text-green-400">{activeUsers}</span>
                    </div>
                </div>
                <div className="text-gray-500 text-xs">
                    XRPL Testnet Connected ●
                </div>
            </footer>
        </div>
    );
}
