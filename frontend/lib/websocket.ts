"use client";
import { useEffect, useRef, useCallback, useState } from "react";

export type EventType =
  | "code_push"
  | "agent_review"
  | "payment"
  | "message"
  | "system";

export interface FeedEvent {
  id: string;
  type: EventType;
  timestamp: number;
  sender: string;
  senderName: string;
  content: string;
  prNumber?: number;
  prTitle?: string;
  filesChanged?: number;
  additions?: number;
  deletions?: number;
  reviewResult?: "approved" | "changes_requested" | "comment";
  reviewSummary?: string;
  linkedPrNumber?: number;
  linkedPrTitle?: string;
  amount?: string;
  endpoint?: string;
  txHash?: string;
  splits?: { address: string; name: string; amount: string }[];
  chainId?: string;
}

export interface Contributor {
  address: string;
  name: string;
  role: string;
  weight: number;
  earnings: number;
  avatar: string;
  prs: number;
  reviews: number;
}

export interface StatsUpdate {
  totalRevenue: number;
  requestCount: number;
  contributors: Contributor[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
// Derive WebSocket URL from API URL (http→ws, https→wss)
const WS_URL =
  process.env.NEXT_PUBLIC_WS_URL ||
  API_URL.replace(/^http/, "ws") + "/ws";

export function useContribOS() {
  const [events, setEvents] = useState<FeedEvent[]>([]);
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [requestCount, setRequestCount] = useState(0);
  const [connected, setConnected] = useState(false);
  const [lastPayment, setLastPayment] = useState<FeedEvent | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<NodeJS.Timeout | null>(null);

  const fetchInitialData = useCallback(async () => {
    try {
      const [feedRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/api/feed`),
        fetch(`${API_URL}/api/stats`),
      ]);
      if (feedRes.ok) {
        const feedData = await feedRes.json();
        setEvents(feedData.events || []);
      }
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setContributors(statsData.contributors || []);
        setTotalRevenue(statsData.totalRevenue || 0);
        setRequestCount(statsData.requestCount || 0);
      }
    } catch (e) {
      console.warn("Failed to fetch initial data:", e);
    }
  }, []);

  const connectWS = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === "event") {
            setEvents((prev) => [...prev, data.event]);
            if (data.event.type === "payment") {
              setLastPayment(data.event);
            }
          }

          if (data.type === "stats_update") {
            setContributors(data.contributors || []);
            setTotalRevenue(data.totalRevenue || 0);
            setRequestCount(data.requestCount || 0);
          }
        } catch {}
      };

      ws.onclose = () => {
        setConnected(false);
        reconnectTimer.current = setTimeout(connectWS, 3000);
      };

      ws.onerror = () => {
        ws.close();
      };
    } catch {
      reconnectTimer.current = setTimeout(connectWS, 3000);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
    connectWS();
    return () => {
      wsRef.current?.close();
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    };
  }, [fetchInitialData, connectWS]);

  return {
    events,
    contributors,
    totalRevenue,
    requestCount,
    connected,
    lastPayment,
  };
}
