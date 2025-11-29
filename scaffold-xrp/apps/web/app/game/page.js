"use client";

import { GameProvider, useGame } from "../../context/GameContext";
import Level1_Identity from "../../components/game/Level1_Identity";
import Level2_Transaction from "../../components/game/Level2_Transaction";
import Level3_Blockchain from "../../components/game/Level3_Blockchain";

function GameContainer() {
    const { gameState } = useGame();

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4">
            <header className="flex justify-between items-center mb-8 border-b border-gray-700 pb-4">
                <h1 className="text-xl font-bold">Niveau {gameState.currentLevel}/3</h1>
                <div className="font-bold text-blue-400">{gameState.username}</div>
            </header>
            <main>
                {gameState.currentLevel === 1 && <Level1_Identity />}
                {gameState.currentLevel === 2 && <Level2_Transaction />}
                {gameState.currentLevel === 3 && <Level3_Blockchain />}
            </main>
        </div>
    );
}

export default function GamePage() {
    return (
        <GameProvider>
            <GameContainer />
        </GameProvider>
    );
}
