"use client";
import { useEffect, useRef, useMemo } from "react";
import { FeedEventCard } from "./feed-event";
import type { FeedEvent } from "@/lib/websocket";
import { Hash, Wifi, WifiOff } from "lucide-react";

interface ChannelFeedProps {
  events: FeedEvent[];
  connected: boolean;
}

export function ChannelFeed({ events, connected }: ChannelFeedProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events]);

  // Compute chain positions for each event
  const chainPositions = useMemo(() => {
    const positions = new Map<
      string,
      { isStart: boolean; isMiddle: boolean; isEnd: boolean }
    >();

    // Group events by chainId
    const chains = new Map<string, number[]>();
    events.forEach((e, i) => {
      if (e.chainId) {
        if (!chains.has(e.chainId)) chains.set(e.chainId, []);
        chains.get(e.chainId)!.push(i);
      }
    });

    // Mark positions
    for (const [, indices] of chains) {
      if (indices.length < 2) continue;
      indices.forEach((idx, pos) => {
        positions.set(events[idx].id, {
          isStart: pos === 0,
          isEnd: pos === indices.length - 1,
          isMiddle: pos > 0 && pos < indices.length - 1,
        });
      });
    }

    return positions;
  }, [events]);

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card">
      {/* Channel header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Hash size={18} className="text-primary" />
          <h2 className="font-semibold text-sm">Activity Feed</h2>
          <span className="text-xs text-muted-foreground">
            Code &rarr; Review &rarr; Payment
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {connected ? (
            <>
              <Wifi size={14} className="text-emerald-400" />
              <span className="text-xs text-emerald-400">Live</span>
            </>
          ) : (
            <>
              <WifiOff size={14} className="text-amber-400" />
              <span className="text-xs text-amber-400">Connecting...</span>
            </>
          )}
        </div>
      </div>

      {/* Event feed */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto py-1">
        {events.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No events yet. Start the server and agent to see activity.
          </div>
        ) : (
          events.map((event) => {
            const pos = chainPositions.get(event.id);
            return (
              <FeedEventCard
                key={event.id}
                event={event}
                isChainStart={pos?.isStart}
                isChainMiddle={pos?.isMiddle}
                isChainEnd={pos?.isEnd}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
