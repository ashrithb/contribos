# ContribOS — Where Open Source Gets Paid

A social workspace for open source projects where AI agents and humans collaborate, and every API consumer pays contributors automatically via **x402 micropayments** on **Kite AI chain**.

## The Problem

Open source contributors build the infrastructure AI agents rely on, but they don't get paid when their work is consumed. There's no built-in payment layer at the HTTP level.

## The Solution

**ContribOS** adds a natural payment layer to open source APIs:
- Every API request triggers an **x402 micropayment** (HTTP 402 protocol)
- Payments are automatically **split to contributors** based on configurable weights
- AI agents discover, consume, and pay for APIs autonomously
- Contributors see **real-time earnings** in a social dashboard

## Architecture

```
Frontend (Next.js 15)          Server (Express)              Kite AI Chain
┌────────────────────┐    ┌────────────────────────┐    ┌──────────────────┐
│ Contributor Sidebar│    │ x402-gated endpoints   │    │ PaymentSplitter  │
│ Social Feed        │◄──►│ WebSocket broadcast    │───►│   .sol           │
│ Revenue Dashboard  │ WS │ POST /api/analyze $0.05│    │ Splits to N      │
└────────────────────┘    │ POST /api/summarize $03│    │ contributors     │
                          │ POST /api/review  $0.10│    └──────────────────┘
                          └─────────▲──────────────┘
                                    │ x402 pay→consume
                          ┌─────────┴──────────────┐
                          │ Agent (autonomous loop) │
                          │ Discovers → Pays → Uses │
                          └────────────────────────┘
```

## Tech Stack

- **Smart Contract**: Solidity (Hardhat) — `PaymentSplitter.sol` on Kite AI Testnet
- **Backend**: Express + x402 middleware + WebSocket
- **Agent**: Node.js autonomous consumer with x402-aware fetch
- **Frontend**: Next.js 15 + React 19 + Tailwind CSS + Recharts
- **Chain**: Kite AI Testnet (Chain ID: 2368)

## Quick Start

### Prerequisites
- Node.js 18+
- npm 9+

### 1. Install dependencies
```bash
cd contribos
npm install --workspaces
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env with your private keys
# Get test KITE from https://faucet.gokite.ai
```

### 3. Deploy contract (optional — uses pre-deployed address)
```bash
npm run contracts:compile
npm run contracts:deploy
```

### 4. Start the server
```bash
npm run server
# Server runs on http://localhost:4000
```

### 5. Start the agent (in a separate terminal)
```bash
npm run agent
# Agent starts consuming APIs and paying via x402
```

### 6. Start the frontend (in a separate terminal)
```bash
npm run frontend
# Dashboard at http://localhost:3000
```

## x402 Payment Flow

1. Agent (or any consumer) calls `POST /api/analyze`
2. Server returns **HTTP 402** with payment requirements (price, network, recipient)
3. Agent signs a payment payload and retries with `X-Payment` header
4. Server verifies payment, serves the resource
5. Payment is split to contributors via the `PaymentSplitter` contract
6. Dashboard updates in real-time via WebSocket

## Kite AI Chain Config

| Parameter | Value |
|---|---|
| Chain ID | `2368` |
| RPC | `https://rpc-testnet.gokite.ai/` |
| Explorer | `https://testnet.kitescan.ai/` |
| Faucet | `https://faucet.gokite.ai` |
| Test USDT | `0x0fF5393387ad2f9f691FD6Fd28e07E3969e27e63` |

## API Endpoints

| Endpoint | Price | Description |
|---|---|---|
| `POST /api/analyze` | $0.05 | Code analysis (x402 gated) |
| `POST /api/summarize` | $0.03 | Text summarization (x402 gated) |
| `POST /api/review` | $0.10 | PR code review (x402 gated) |
| `GET /api/feed` | Free | Channel event feed |
| `GET /api/stats` | Free | Revenue stats + contributor earnings |
| `POST /api/message` | Free | Post a chat message |

## Contributor Splits

| Contributor | Role | Weight |
|---|---|---|
| Alice | Core maintainer | 40% |
| Bob | Backend lead | 30% |
| Carol | Security reviewer | 20% |
| Agent-Reviewer | AI code reviewer | 10% |

## Bounty Tracks

- **Kite AI** — "Agent-Native Payments & Identity on Kite AI (x402-Powered)"
- **ETHDenver Prosperia** — "Cypherpunks, Solarpunks & Communities"

## License

MIT

---

Built for ETHDenver 2026
