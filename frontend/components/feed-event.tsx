"use client";
import { formatTimestamp, truncateAddress } from "@/lib/utils";
import { getExplorerTxUrl } from "@/lib/kite-chain";
import type { FeedEvent } from "@/lib/websocket";
import {
  GitPullRequest,
  Bot,
  Zap,
  MessageSquare,
  Info,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  FileCode2,
  Plus,
  Minus,
} from "lucide-react";

interface FeedEventCardProps {
  event: FeedEvent;
  isChainStart?: boolean;
  isChainMiddle?: boolean;
  isChainEnd?: boolean;
}

export function FeedEventCard({
  event,
  isChainStart,
  isChainMiddle,
  isChainEnd,
}: FeedEventCardProps) {
  const hasChain = isChainStart || isChainMiddle || isChainEnd;

  return (
    <div className="relative">
      {/* Chain connector line */}
      {hasChain && (
        <div
          className={`absolute left-7 w-0.5 bg-primary/20 ${
            isChainStart
              ? "top-10 bottom-0"
              : isChainEnd
                ? "top-0 h-4"
                : "top-0 bottom-0"
          }`}
        />
      )}

      <div className="animate-fade-in relative">
        {event.type === "code_push" && <CodePushCard event={event} />}
        {event.type === "agent_review" && <AgentReviewCard event={event} />}
        {event.type === "payment" && <PaymentCard event={event} />}
        {event.type === "message" && <MessageCard event={event} />}
        {event.type === "system" && <SystemCard event={event} />}
      </div>
    </div>
  );
}

function CodePushCard({ event }: { event: FeedEvent }) {
  return (
    <div className="mx-3 my-2 rounded-lg border border-blue-500/20 bg-blue-500/5 p-3">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-blue-400">
          <GitPullRequest size={15} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-blue-400 text-sm">
              {event.senderName}
            </span>
            <span className="text-xs text-muted-foreground">pushed</span>
            <span className="font-mono text-xs font-medium text-foreground bg-muted px-1.5 py-0.5 rounded">
              PR #{event.prNumber}
            </span>
            <span className="ml-auto text-xs text-muted-foreground">
              {formatTimestamp(event.timestamp)}
            </span>
          </div>
          <p className="mt-1 text-sm font-medium text-foreground/90">
            {event.prTitle}
          </p>
          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <FileCode2 size={11} />
              {event.filesChanged} files
            </span>
            <span className="flex items-center gap-1 text-green-400">
              <Plus size={11} />
              {event.additions}
            </span>
            <span className="flex items-center gap-1 text-red-400">
              <Minus size={11} />
              {event.deletions}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function AgentReviewCard({ event }: { event: FeedEvent }) {
  const isApproved = event.reviewResult === "approved";
  return (
    <div className="mx-3 my-2 rounded-lg border border-purple-500/20 bg-purple-500/5 p-3">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-purple-400">
          <Bot size={15} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-purple-400 text-sm">
              {event.senderName}
            </span>
            <span className="rounded bg-purple-500/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-purple-400/70">
              AI Agent
            </span>
            <span className="text-xs text-muted-foreground">reviewed</span>
            <span className="font-mono text-xs font-medium text-foreground bg-muted px-1.5 py-0.5 rounded">
              PR #{event.linkedPrNumber}
            </span>
            <span className="ml-auto text-xs text-muted-foreground">
              {formatTimestamp(event.timestamp)}
            </span>
          </div>

          {/* Verdict badge */}
          <div className="mt-2 flex items-center gap-2">
            {isApproved ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-500/15 px-2.5 py-1 text-xs font-medium text-green-400">
                <CheckCircle2 size={12} />
                {event.reviewSummary}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/15 px-2.5 py-1 text-xs font-medium text-yellow-400">
                <AlertCircle size={12} />
                {event.reviewSummary}
              </span>
            )}
          </div>

          <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
            {event.content}
          </p>
        </div>
      </div>
    </div>
  );
}

function PaymentCard({ event }: { event: FeedEvent }) {
  return (
    <div className="mx-3 my-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
          <Zap size={15} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-emerald-400">
              {event.amount}
            </span>
            <span className="text-xs text-muted-foreground">
              paid via x402 for
            </span>
            <span className="font-mono text-xs text-foreground/80">
              {event.endpoint}
            </span>
            <span className="ml-auto text-xs text-muted-foreground">
              {formatTimestamp(event.timestamp)}
            </span>
          </div>

          {/* Split breakdown */}
          {event.splits && event.splits.length > 0 && (
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              {event.splits.map((split) => (
                <div
                  key={split.address}
                  className="flex items-center justify-between rounded bg-emerald-500/10 px-2 py-1"
                >
                  <span className="text-xs text-emerald-300/80">
                    {split.name}
                  </span>
                  <span className="text-xs font-medium text-emerald-400">
                    {split.amount}
                  </span>
                </div>
              ))}
            </div>
          )}

          {event.txHash && (
            <div className="mt-2">
              <a
                href={getExplorerTxUrl(event.txHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-emerald-400 transition-colors"
              >
                tx: {truncateAddress(event.txHash)}
                <ExternalLink size={10} />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MessageCard({ event }: { event: FeedEvent }) {
  return (
    <div className="flex gap-3 px-4 py-2.5 hover:bg-muted/30 transition-colors">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500/15 text-blue-400">
        <MessageSquare size={13} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="font-semibold text-blue-400 text-sm">
            {event.senderName}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatTimestamp(event.timestamp)}
          </span>
        </div>
        <p className="mt-0.5 text-sm text-foreground/80">{event.content}</p>
      </div>
    </div>
  );
}

function SystemCard({ event }: { event: FeedEvent }) {
  return (
    <div className="flex items-center justify-center gap-2 py-2 px-4">
      <div className="h-px flex-1 bg-border" />
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Info size={11} />
        {event.content}
      </div>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}
