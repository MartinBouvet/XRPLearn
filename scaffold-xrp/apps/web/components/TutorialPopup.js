"use client";

import { useState, useEffect } from "react";

export function TutorialPopup({ title, content, onNext, onClose, isOpen }) {
    if (!isOpen) return null;

    // Simplified positioning: Always center with blur, but account for sidebar (pr-80)
    const containerClasses = "fixed inset-0 z-50 flex items-center justify-center pr-80 bg-black/60 backdrop-blur-md animate-fade-in";

    return (
        <div className={containerClasses}>
            <div className={`
                relative max-w-xl w-full 
                bg-white/90 dark:bg-gray-900/80 backdrop-blur-xl 
                border border-primary/30 dark:border-primary/30 
                rounded-2xl p-1 
                shadow-2xl dark:shadow-[0_0_50px_rgba(139,83,254,0.2)]
            `}>
                {/* Glowing Border Container */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 animate-pulse-glow -z-10"></div>

                {/* Inner Content */}
                <div className="bg-gray-50/90 dark:bg-gray-900/90 rounded-xl p-6 overflow-hidden relative">
                    {/* Tech Accents */}
                    <div className="absolute top-0 left-0 w-20 h-1 bg-gradient-to-r from-primary to-transparent"></div>
                    <div className="absolute bottom-0 right-0 w-20 h-1 bg-gradient-to-l from-secondary to-transparent"></div>
                    <div className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-bl-lg"></div>
                    <div className="absolute bottom-0 left-0 w-2 h-2 bg-secondary rounded-tr-lg"></div>

                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/50">
                                <span className="text-primary text-lg">ℹ️</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-wide">
                                {title}
                            </h3>
                        </div>
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="text-gray-500 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    <div className="prose prose-invert max-w-none mb-6 text-gray-600 dark:text-gray-300 text-base leading-relaxed pl-11">
                        {content}
                    </div>

                    <div className="flex justify-end gap-3 pl-11">
                        <button
                            onClick={onNext}
                            className="
                                group relative px-6 py-2.5 
                                bg-gradient-to-r from-primary to-purple-600 
                                hover:from-purple-600 hover:to-primary 
                                text-white font-bold rounded-lg 
                                shadow-lg shadow-primary/30 
                                transform transition-all hover:scale-[1.02] active:scale-[0.98]
                                flex items-center gap-2
                            "
                        >
                            <span>Continue</span>
                            <span className="group-hover:translate-x-1 transition-transform">→</span>

                            {/* Button Glow */}
                            <div className="absolute inset-0 rounded-lg bg-white/20 blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
