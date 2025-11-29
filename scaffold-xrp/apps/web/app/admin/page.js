"use client";

import { useWallet } from "../../components/providers/WalletProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminDashboard() {
    const { members } = useWallet();
    const router = useRouter();

    useEffect(() => {
        // Basic protection: if not logged in as admin (checked via localStorage for simplicity in this demo)
        const username = localStorage.getItem("xrpl_username");
        if (username?.toLowerCase() !== "admin") {
            router.push("/");
        }
    }, [router]);

    return (
        <main className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-12">
                    <h1 className="text-4xl font-bold text-red-500">Admin Dashboard 🛠️</h1>
                    <button
                        onClick={() => router.push("/")}
                        className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded text-gray-300"
                    >
                        Logout
                    </button>
                </div>

                <div className="bg-gray-800 rounded-xl overflow-hidden shadow-2xl border border-gray-700">
                    <div className="p-6 border-b border-gray-700 bg-gray-800/50">
                        <h2 className="text-2xl font-bold flex items-center gap-3">
                            <span>👥</span> Connected Users ({members.length})
                        </h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-900/50 text-gray-400 uppercase text-xs font-bold">
                                <tr>
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Public Address (Wallet)</th>
                                    <th className="px-6 py-4">Progress / Level</th>
                                    <th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {members.map((member, index) => (
                                    <tr key={index} className="hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="text-2xl bg-gray-700 rounded-full w-10 h-10 flex items-center justify-center">
                                                    {member.avatar || "👤"}
                                                </div>
                                                <span className="font-bold text-lg">{member.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-gray-300 text-sm">
                                            {member.address}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${member.level?.includes("Guardian") ? "bg-green-900/30 text-green-400 border-green-500/30" :
                                                    member.level?.includes("Trader") ? "bg-purple-900/30 text-purple-400 border-purple-500/30" :
                                                        member.level?.includes("Novice") ? "bg-blue-900/30 text-blue-400 border-blue-500/30" :
                                                            "bg-gray-700 text-gray-400 border-gray-600"
                                                }`}>
                                                {member.level || "Unknown"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${member.status === 'online' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></div>
                                                <span className="text-sm text-gray-300 capitalize">{member.status}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </main>
    );
}
