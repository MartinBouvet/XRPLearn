"use client";

import { WalletConnector } from "./WalletConnector";
import Image from "next/image";
import { useWalletManager } from "../hooks/useWalletManager";
import { useWallet } from "./providers/WalletProvider";

export function Header() {
  useWalletManager();
  const { statusMessage } = useWallet();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface-glass dark:bg-surface-glassDark backdrop-blur-xl border-b border-black/5 dark:border-white/5 transition-all duration-300">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="relative h-10 w-40 transition-transform duration-300 hover:scale-105">
              <Image
                src="/logo.png"
                alt="UnBlock Logo"
                fill
                className="object-contain dark:hidden"
                priority
              />
              <Image
                src="/logo-dark.png"
                alt="UnBlock Logo"
                fill
                className="object-contain hidden dark:block"
                priority
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {statusMessage && (
              <div
                className={`text-sm px-3 py-1 rounded-lg ${statusMessage.type === "success"
                  ? "bg-green-50 text-green-700"
                  : statusMessage.type === "error"
                    ? "bg-red-50 text-red-700"
                    : statusMessage.type === "warning"
                      ? "bg-yellow-50 text-yellow-700"
                      : "bg-primary/10 text-primary"
                  }`}
              >
                {statusMessage.message}
              </div>
            )}
            <a
              href="/admin"
              className="text-xs font-bold tracking-widest uppercase text-content-secondary hover:text-primary dark:text-content-muted dark:hover:text-content-light transition-colors"
            >
              Admin
            </a>
            <WalletConnector />
          </div>
        </div>
      </div>
    </header>
  );
}
