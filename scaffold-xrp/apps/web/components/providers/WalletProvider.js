"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { Wallet } from "xrpl";

const WalletContext = createContext(undefined);

export function WalletProvider({ children }) {
  const [walletManager, setWalletManagerState] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [accountInfo, setAccountInfo] = useState(null);
  const [logs, setLogs] = useState([]);
  const [statusMessage, setStatusMessage] = useState(null);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    // Initialize Simulation Members
    const storedMembers = localStorage.getItem("simulation_members");
    if (storedMembers) {
      setMembers(JSON.parse(storedMembers));
    } else {
      const fakeMembers = [
        { name: "CryptoKing", address: Wallet.generate().address, avatar: "👑", level: "Guardian (Lvl 3)", status: "online" },
        { name: "XRP_Fan", address: Wallet.generate().address, avatar: "🚀", level: "Trader (Lvl 2)", status: "away" },
        { name: "LedgerMaster", address: Wallet.generate().address, avatar: "📒", level: "Novice (Lvl 1)", status: "online" },
        { name: "ToTheMoon", address: Wallet.generate().address, avatar: "🌙", level: "Guardian (Lvl 3)", status: "online" },
        { name: "SatoshiNakamoto", address: Wallet.generate().address, avatar: "🕵️", level: "Admin", status: "busy" },
        { name: "Vitalik", address: Wallet.generate().address, avatar: "🦄", level: "Trader (Lvl 2)", status: "online" },
      ];
      localStorage.setItem("simulation_members", JSON.stringify(fakeMembers));
      setMembers(fakeMembers);
    }
  }, []);

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

  const resetMembers = useCallback(() => {
    localStorage.removeItem("simulation_members");
    setMembers([]);
  }, []);

  return (
    <WalletContext.Provider
      value={{
        walletManager,
        isConnected,
        accountInfo,
        logs,
        statusMessage,
        members,
        setWalletManager,
        setIsConnected,
        setAccountInfo,
        addLog,
        clearLogs,
        showStatus,
        resetMembers,
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
