"use client";
import { useEffect, useState } from "react";
import type { FeedEvent } from "@/lib/websocket";
import { Bot, Server, Landmark, Users, ArrowRight } from "lucide-react";

interface ValueFlowProps {
  lastPayment: FeedEvent | null;
  totalRevenue: number;
  requestCount: number;
}

export function ValueFlow({
  lastPayment,
  totalRevenue,
  requestCount,
}: ValueFlowProps) {
  const [animatingStep, setAnimatingStep] = useState<number | null>(null);

  // Animate the flow when a new payment comes in
  useEffect(() => {
    if (!lastPayment) return;
    setAnimatingStep(0);
    const t1 = setTimeout(() => setAnimatingStep(1), 400);
    const t2 = setTimeout(() => setAnimatingStep(2), 800);
    const t3 = setTimeout(() => setAnimatingStep(3), 1200);
    const t4 = setTimeout(() => setAnimatingStep(null), 2500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [lastPayment]);

  const steps = [
    {
      icon: Bot,
      label: "AI Agent",
      sublabel: "Discovers API",
      color: "purple",
    },
    {
      icon: Server,
      label: "x402 API",
      sublabel: lastPayment?.amount || "$0.05",
      color: "blue",
    },
    {
      icon: Landmark,
      label: "Splitter",
      sublabel: "On-chain",
      color: "amber",
    },
    {
      icon: Users,
      label: "Contributors",
      sublabel: `${requestCount} paid`,
      color: "emerald",
    },
  ];

  const colorMap: Record<string, string> = {
    purple: "text-purple-400 bg-purple-500/15 border-purple-500/30",
    blue: "text-blue-400 bg-blue-500/15 border-blue-500/30",
    amber: "text-amber-400 bg-amber-500/15 border-amber-500/30",
    emerald: "text-emerald-400 bg-emerald-500/15 border-emerald-500/30",
  };

  const activeColorMap: Record<string, string> = {
    purple: "text-purple-300 bg-purple-500/30 border-purple-400/60 shadow-[0_0_16px_rgba(168,85,247,0.3)]",
    blue: "text-blue-300 bg-blue-500/30 border-blue-400/60 shadow-[0_0_16px_rgba(59,130,246,0.3)]",
    amber: "text-amber-300 bg-amber-500/30 border-amber-400/60 shadow-[0_0_16px_rgba(245,158,11,0.3)]",
    emerald: "text-emerald-300 bg-emerald-500/30 border-emerald-400/60 shadow-[0_0_16px_rgba(16,185,129,0.3)]",
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          How Value Flows
        </h3>
        <span className="text-xs text-muted-foreground">
          Total: <span className="font-semibold text-emerald-400">${totalRevenue.toFixed(2)}</span>
        </span>
      </div>

      <div className="flex items-center justify-between gap-1">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-1 flex-1">
            {/* Step node */}
            <div
              className={`flex flex-col items-center gap-1.5 flex-1 rounded-lg border p-2.5 transition-all duration-300 ${
                animatingStep !== null && animatingStep >= i
                  ? activeColorMap[step.color]
                  : colorMap[step.color]
              }`}
            >
              <step.icon size={18} />
              <span className="text-[11px] font-semibold">{step.label}</span>
              <span className="text-[10px] opacity-70">{step.sublabel}</span>
            </div>

            {/* Arrow between steps */}
            {i < steps.length - 1 && (
              <div className="shrink-0">
                <ArrowRight
                  size={14}
                  className={`transition-all duration-300 ${
                    animatingStep !== null && animatingStep > i
                      ? "text-primary scale-125"
                      : "text-muted-foreground/40"
                  }`}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Live payment flash */}
      {animatingStep !== null && lastPayment && (
        <div className="mt-3 flex items-center justify-center gap-2 rounded-md bg-emerald-500/10 py-1.5 animate-fade-in">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-emerald-400">
            Payment {lastPayment.amount} flowing to {lastPayment.splits?.length || 4} contributors via x402
          </span>
        </div>
      )}
    </div>
  );
}
