# Umbra Pay Links

**Private payment links for humans and machines on Solana** — one intent, **Umbra-confidential settlement**, and an **x402-style HTTP 402** URL so software can pay the same bill without a custom integration.

| | |
| --- | --- |
| **Repository** | [github.com/panagot/-Umbra-Pay-Links](https://github.com/panagot/-Umbra-Pay-Links) |
| **Live demo** | *Add your Vercel URL here after deploy* |
| **Track** | [Umbra Side Track — Superteam](https://superteam.fun/earn/listing/umbra-side-track) |

---

## The problem & who it’s for

**Problem:** “Pay me” on Solana usually means exposing a **public graph** of who paid whom and how much. **Solana Pay–style** flows and plain SPL transfers don’t give merchants or payers **transactional privacy**. At the same time, **AI agents and backends** need a **standard machine protocol** (not only a browser QR code).

**Who benefits**

| User | Use case |
| ---- | -------- |
| **Creators, shops, SaaS** | Invoices, tips, API access, digital goods — **shareable links** where the **merchant address is not in the URL** (opaque id only). |
| **Payers** | Familiar flow: open link → wallet → pay; value moves on **Umbra’s confidential rails** toward the merchant. |
| **Agent & platform builders** | **X402 private payments**: one **GET** returns **402 + JSON** until Umbra settlement is recorded, then **200** — same pattern as emerging x402 tooling, with **Umbra underneath**, not a naive “send to `payTo`” instruction. |

---

## How this uses the **Umbra SDK** (core integration)

This product **does not** replace Umbra with a server-side fake or a simple SPL transfer. **Settlement is the Umbra SDK end-to-end.**

**Packages:** `@umbra-privacy/sdk`, `@umbra-privacy/web-zk-prover`, Wallet Standard (`@wallet-standard/*`), `@solana/kit` for typed addresses.

**Browser checkout (`PayWithUmbra`) — in order:**

1. `createSignerFromWalletAccount` — Wallet Standard → Umbra signer  
2. `getUmbraClient` — network, RPC, WebSocket subscriptions, Umbra indexer  
3. `getUserAccountQuerierFunction` / `getUserRegistrationFunction` — Umbra identity when needed  
4. `getPublicBalanceToReceiverClaimableUtxoCreatorFunction` + `getCreateReceiverClaimableUtxoFromPublicBalanceProver` — **public USDC → receiver-claimable UTXO** toward the merchant (confidential settlement path)

**Headless automation (`scripts/agent-pay.mjs`):** same pipeline with `createSignerFromPrivateKeyBytes` — **proves parity** for machine payers.

**App server:** stores intents, serves **402** resources, optional **`getSignatureStatuses`** gate (`REQUIRE_ONCHAIN_CONFIRM_FOR_SETTLE`), webhooks. **Umbra’s programs** are invoked **through the SDK** from the client; this repo does not ship a separate on-chain program ID.

**Further Umbra primitives (roadmap-friendly):** viewing keys, selective disclosure, and private swaps are part of Umbra’s broader stack — this prototype focuses on **private pay links + x402-shaped agent access**, which maps directly to the track’s *Private Payments* and *X402 Private Payments* prompts.

---

## What you get in the app

1. **Human pay link** — `/pay/<id>`: wallet + Umbra checkout.  
2. **Agent resource link** — `/api/resources/<id>`: **402** until paid, then **200** + JSON.  
3. Optional **webhook** on first settlement.  
4. In-app **How it works**, **Settlement**, **Agents & APIs**, and **Demo center** (simulations + link to live flow).

---

## Build, test, and run

```bash
npm install
cp .env.example .env.local   # optional
npm run dev
```

Open [http://localhost:3000](http://localhost:3000): create an intent → open the **pay link** (wallet + Umbra) → call the **resource URL** again (or use `npm run agent:pay` with a funded keypair — see `.env.example` and script header).

**Tests**

| Command | Purpose |
| ------- | ------- |
| `npm run test` / `npm run test:unit` | Vitest — helpers for rate limits + RPC verify |
| `npm run test:e2e` | Playwright — all main pages + OpenAPI + intent → pay → **402** |
| `npm run test:smoke` | Quick `fetch` smoke (needs server on `BASE_URL`) |
| `npm run test:all` | Unit + E2E |

First-time Playwright: `npx playwright install chromium`

---

## Deploy (e.g. Vercel)

1. Import the GitHub repo in [Vercel](https://vercel.com/).  
2. Set **`NEXT_PUBLIC_APP_URL`** to your production URL so generated links are correct.  
3. **File storage:** intents live in `data/` for this demo — **serverless disk is ephemeral**; use a database for production.

---

## Suggested demo video (under 5 minutes)

1. **0:00–0:30** — Problem: public pay links vs need for **financial privacy** + **agents**.  
2. **0:30–1:30** — **Demo center**: retail simulation, then **402 → pay → 200** timeline (no wallet).  
3. **1:30–3:30** — **Live flow**: create intent → show **opaque id** vs merchant address → **pay with Umbra** (or show settlement step) → refresh **agent URL** → **200**.  
4. **3:30–4:30** — **Code / SDK**: quick open of Settlement page or README — list **`getUmbraClient`** + **receiver-claimable UTXO** as the real move.  
5. **4:30–5:00** — **Impact**: private payment links + **x402-compatible** agent surface on Solana.

---

## References

- [Umbra SDK](https://sdk.umbraprivacy.com/) · [Quickstart](https://sdk.umbraprivacy.com/quickstart)  
- [Umbra](https://umbraprivacy.com/) (product context)  
- [x402 response format (concept)](https://docs.g402.ai/docs/api/response-format)  
- OpenAPI in this app: `/openapi.json`

---

## License

MIT
