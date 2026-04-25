# Umbra Pay Links

**Private pay links for people and software.**  
Create one payment in the app and get two links: a normal **checkout page** for humans (wallet + Umbra), and a **machine-friendly URL** that apps and AI agents can call until the bill is paid—then it unlocks automatically.

Built for the [Umbra Side Track](https://superteam.fun/earn/listing/umbra-side-track) on Solana.  
**Repository:** [github.com/panagot/-Umbra-Pay-Links](https://github.com/panagot/-Umbra-Pay-Links)

---

## In plain English

### The problem it solves

- **Creators and shops** want a “pay me” link without every payment being trivially traceable on a public ledger graph.
- **Customers** want to pay in a familiar way: open a link, connect a wallet, confirm.
- **Apps and AI agents** need a **standard web pattern**: “call this URL; if you’re not paid yet, you get a clear ‘payment required’ response; pay; call again and you get the content.”

This project ties those together: **one payment record**, **private settlement through Umbra**, and **the same bill** whether the payer is a person or a bot.

### What you get when you create a link

1. **Human pay link** — Share it like any checkout URL. The payer opens it in the browser, connects a Solana wallet (e.g. Phantom), and pays with **Umbra** so funds move on a confidential path toward your merchant wallet.
2. **Agent link** — The same payment, exposed as a web API. Before payment, it answers with **“payment required”** and structured instructions. After payment, it answers with **success** and a small JSON payload—so automation can “pay and retry” without a custom integration for every merchant.

You only configure the amount, label, and **merchant Solana address** once.

### Who it’s for

| Audience | Why it matters |
| -------- | -------------- |
| **Solo creators & small teams** | One link for invoices, tips, or digital goods—plus optional webhook when someone pays. |
| **Developers** | OpenAPI spec at `/openapi.json`, demo pages, and a sample script for headless payment. |
| **Agent / AI builders** | Same URL before and after pay; status flips from “pay up” to “here’s your data” using familiar HTTP semantics. |

### Try it locally

1. Clone the repo and install dependencies: `npm install`
2. (Optional) Copy `.env.example` to `.env.local` if you need custom RPC or network settings.
3. Run `npm run dev` and open [http://localhost:3000](http://localhost:3000)
4. Create a payment, open the **human pay link**, complete checkout, then hit the **agent link** again—you should see it unlock.

**Wallet:** You need a **Wallet Standard** Solana wallet with transaction and message signing. The merchant address you enter must be able to receive Umbra flows (see in-app **Settlement** docs).

---

## Deploy on Vercel

1. Push this repo to GitHub and **Import** the project in [Vercel](https://vercel.com/).
2. Framework: **Next.js** (auto-detected). Build: `npm run build`, output default.
3. In Vercel **Environment variables**, set at least **`NEXT_PUBLIC_APP_URL`** to your production URL (e.g. `https://your-project.vercel.app`) so generated pay links and API URLs are correct.

**Important:** This demo stores intents in a local **`data/`** file. On Vercel, serverless instances don’t give you durable disk the way a VPS does—treat hosted deploys as **demos**, or swap storage for a real database before serious use.

Do **not** commit `.env.local`, keypair JSON files, or live `data/*.json`—they are listed in `.gitignore`.

---

## Technical details (short)

- **Settlement:** [Umbra SDK](https://sdk.umbraprivacy.com/quickstart) — receiver-claimable UTXO flow from public USDC balance, with ZK prover in the browser; headless path mirrors the same SDK calls in `scripts/agent-pay.mjs`.
- **Agent protocol:** `GET /api/resources/<id>` returns **402** + x402-shaped JSON until paid, then **200**.
- **Hardening:** Rate limits on API routes, optional on-chain signature check (`REQUIRE_ONCHAIN_CONFIRM_FOR_SETTLE` in `.env.example`), optional merchant webhooks, Vitest tests.

More depth: use the in-app guides (**How it works**, **Settlement**, **Agents & APIs**) and the [x402 response format](https://docs.g402.ai/docs/api/response-format) concept doc.

---

## License

MIT
