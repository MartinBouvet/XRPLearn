"use client";

import { useEffect, useState } from "react";

export function BlockchainBackground() {
    const [cubes, setCubes] = useState([]);

    useEffect(() => {
        // Generate random cubes
        const newCubes = Array.from({ length: 15 }).map((_, i) => ({
            id: i,
            left: Math.random() * 100,
            top: Math.random() * 100,
            delay: Math.random() * 5,
            duration: 15 + Math.random() * 10,
            scale: 0.5 + Math.random() * 1,
        }));
        setCubes(newCubes);
    }, []);

    return (
        <div className="fixed inset-0 overflow-hidden -z-10 bg-[#0a0a0a]">
            {/* Grid Floor */}
            <div className="grid-floor"></div>

            {/* Ambient Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[100px]"></div>

            {/* Floating Cubes */}
            {cubes.map((cube) => (
                <div
                    key={cube.id}
                    className="absolute cube-container"
                    style={{
                        left: `${cube.left}%`,
                        top: `${cube.top}%`,
                        transform: `scale(${cube.scale})`,
                    }}
                >
                    <div
                        className="cube"
                        style={{
                            animationDuration: `${cube.duration}s`,
                            animationDelay: `-${cube.delay}s`
                        }}
                    >
                        <div className="cube-face cube-face-front">XRPL</div>
                        <div className="cube-face cube-face-back"></div>
                        <div className="cube-face cube-face-right"></div>
                        <div className="cube-face cube-face-left"></div>
                        <div className="cube-face cube-face-top"></div>
                        <div className="cube-face cube-face-bottom"></div>
                    </div>
                </div>
            ))}

            {/* Scanlines Overlay */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%]"></div>
        </div>
    );
}
