#!/usr/bin/env node
/**
 * HTTP smoke against a running server (no Playwright).
 * Usage: BASE_URL=http://127.0.0.1:3000 node scripts/smoke-http.mjs
 * Requires: npm run build && npm run start (or dev) already listening.
 */

const base = (process.env.BASE_URL ?? "http://127.0.0.1:3000").replace(/\/$/, "");

const paths = [
  "/",
  "/demo",
  "/how-it-works",
  "/settlement",
  "/agents",
  "/openapi.json",
];

async function main() {
  const errors = [];

  for (const p of paths) {
    const url = `${base}${p}`;
    try {
      const res = await fetch(url, { redirect: "follow" });
      if (!res.ok) {
        errors.push(`${url} → ${res.status}`);
      } else if (p === "/openapi.json") {
        const j = await res.json();
        if (typeof j?.openapi !== "string") {
          errors.push(`${url} → invalid OpenAPI JSON`);
        }
      }
    } catch (e) {
      errors.push(`${url} → ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  const merchant =
    "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
  try {
    const post = await fetch(`${base}/api/intents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        label: "smoke",
        amountUsdc: "0.01",
        merchantAddress: merchant,
      }),
    });
    if (!post.ok) {
      errors.push(`POST /api/intents → ${post.status} ${await post.text()}`);
    } else {
      const data = await post.json();
      const id = data.intent?.id;
      if (!id) {
        errors.push("POST /api/intents → missing intent.id");
      } else {
        const r402 = await fetch(`${base}/api/resources/${id}`);
        if (r402.status !== 402) {
          errors.push(`GET /api/resources/${id} expected 402 got ${r402.status}`);
        }
        const rIntent = await fetch(`${base}/api/intents/${id}`);
        if (!rIntent.ok) {
          errors.push(`GET /api/intents/${id} → ${rIntent.status}`);
        }
      }
    }
  } catch (e) {
    errors.push(`API flow → ${e instanceof Error ? e.message : String(e)}`);
  }

  if (errors.length) {
    console.error("Smoke failed:\n", errors.join("\n"));
    process.exit(1);
  }
  console.log("Smoke OK:", base, `(${paths.length + 1} page checks + API flow)`);
}

await main();
