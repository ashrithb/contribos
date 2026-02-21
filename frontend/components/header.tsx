"use client";
import { Boxes, Github, ExternalLink } from "lucide-react";
import { KITE_TESTNET } from "@/lib/kite-chain";

interface HeaderProps {
  splitterAddress?: string;
}

export function Header({ splitterAddress }: HeaderProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-6">
      {/* Left: Logo */}
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
          <Boxes size={18} className="text-primary" />
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-tight">ContribOS</h1>
          <p className="text-[10px] text-muted-foreground">
            Where Open Source Gets Paid
          </p>
        </div>
      </div>

      {/* Center: Chain info */}
      <div className="hidden md:flex items-center gap-4">
        <div className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1">
          <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
          <span className="text-xs text-muted-foreground">
            {KITE_TESTNET.name}
          </span>
        </div>
        {splitterAddress && splitterAddress !== "0x0000000000000000000000000000000000000000" && (
          <a
            href={`${KITE_TESTNET.explorerUrl}/address/${splitterAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            Splitter: {splitterAddress.slice(0, 6)}...{splitterAddress.slice(-4)}
            <ExternalLink size={10} />
          </a>
        )}
      </div>

      {/* Right: Links */}
      <div className="flex items-center gap-3">
        <a
          href="https://faucet.gokite.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md bg-muted px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Faucet
        </a>
        <a
          href="https://github.com/ashrithb"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-md bg-primary/20 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/30 transition-colors"
        >
          <Github size={14} />
          GitHub
        </a>
      </div>
    </header>
  );
}
