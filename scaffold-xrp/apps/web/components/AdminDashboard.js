"use client";
// Force Vercel Redeploy

import { useState, useEffect, useRef } from "react";
import { Client } from "xrpl";
import { BlockchainBackground } from "./BlockchainBackground";
import Image from "next/image";

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
    const [transactions, setTransactions] = useState([]);
    const wsRef = useRef(null);

    // Poll for members and balances
    useEffect(() => {
        fetchMembers();
        const interval = setInterval(fetchMembers, 5000);
        return () => clearInterval(interval);
    }, []);

    // WebSocket for Live Ledger
    useEffect(() => {
        // Only connect if we have members with real addresses
        const validAddresses = members
            .filter(m => m.address && m.address.startsWith("r"))
            .map(m => m.address);

        if (validAddresses.length === 0) return;

        // If WS is already open, just update subscription (if needed) or reconnect
        // For simplicity, we'll close and reconnect if the list changes significantly or just keep one connection open
        // Better approach: Keep one connection, and send new 'subscribe' commands.

        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
            const ws = new WebSocket("wss://s.altnet.rippletest.net:51233");
            wsRef.current = ws;

            ws.onopen = () => {
                console.log("Connected to XRPL Ledger Stream");
                // Subscribe to accounts
                ws.send(JSON.stringify({
                    command: "subscribe",
                    accounts: validAddresses
                }));
            };

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.type === "transaction") {
                    handleNewTransaction(data);
                }
            };

            ws.onclose = () => {
                console.log("Disconnected from XRPL Ledger Stream");
            };
        } else {
            // Update subscription
            if (wsRef.current.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify({
                    command: "subscribe",
                    accounts: validAddresses
                }));
            }
        }

        return () => {
            // Don't close on every render, only on unmount or if we want to fully reset
            // wsRef.current?.close();
        };
    }, [members.length]); // Re-subscribe when member count changes

    const handleNewTransaction = (tx) => {
        const newTx = {
            id: tx.transaction.hash,
            type: tx.transaction.TransactionType,
            from: tx.transaction.Account,
            to: tx.transaction.Destination,
            amount: tx.transaction.Amount ? (typeof tx.transaction.Amount === 'string' ? tx.transaction.Amount / 1000000 : "NFT/Token") : "0",
            result: tx.meta.TransactionResult,
            timestamp: new Date().toLocaleTimeString()
        };

        setTransactions(prev => [newTx, ...prev].slice(0, 50)); // Keep last 50
    };

    const fetchMembers = async () => {
        try {
            const res = await fetch("/api/community/members");
            if (res.ok) {
                const data = await res.json();

                // Deduplicate by NAME
                const uniqueMembersMap = new Map();
                data.members.forEach(m => {
                    const existing = uniqueMembersMap.get(m.name);
                    if (!existing) {
                        uniqueMembersMap.set(m.name, m);
                    } else {
                        if (existing.address === "Pending..." && m.address !== "Pending...") {
                            uniqueMembersMap.set(m.name, m);
                        }
                    }
                });
                const uniqueMembers = Array.from(uniqueMembersMap.values());

                // Fetch balances
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
            setTransactions([]);
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

    // Helper to find name by address
    const getName = (address) => {
        const member = members.find(m => m.address === address);
        return member ? member.name : (address ? `${address.substring(0, 4)}...` : "Unknown");
    };

    return (
        <div className="flex flex-col h-screen font-sans overflow-hidden text-content-primary dark:text-content-light relative">
            <BlockchainBackground />

            {/* --- HEADER --- */}
            <header className="bg-surface-glass dark:bg-surface-glassDark backdrop-blur-md border-b border-white/10 p-4 flex justify-between items-center shadow-lg z-10">
                <div className="flex items-center gap-4 pl-24">
                    <div className="relative h-20 w-80">
                        <Image
                            src="/logo.png"
                            alt="UnBlock Logo"
                            fill
                            className="object-contain object-left dark:hidden"
                            priority
                        />
                        <Image
                            src="/logo-dark.png"
                            alt="UnBlock Logo"
                            fill
                            className="object-contain object-left hidden dark:block"
                            priority
                        />
                    </div>
                </div>

                <div>
                    <button
                        onClick={handleReset}
                        disabled={isLoading}
                        className="bg-red-500/20 hover:bg-red-500/40 text-red-500 border border-red-500/50 px-6 py-2 rounded-xl font-bold backdrop-blur-sm shadow-lg flex items-center gap-2 disabled:opacity-50 transition-all hover:shadow-red-500/20"
                    >
                        {isLoading ? "RESETTING..." : "⚠️ RESET GAME"}
                    </button>
                </div>
            </header>

            {/* --- MAIN CONTENT --- */}
            <div className="flex flex-1 overflow-hidden relative z-10">
                {/* LEFT: User Grid */}
                <main className="flex-1 p-8 overflow-y-auto relative scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
                    {members.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-content-secondary dark:text-content-muted">
                            <div className="text-6xl mb-4 animate-bounce">🎓</div>
                            <h2 className="text-2xl font-bold font-display">Waiting for students to join...</h2>
                            <p className="mt-2 opacity-60">Ask them to enter their codename on the home page.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {members.map((member, idx) => (
                                <div
                                    key={idx}
                                    className={`relative bg-surface-glass dark:bg-surface-glassDark backdrop-blur-md rounded-2xl p-5 border transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/10 group ${member.status === "offline"
                                        ? "border-white/5 opacity-60"
                                        : "border-white/10 hover:border-primary/50"
                                        }`}
                                >
                                    {/* Status Dot */}
                                    <div className={`absolute top-4 right-4 w-3 h-3 rounded-full shadow-lg ${member.status === 'online' ? 'bg-green-500 shadow-green-500/50' :
                                        member.status === 'busy' ? 'bg-yellow-500 shadow-yellow-500/50' : 'bg-red-500 shadow-red-500/50'
                                        }`} />

                                    <div className="flex flex-col items-center text-center">
                                        <div className="text-5xl mb-4 bg-white/5 w-20 h-20 flex items-center justify-center rounded-2xl border border-white/10 shadow-inner group-hover:scale-110 transition-transform duration-300">
                                            {member.avatar}
                                        </div>
                                        <h3 className="text-xl font-bold font-display mb-1">{member.name}</h3>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border mb-4 ${member.level == "3" ? "bg-green-500/10 text-green-500 border-green-500/20" :
                                            member.level == "2" ? "bg-purple-500/10 text-purple-500 border-purple-500/20" :
                                                "bg-blue-500/10 text-blue-500 border-blue-500/20"
                                            }`}>
                                            Level {member.level}
                                        </span>

                                        <div className="w-full bg-black/20 rounded-xl p-3 mb-3 border border-white/5">
                                            <div className="text-xs text-content-muted uppercase font-bold tracking-wider mb-1">Balance</div>
                                            <div className="text-lg font-mono text-yellow-500">{member.balance ? `${member.balance} XRP` : "Loading..."}</div>
                                        </div>

                                        {/* Wallet Address */}
                                        <div className="bg-black/20 rounded-lg px-3 py-2 text-[10px] font-mono text-content-muted w-full truncate select-all cursor-pointer hover:text-primary transition-colors border border-white/5 hover:border-primary/30" title={member.address}>
                                            {member.address}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>

                {/* RIGHT: Live Ledger Sidebar */}
                <aside className="w-96 bg-surface-glass dark:bg-surface-glassDark backdrop-blur-md border-l border-white/10 flex flex-col shadow-2xl z-20">
                    <div className="p-4 border-b border-white/10 bg-white/5">
                        <h2 className="text-lg font-bold font-display flex items-center gap-2 tracking-wide">
                            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_#ef4444]"></span>
                            LIVE LEDGER
                        </h2>
                        <p className="text-xs text-content-muted">Real-time transactions from students</p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
                        {transactions.length === 0 ? (
                            <div className="text-center text-content-muted mt-10 text-sm italic">
                                Waiting for activity...
                            </div>
                        ) : (
                            transactions.map((tx) => (
                                <div key={tx.id} className="bg-white/5 p-3 rounded-xl border border-white/10 text-sm animate-fade-in-left hover:bg-white/10 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`font-bold text-xs px-2 py-0.5 rounded border ${tx.result === "tesSUCCESS"
                                            ? "bg-green-500/10 text-green-500 border-green-500/20"
                                            : "bg-red-500/10 text-red-500 border-red-500/20"
                                            }`}>
                                            {tx.type}
                                        </span>
                                        <span className="text-xs text-content-muted font-mono">{tx.timestamp}</span>
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <div className="flex justify-between">
                                            <span className="text-content-secondary text-xs">From:</span>
                                            <span className="font-mono text-blue-400 truncate w-32 text-right text-xs" title={tx.from}>
                                                {getName(tx.from)}
                                            </span>
                                        </div>
                                        {tx.to && (
                                            <div className="flex justify-between">
                                                <span className="text-content-secondary text-xs">To:</span>
                                                <span className="font-mono text-purple-400 truncate w-32 text-right text-xs" title={tx.to}>
                                                    {getName(tx.to)}
                                                </span>
                                            </div>
                                        )}
                                        <div className="mt-2 pt-2 border-t border-white/10 flex justify-between font-bold">
                                            <span>Amount:</span>
                                            <span className="text-yellow-500">{tx.amount} XRP</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </aside>
            </div>

            {/* --- FOOTER --- */}
            <footer className="bg-surface-glass dark:bg-surface-glassDark backdrop-blur-md border-t border-white/10 p-4 flex items-center justify-between text-sm relative z-10">
                <div className="flex items-center gap-8">
                    <div>
                        <span className="block text-content-muted text-xs uppercase font-bold tracking-wider">Total Network Balance</span>
                        <span className="text-xl font-bold font-mono text-primary">
                            {totalBalance.toFixed(2)} XRP
                        </span>
                    </div>
                    <div className="border-l border-white/10 pl-8">
                        <span className="block text-content-muted text-xs uppercase font-bold tracking-wider">Active Nodes</span>
                        <span className="text-xl font-bold font-mono text-green-500">{activeUsers}</span>
                    </div>
                </div>
                <div className="text-content-muted text-xs font-mono">
                    XRPL Testnet Connected <span className="text-green-500 animate-pulse">●</span>
                </div>
            </footer>
        </div>
    );
}
