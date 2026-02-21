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
    address: "0xA11c3000000000000000000000000000000A11c3",
    name: "Alice",
    role: "Core maintainer",
    weight: 40,
    earnings: 0,
    avatar: "A",
    prs: 0,
    reviews: 0,
  },
  {
    address: "0xB0bb0000000000000000000000000000000B0bb0",
    name: "Bob",
    role: "Backend lead",
    weight: 30,
    earnings: 0,
    avatar: "B",
    prs: 0,
    reviews: 0,
  },
  {
    address: "0xCa101000000000000000000000000000000Ca101",
    name: "Carol",
    role: "Security reviewer",
    weight: 20,
    earnings: 0,
    avatar: "C",
    prs: 0,
    reviews: 0,
  },
  {
    address: "0xA93n7000000000000000000000000000000A93n7",
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

  // Chain 1: Alice pushes parser endpoint → Agent reviews → Payment
  const c1 = nextChainId();
  events.push({
    id: nextId(),
    type: "code_push",
    timestamp: now - 600000,
    sender: contributors[0].address,
    senderName: "Alice",
    content: "Pushed new parser endpoint with token validation",
    prNumber: 42,
    prTitle: "Add retry logic with exponential backoff",
    filesChanged: 4,
    additions: 127,
    deletions: 18,
    chainId: c1,
  });
  events.push({
    id: nextId(),
    type: "agent_review",
    timestamp: now - 570000,
    sender: contributors[3].address,
    senderName: "Agent-Reviewer",
    content:
      "Clean implementation with good error handling. Backoff multiplier looks correct. Test coverage is thorough.",
    reviewResult: "approved",
    reviewSummary: "Approved — no issues found, 2 style suggestions",
    linkedPrNumber: 42,
    linkedPrTitle: "Add retry logic with exponential backoff",
    chainId: c1,
  });
  events.push({
    id: nextId(),
    type: "payment",
    timestamp: now - 560000,
    sender: contributors[3].address,
    senderName: "Agent-Reviewer",
    content: "x402 payment for /api/review",
    amount: "$0.10",
    endpoint: "/api/review",
    txHash: mockTxHash(),
    splits: [
      { address: contributors[0].address, name: "Alice", amount: "$0.040" },
      { address: contributors[1].address, name: "Bob", amount: "$0.030" },
      { address: contributors[2].address, name: "Carol", amount: "$0.020" },
      {
        address: contributors[3].address,
        name: "Agent-Reviewer",
        amount: "$0.010",
      },
    ],
    chainId: c1,
  });

  // Chain 2: Carol pushes auth middleware → Agent reviews → Payment
  const c2 = nextChainId();
  events.push({
    id: nextId(),
    type: "code_push",
    timestamp: now - 400000,
    sender: contributors[2].address,
    senderName: "Carol",
    content: "Merged auth middleware PR with JWT support",
    prNumber: 43,
    prTitle: "Refactor auth middleware to support API key + JWT",
    filesChanged: 6,
    additions: 203,
    deletions: 45,
    chainId: c2,
  });
  events.push({
    id: nextId(),
    type: "agent_review",
    timestamp: now - 380000,
    sender: contributors[3].address,
    senderName: "Agent-Reviewer",
    content:
      "Security review passed. No vulnerabilities detected. JWT validation is correct. Suggest adding token expiry check.",
    reviewResult: "approved",
    reviewSummary: "Approved — secure implementation, 1 suggestion",
    linkedPrNumber: 43,
    linkedPrTitle: "Refactor auth middleware to support API key + JWT",
    chainId: c2,
  });
  events.push({
    id: nextId(),
    type: "payment",
    timestamp: now - 375000,
    sender: contributors[3].address,
    senderName: "Agent-Reviewer",
    content: "x402 payment for /api/review",
    amount: "$0.10",
    endpoint: "/api/review",
    txHash: mockTxHash(),
    splits: [
      { address: contributors[0].address, name: "Alice", amount: "$0.040" },
      { address: contributors[1].address, name: "Bob", amount: "$0.030" },
      { address: contributors[2].address, name: "Carol", amount: "$0.020" },
      {
        address: contributors[3].address,
        name: "Agent-Reviewer",
        amount: "$0.010",
      },
    ],
    chainId: c2,
  });

  // Chain 3: Bob pushes logging → Agent analyzes → Payment
  const c3 = nextChainId();
  events.push({
    id: nextId(),
    type: "code_push",
    timestamp: now - 250000,
    sender: contributors[1].address,
    senderName: "Bob",
    content: "Added structured logging with correlation IDs",
    prNumber: 44,
    prTitle: "Add structured logging with correlation IDs",
    filesChanged: 8,
    additions: 156,
    deletions: 32,
    chainId: c3,
  });
  events.push({
    id: nextId(),
    type: "agent_review",
    timestamp: now - 230000,
    sender: contributors[3].address,
    senderName: "Agent-Reviewer",
    content:
      "Logging format is consistent. Correlation IDs propagate correctly across async boundaries. Good use of structured fields.",
    reviewResult: "approved",
    reviewSummary: "Approved — clean implementation",
    linkedPrNumber: 44,
    linkedPrTitle: "Add structured logging with correlation IDs",
    chainId: c3,
  });
  events.push({
    id: nextId(),
    type: "payment",
    timestamp: now - 225000,
    sender: contributors[3].address,
    senderName: "Agent-Reviewer",
    content: "x402 payment for /api/analyze",
    amount: "$0.05",
    endpoint: "/api/analyze",
    txHash: mockTxHash(),
    splits: [
      { address: contributors[0].address, name: "Alice", amount: "$0.020" },
      { address: contributors[1].address, name: "Bob", amount: "$0.015" },
      { address: contributors[2].address, name: "Carol", amount: "$0.010" },
      {
        address: contributors[3].address,
        name: "Agent-Reviewer",
        amount: "$0.005",
      },
    ],
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
      "The /analyze endpoint is getting way more agent traffic today — 3 new agents discovered us through the registry",
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
export const prTemplates = [
  {
    title: "Implement webhook delivery queue with dead letter handling",
    files: 5,
    add: 189,
    del: 23,
  },
  {
    title: "Add rate limiting per API key with sliding window",
    files: 3,
    add: 94,
    del: 12,
  },
  {
    title: "Implement graceful shutdown with in-flight request draining",
    files: 4,
    add: 112,
    del: 28,
  },
  {
    title: "Add WebSocket reconnection with exponential backoff",
    files: 2,
    add: 67,
    del: 8,
  },
  {
    title: "Refactor caching layer to support TTL per resource type",
    files: 6,
    add: 234,
    del: 89,
  },
  {
    title: "Add input validation middleware with JSON schema",
    files: 4,
    add: 145,
    del: 34,
  },
  {
    title: "Implement CORS policy with per-origin configuration",
    files: 2,
    add: 78,
    del: 15,
  },
  {
    title: "Add health check endpoint with dependency status",
    files: 3,
    add: 56,
    del: 4,
  },
  {
    title: "Migrate database queries to use prepared statements",
    files: 7,
    add: 198,
    del: 167,
  },
  {
    title: "Add OpenAPI spec generation from route handlers",
    files: 5,
    add: 312,
    del: 0,
  },
];

export const reviewTemplates = [
  {
    result: "approved" as const,
    summary: "Approved — clean implementation, good test coverage",
    detail:
      "Code follows established patterns. Error handling is thorough. Tests cover edge cases. No security concerns.",
  },
  {
    result: "approved" as const,
    summary: "Approved — no issues found, 2 style suggestions",
    detail:
      "Implementation is solid. Consider extracting the validation logic into a shared utility. Variable naming is clear.",
  },
  {
    result: "approved" as const,
    summary: "Approved — secure implementation, well-documented",
    detail:
      "Security review passed. Input sanitization is correct. API boundaries are well-defined. Documentation is helpful.",
  },
  {
    result: "approved" as const,
    summary: "Approved — backwards compatible, good migration path",
    detail:
      "Schema changes are backwards compatible. Migration script handles edge cases. Rollback procedure is documented.",
  },
  {
    result: "changes_requested" as const,
    summary: "Changes requested — 1 issue, 2 suggestions",
    detail:
      "Found potential race condition in the connection pool cleanup. Suggest adding mutex. Also consider adding timeout parameter.",
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
