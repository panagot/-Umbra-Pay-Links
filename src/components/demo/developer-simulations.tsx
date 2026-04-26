"use client";

import Link from "next/link";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  VECTOR_STORE_BASE,
  useDemoCheckoutOptional,
  type SyncedVectorCheckout,
} from "@/components/demo/demo-checkout-sync";
import { InfoTip } from "@/components/ui/tooltip";

const cardWrap =
  "overflow-hidden rounded-2xl border border-line bg-panel shadow-[var(--shadow-card)]";

const preBox =
  "max-h-56 overflow-auto rounded-xl border border-line bg-canvas/90 p-3 font-mono text-[11px] leading-relaxed shadow-inner sm:p-4";

const DEFAULT_TOPUP: SyncedVectorCheckout = {
  intentId: "api_topup_8f2a91bc",
  amountAtomic: "49000000",
  subtotalLabel: "49.00",
  lineItems: ["API credits · Starter (2,500 calls)"],
};

function settledPayload(live: SyncedVectorCheckout) {
  return {
    event: "intent.settled" as const,
    intentId: live.intentId,
    label: live.lineItems[0] ?? "API credits",
    amountAtomic: live.amountAtomic,
    mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    merchantAddress: "ORBITGRID_DEMO_MERCHANT",
    settledAt: new Date().toISOString(),
    simulated: true,
  };
}

function mock402Body(live: SyncedVectorCheckout) {
  return {
    x402Version: 1,
    error: "Payment required — settle with Umbra per extra (simulation).",
    accepts: [
      {
        scheme: "exact",
        network: "solana-mainnet",
        maxAmountRequired: live.amountAtomic,
        resource: `${VECTOR_STORE_BASE}/api/resources/${live.intentId}`,
        description: live.lineItems.join(" · "),
        payTo: "ORBITGRID_MERCHANT_TRUNC",
        asset: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        extra: {
          settlement: "umbra-receiver-claimable-utxo",
          intentId: live.intentId,
          humanPayUrl: `${VECTOR_STORE_BASE}/pay/${live.intentId}`,
          confirmUrl: `${VECTOR_STORE_BASE}/api/intents/${live.intentId}/confirm`,
        },
      },
    ],
  };
}

type WebhookRow = {
  id: string;
  ts: string;
  event: string;
  body: string;
};

type DevSimCtxValue = {
  webhooks: WebhookRow[];
  appendWebhook: (event: string, body: object) => void;
  clearWebhooks: () => void;
};

const DevSimCtx = createContext<DevSimCtxValue | null>(null);

export function DeveloperSimProvider({ children }: { children: ReactNode }) {
  const [webhooks, setWebhooks] = useState<WebhookRow[]>([]);

  const appendWebhook = useCallback((event: string, body: object) => {
    const ts = new Date().toISOString();
    setWebhooks((w) => [
      {
        id: `${ts}-${w.length}`,
        ts: ts.slice(11, 23),
        event,
        body: JSON.stringify(body, null, 2),
      },
      ...w.slice(0, 24),
    ]);
  }, []);

  const clearWebhooks = useCallback(() => setWebhooks([]), []);

  const value = useMemo(
    () => ({ webhooks, appendWebhook, clearWebhooks }),
    [webhooks, appendWebhook, clearWebhooks],
  );

  return <DevSimCtx.Provider value={value}>{children}</DevSimCtx.Provider>;
}

function useDeveloperSim() {
  const c = useContext(DevSimCtx);
  if (!c) {
    throw new Error("DeveloperSimProvider is required");
  }
  return c;
}

export function DeveloperWebhookInbox() {
  const { webhooks, clearWebhooks } = useDeveloperSim();

  return (
    <section className={`${cardWrap} scroll-mt-24`}>
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line bg-canvas/60 px-4 py-4 sm:px-5">
        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-teal">
            Webhook inbox · mock
          </p>
          <h2 className="mt-1 text-lg font-semibold text-ink sm:text-xl">Merchant endpoint</h2>
          <p className="mt-1 max-w-2xl text-xs text-muted sm:text-sm">
            Rows appear when you complete a simulation below (same{" "}
            <code className="rounded bg-panel px-1 font-mono text-[10px]">intent.settled</code>{" "}
            shape as production webhooks).
          </p>
        </div>
        <button
          type="button"
          onClick={() => clearWebhooks()}
          className="rounded-xl border border-line bg-surface px-3 py-2 text-xs font-medium text-muted hover:border-teal/40 hover:text-teal"
        >
          Clear
        </button>
      </div>
      <div className="p-4 sm:p-5">
        {webhooks.length === 0 ? (
          <p className="rounded-xl border border-dashed border-line bg-canvas/50 py-8 text-center text-sm text-muted">
            No events yet. Run the API credits or terminal simulation.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-line">
            <table className="w-full min-w-[520px] text-left text-xs">
              <thead className="border-b border-line bg-canvas/80 font-semibold text-ink">
                <tr>
                  <th className="px-3 py-2 font-mono">Time (UTC)</th>
                  <th className="px-3 py-2">Event</th>
                  <th className="px-3 py-2">Body</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-muted">
                {webhooks.map((row) => (
                  <tr key={row.id} className="align-top">
                    <td className="whitespace-nowrap px-3 py-2 font-mono text-teal">{row.ts}</td>
                    <td className="whitespace-nowrap px-3 py-2 font-medium text-ink">{row.event}</td>
                    <td className="px-3 py-2">
                      <pre className="max-h-32 overflow-auto whitespace-pre-wrap break-all font-mono text-[10px] leading-relaxed text-ink">
                        {row.body}
                      </pre>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

export function DeveloperApiCreditsPanel() {
  const checkout = useDemoCheckoutOptional();
  const { appendWebhook } = useDeveloperSim();
  const live = useMemo(() => checkout?.synced ?? DEFAULT_TOPUP, [checkout?.synced]);
  const linked = Boolean(checkout?.synced);
  const [credits, setCredits] = useState(8_500);
  const [busy, setBusy] = useState(false);

  const runPurchase = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    await new Promise((r) => setTimeout(r, 1_100));
    setCredits((c) => c + 25_000);
    appendWebhook("intent.settled", settledPayload(live));
    setBusy(false);
  }, [busy, appendWebhook, live]);

  const pct = Math.min(100, Math.round((credits / 50_000) * 100));

  return (
    <section className={`${cardWrap} scroll-mt-24`}>
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line bg-canvas/60 px-4 py-4 sm:px-5">
        <div className="min-w-0">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-teal">
            SaaS · OrbitGrid API (simulation)
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold tracking-tight text-ink sm:text-xl">
              API credits
            </h2>
            <InfoTip
              label="Simulation"
              content="Balances and webhooks are local only. If you generated checkout links on the Demo center retail page, amounts and intent id sync here."
            />
          </div>
          {linked ? (
            <p className="mt-2 rounded-lg border border-teal/30 bg-teal-soft/40 px-2.5 py-1.5 text-[11px] font-medium text-teal">
              Linked checkout · intent{" "}
              <code className="font-mono">{live.intentId}</code> · ${live.subtotalLabel} USDC
            </p>
          ) : (
            <p className="mt-2 text-xs text-muted">
              Example pack: <code className="font-mono text-ink">{DEFAULT_TOPUP.intentId}</code>{" "}
              · ${DEFAULT_TOPUP.subtotalLabel} USDC.{" "}
              <Link href="/demo#demo-retail" className="font-medium text-teal hover:underline">
                Demo center
              </Link>{" "}
              to bind a cart.
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => void runPurchase()}
          disabled={busy}
          className="shrink-0 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy ? "Processing…" : "Simulate: buy +25,000 credits"}
        </button>
      </div>
      <div className="space-y-4 p-4 sm:p-5">
        <div>
          <div className="flex items-baseline justify-between gap-2 text-xs text-muted">
            <span>Balance (credits)</span>
            <span className="font-mono font-semibold text-ink">
              {credits.toLocaleString()} / 50,000
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-line">
            <div
              className="h-full rounded-full bg-teal transition-[width] duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
        <p className="text-[11px] leading-relaxed text-muted">
          After the simulated Umbra settlement, your server would extend quota and emit
          analytics. Here we only bump the meter and append one{" "}
          <code className="rounded bg-panel px-1 font-mono text-[10px]">intent.settled</code>{" "}
          row to the inbox below.
        </p>
      </div>
    </section>
  );
}

type TermPhase = "idle" | "running" | "done";

export function DeveloperTerminalAgentLog() {
  const checkout = useDemoCheckoutOptional();
  const { appendWebhook } = useDeveloperSim();
  const live = useMemo(() => checkout?.synced ?? DEFAULT_TOPUP, [checkout?.synced]);
  const linked = Boolean(checkout?.synced);
  const [phase, setPhase] = useState<TermPhase>("idle");
  const [log, setLog] = useState<string[]>([]);
  const timersRef = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }, []);

  const schedule = useCallback((ms: number, fn: () => void) => {
    timersRef.current.push(window.setTimeout(fn, ms));
  }, []);

  const push = useCallback((line: string) => {
    setLog((prev) => [...prev.slice(-40), line]);
  }, []);

  const run = useCallback(() => {
    if (phase === "running") return;
    clearTimers();
    setLog([]);
    setPhase("running");
    const id = live.intentId;
    const base = VECTOR_STORE_BASE;
    const url = `${base}/api/resources/${id}`;

    push(`$ export ORBITGRID_API_KEY=demo_••••••••`);
    push(`$ curl -sSi "${url}"`);
    schedule(500, () => {
      push("HTTP/1.1 402 Payment Required");
      push("content-type: application/json");
      push("");
      push(JSON.stringify(mock402Body(live), null, 2).slice(0, 420) + "\n…");
    });
    schedule(2_000, () => {
      push("");
      push("# Payer completes Umbra checkout + POST /confirm (omitted in sim)");
    });
    schedule(3_200, () => {
      push(`$ curl -sSi "${url}"`);
    });
    schedule(3_700, () => {
      push("HTTP/1.1 200 OK");
      push("content-type: application/json");
      push("");
      push(
        JSON.stringify(
          { unlocked: true, intentId: id, tier: "api_credits_released", creditsDelta: 25000 },
          null,
          2,
        ),
      );
    });
    schedule(4_400, () => {
      appendWebhook("intent.settled", settledPayload(live));
      setPhase("done");
    });
    schedule(6_200, () => setPhase("idle"));
  }, [phase, live, push, clearTimers, schedule, appendWebhook]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  return (
    <section className={`${cardWrap} scroll-mt-24`}>
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line bg-canvas/60 px-4 py-4 sm:px-5">
        <div className="min-w-0">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-teal">
            Agent · headless poll (simulation)
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold tracking-tight text-ink sm:text-xl">
              Terminal log
            </h2>
            {linked ? (
              <span className="rounded-full border border-teal/30 bg-teal-soft/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-teal">
                Linked intent
              </span>
            ) : (
              <span className="rounded-full border border-line bg-surface px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted">
                Example intent
              </span>
            )}
          </div>
          <p className="mt-1 max-w-2xl text-xs text-muted sm:text-sm">
            Typed client output only. The second GET mirrors{" "}
            <code className="rounded bg-panel px-1 font-mono text-[10px]">GET /api/resources/:id</code>{" "}
            after settlement.
          </p>
        </div>
        <button
          type="button"
          onClick={() => run()}
          disabled={phase === "running"}
          className="shrink-0 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-40"
        >
          {phase === "running" ? "Running…" : "Run terminal simulation"}
        </button>
      </div>
      <div className="p-4 sm:p-5">
        <pre className={`${preBox} text-ink`}>
          {log.length === 0
            ? 'Press "Run terminal simulation" — output appears here; webhook row is appended when 200 is returned.'
            : log.join("\n")}
        </pre>
      </div>
    </section>
  );
}
