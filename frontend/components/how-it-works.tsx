"use client";
import { useState } from "react";
import { ChevronDown, ChevronUp, Code2, Bot, DollarSign } from "lucide-react";

export function HowItWorks() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-border bg-card">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-muted/30 transition-colors"
      >
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          How ContribOS Works
        </span>
        {expanded ? (
          <ChevronUp size={14} className="text-muted-foreground" />
        ) : (
          <ChevronDown size={14} className="text-muted-foreground" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-border px-4 pb-4 pt-3 animate-fade-in">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-500/15 text-blue-400 text-xs font-bold">
                1
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <Code2 size={13} className="text-blue-400" />
                  <span className="text-sm font-medium">
                    Contributors push code
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Developers submit PRs. Each contributor has a weight in the
                  PaymentSplitter contract.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-purple-500/15 text-purple-400 text-xs font-bold">
                2
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <Bot size={13} className="text-purple-400" />
                  <span className="text-sm font-medium">
                    AI agents review & consume via x402
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Agents discover APIs, get HTTP 402, pay automatically via
                  the x402 protocol on Kite AI chain.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-bold">
                3
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <DollarSign size={13} className="text-emerald-400" />
                  <span className="text-sm font-medium">
                    Every API call = micropayment to contributors
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Payments land in the on-chain PaymentSplitter and are
                  automatically distributed by contributor weight.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
