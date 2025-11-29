import { WalletIcon } from "./WalletIcon";

export function ExplorerSidebar({ logs, wallet, balance }) {
    return (
        <div className="fixed right-0 top-0 h-full w-80 bg-gray-900 border-l border-gray-700 flex flex-col shadow-2xl z-50">
            <div className="p-4 border-b border-gray-700 bg-gray-900/50 backdrop-blur">
                <h3 className="text-green-400 font-bold text-lg">
                    &gt; XRPL Explorer
                </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-sm">
                {logs.length === 0 && (
                    <div className="text-gray-600 italic">Waiting for network activity...</div>
                )}
                {logs.map((log, index) => (
                    <div key={index} className="animate-fade-in border-l-2 border-gray-700 pl-2 py-1">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>{log.time}</span>
                            <span className={`font-bold ${log.type === 'tx' ? 'text-yellow-500' :
                                    log.type === 'success' ? 'text-green-400' :
                                        log.type === 'error' ? 'text-red-400' : 'text-blue-400'
                                }`}>
                                {log.type.toUpperCase()}
                            </span>
                        </div>
                        <div className="text-gray-300 break-words">
                            {log.message}
                        </div>
                        {log.hash && (
                            <div className="text-xs text-gray-600 mt-1 truncate font-mono">
                                Hash: {log.hash}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {wallet && (
                <div className="p-4 border-t border-gray-700 bg-gray-800/50 backdrop-blur-md">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="font-bold text-gray-200 text-sm uppercase tracking-wider">Active Session</span>
                    </div>

                    <div className="space-y-3">
                        <div className="bg-gray-900/50 p-2 rounded border border-gray-700">
                            <div className="text-[10px] text-gray-500 uppercase mb-1">Public Address</div>
                            <div className="font-mono text-blue-300 text-xs truncate select-all" title={wallet.address}>
                                {wallet.address}
                            </div>
                        </div>

                        <div className="bg-gray-900/50 p-2 rounded border border-gray-700 flex justify-between items-center">
                            <div className="text-[10px] text-gray-500 uppercase">Balance</div>
                            <div className="font-bold text-yellow-400 text-sm">
                                {balance} <span className="text-[10px] text-gray-400 font-normal">YC</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
