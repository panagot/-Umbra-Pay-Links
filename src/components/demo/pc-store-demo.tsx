"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { DEMO_NAV_LINKS } from "@/components/demo/demo-anchors";
import {
  VECTOR_STORE_BASE,
  useDemoCheckoutOptional,
} from "@/components/demo/demo-checkout-sync";
import { InfoTip } from "@/components/ui/tooltip";

type Category = "Graphics" | "Memory" | "Storage" | "CPU" | "Power" | "Case";

type Product = {
  id: string;
  category: Category;
  name: string;
  spec: string;
  priceUsdc: number;
  badge: string;
  stock: string;
};

const PRODUCTS: Product[] = [
  {
    id: "gpu-5070",
    category: "Graphics",
    name: "Nebula RTX 5070 Twin",
    spec: "12GB GDDR7 · PCIe 5.0 · 220W",
    priceUsdc: 599,
    badge: "GPU",
    stock: "14 in stock",
  },
  {
    id: "gpu-9060",
    category: "Graphics",
    name: "Pulse RX 9060 XT",
    spec: "16GB · RDNA 4 · dual fan",
    priceUsdc: 379,
    badge: "GPU",
    stock: "31 in stock",
  },
  {
    id: "ram-32",
    category: "Memory",
    name: "Volt DDR5-6000 Kit",
    spec: "32GB (2×16) · CL30 · XMP",
    priceUsdc: 119,
    badge: "RAM",
    stock: "Restock weekly",
  },
  {
    id: "ram-64",
    category: "Memory",
    name: "Aegis DDR5-5600 Kit",
    spec: "64GB (2×32) · ECC-ready",
    priceUsdc: 229,
    badge: "RAM",
    stock: "8 in stock",
  },
  {
    id: "ssd-2tb",
    category: "Storage",
    name: "BlackSnake NVMe Gen4",
    spec: "2TB · 7300 MB/s read",
    priceUsdc: 159,
    badge: "SSD",
    stock: "High turnover",
  },
  {
    id: "hdd-8tb",
    category: "Storage",
    name: "IronVault CMR 8TB",
    spec: "3.5\" · 7200 RPM · NAS rated",
    priceUsdc: 189,
    badge: "HDD",
    stock: "22 in stock",
  },
  {
    id: "cpu-zen5",
    category: "CPU",
    name: "Ryzen 9 9900X",
    spec: "12C/24T · 4.4GHz · AM5",
    priceUsdc: 449,
    badge: "CPU",
    stock: "6 in stock",
  },
  {
    id: "psu-850",
    category: "Power",
    name: "ForgeGold 850W",
    spec: "ATX 3.1 · 80+ Gold · modular",
    priceUsdc: 139,
    badge: "PSU",
    stock: "40+ in stock",
  },
  {
    id: "case-mid",
    category: "Case",
    name: "MeshForge 500 Air",
    spec: "Mid-tower · TG panel · 3×140",
    priceUsdc: 99,
    badge: "Case",
    stock: "17 in stock",
  },
];

const CATEGORIES: Category[] = [
  "Graphics",
  "Memory",
  "Storage",
  "CPU",
  "Power",
  "Case",
];

function formatMoney(n: number) {
  return n.toFixed(2);
}

export function PcStoreDemo() {
  const checkoutSync = useDemoCheckoutOptional();
  const [tab, setTab] = useState<Category | "All">("All");
  const [cart, setCart] = useState<Product[]>([]);
  const [intentId, setIntentId] = useState<string | null>(null);
  const [story, setStory] = useState<string[]>([]);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [autoRunning, setAutoRunning] = useState(false);
  const timersRef = useRef<number[]>([]);

  const base = VECTOR_STORE_BASE;
  const humanUrl = intentId ? `${base}/pay/${intentId}` : null;
  const agentUrl = intentId ? `${base}/api/resources/${intentId}` : null;

  const filtered =
    tab === "All" ? PRODUCTS : PRODUCTS.filter((p) => p.category === tab);

  const subtotal = cart.reduce((s, p) => s + p.priceUsdc, 0);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
  }, []);

  const push = useCallback((line: string) => {
    setStory((prev) => [...prev.slice(-30), line]);
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const addToCart = useCallback((p: Product) => {
    setCart((c) => (c.some((x) => x.id === p.id) ? c : [...c, p]));
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setCart((c) => c.filter((x) => x.id !== id));
  }, []);

  const checkout = useCallback(() => {
    if (cart.length === 0) return;
    const id = `build_${crypto.randomUUID().replace(/-/g, "").slice(0, 14)}`;
    setIntentId(id);
    checkoutSync?.setSynced({
      intentId: id,
      amountAtomic: String(Math.round(subtotal * 1_000_000)),
      subtotalLabel: formatMoney(subtotal),
      lineItems: cart.map((p) => p.name),
    });
    clearTimers();
    setStory([]);
    push("Checkout: intent minted for this cart subtotal.");
    push(`Human payment URL → ${base}/pay/${id}`);
    push(`Agent resource URL → ${base}/api/resources/${id}`);
  }, [cart, checkoutSync, clearTimers, push, base, subtotal]);

  const runAgentOnly = useCallback(() => {
    if (!humanUrl || !agentUrl || autoRunning) return;
    clearTimers();
    setStory([]);
    setAutoRunning(true);
    const schedule = (ms: number, fn: () => void) => {
      timersRef.current.push(window.setTimeout(fn, ms));
    };
    push("Agent: GET https://vector-silicon.demo/ (storefront HTML)");
    schedule(400, () =>
      push("Agent: scrape JSON-LD / meta[checkout] → humanUrl + agentResourceUrl"),
    );
    schedule(900, () => push(`Agent: GET ${agentUrl}`));
    schedule(1400, () => push("← 402 Payment Required (x402Version + accepts[])"));
    schedule(2000, () =>
      push("Agent: extra.settlement = umbra-receiver-claimable-utxo → Umbra settle"),
    );
    schedule(2800, () => push("Agent: POST …/confirm { signatures: […] }"));
    schedule(3600, () =>
      push("Agent: GET resource again → 200 { unlocked: true, receipt: true }"),
    );
    schedule(4400, () => {
      push("Build paid. Same intent id the human would have used from their link.");
      setAutoRunning(false);
    });
  }, [humanUrl, agentUrl, autoRunning, clearTimers, push]);

  const runAutomaticDemo = useCallback(() => {
    if (autoRunning) return;
    clearTimers();
    checkoutSync?.setSynced(null);
    setCart([]);
    setIntentId(null);
    setStory([]);
    setAutoRunning(true);
    setHighlightId(null);

    let autoIntentId = "";

    const schedule = (ms: number, fn: () => void) => {
      timersRef.current.push(window.setTimeout(fn, ms));
    };

    const bundle = [
      PRODUCTS.find((p) => p.id === "gpu-5070")!,
      PRODUCTS.find((p) => p.id === "ram-32")!,
      PRODUCTS.find((p) => p.id === "ssd-2tb")!,
    ];

    push("— VECTOR SILICON · automatic simulation —");
    push("Human shopper and AI agent both use this storefront; only the client differs.");
    schedule(500, () => {
      push("Human: lands on shop, filters to Graphics.");
      setTab("Graphics");
    });
    schedule(1100, () => {
      const p = bundle[0];
      setHighlightId(p.id);
      addToCart(p);
      push(`Human: adds ${p.name} ($${formatMoney(p.priceUsdc)})`);
    });
    schedule(2100, () => {
      setHighlightId(null);
      push("Human: opens Memory + Storage for a balanced build.");
      setTab("Memory");
    });
    schedule(2700, () => {
      const p = bundle[1];
      setHighlightId(p.id);
      addToCart(p);
      push(`Human: adds ${p.name} ($${formatMoney(p.priceUsdc)})`);
    });
    schedule(3700, () => {
      setTab("Storage");
    });
    schedule(4100, () => {
      const p = bundle[2];
      setHighlightId(p.id);
      addToCart(p);
      push(`Human: adds ${p.name} ($${formatMoney(p.priceUsdc)})`);
    });
    schedule(5100, () => {
      setHighlightId(null);
      setTab("All");
      const sub = bundle.reduce((s, x) => s + x.priceUsdc, 0);
      push(`Cart subtotal $${formatMoney(sub)} USDC — ready for Umbra-backed checkout.`);
    });
    schedule(5900, () => {
      push('Human: clicks “Generate checkout links” on the cart rail…');
      const id = `build_${crypto.randomUUID().replace(/-/g, "").slice(0, 14)}`;
      autoIntentId = id;
      const bundleSub = bundle.reduce((s, x) => s + x.priceUsdc, 0);
      setIntentId(id);
      checkoutSync?.setSynced({
        intentId: id,
        amountAtomic: String(Math.round(bundleSub * 1_000_000)),
        subtotalLabel: formatMoney(bundleSub),
        lineItems: bundle.map((p) => p.name),
      });
      push(`Issued intent ${id}`);
      push(`Human payment URL → ${base}/pay/${id}`);
      push(`Agent resource URL → ${base}/api/resources/${id}`);
    });
    schedule(7200, () => {
      push("— same cart, autonomous path (no mouse) —");
    });
    schedule(7600, () =>
      push("Agent: fetch storefront, discover both URLs from structured data"),
    );
    schedule(8200, () =>
      push(
        `Agent: GET ${base}/api/resources/${autoIntentId} → 402 with Umbra extra`,
      ),
    );
    schedule(9200, () =>
      push("Agent: settle with Umbra receiver-claimable UTXO + POST confirm"),
    );
    schedule(10200, () =>
      push("Agent: GET resource → 200 — gate cleared for APIs, webhooks, or PDF."),
    );
    schedule(11200, () => {
      push("— end — try your own parts list or hit Reset.");
      setAutoRunning(false);
    });
  }, [autoRunning, checkoutSync, clearTimers, push, addToCart, base]);

  const reset = useCallback(() => {
    clearTimers();
    checkoutSync?.setSynced(null);
    setCart([]);
    setIntentId(null);
    setStory([]);
    setHighlightId(null);
    setAutoRunning(false);
    setTab("All");
  }, [checkoutSync, clearTimers]);

  const cardWrap =
    "rounded-2xl border border-line bg-panel shadow-[var(--shadow-card)]";

  const tipOnHero =
    "inline-flex h-5 w-5 shrink-0 cursor-default items-center justify-center rounded-full border border-teal-muted/50 bg-white/10 text-[10px] font-bold text-teal-muted tabular-nums transition hover:bg-white/20";

  return (
    <section className={`${cardWrap} overflow-hidden`}>
      <div className="border-b border-teal-muted/25 bg-teal-deep px-4 py-4 text-panel sm:px-5 sm:py-4">
        <div className="flex flex-col gap-3 border-b border-white/10 pb-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-x-4 sm:gap-y-2">
          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[11px] leading-snug text-panel/80">
            <span className="rounded border border-panel/25 bg-white/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-teal-muted">
              Demo
            </span>
            <span className="font-semibold text-panel">Demo center</span>
            <span className="hidden text-panel/40 sm:inline" aria-hidden>
              ·
            </span>
            <span className="max-w-[min(100%,28rem)]">
              Simulated retail + agent 402 — no wallet or RPC here.
            </span>
            <InfoTip
              label="About this page"
              content={
                <>
                  Two stacked stories: build a cart and mint links, then the headless
                  402 → Umbra → 200 path. All in-browser.
                </>
              }
              triggerClassName={tipOnHero}
            />
            <Link
              href="/"
              className="font-semibold text-teal-muted underline decoration-teal-muted/50 underline-offset-2 hover:text-panel"
            >
              Live create →
            </Link>
          </div>
          <nav
            className="flex shrink-0 flex-wrap gap-1.5"
            aria-label="Jump to demo sections"
          >
            {DEMO_NAV_LINKS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-full border border-panel/35 bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-panel transition hover:border-panel/60 hover:bg-white/15"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-teal-muted">
              Part 1 · PC store
            </p>
            <h2 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">
              VECTOR SILICON
            </h2>
            <p className="mt-1 max-w-2xl text-xs leading-snug text-panel/80 sm:text-[13px]">
              Add parts, checkout mints human + agent URLs for the same build.{" "}
              <strong className="font-medium text-panel">Run automatic simulation</strong>{" "}
              walks human cart then agent pay back-to-back.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void runAutomaticDemo()}
              disabled={autoRunning}
              className="rounded-xl bg-brand px-3 py-2 text-sm font-semibold text-white shadow-md hover:bg-brand-hover disabled:opacity-50 sm:px-4 sm:py-2.5"
            >
              {autoRunning ? "Running…" : "Run automatic simulation"}
            </button>
            <button
              type="button"
              onClick={() => reset()}
              disabled={autoRunning}
              className="rounded-xl border border-panel/40 bg-white/10 px-3 py-2 text-sm font-medium text-panel shadow-sm hover:bg-white/18 disabled:opacity-40 sm:px-4 sm:py-2.5"
            >
              Reset
            </button>
            <InfoTip
              label="Storefront demo"
              content={
                <>
                  Fictional SKUs and host. Automatic mode walks a human cart, issues
                  links, then replays an agent paying the same intent — all in-browser,
                  no RPC.
                </>
              }
              triggerClassName={tipOnHero}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-[1fr_minmax(280px,360px)]">
        <div className="border-b border-line p-5 sm:p-6 lg:border-b-0 lg:border-r">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setTab("All")}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                tab === "All"
                  ? "border-teal-deep bg-teal-deep text-white shadow-sm"
                  : "border-line bg-canvas text-muted hover:border-line-strong hover:text-ink"
              }`}
            >
              All
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setTab(c)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  tab === c
                    ? "border-teal bg-teal text-white shadow-sm"
                    : "border-line bg-canvas text-muted hover:border-line-strong hover:text-ink"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((p) => {
              const inCart = cart.some((x) => x.id === p.id);
              const hi = highlightId === p.id;
              return (
                <article
                  key={p.id}
                  className={`flex flex-col rounded-xl border bg-panel p-4 shadow-[0_1px_0_rgb(22_20_18/0.04)] transition ${
                    hi
                      ? "border-brand ring-2 ring-brand/30"
                      : inCart
                        ? "border-teal/40 bg-teal-soft/35"
                        : "border-line hover:border-line-strong hover:shadow-[var(--shadow-card)]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="rounded-md border border-line/80 bg-canvas px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide text-muted">
                      {p.badge}
                    </span>
                    {inCart ? (
                      <span className="rounded-full bg-teal/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-teal">
                        In cart
                      </span>
                    ) : null}
                  </div>
                  <h3 className="mt-3 text-sm font-semibold leading-snug text-ink">
                    {p.name}
                  </h3>
                  <p className="mt-2 min-h-[2.5rem] text-xs leading-snug text-muted">
                    {p.spec}
                  </p>
                  <p className="mt-1 text-[10px] font-medium text-faint">{p.stock}</p>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3.5">
                    <span className="font-mono text-sm font-semibold tabular-nums text-ink">
                      ${formatMoney(p.priceUsdc)}
                    </span>
                    <button
                      type="button"
                      onClick={() => addToCart(p)}
                      disabled={inCart || autoRunning}
                      className={
                        inCart
                          ? "min-w-[6.75rem] cursor-default rounded-lg border border-teal/35 bg-teal-soft px-3 py-2 text-center text-xs font-semibold text-teal"
                          : autoRunning
                            ? "min-w-[6.75rem] cursor-not-allowed rounded-lg border border-line bg-surface px-3 py-2 text-center text-xs font-semibold text-muted opacity-70"
                            : "min-w-[6.75rem] rounded-lg border border-teal-deep-hover bg-teal-deep px-3 py-2 text-center text-xs font-semibold text-white shadow-sm hover:bg-teal-deep-hover hover:shadow"
                      }
                    >
                      {inCart ? "Added" : "Add to cart"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <aside className="flex flex-col border-t border-line bg-surface p-5 sm:p-6 lg:sticky lg:top-24 lg:max-h-[calc(100vh-8rem)] lg:self-start lg:border-t-0 lg:border-l lg:border-line lg:overflow-y-auto">
          <h3 className="text-sm font-semibold text-ink">Cart &amp; checkout</h3>
          <p className="mt-1 text-xs text-muted">
            {cart.length} line{cart.length === 1 ? "" : "s"} ·{" "}
            <span className="font-mono font-semibold text-ink">
              ${formatMoney(subtotal)} USDC
            </span>
          </p>
          <ul className="mt-4 max-h-56 space-y-2 overflow-y-auto lg:max-h-none">
            {cart.length === 0 ? (
              <li className="rounded-lg border border-dashed border-line bg-panel/70 px-3 py-8 text-center text-xs text-muted">
                Cart empty — add parts from the shelf or run the automatic simulation.
              </li>
            ) : (
              cart.map((line) => (
                <li
                  key={line.id}
                  className="flex items-start justify-between gap-2 rounded-lg border border-line bg-panel px-3 py-2.5 text-xs"
                >
                  <div>
                    <p className="font-medium text-ink">{line.name}</p>
                    <p className="text-[10px] text-faint">{line.badge}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="font-mono text-ink">${formatMoney(line.priceUsdc)}</span>
                    <button
                      type="button"
                      onClick={() => removeFromCart(line.id)}
                      disabled={autoRunning}
                      className="text-[10px] font-semibold text-brand hover:text-brand-hover disabled:opacity-40"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))
            )}
          </ul>
          <div className="mt-4 space-y-2 border-t border-line pt-4">
            <button
              type="button"
              onClick={() => checkout()}
              disabled={cart.length === 0 || autoRunning}
              className="w-full rounded-xl bg-brand py-3 text-sm font-semibold text-white shadow-[var(--shadow-card)] hover:bg-brand-hover disabled:opacity-40"
            >
              Generate checkout links
            </button>
            <button
              type="button"
              onClick={() => runAgentOnly()}
              disabled={!intentId || autoRunning}
              className="w-full rounded-xl border border-teal/30 bg-teal-soft/40 py-3 text-sm font-semibold text-teal hover:border-teal/50 hover:bg-teal-soft disabled:opacity-40"
            >
              Simulate AI agent pay only
            </button>
          </div>

          {intentId ? (
            <div className="mt-5 space-y-3 rounded-xl border border-line bg-panel p-3 shadow-[0_1px_0_rgb(22_20_18/0.05)]">
              <div className="rounded-lg border border-brand/20 bg-brand-soft/50 p-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-brand">
                  Human payment link
                </p>
                <code className="mt-1.5 block break-all font-mono text-[10px] leading-relaxed text-ink">
                  {humanUrl}
                </code>
              </div>
              <div className="rounded-lg border border-teal/25 bg-teal-soft/60 p-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-teal">
                  Agent resource URL
                </p>
                <code className="mt-1.5 block break-all font-mono text-[10px] leading-relaxed text-teal">
                  {agentUrl}
                </code>
              </div>
            </div>
          ) : null}

          {story.length > 0 ? (
            <div className="mt-5">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-faint">
                Live narration
              </p>
              <pre className="max-h-52 overflow-auto rounded-xl border border-line-strong/60 bg-surface p-3 font-mono text-[10px] leading-relaxed text-ink/85">
                {story.join("\n")}
              </pre>
            </div>
          ) : null}
        </aside>
      </div>
    </section>
  );
}
