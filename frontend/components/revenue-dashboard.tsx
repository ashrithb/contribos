"use client";
import { formatUSD, truncateAddress, timeAgo } from "@/lib/utils";
import { getExplorerTxUrl } from "@/lib/kite-chain";
import type { FeedEvent, Contributor } from "@/lib/websocket";
import {
  DollarSign,
  TrendingUp,
  Activity,
  ExternalLink,
  Zap,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useMemo } from "react";

interface RevenueDashboardProps {
  events: FeedEvent[];
  totalRevenue: number;
  requestCount: number;
  contributors: Contributor[];
}

export function RevenueDashboard({
  events,
  totalRevenue,
  requestCount,
  contributors,
}: RevenueDashboardProps) {
  // Build chart data from payment events
  const chartData = useMemo(() => {
    const payments = events.filter((e) => e.type === "payment");
    let cumulative = 0;
    return payments.map((p) => {
      const amount = parseFloat((p.amount || "$0").replace("$", ""));
      cumulative += amount;
      return {
        time: new Date(p.timestamp).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
        revenue: parseFloat(cumulative.toFixed(2)),
      };
    });
  }, [events]);

  const recentPayments = events
    .filter((e) => e.type === "payment")
    .slice(-8)
    .reverse();

  const totalEarnings = contributors.reduce((s, c) => s + c.earnings, 0);

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <Activity size={18} className="text-primary" />
        <h2 className="font-semibold text-sm">Revenue Dashboard</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-muted p-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <DollarSign size={12} />
              Total Revenue
            </div>
            <div className="mt-1 text-xl font-bold text-payment">
              {formatUSD(totalRevenue)}
            </div>
          </div>
          <div className="rounded-lg bg-muted p-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <TrendingUp size={12} />
              API Requests
            </div>
            <div className="mt-1 text-xl font-bold text-primary">
              {requestCount}
            </div>
          </div>
        </div>

        {/* Revenue chart */}
        <div className="rounded-lg bg-muted p-3">
          <div className="mb-2 text-xs font-medium text-muted-foreground">
            Cumulative Revenue
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={120}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient
                    id="revenueGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="rgb(139, 92, 246)"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="rgb(139, 92, 246)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 10, fill: "#71717a" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#71717a" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `$${v}`}
                  width={40}
                />
                <Tooltip
                  contentStyle={{
                    background: "#1c1c22",
                    border: "1px solid #27272a",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, "Revenue"]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="rgb(139, 92, 246)"
                  strokeWidth={2}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[120px] items-center justify-center text-xs text-muted-foreground">
              Waiting for payments...
            </div>
          )}
        </div>

        {/* Contributor earnings breakdown */}
        <div className="rounded-lg bg-muted p-3">
          <div className="mb-2 text-xs font-medium text-muted-foreground">
            Earnings Distribution
          </div>
          <div className="space-y-2">
            {contributors.map((c) => {
              const pct =
                totalEarnings > 0 ? (c.earnings / totalEarnings) * 100 : c.weight;
              return (
                <div key={c.address}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-foreground/80">{c.name}</span>
                    <span className="text-payment font-medium">
                      {formatUSD(c.earnings)}
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 w-full rounded-full bg-background">
                    <div
                      className="h-1.5 rounded-full bg-primary/60 transition-all duration-500"
                      style={{ width: `${Math.max(pct, 2)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent transactions */}
        <div className="rounded-lg bg-muted p-3">
          <div className="mb-2 text-xs font-medium text-muted-foreground">
            Recent Transactions
          </div>
          {recentPayments.length === 0 ? (
            <div className="py-4 text-center text-xs text-muted-foreground">
              No transactions yet
            </div>
          ) : (
            <div className="space-y-2">
              {recentPayments.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-1.5">
                    <Zap size={10} className="text-payment" />
                    <span className="text-foreground/80">{p.endpoint}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-payment">
                      {p.amount}
                    </span>
                    {p.txHash && (
                      <a
                        href={getExplorerTxUrl(p.txHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        <ExternalLink size={10} />
                      </a>
                    )}
                    <span className="text-muted-foreground">
                      {timeAgo(p.timestamp)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
