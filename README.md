# ContribOS

**Autonomous AI agents help review open source PRs and pay contributors via x402 micropayments on Kite AI chain.**

There is a crisis in our world of AI for good quality contribution.

Open source maintainers spend hours reviewing PRs that pour in from contributors — often with no way to reward quality work. ContribOS fixes both problems: an AI agent automatically reviews every PR for correctness, and every API call the agent makes triggers a real on-chain micropayment that gets split to all contributors based on their weight.

No grants. No invoices. No manual payouts. Just code, review, pay — every time.

## How It Works

```
 Developer pushes PR          AI Agent reviews            Payment splits on-chain
 ┌─────────────────┐     ┌─────────────────────┐     ┌──────────────────────────┐
 │  Carol opens     │     │  Agent-Reviewer      │     │  PaymentSplitter.sol     │
 │  PR #234:        │────>│  verifies chatID     │────>│  on Kite AI Testnet      │
 │  "fix: correct   │     │  logic against live   │     │                          │
 │   chatID in      │     │  streaming endpoint   │     │  Alice   40% ── $0.040   │
 │   streaming      │     │                       │     │  Bob     30% ── $0.030   │
 │   response"      │     │  Verdict: Approved    │     │  Carol   20% ── $0.020   │
 │                  │     │                       │     │  Agent   10% ── $0.010   │
 └─────────────────┘     └───────────┬───────────┘     └──────────────────────────┘
                                     │
                              x402 payment
                           (real tx on Kite)
                                     │
                                     ▼
                          https://testnet.kitescan.ai/tx/0x334599b...
```

Every payment is a **real on-chain transaction** on Kite AI Testnet. Click any tx hash in the dashboard and it opens on [KiteScan](https://testnet.kitescan.ai).

## The x402 Protocol Flow

The server implements the [x402 protocol](https://www.x402.org/) — HTTP 402 Payment Required as a native payment layer for APIs:

```
Agent                          Server                         Kite AI Chain
  │                              │                                │
  │  POST /api/review            │                                │
  │─────────────────────────────>│                                │
  │                              │                                │
  │  HTTP 402 Payment Required   │                                │
  │  {                           │                                │
  │    scheme: "gokite-aa",      │                                │
  │    network: "kite-testnet",  │                                │
  │    payTo: "0x4D0B...Caf",    │                                │
  │    asset: "0x0fF5...e63"     │                                │
  │  }                           │                                │
  │<─────────────────────────────│                                │
  │                              │                                │
  │  sendTransaction(0.000001 KITE)                               │
  │──────────────────────────────────────────────────────────────>│
  │                              │                     tx: 0x33...│
  │<──────────────────────────────────────────────────────────────│
  │                              │                                │
  │  POST /api/review            │                                │
  │  X-Payment: { txHash: "0x33..." }                             │
  │─────────────────────────────>│                                │
  │                              │──── split to contributors ────>│
  │  200 OK { verdict, summary } │                                │
  │<─────────────────────────────│                                │
```

The agent discovers the API, gets a 402, pays on-chain, and retries with proof of payment. The server verifies, serves the response, and broadcasts the payment event to the real-time dashboard.

## Live Demo

The system runs three services locally and generates a live activity stream:

- **Code pushes** appear as contributors submit PRs (simulated from real [0G docs repo](https://github.com/0gfoundation/0g-doc/pulls) PR titles)
- **AI reviews** appear 3-6 seconds later with detailed review verdicts
- **Payments** appear with real on-chain tx hashes, split amounts, and links to KiteScan
- The **value flow animation** lights up to show money moving from agent → API → splitter → contributors

All payment transactions are real and verifiable on [Kite AI Testnet Explorer](https://testnet.kitescan.ai).

## Architecture

```
contribos/
├── contracts/                 # Solidity smart contract
│   └── PaymentSplitter.sol    # On-chain payment splitting (deployed on Kite)
├── server/                    # Express backend
│   ├── index.ts               # x402 middleware, WebSocket, API endpoints
│   └── seed-data.ts           # Activity chains, contributor config, PR templates
├── agent/                     # Autonomous AI agent
│   └── index.ts               # x402-aware consumer with ethers.js for real txs
└── frontend/                  # Next.js 15 dashboard
    ├── components/
    │   ├── channel-feed.tsx    # Activity feed with chain grouping
    │   ├── feed-event.tsx      # Rich cards (code push, review, payment)
    │   ├── value-flow.tsx      # Animated value flow diagram
    │   ├── contributor-sidebar.tsx  # Contributor stats + leaderboard
    │   ├── revenue-dashboard.tsx    # Revenue charts + distributions
    │   └── how-it-works.tsx    # Collapsible explainer
    └── lib/
        ├── websocket.ts       # Real-time state management
        └── kite-chain.ts      # Kite testnet config + explorer URLs
```

## Deployed Contracts

| Contract | Address | Explorer |
|---|---|---|
| PaymentSplitter | `0x4D0BA345bE415f5a57CdbA2BE5a5b9aBB8f15Caf` | [View on KiteScan](https://testnet.kitescan.ai/address/0x4D0BA345bE415f5a57CdbA2BE5a5b9aBB8f15Caf) |

## Quick Start

```bash
# Install
npm install --workspaces

# Configure
cp .env.example .env
# Add your private keys and get test KITE from https://faucet.gokite.ai

# Deploy contract (optional — already deployed)
npm run contracts:compile && npm run contracts:deploy

# Run all three services (each in a separate terminal)
npm run server     # http://localhost:4000
npm run agent      # Autonomous x402 consumer
npm run frontend   # http://localhost:3000
```

## API Endpoints

| Endpoint | Price | Description |
|---|---|---|
| `POST /api/analyze` | $0.05 | Code analysis (x402 gated) |
| `POST /api/summarize` | $0.03 | Text summarization (x402 gated) |
| `POST /api/review` | $0.10 | PR code review (x402 gated) |
| `POST /api/event` | Free | Post activity events (code push, review) |
| `GET /api/feed` | Free | Full event feed |
| `GET /api/stats` | Free | Revenue + contributor earnings |
| `WebSocket /ws` | Free | Real-time event stream |

## Kite AI Testnet

| Parameter | Value |
|---|---|
| Chain ID | `2368` |
| RPC | `https://rpc-testnet.gokite.ai/` |
| Explorer | [testnet.kitescan.ai](https://testnet.kitescan.ai/) |
| Faucet | [faucet.gokite.ai](https://faucet.gokite.ai) |
| x402 Scheme | `gokite-aa` |
| Facilitator | [facilitator.pieverse.io](https://facilitator.pieverse.io) |

## Why This Matters

Open source has a sustainability problem. Millions of projects are consumed daily by AI agents, companies, and developers — but contributors see nothing in return. Meanwhile, AI agents are becoming the primary consumers of APIs, and they can pay.

ContribOS connects these two realities:

1. **For maintainers**: Every API call to your project generates revenue, split automatically to contributors by weight. No grant applications, no sponsorship tiers — just direct payment for value delivered.

2. **For AI agents**: APIs are discoverable, self-describing (via 402 responses), and payable. An agent can find an API, understand what it costs, pay, and consume — all autonomously.

3. **For open source communities**: Contribution quality improves when there's transparent, on-chain reward. The AI reviewer catches issues that humans miss or don't have time to review. The payment splitter ensures everyone gets their share.

This isn't theoretical — it's running on Kite AI Testnet with real transactions right now.

## Tech Stack

- **Smart Contract**: Solidity 0.8.24 / Hardhat — PaymentSplitter with native + ERC-20 splitting
- **Backend**: Express, WebSocket, custom x402 middleware
- **Agent**: Node.js + ethers.js — autonomous x402 consumer with real on-chain payments
- **Frontend**: Next.js 15, React 19, Tailwind CSS v4, Recharts
- **Chain**: Kite AI Testnet (EVM, Chain ID 2368)

## Bounty Tracks

- **Kite AI** ($10K) — Agent-native x402 payments on Kite AI chain
- **Prosperia** ($2K) — Open source sustainability as a public good
- **0G Dev Tooling** ($4K) — Evaluating and rewarding contributions to open source repos (demonstrated against [0G docs](https://github.com/0gfoundation/0g-doc/pulls))
