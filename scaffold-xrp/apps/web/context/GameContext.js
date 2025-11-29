"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { Wallet } from "xrpl";

const GameContext = createContext();

export function GameProvider({ children }) {
    const [gameState, setGameState] = useState({
        currentLevel: 1,
        username: "",
        wallet: null,
        balance: { yellow: 0, red: 0 },
        badges: [],
        history: [],
    });

    useEffect(() => {
        const storedUsername = localStorage.getItem("xrpl_username");
        if (storedUsername) {
            setGameState((prev) => ({ ...prev, username: storedUsername }));
        }
    }, []);

    const generateWallet = () => {
        const wallet = Wallet.generate();
        setGameState((prev) => ({
            ...prev,
            wallet: { address: wallet.address, seed: wallet.seed },
        }));
        return wallet;
    };

    const claimFaucet = () => {
        setGameState((prev) => ({
            ...prev,
            balance: { ...prev.balance, yellow: 100 },
            history: [...prev.history, { type: "CLAIM", amount: 100, token: "YELLOW", hash: "FAUCET_" + Date.now() }],
        }));
    };

    const swapTokens = () => {
        if (gameState.balance.yellow < 100) return false;
        setGameState((prev) => ({
            ...prev,
            balance: { yellow: 0, red: 100 },
            history: [...prev.history, { type: "SWAP", from: "YELLOW", to: "RED", amount: 100, hash: "SWAP_" + Date.now() }],
        }));
        return true;
    };

    const payDoor = () => {
        if (gameState.balance.red < 100) return false;
        setGameState((prev) => ({
            ...prev,
            balance: { ...prev.balance, red: 0 },
            history: [...prev.history, { type: "PAYMENT", amount: 100, token: "RED", hash: "DOOR_" + Date.now() }],
        }));
        return true;
    };

    const awardBadge = (badgeName) => {
        if (!gameState.badges.includes(badgeName)) {
            setGameState((prev) => ({ ...prev, badges: [...prev.badges, badgeName] }));
        }
    };

    const nextLevel = () => {
        setGameState((prev) => ({ ...prev, currentLevel: prev.currentLevel + 1 }));
    };

    return (
        <GameContext.Provider value={{ gameState, generateWallet, claimFaucet, swapTokens, payDoor, awardBadge, nextLevel }}>
            {children}
        </GameContext.Provider>
    );
}

export function useGame() {
    return useContext(GameContext);
}
