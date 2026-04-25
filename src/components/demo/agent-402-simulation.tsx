"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DEMO_ANCHORS } from "@/components/demo/demo-anchors";
import {
  VECTOR_STORE_BASE,
  useDemoCheckoutOptional,
  type SyncedVectorCheckout,
} from "@/components/demo/demo-checkout-sync";
import { InfoTip } from "@/components/ui/tooltip";

type Phase = "idle" | "request" | "402" | "pay" | "200";

/** Shown until you hit “Generate checkout links” in VECTOR SILICON — same 3-line story. */
const DEFAULT_CHECKOUT: SyncedVectorCheckout = {
  intentId: "build_vs9c2a8f1e704",
  amountAtomic: "877000000",
  subtotalLabel: "877.00",
  lineItems: [
    "Nebula RTX 5070 Twin",
    "Volt DDR5-6000 32GB kit",
    "BlackSnake NVMe Gen4 2TB",
  ],
};

function buildDescription(lines: string[], sub: string) {
  const head = lines.slice(0, 3).join(" · ");
  const extra = lines.length > 3 ? ` +${lines.length - 3} more` : "";
  return `VECTOR SILICON · PC build — ${head}${extra} ($${sub} USDC)`;
}

function buildMock402(live: SyncedVectorCheckout) {
  const { intentId, amountAtomic, subtotalLabel, lineItems } = live;
  return {
    x402Version: 1,
    error: "Payment required — settle with Umbra per extra (not a raw SPL transfer).",
    accepts: [
      {
        scheme: "exact",
        network: "solana-mainnet",
        maxAmountRequired: amountAtomic,
        maxTimeoutSeconds: 600,
        resource: `${VECTOR_STORE_BASE}/api/resources/${intentId}`,
        description: buildDescription(lineItems, subtotalLabel),
        payTo: "VECTOR_SILICON_MERCHANT_TRUNC",
        asset: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        mimeType: "application/json",
        outputSchema: null,
        extra: {
          name: "USDC",
          settlement: "umbra-receiver-claimable-utxo",
          intentId,
          amountAtomic,
          mint: "EPjF…Td1v",
          humanPayUrl: `${VECTOR_STORE_BASE}/pay/${intentId}`,
          confirmUrl: `${VECTOR_STORE_BASE}/api/intents/${intentId}/confirm`,
          cartSummary: lineItems.join(" · "),
          buildManifestPreview: "sha256:bom_vs9c2a…",
        },
      },
    ],
  };
}

function buildMock200(live: SyncedVectorCheckout) {
  return {
    unlocked: true,
    intentId: live.intentId,
    tier: "pc_build_paid",
    message:
      "Pick list released — warehouse pulls parts for VECTOR SILICON checkout " +
      live.intentId +
      ".",
    lineItems: live.lineItems,
  };
}

function PhaseDot({ active }: { active: boolean }) {
  return (
    <span
      className={[
        "h-2 w-2 rounded-full transition",
        active
          ? "scale-125 bg-brand shadow shadow-brand/40"
          : "bg-line-strong",
      ].join(" ")}
    />
  );
}

const cardWrap =
  "overflow-hidden rounded-2xl border border-line bg-panel shadow-[var(--shadow-card)]";

const preBox =
  "max-h-52 overflow-auto rounded-xl border border-line bg-canvas/90 p-3 font-mono text-[11px] leading-relaxed shadow-inner sm:p-4";

export function Agent402Simulation() {
  const ctx = useDemoCheckoutOptional();
  const [phase, setPhase] = useState<Phase>("idle");
  const [log, setLog] = useState<string[]>([]);
  const timersRef = useRef<number[]>([]);

  const live = useMemo(() => ctx?.synced ?? DEFAULT_CHECKOUT, [ctx?.synced]);
  const isLinked = Boolean(ctx?.synced);

  const mock402 = useMemo(() => buildMock402(live), [live]);
  const mock200 = useMemo(() => buildMock200(live), [live]);

  const push = useCallback((line: string) => {
    setLog((prev) => [...prev.slice(-18), line]);
  }, []);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }, []);

  const schedule = useCallback((ms: number, fn: () => void) => {
    timersRef.current.push(window.setTimeout(fn, ms));
  }, []);

  const runX402 = useCallback(() => {
    const L = ctx?.synced ?? DEFAULT_CHECKOUT;
    const id = L.intentId;
    const base = VECTOR_STORE_BASE;

    clearTimers();
    setLog([]);
    setPhase("request");
    push(`GET ${base}/api/resources/${id}`);
    push(
      "User-Agent: VectorSilicon-BuildAgent/1.0 (headless buyer — same cart as storefront)",
    );
    schedule(450, () => {
      setPhase("402");
      push("← 402 Payment Required");
      push(
        `Cart: ${L.lineItems.slice(0, 3).join(" · ")}${L.lineItems.length > 3 ? " …" : ""} · $${L.subtotalLabel} USDC`,
      );
      push("Parsing accepts[0]: scheme=exact, network=solana-mainnet");
      push("extra.settlement = umbra-receiver-claimable-utxo → Umbra client");
    });
    schedule(1600, () => {
      push(`extra.humanPayUrl / agent resource match rail: ${base}/pay/${id}`);
    });
    schedule(2600, () => {
      setPhase("pay");
      push("ZK: receiver-claimable UTXO for parts payout (same path as human Pay with Umbra)");
      push("RPC: proof txs confirmed — warehouse gate still closed until POST confirm");
    });
    schedule(4200, () => {
      push(`POST ${base}/api/intents/${id}/confirm { signatures: […] }`);
    });
    schedule(5000, () => {
      setPhase("200");
      push(`GET ${base}/api/resources/${id} → 200 application/json`);
      push('Body: { unlocked: true, tier: "pc_build_paid", lineItems: […] }');
    });
    schedule(8200, () => setPhase("idle"));
  }, [ctx?.synced, push, clearTimers, schedule]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  return (
    <section id={DEMO_ANCHORS.agent} className={`${cardWrap} scroll-mt-24`}>
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line bg-canvas/60 px-4 py-4 sm:px-5 sm:py-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-teal">
              Protocol · VECTOR SILICON · in-browser only
            </p>
            {isLinked ? (
              <span className="rounded-full border border-teal/30 bg-teal-soft/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-teal">
                Linked to checkout above
              </span>
            ) : (
              <span className="rounded-full border border-line bg-surface px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted">
                Example intent
              </span>
            )}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold tracking-tight text-ink sm:text-xl">
              Agent: 402 → Umbra → 200
            </h2>
            <InfoTip
              label="Simulation"
              content={
                <>
                  Uses the same <code className="font-mono">build_…</code> id and USDC
                  total as the Human / Agent URLs in the cart rail after you click
                  Generate checkout links — or the default three-line build before that.
                </>
              }
            />
          </div>
          <p className="mt-1 max-w-2xl text-xs text-muted sm:text-sm">
            Mock JSON mirrors this repo&apos;s{" "}
            <code className="rounded bg-panel px-1 font-mono text-[10px]">/api/resources/:id</code>{" "}
            shape. Resource and pay URLs always match{" "}
            <strong className="text-ink">vector-silicon.demo</strong> and the active
            intent id.
          </p>
        </div>
        <button
          type="button"
          onClick={() => runX402()}
          disabled={phase !== "idle" && phase !== "200"}
          className="shrink-0 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-40"
        >
          {phase !== "idle" && phase !== "200" ? "Running…" : "Run simulation"}
        </button>
      </div>

      <div className="space-y-4 p-4 sm:p-5">
        <div className="flex flex-wrap gap-3 rounded-xl border border-line/90 bg-surface px-3 py-3 text-[11px] text-muted sm:gap-4 sm:px-4">
          <div className="min-w-[130px] flex-1">
            <p className="font-semibold text-ink">Resource</p>
            <code className="mt-0.5 block break-all font-mono text-teal">
              GET {VECTOR_STORE_BASE}/api/resources/{live.intentId}
            </code>
          </div>
          <div className="min-w-[130px] flex-1 border-l border-line/70 pl-3 sm:pl-4">
            <p className="font-semibold text-ink">Human pay (same intent)</p>
            <code className="mt-0.5 block break-all font-mono text-brand">
              {VECTOR_STORE_BASE}/pay/{live.intentId}
            </code>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium text-muted">
          <span className="flex items-center gap-1.5">
            <PhaseDot active={phase === "request"} /> GET
          </span>
          <span className="text-line-strong" aria-hidden>
            →
          </span>
          <span className="flex items-center gap-1.5">
            <PhaseDot active={phase === "402"} /> 402 + parse
          </span>
          <span className="text-line-strong" aria-hidden>
            →
          </span>
          <span className="flex items-center gap-1.5">
            <PhaseDot active={phase === "pay"} /> Umbra + confirm
          </span>
          <span className="text-line-strong" aria-hidden>
            →
          </span>
          <span className="flex items-center gap-1.5">
            <PhaseDot active={phase === "200"} /> 200
          </span>
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          <div>
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-faint">
              Activity log
            </p>
            <pre className={`${preBox} text-teal`}>
              {log.length === 0
                ? isLinked
                  ? "Press “Run simulation” — flow uses your generated build_… id and cart total."
                  : "Press “Run simulation” — or generate checkout links above to bind this block to that intent."
                : log.join("\n")}
            </pre>
          </div>
          <div>
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-faint">
              Response body (mock)
            </p>
            <pre className={`${preBox} text-[10px] text-ink`}>
              {phase === "200"
                ? JSON.stringify(mock200, null, 2)
                : JSON.stringify(mock402, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
