import { Tooltip } from "./Tooltip";
import { useWallet } from "./providers/WalletProvider";

export function ExplorerSidebar({ wallet, balance, inventory }) {
    const { logs } = useWallet();
    return (
        <div className="fixed right-0 top-0 h-full w-80 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 flex flex-col shadow-2xl z-50 transition-colors duration-300">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 backdrop-blur">
                <Tooltip content="This is the Ledger. It records every transaction permanently. In a real blockchain, this history is shared by thousands of computers.">
                    <h3 className="text-green-400 font-bold text-lg cursor-help">
                        &gt; XRPL Explorer
                    </h3>
                </Tooltip>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-sm">
                {logs.length === 0 && (
                    <div className="text-gray-600 italic">Waiting for network activity...</div>
                )}
                {logs.map((log, index) => (
                    <div key={index} className="animate-fade-in border-l-2 border-gray-200 dark:border-gray-700 pl-2 py-1">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>{log.time}</span>
                            <span className={`font-bold ${log.type === 'tx' ? 'text-yellow-500' :
                                log.type === 'success' ? 'text-green-400' :
                                    log.type === 'error' ? 'text-red-400' : 'text-blue-400'
                                }`}>
                                {log.type.toUpperCase()}
                            </span>
                        </div>
                        <div className="text-gray-600 dark:text-gray-300 break-words">
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
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-md">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="font-bold text-gray-200 text-sm uppercase tracking-wider">Active Session</span>
                    </div>

                    <div className="bg-white dark:bg-gray-900/50 p-2 rounded border border-gray-200 dark:border-gray-700 space-y-2">
                        <Tooltip content="Your Public Address (r...). Think of it like your email address or mailbox. It's safe to share this with anyone to receive funds.">
                            <div className="bg-white dark:bg-gray-900/50 p-2 rounded border border-gray-200 dark:border-gray-700 cursor-help transition-colors hover:border-blue-500/50">
                                <div className="text-[10px] text-gray-500 uppercase mb-1">Public Address</div>
                                <div className="font-mono text-blue-600 dark:text-blue-300 text-xs truncate select-all" title={wallet.address}>
                                    {wallet.address}
                                </div>
                            </div>
                        </Tooltip>

                        <div className="bg-gray-900/50 p-2 rounded border border-gray-700 space-y-2">
                            <Tooltip content="Your Balance in XRP. 1 XRP = 1,000,000 Drops. You need a small reserve (usually 10 XRP) to keep your account active on the ledger.">
                                <div className="flex justify-between items-center cursor-help transition-colors hover:border-yellow-500/50">
                                    <div className="text-[10px] text-gray-500 uppercase">XRP (Yellow)</div>
                                    <div className="font-bold text-yellow-600 dark:text-yellow-400 text-sm">
                                        {typeof balance === 'number' ? balance.toFixed(2) : balance} <span className="text-[10px] text-gray-500 dark:text-gray-400 font-normal">YC</span>
                                    </div>
                                </div>
                            </Tooltip>

                            {inventory && Object.entries(inventory).map(([color, amount]) => (
                                amount > 0 && (
                                    <div key={color} className="flex justify-between items-center border-t border-gray-200 dark:border-gray-800 pt-1">
                                        <div className="text-[10px] text-gray-500 uppercase">{color} Coin</div>
                                        <div className={`font-bold text-${color}-400 text-sm`}>
                                            {amount} <span className="text-[10px] text-gray-400 font-normal">RC</span>
                                        </div>
                                    </div>
                                )
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
