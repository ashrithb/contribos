"use client";
import { truncateAddress, formatUSD } from "@/lib/utils";
import { getExplorerAddressUrl } from "@/lib/kite-chain";
import type { Contributor } from "@/lib/websocket";
import {
  Users,
  Trophy,
  ExternalLink,
  Bot,
  GitPullRequest,
  Eye,
} from "lucide-react";
import { useState } from "react";

interface ContributorSidebarProps {
  contributors: Contributor[];
}

export function ContributorSidebar({ contributors }: ContributorSidebarProps) {
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const sorted = [...contributors].sort((a, b) => b.earnings - a.earnings);
  const displayList = showLeaderboard ? sorted : contributors;
  const totalEarnings = contributors.reduce((s, c) => s + c.earnings, 0);

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Users size={18} className="text-primary" />
          <h2 className="font-semibold text-sm">Contributors</h2>
          <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
            {contributors.length}
          </span>
        </div>
        <button
          onClick={() => setShowLeaderboard(!showLeaderboard)}
          className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors ${
            showLeaderboard
              ? "bg-amber-500/20 text-amber-400"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          <Trophy size={12} />
          {showLeaderboard ? "Ranked" : "Rank"}
        </button>
      </div>

      {/* Contributor list */}
      <div className="flex-1 overflow-y-auto">
        {displayList.map((contributor, index) => {
          const earningsPct =
            totalEarnings > 0
              ? (contributor.earnings / totalEarnings) * 100
              : contributor.weight;
          const isAgent = contributor.name === "Agent-Reviewer";

          return (
            <div
              key={contributor.address}
              className="border-b border-border/50 px-4 py-3 hover:bg-muted/30 transition-colors"
            >
              {/* Top row: avatar, name, earnings */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${
                      isAgent
                        ? "bg-purple-500/20 text-purple-400"
                        : "bg-primary/20 text-primary"
                    }`}
                  >
                    {showLeaderboard ? (
                      <span className="text-xs">{`#${index + 1}`}</span>
                    ) : isAgent ? (
                      <Bot size={16} />
                    ) : (
                      contributor.avatar
                    )}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card bg-emerald-400" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium truncate">
                      {contributor.name}
                    </span>
                    {isAgent && (
                      <span className="rounded bg-purple-500/10 px-1 py-0.5 text-[9px] font-medium uppercase tracking-wider text-purple-400/70">
                        AI
                      </span>
                    )}
                    <span className="ml-auto text-sm font-semibold text-emerald-400">
                      {formatUSD(contributor.earnings)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <a
                      href={getExplorerAddressUrl(contributor.address)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-muted-foreground hover:text-primary transition-colors flex items-center gap-0.5"
                    >
                      {truncateAddress(contributor.address)}
                      <ExternalLink size={8} />
                    </a>
                    <span className="text-[11px] text-muted-foreground">
                      &middot; {contributor.weight}% weight
                    </span>
                  </div>
                </div>
              </div>

              {/* Activity stats */}
              <div className="mt-2 flex items-center gap-3 pl-12">
                <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <GitPullRequest size={10} className="text-blue-400" />
                  {contributor.prs} PRs
                </span>
                <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Eye size={10} className="text-purple-400" />
                  {contributor.reviews} reviews
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {contributor.role}
                </span>
              </div>

              {/* Earnings bar */}
              <div className="mt-1.5 pl-12">
                <div className="h-1 w-full rounded-full bg-muted">
                  <div
                    className="h-1 rounded-full bg-emerald-500/60 transition-all duration-700"
                    style={{ width: `${Math.max(earningsPct, 3)}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer summary */}
      <div className="border-t border-border px-4 py-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            Splits via PaymentSplitter on Kite AI
          </span>
          <span className="font-semibold text-emerald-400">
            {formatUSD(totalEarnings)} total
          </span>
        </div>
      </div>
    </div>
  );
}
