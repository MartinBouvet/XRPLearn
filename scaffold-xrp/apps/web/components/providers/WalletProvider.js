"use client";

import { createContext, useContext, useState, useCallback } from "react";

const WalletContext = createContext(undefined);

export function WalletProvider({ children }) {
  const [walletManager, setWalletManagerState] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [accountInfo, setAccountInfo] = useState(null);
  const [logs, setLogs] = useState([]);
  const [statusMessage, setStatusMessage] = useState(null);

  const setWalletManager = useCallback((manager) => {
    setWalletManagerState(manager);
  }, []);

  const addLog = useCallback((message, type = "info", hash = null) => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [{ time, message, type, hash }, ...prev]);
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const showStatus = useCallback((message, type) => {
    setStatusMessage({ message, type });
    setTimeout(() => {
      setStatusMessage(null);
    }, 5000);
  }, []);

  return (
    <WalletContext.Provider
      value={{
        walletManager,
        isConnected,
        accountInfo,
        logs,
        statusMessage,
        setWalletManager,
        setIsConnected,
        setAccountInfo,
        addLog,
        clearLogs,
        showStatus,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
