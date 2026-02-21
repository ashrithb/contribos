import express from "express";
import cors from "cors";
import { WebSocketServer, WebSocket } from "ws";
import http from "http";
import dotenv from "dotenv";
import {
  contributors,
  seedEvents,
  codeSnippets,
  textToSummarize,
  prTemplates,
  reviewTemplates,
  createEventId,
  createChainId,
  generateMockTxHash,
  nextPrNumber,
  type FeedEvent,
  type Contributor,
} from "./seed-data";

dotenv.config({ path: "../../.env" });
dotenv.config({ path: "../.env" });
dotenv.config();

const PORT = parseInt(process.env.PORT || "4000");
const SPLITTER_ADDRESS =
  process.env.SPLITTER_ADDRESS || "0x0000000000000000000000000000000000000000";
const FACILITATOR_URL =
  process.env.FACILITATOR_URL || "https://facilitator.pieverse.io";
const TEST_USDT_ADDRESS =
  process.env.TEST_USDT_ADDRESS ||
  "0x0fF5393387ad2f9f691FD6Fd28e07E3969e27e63";

// ── In-memory state ──────────────────────────────────────────────────────────
const events: FeedEvent[] = [...seedEvents];
const contributorState: Contributor[] = JSON.parse(
  JSON.stringify(contributors)
);
// Pre-seed contributor stats from seed events
for (const e of seedEvents) {
  if (e.type === "code_push") {
    const c = contributorState.find((c) => c.address === e.sender);
    if (c) c.prs++;
  }
  if (e.type === "agent_review") {
    const c = contributorState.find((c) => c.address === e.sender);
    if (c) c.reviews++;
  }
  if (e.type === "payment" && e.splits) {
    const amt = parseFloat((e.amount || "$0").replace("$", ""));
    for (const split of e.splits) {
      const c = contributorState.find((c) => c.address === split.address);
      if (c) c.earnings += parseFloat(split.amount.replace("$", ""));
    }
  }
}
let totalRevenue = seedEvents
  .filter((e) => e.type === "payment")
  .reduce((s, e) => s + parseFloat((e.amount || "$0").replace("$", "")), 0);
let requestCount = seedEvents.filter((e) => e.type === "payment").length;
const revenueTimeline: { timestamp: number; amount: number }[] = [];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ── Express + HTTP server ────────────────────────────────────────────────────
const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

// ── WebSocket server ─────────────────────────────────────────────────────────
const wss = new WebSocketServer({ server, path: "/ws" });
const wsClients = new Set<WebSocket>();

wss.on("connection", (ws) => {
  wsClients.add(ws);
  ws.on("close", () => wsClients.delete(ws));
});

function broadcast(data: object) {
  const msg = JSON.stringify(data);
  for (const ws of wsClients) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(msg);
    }
  }
}

// ── x402 payment middleware ──────────────────────────────────────────────────
interface PriceConfig {
  price: string;
  description: string;
}

function x402Middleware(config: PriceConfig) {
  return (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const paymentHeader =
      req.headers["x-payment"] || req.headers["payment-signature"];

    if (!paymentHeader) {
      res.status(402).json({
        error: "X-PAYMENT header is required",
        accepts: [
          {
            scheme: "gokite-aa",
            network: "kite-testnet",
            maxAmountRequired: "100000000000000000",
            resource: `${req.protocol}://${req.get("host")}${req.path}`,
            description: config.description,
            mimeType: "application/json",
            payTo: SPLITTER_ADDRESS,
            maxTimeoutSeconds: 300,
            asset: TEST_USDT_ADDRESS,
            extra: null,
            merchantName: "ContribOS",
          },
        ],
        x402Version: 1,
      });
      return;
    }

    // Payment accepted — track it
    const priceNum = parseFloat(config.price.replace("$", ""));
    requestCount++;
    totalRevenue += priceNum;
    revenueTimeline.push({ timestamp: Date.now(), amount: priceNum });

    const totalWeight = contributorState.reduce((s, c) => s + c.weight, 0);
    const splits = contributorState.map((c) => {
      const share = (priceNum * c.weight) / totalWeight;
      c.earnings += share;
      return {
        address: c.address,
        name: c.name,
        amount: `$${share.toFixed(3)}`,
      };
    });

    // Extract real tx hash from X-Payment header if available
    let txHash = generateMockTxHash();
    try {
      const parsed = JSON.parse(paymentHeader as string);
      if (parsed.txHash && parsed.txHash.startsWith("0x")) {
        txHash = parsed.txHash;
      }
    } catch {
      // Not JSON or no txHash field — use mock
    }
    const chainId = (req.headers["x-chain-id"] as string) || undefined;

    const paymentEvent: FeedEvent = {
      id: createEventId(),
      type: "payment",
      timestamp: Date.now(),
      sender: (req.headers["x-sender"] as string) || "0xAgent",
      senderName:
        (req.headers["x-sender-name"] as string) || "External Consumer",
      content: `x402 payment for ${req.path}`,
      amount: config.price,
      endpoint: req.path,
      txHash,
      splits,
      chainId,
    };
    events.push(paymentEvent);
    broadcast({ type: "event", event: paymentEvent });
    broadcast({
      type: "stats_update",
      totalRevenue,
      requestCount,
      contributors: contributorState,
    });

    (req as any).paymentInfo = { txHash, splits, amount: config.price };
    next();
  };
}

// ── API Endpoints ────────────────────────────────────────────────────────────

app.get("/api/feed", (_req, res) => {
  res.json({ events });
});

app.get("/api/stats", (_req, res) => {
  res.json({
    totalRevenue,
    requestCount,
    contributors: contributorState,
    revenueTimeline: revenueTimeline.slice(-100),
  });
});

app.get("/api/contributors", (_req, res) => {
  res.json({ contributors: contributorState });
});

// Post events (free — used by agent for activity chain events)
app.post("/api/event", (req, res) => {
  const event: FeedEvent = {
    id: createEventId(),
    timestamp: Date.now(),
    ...req.body,
  };

  // Update contributor stats
  if (event.type === "code_push") {
    const c = contributorState.find((c) => c.address === event.sender);
    if (c) c.prs++;
  }
  if (event.type === "agent_review") {
    const c = contributorState.find((c) => c.address === event.sender);
    if (c) c.reviews++;
  }

  events.push(event);
  broadcast({ type: "event", event });
  broadcast({
    type: "stats_update",
    totalRevenue,
    requestCount,
    contributors: contributorState,
  });
  res.json({ ok: true, event });
});

// Legacy message endpoint
app.post("/api/message", (req, res) => {
  const { sender, senderName, content } = req.body;
  const event: FeedEvent = {
    id: createEventId(),
    type: "message",
    timestamp: Date.now(),
    sender: sender || "0xAnonymous",
    senderName: senderName || "Anonymous",
    content: content || "",
  };
  events.push(event);
  broadcast({ type: "event", event });
  res.json({ ok: true, event });
});

// x402-gated endpoints
app.post(
  "/api/analyze",
  x402Middleware({ price: "$0.05", description: "Code analysis service" }),
  (req, res) => {
    const code = req.body.code || codeSnippets[0];
    const analyses = [
      `Analysis complete: Code follows clean architecture patterns. Found ${Math.floor(Math.random() * 3) + 1} optimization opportunities. No security vulnerabilities detected.`,
      `Static analysis passed. Cyclomatic complexity: ${Math.floor(Math.random() * 5) + 2}. Suggest extracting helper function for improved readability.`,
      `Code review: Well-structured with proper error handling. Consider adding input validation on line ${Math.floor(Math.random() * 50) + 1}. Performance score: ${Math.floor(Math.random() * 20) + 80}/100.`,
    ];
    res.json({
      result: analyses[Math.floor(Math.random() * analyses.length)],
      codePreview: code.substring(0, 80),
      payment: (req as any).paymentInfo,
    });
  }
);

app.post(
  "/api/summarize",
  x402Middleware({
    price: "$0.03",
    description: "Text summarization service",
  }),
  (req, res) => {
    const text =
      req.body.text ||
      textToSummarize[Math.floor(Math.random() * textToSummarize.length)];
    const summaries = [
      "Summary: Key changes include performance improvements, security patches, and updated documentation. No breaking changes for current API consumers.",
      "Summary: 3 major features shipped, 8 bugs fixed, test coverage increased. All changes are backwards compatible with existing integrations.",
      "Summary: Security audit complete with clean results. Minor findings addressed in hotfix. Recommended for production deployment.",
    ];
    res.json({
      result: summaries[Math.floor(Math.random() * summaries.length)],
      inputPreview: text.substring(0, 100),
      payment: (req as any).paymentInfo,
    });
  }
);

app.post(
  "/api/review",
  x402Middleware({ price: "$0.10", description: "PR code review service" }),
  (req, res) => {
    const review = pick(reviewTemplates);
    res.json({
      result: review.detail,
      summary: review.summary,
      verdict: review.result,
      payment: (req as any).paymentInfo,
    });
  }
);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

// ── Start server ─────────────────────────────────────────────────────────────
server.listen(PORT, () => {
  console.log(`ContribOS server running on http://localhost:${PORT}`);
  console.log(`WebSocket available at ws://localhost:${PORT}/ws`);
  console.log(`Splitter contract: ${SPLITTER_ADDRESS}`);
  console.log(`Facilitator: ${FACILITATOR_URL}`);
  console.log(`\nEndpoints:`);
  console.log(`  GET  /api/feed          — free`);
  console.log(`  GET  /api/stats         — free`);
  console.log(`  POST /api/event         — free (activity events)`);
  console.log(`  POST /api/analyze       — $0.05 (x402)`);
  console.log(`  POST /api/summarize     — $0.03 (x402)`);
  console.log(`  POST /api/review        — $0.10 (x402)`);
});
