"use client";

import { useState, useEffect, useRef } from "react";
import { useWallet } from "./providers/WalletProvider";

// Simulated Blockchain Events for "God Mode"
const MOCK_EVENTS = [
    { type: "success", msg: "Alice minted Badge 'Key Keeper'", hash: "Tx...8A2" },
    { type: "success", msg: "Bob sent 50 XRP to DEX", hash: "Tx...B91" },
    { type: "fail", msg: "Charlie: Insufficient Funds", hash: "Tx...C22" },
    { type: "success", msg: "Dave unlocked Level 2", hash: "Tx...D33" },
    { type: "success", msg: "Eve created Wallet (r...99)", hash: "Tx...E44" },
    { type: "fail", msg: "Frank: Invalid Sequence", hash: "Tx...F55" },
    { type: "success", msg: "Grace minted NFT 'Dragon'", hash: "Tx...G66" },
    { type: "success", msg: "Heidi swapped 10 XRP to RLUSD", hash: "Tx...H77" },
];

export default function AdminDashboard() {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) return null;

    return <DashboardContent />;
}

function DashboardContent() {
    const { members, resetMembers } = useWallet();
    const [sessionActive, setSessionActive] = useState(false);
    const [timer, setTimer] = useState(0);
    const [feed, setFeed] = useState([]);
    const feedEndRef = useRef(null);

    // Session Timer
    useEffect(() => {
        let interval;
        if (sessionActive) {
            interval = setInterval(() => {
                setTimer((prev) => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [sessionActive]);

    // God Mode: Simulated Blockchain Feed
    useEffect(() => {
        if (!sessionActive) return;

        const interval = setInterval(() => {
            const randomEvent = MOCK_EVENTS[Math.floor(Math.random() * MOCK_EVENTS.length)];
            const timestamp = new Date().toLocaleTimeString();
            setFeed((prev) => [...prev.slice(-19), { ...randomEvent, timestamp, id: Date.now() }]);
        }, 2500); // New event every 2.5s

        return () => clearInterval(interval);
    }, [sessionActive]);

    // Auto-scroll feed
    useEffect(() => {
        feedEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [feed]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    // Calculate Class Progress
    const totalLevels = 3; // Assuming 3 levels max for now
    const levelMap = { "Novice (Lvl 1)": 1, "Trader (Lvl 2)": 2, "Guardian (Lvl 3)": 3, "Admin": 3 };
    const totalProgress = members.reduce((acc, m) => acc + (levelMap[m.level] || 0), 0);
    const maxProgress = members.length * totalLevels;
    const progressPercentage = maxProgress > 0 ? Math.round((totalProgress / maxProgress) * 100) : 0;

    return (
        <div className="flex flex-col h-screen bg-gray-900 text-white font-sans overflow-hidden">
            {/* --- SESSION HEADER --- */}
            <header className="bg-gray-800 border-b border-gray-700 p-4 flex justify-between items-center shadow-lg z-10">
                <div className="flex items-center gap-6">
                    <div className="bg-blue-600 px-4 py-2 rounded-lg shadow-blue-900/50 shadow-lg">
                        <span className="text-xs uppercase font-bold text-blue-200 block">Game PIN</span>
                        <span className="text-3xl font-black tracking-widest">#8832</span>
                    </div>
                    <div className="text-center">
                        <span className="text-xs uppercase font-bold text-gray-400 block">Session Time</span>
                        <span className={`text-3xl font-mono font-bold ${sessionActive ? "text-green-400" : "text-gray-500"}`}>
                            {formatTime(timer)}
                        </span>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => {
                            if (confirm("Are you sure you want to restart the game? This will clear all connected students.")) {
                                resetMembers();
                                setSessionActive(false);
                                setTimer(0);
                                setFeed([]);
                            }
                        }}
                        className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-bold border border-red-500 shadow-lg flex items-center gap-2"
                    >
                        🔄 RESTART
                    </button>
                    {!sessionActive ? (
                        <button
                            onClick={() => setSessionActive(true)}
                            className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-lg font-bold text-lg shadow-lg transition-transform active:scale-95 flex items-center gap-2"
                        >
                            ▶ START SESSION
                        </button>
                    ) : (
                        <button
                            onClick={() => setSessionActive(false)}
                            className="bg-yellow-600 hover:bg-yellow-500 text-white px-6 py-3 rounded-lg font-bold text-lg shadow-lg transition-transform active:scale-95 flex items-center gap-2"
                        >
                            ⏸ PAUSE
                        </button>
                    )}
                    <button className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg font-semibold border border-gray-600">
                        🔓 Unlock Lvl 2
                    </button>
                    <button className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg font-semibold border border-gray-600">
                        🔓 Unlock Lvl 3
                    </button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* --- CLASSROOM VIEW (MAIN GRID) --- */}
                <main className="flex-1 p-6 overflow-y-auto bg-gray-900 relative">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {members.map((member, idx) => (
                            <div
                                key={idx}
                                className={`relative bg-gray-800 rounded-xl p-5 border-2 transition-all hover:scale-[1.02] shadow-xl ${member.status === "offline" ? "border-gray-700 opacity-60" : "border-gray-700 hover:border-blue-500"
                                    }`}
                            >
                                {/* Status Dot */}
                                <div className={`absolute top-4 right-4 w-3 h-3 rounded-full ${member.status === 'online' ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' :
                                    member.status === 'busy' ? 'bg-yellow-500' : 'bg-red-500'
                                    }`} />

                                <div className="flex flex-col items-center text-center">
                                    <div className="text-5xl mb-3 bg-gray-700/50 w-20 h-20 flex items-center justify-center rounded-full border border-gray-600">
                                        {member.avatar}
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-1">{member.name}</h3>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border mb-4 ${member.level?.includes("Guardian") ? "bg-green-900/30 text-green-400 border-green-500/30" :
                                        member.level?.includes("Trader") ? "bg-purple-900/30 text-purple-400 border-purple-500/30" :
                                            "bg-blue-900/30 text-blue-400 border-blue-500/30"
                                        }`}>
                                        {member.level}
                                    </span>

                                    {/* Mock Wallet Address */}
                                    <div className="bg-black/30 rounded px-2 py-1 text-[10px] font-mono text-gray-400 w-full truncate">
                                        {member.address}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </main>

                {/* --- GOD MODE (SIDEBAR) --- */}
                <aside className="w-96 bg-black border-l border-gray-800 flex flex-col shadow-2xl">
                    <div className="p-4 border-b border-gray-800 bg-gray-900/50">
                        <h2 className="text-lg font-bold text-green-400 flex items-center gap-2">
                            <span className="animate-pulse">●</span> XRPL Live Feed
                        </h2>
                        <p className="text-xs text-gray-500 mt-1">Listening to Testnet...</p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-sm">
                        {feed.length === 0 && (
                            <div className="text-gray-600 text-center mt-10 italic">Waiting for transactions...</div>
                        )}
                        {feed.map((event) => (
                            <div key={event.id} className="animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className={`p-3 rounded border-l-4 ${event.type === 'success' ? 'bg-green-900/10 border-green-500' : 'bg-red-900/10 border-red-500'
                                    }`}>
                                    <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                                        <span>{event.timestamp}</span>
                                        <span>{event.hash}</span>
                                    </div>
                                    <div className={event.type === 'success' ? 'text-green-300' : 'text-red-300 font-bold'}>
                                        {event.type === 'fail' && "⚠️ "}{event.msg}
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div ref={feedEndRef} />
                    </div>
                </aside>
            </div>

            {/* --- ANALYTICS FOOTER --- */}
            <footer className="bg-gray-800 border-t border-gray-700 p-4 flex items-center gap-8 text-sm">
                <div className="flex-1">
                    <div className="flex justify-between mb-1">
                        <span className="font-bold text-gray-300">Class Completion</span>
                        <span className="text-blue-400 font-bold">{progressPercentage}%</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-1000"
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                </div>
                <div className="border-l border-gray-600 pl-8">
                    <span className="block text-gray-500 text-xs uppercase font-bold">Session Volume</span>
                    <span className="text-xl font-bold text-white">4,250 XRP</span>
                </div>
                <div className="border-l border-gray-600 pl-8 pr-4">
                    <span className="block text-gray-500 text-xs uppercase font-bold">Active Nodes</span>
                    <span className="text-xl font-bold text-green-400">{members.filter(m => m.status === 'online').length}</span>
                </div>
            </footer>
        </div>
    );
}
