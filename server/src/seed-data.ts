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
  // code_push fields
  prNumber?: number;
  prTitle?: string;
  filesChanged?: number;
  additions?: number;
  deletions?: number;
  // agent_review fields
  reviewResult?: "approved" | "changes_requested" | "comment";
  reviewSummary?: string;
  linkedPrNumber?: number;
  linkedPrTitle?: string;
  // payment fields
  amount?: string;
  endpoint?: string;
  txHash?: string;
  splits?: { address: string; name: string; amount: string }[];
  // chain grouping — events with same chainId are visually linked
  chainId?: string;
}

export const contributors: Contributor[] = [
  {
    address: "0x5aF191F4a93dD5D830F6232b7c4a12A5f8ebd10E",
    name: "Alice",
    role: "Core maintainer",
    weight: 40,
    earnings: 0,
    avatar: "A",
    prs: 0,
    reviews: 0,
  },
  {
    address: "0xbf50e468ffdc701A07af517215A961362147027C",
    name: "Bob",
    role: "Backend lead",
    weight: 30,
    earnings: 0,
    avatar: "B",
    prs: 0,
    reviews: 0,
  },
  {
    address: "0x57CF531C2479b56cA4285e5FA5eF75369A709775",
    name: "Carol",
    role: "Security reviewer",
    weight: 20,
    earnings: 0,
    avatar: "C",
    prs: 0,
    reviews: 0,
  },
  {
    address: "0x45c3Bc818bd50baB7212a764B603aAD51893614B",
    name: "Agent-Reviewer",
    role: "AI code reviewer",
    weight: 10,
    earnings: 0,
    avatar: "R",
    prs: 0,
    reviews: 0,
  },
];

let eventCounter = 0;
function nextId(): string {
  return `evt_${++eventCounter}`;
}

let chainCounter = 0;
function nextChainId(): string {
  return `chain_${++chainCounter}`;
}

function mockTxHash(): string {
  return `0x${Array.from({ length: 64 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join("")}`;
}

const now = Date.now();

// Pre-seeded activity chains — each chain shows code → review → payment
export const seedEvents: FeedEvent[] = (() => {
  const events: FeedEvent[] = [];

  // Chain 1: Alice pushes 0G SDK update → Agent reviews → Payment
  const c1 = nextChainId();
  events.push({
    id: nextId(),
    type: "code_push",
    timestamp: now - 600000,
    sender: contributors[0].address,
    senderName: "Alice",
    content: "Fixed deprecated SDK examples and updated compute contracts",
    prNumber: 251,
    prTitle: "fix: update deprecated SDK example, service tables, and compute contracts",
    filesChanged: 4,
    additions: 127,
    deletions: 43,
    chainId: c1,
  });
  events.push({
    id: nextId(),
    type: "agent_review",
    timestamp: now - 570000,
    sender: contributors[3].address,
    senderName: "Agent-Reviewer",
    content:
      "SDK examples verified against latest API. Service table references updated correctly. Compute contract addresses match on-chain deployment.",
    reviewResult: "approved",
    reviewSummary: "Approved — SDK examples verified, contracts match on-chain",
    linkedPrNumber: 251,
    linkedPrTitle: "fix: update deprecated SDK example, service tables, and compute contracts",
    chainId: c1,
  });
  // Chain 2: Carol pushes chatID fix → Agent reviews
  const c2 = nextChainId();
  events.push({
    id: nextId(),
    type: "code_push",
    timestamp: now - 400000,
    sender: contributors[2].address,
    senderName: "Carol",
    content: "Corrected chatID retrieval logic in streaming response docs",
    prNumber: 234,
    prTitle: "fix: correct chatID retrieval logic in streaming response",
    filesChanged: 2,
    additions: 18,
    deletions: 12,
    chainId: c2,
  });
  events.push({
    id: nextId(),
    type: "agent_review",
    timestamp: now - 380000,
    sender: contributors[3].address,
    senderName: "Agent-Reviewer",
    content:
      "Verified chatID parsing against live streaming endpoint. Response format matches updated API spec. Edge case for empty responses handled.",
    reviewResult: "approved",
    reviewSummary: "Approved — chatID logic verified against live endpoint",
    linkedPrNumber: 234,
    linkedPrTitle: "fix: correct chatID retrieval logic in streaming response",
    chainId: c2,
  });
  // Chain 3: Bob pushes fine-tuning guide update → Agent reviews
  const c3 = nextChainId();
  events.push({
    id: nextId(),
    type: "code_push",
    timestamp: now - 250000,
    sender: contributors[1].address,
    senderName: "Bob",
    content: "Updated fine-tuning guide to reflect actual tested workflow",
    prNumber: 243,
    prTitle: "docs: update fine-tuning guide to reflect actual tested workflow",
    filesChanged: 3,
    additions: 89,
    deletions: 41,
    chainId: c3,
  });
  events.push({
    id: nextId(),
    type: "agent_review",
    timestamp: now - 230000,
    sender: contributors[3].address,
    senderName: "Agent-Reviewer",
    content:
      "Fine-tuning workflow steps verified end-to-end. Dataset format matches API requirements. Training parameters produce expected results.",
    reviewResult: "approved",
    reviewSummary: "Approved — workflow tested end-to-end",
    linkedPrNumber: 243,
    linkedPrTitle: "docs: update fine-tuning guide to reflect actual tested workflow",
    chainId: c3,
  });
  // Standalone message
  events.push({
    id: nextId(),
    type: "message",
    timestamp: now - 120000,
    sender: contributors[0].address,
    senderName: "Alice",
    content:
      "Seeing more PRs to the 0G docs repo this week — agent reviewer is catching issues faster than manual review",
  });

  // System event
  events.push({
    id: nextId(),
    type: "system",
    timestamp: now - 60000,
    sender: "system",
    senderName: "ContribOS",
    content:
      "PaymentSplitter contract has distributed $0.25 to 4 contributors today",
  });

  return events;
})();

// Templates for generating live activity chains during demo
// Real PR titles from github.com/0gfoundation/0g-doc/pulls
export const prTemplates = [
  {
    title: "docs: add Content-Signal headers and fine-tuning example link",
    files: 2,
    add: 45,
    del: 3,
  },
  {
    title: "docs: add hosted Web UI link for compute inference",
    files: 1,
    add: 18,
    del: 2,
  },
  {
    title: "feat: Add LLM-friendly documentation endpoints",
    files: 4,
    add: 156,
    del: 0,
  },
  {
    title: "docs: update compute network model listings",
    files: 2,
    add: 67,
    del: 34,
  },
  {
    title: "docs: clarify chatID retrieval principle and correct terminology",
    files: 3,
    add: 42,
    del: 28,
  },
  {
    title: "refactor: change flux model to z-image",
    files: 2,
    add: 15,
    del: 12,
  },
  {
    title: "chore: update deepseek from 3.1 to 3.2",
    files: 1,
    add: 8,
    del: 8,
  },
  {
    title: "docs: update compute network documentation",
    files: 5,
    add: 134,
    del: 67,
  },
  {
    title: "refactor: refactor compute network doc",
    files: 6,
    add: 198,
    del: 145,
  },
  {
    title: "fix: correct chatID retrieval logic in inference documentation",
    files: 2,
    add: 22,
    del: 18,
  },
  {
    title: "fix: mainnet node path",
    files: 1,
    add: 4,
    del: 4,
  },
  {
    title: "docs: remove emojis from section headings",
    files: 8,
    add: 24,
    del: 24,
  },
];

export const reviewTemplates = [
  {
    result: "approved" as const,
    summary: "Approved — API examples verified against live endpoint",
    detail:
      "Tested all code examples against 0G compute network. Response formats match documented schema. Latency within expected range.",
  },
  {
    result: "approved" as const,
    summary: "Approved — model references up to date",
    detail:
      "Model listings verified against current 0G compute network availability. Pricing table matches on-chain rates. Deprecation notices added correctly.",
  },
  {
    result: "approved" as const,
    summary: "Approved — documentation links and paths verified",
    detail:
      "All internal cross-references resolve correctly. External links to 0G explorer and faucet tested. No broken anchors.",
  },
  {
    result: "approved" as const,
    summary: "Approved — configuration values match testnet",
    detail:
      "Chain ID, RPC URL, and contract addresses verified against live 0G testnet. Node setup instructions tested on clean environment.",
  },
  {
    result: "changes_requested" as const,
    summary: "Changes requested — outdated SDK version referenced",
    detail:
      "SDK import path uses deprecated v1 format. Update to v2 namespace. Also, fine-tuning example references removed model — suggest using deepseek-3.2.",
  },
];

export const codeSnippets = [
  'function parseToken(input: string) { return input.split(".").map(decode); }',
  "async function validateAuth(req: Request) { const token = req.headers.authorization; }",
  "const rateLimiter = new RateLimiter({ windowMs: 60000, max: 100 });",
  "export class CacheManager { private store = new Map<string, CacheEntry>(); }",
  "function hashPassword(pwd: string) { return bcrypt.hash(pwd, SALT_ROUNDS); }",
  "const wsPool = new ConnectionPool({ maxConnections: 50, idleTimeout: 30000 });",
];

export const textToSummarize = [
  "Release v2.3.0 includes 12 new features, performance improvements to the query engine, updated documentation, 3 breaking changes in the auth API, migration guide included, and fixes for 8 reported bugs.",
  "The Q4 security audit found 0 critical vulnerabilities. Two low-severity findings related to verbose error messages in development mode and an unused admin endpoint. Both have been patched.",
  "This week's contributor report: 23 pull requests merged, 5 new contributors onboarded, documentation updated for 3 modules, test coverage increased from 91% to 94%.",
];

export const prDescriptions = [
  "Add retry logic with exponential backoff to external API calls",
  "Implement webhook delivery queue with dead letter handling",
  "Refactor authentication middleware to support API key + JWT",
  "Add structured logging with correlation IDs across services",
  "Implement graceful shutdown with in-flight request draining",
];

let prCounter = 44;
export function nextPrNumber(): number {
  return ++prCounter;
}

export function createEventId(): string {
  return nextId();
}

export function createChainId(): string {
  return nextChainId();
}

export function generateMockTxHash(): string {
  return mockTxHash();
}
