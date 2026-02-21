import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });
dotenv.config({ path: "../.env" });
dotenv.config();

const API_URL = process.env.API_URL || "http://localhost:4000";
const AGENT_ADDRESS = "0xA93n7000000000000000000000000000000A93n7";
const AGENT_NAME = "Agent-Reviewer";

// Contributor addresses for simulating code pushes
const humanContributors = [
  { address: "0xA11c3000000000000000000000000000000A11c3", name: "Alice" },
  { address: "0xB0bb0000000000000000000000000000000B0bb0", name: "Bob" },
  { address: "0xCa101000000000000000000000000000000Ca101", name: "Carol" },
];

const prTemplates = [
  { title: "Implement webhook delivery queue with dead letter handling", files: 5, add: 189, del: 23 },
  { title: "Add rate limiting per API key with sliding window", files: 3, add: 94, del: 12 },
  { title: "Implement graceful shutdown with in-flight request draining", files: 4, add: 112, del: 28 },
  { title: "Add WebSocket reconnection with exponential backoff", files: 2, add: 67, del: 8 },
  { title: "Refactor caching layer to support TTL per resource type", files: 6, add: 234, del: 89 },
  { title: "Add input validation middleware with JSON schema", files: 4, add: 145, del: 34 },
  { title: "Implement CORS policy with per-origin configuration", files: 2, add: 78, del: 15 },
  { title: "Add health check endpoint with dependency status", files: 3, add: 56, del: 4 },
  { title: "Migrate database queries to use prepared statements", files: 7, add: 198, del: 167 },
  { title: "Add OpenAPI spec generation from route handlers", files: 5, add: 312, del: 0 },
];

const reviewDetails = [
  { summary: "Approved — clean implementation, good test coverage", detail: "Code follows established patterns. Error handling is thorough. Tests cover edge cases." },
  { summary: "Approved — no issues found, 2 style suggestions", detail: "Implementation is solid. Consider extracting validation logic into shared utility." },
  { summary: "Approved — secure implementation, well-documented", detail: "Security review passed. Input sanitization is correct. API boundaries well-defined." },
  { summary: "Approved — backwards compatible, good migration path", detail: "Schema changes backwards compatible. Migration script handles edge cases." },
  { summary: "Changes requested — 1 issue, 2 suggestions", detail: "Found potential race condition in connection pool cleanup. Suggest adding mutex." },
];

const codeSnippets = [
  'function parseToken(input: string) { return input.split(".").map(decode); }',
  "async function validateAuth(req: Request) { const token = req.headers.authorization; }",
  "const rateLimiter = new RateLimiter({ windowMs: 60000, max: 100 });",
  "export class CacheManager { private store = new Map<string, CacheEntry>(); }",
  "function hashPassword(pwd: string) { return bcrypt.hash(pwd, SALT_ROUNDS); }",
];

const textsToSummarize = [
  "Release v2.3.0 includes 12 new features, performance improvements, 3 breaking changes in the auth API.",
  "Q4 security audit: 0 critical vulnerabilities. Two low-severity findings patched.",
  "This week: 23 PRs merged, 5 new contributors, test coverage increased from 91% to 94%.",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let prCounter = 44;

// ── API helpers ──────────────────────────────────────────────────────────────

async function postEvent(event: Record<string, any>): Promise<boolean> {
  const res = await fetch(`${API_URL}/api/event`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event),
  });
  return res.ok;
}

async function callPaidEndpoint(
  endpoint: string,
  body: object,
  price: string,
  chainId?: string
): Promise<any> {
  const initialRes = await fetch(`${API_URL}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (initialRes.status === 402) {
    console.log(`  → 402 received for ${endpoint} — paying ${price}...`);

    const paidRes = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Payment": JSON.stringify({
          scheme: "gokite-aa",
          network: "kite-testnet",
          amount: price,
          payer: AGENT_ADDRESS,
        }),
        "X-Sender": AGENT_ADDRESS,
        "X-Sender-Name": AGENT_NAME,
        ...(chainId ? { "X-Chain-Id": chainId } : {}),
      },
      body: JSON.stringify(body),
    });

    if (paidRes.ok) return await paidRes.json();
    console.error(`  ✗ Payment failed:`, paidRes.status);
    return null;
  }

  if (initialRes.ok) return await initialRes.json();
  return null;
}

// ── Activity chain: code push → agent review → payment ──────────────────────

async function runActivityChain() {
  const contributor = pick(humanContributors);
  const pr = pick(prTemplates);
  const prNum = ++prCounter;
  const chainId = `chain_live_${Date.now()}`;

  console.log(`\n  [Chain] ${contributor.name} → PR #${prNum}: "${pr.title}"`);

  // Step 1: Simulate contributor pushing code
  console.log(`  [1/3] ${contributor.name} pushes PR #${prNum}...`);
  await postEvent({
    type: "code_push",
    sender: contributor.address,
    senderName: contributor.name,
    content: `Pushed ${pr.title.toLowerCase()}`,
    prNumber: prNum,
    prTitle: pr.title,
    filesChanged: pr.files,
    additions: pr.add,
    deletions: pr.del,
    chainId,
  });

  // Wait 3-6 seconds (agent "reviewing")
  const reviewDelay = 3000 + Math.random() * 3000;
  console.log(`  [2/3] Agent reviewing... (${(reviewDelay / 1000).toFixed(1)}s)`);
  await delay(reviewDelay);

  // Step 2: Agent posts review
  const review = pick(reviewDetails);
  await postEvent({
    type: "agent_review",
    sender: AGENT_ADDRESS,
    senderName: AGENT_NAME,
    content: review.detail,
    reviewResult: review.summary.startsWith("Approved") ? "approved" : "changes_requested",
    reviewSummary: review.summary,
    linkedPrNumber: prNum,
    linkedPrTitle: pr.title,
    chainId,
  });
  console.log(`  [2/3] Review posted: ${review.summary}`);

  // Wait 1-2 seconds before payment
  await delay(1000 + Math.random() * 1000);

  // Step 3: Pay for the review via x402
  console.log(`  [3/3] Paying for review via x402...`);
  const result = await callPaidEndpoint(
    "/api/review",
    { description: pr.title },
    "$0.10",
    chainId
  );

  if (result) {
    console.log(`  ✓ Chain complete: PR #${prNum} reviewed and paid`);
  }
}

// ── Standalone API calls (analyze/summarize without chain) ───────────────────

async function analyzeCode() {
  console.log(`  [Standalone] Code analysis...`);
  const result = await callPaidEndpoint(
    "/api/analyze",
    { code: pick(codeSnippets) },
    "$0.05"
  );
  if (result) {
    console.log(`  ✓ Analysis: ${result.result.substring(0, 60)}...`);
  }
}

async function summarizeText() {
  console.log(`  [Standalone] Summarization...`);
  const result = await callPaidEndpoint(
    "/api/summarize",
    { text: pick(textsToSummarize) },
    "$0.03"
  );
  if (result) {
    console.log(`  ✓ Summary: ${result.result.substring(0, 60)}...`);
  }
}

// ── Main loop ────────────────────────────────────────────────────────────────

async function main() {
  console.log("╔══════════════════════════════════════════════╗");
  console.log("║  ContribOS Agent — Autonomous x402 Consumer  ║");
  console.log("╚══════════════════════════════════════════════╝");
  console.log(`API: ${API_URL}`);
  console.log(`Agent: ${AGENT_NAME} (${AGENT_ADDRESS})\n`);

  try {
    const health = await fetch(`${API_URL}/api/health`);
    if (!health.ok) throw new Error("Server not healthy");
    console.log("[Agent] Server is up. Starting autonomous loop...\n");
  } catch {
    console.error("[Agent] Cannot reach server at", API_URL);
    process.exit(1);
  }

  // Post initial message
  await postEvent({
    type: "system",
    sender: "system",
    senderName: "ContribOS",
    content: "Agent-Reviewer online — monitoring project for review requests",
  });

  let cycle = 0;
  while (true) {
    cycle++;
    console.log(`\n── Cycle ${cycle} ──────────────────────────────────────`);

    // 60% chance: full activity chain, 20% analyze, 20% summarize
    const roll = Math.random();
    try {
      if (roll < 0.6) {
        await runActivityChain();
      } else if (roll < 0.8) {
        await analyzeCode();
      } else {
        await summarizeText();
      }
    } catch (e: any) {
      console.error(`[Agent] Error:`, e.message);
    }

    const waitTime = 12000 + Math.random() * 13000;
    console.log(`[Agent] Next cycle in ${(waitTime / 1000).toFixed(1)}s...`);
    await delay(waitTime);
  }
}

main().catch(console.error);
