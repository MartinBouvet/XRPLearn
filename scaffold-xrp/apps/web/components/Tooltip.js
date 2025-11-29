"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

export function Tooltip({ content, children }) {
    const [isVisible, setIsVisible] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const triggerRef = useRef(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleMouseEnter = () => {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const viewportWidth = window.innerWidth;

            // Default to top, unless too close to top (e.g. < 150px)
            const showBelow = rect.top < 150;

            // Horizontal Clamping
            const tooltipWidth = 256; // w-64 = 16rem = 256px
            const margin = 10;
            const triggerCenter = rect.left + rect.width / 2;
            const idealLeft = triggerCenter - tooltipWidth / 2;

            // Clamp left position to stay within screen
            const clampedLeft = Math.max(margin, Math.min(viewportWidth - tooltipWidth - margin, idealLeft));

            // Calculate arrow position relative to tooltip (to point at trigger center)
            const arrowOffset = triggerCenter - clampedLeft;

            setCoords({
                left: clampedLeft,
                top: rect.top,
                bottom: rect.bottom,
                showBelow,
                arrowOffset
            });
            setIsVisible(true);
        }
    };

    return (
        <div
            className="relative inline-block"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={() => setIsVisible(false)}
            ref={triggerRef}
        >
            {children}

            {isVisible && mounted && createPortal(
                <div
                    className="fixed z-[9999] w-64 animate-fade-in pointer-events-none"
                    style={{
                        left: coords.left,
                        // Removed translateX(-50%) because we are calculating explicit left
                        ...(coords.showBelow
                            ? {
                                top: coords.bottom + 10, // 10px gap below
                                bottom: 'auto',
                            }
                            : {
                                top: 'auto',
                                bottom: window.innerHeight - coords.top + 10, // 10px gap above
                            }
                        )
                    }}
                >
                    <div className="bg-gray-900/95 backdrop-blur-xl border border-blue-500/30 rounded-xl p-4 shadow-2xl relative">
                        {/* Arrow */}
                        {/* If showBelow, arrow points up (at top of tooltip). Else points down (at bottom). */}
                        <div
                            className={`absolute w-0 h-0 border-x-transparent border-[6px]
                            ${coords.showBelow
                                    ? 'border-b-gray-900/95 border-t-0 -top-[6px]'
                                    : 'border-t-gray-900/95 border-b-0 -bottom-[6px]'
                                }`}
                            style={{ left: coords.arrowOffset, transform: 'translateX(-50%)' }}
                        ></div>

                        {/* Border Arrow for glow effect */}
                        <div
                            className={`absolute w-0 h-0 border-x-transparent border-[7px] -z-10
                            ${coords.showBelow
                                    ? 'border-b-blue-500/30 border-t-0 -top-[7px]'
                                    : 'border-t-blue-500/30 border-b-0 -bottom-[7px]'
                                }`}
                            style={{ left: coords.arrowOffset, transform: 'translateX(-50%)' }}
                        ></div>

                        <div className="text-sm text-gray-300 leading-relaxed">
                            {content}
                        </div>

                        {/* Decorative glow */}
                        <div className="absolute inset-0 rounded-xl bg-blue-500/5 pointer-events-none"></div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
