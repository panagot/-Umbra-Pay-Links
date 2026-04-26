"use client";

import { useState } from "react";
import { FieldLabel } from "@/components/app/field-label";
import { CopyButton } from "@/components/ui/copy-button";
import { InfoTip } from "@/components/ui/tooltip";

export function CreateIntentForm() {
  const [label, setLabel] = useState("Coffee");
  const [amountUsdc, setAmountUsdc] = useState("1");
  const [merchantAddress, setMerchantAddress] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    payUrl: string;
    agentResourceUrl: string;
  } | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/intents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label,
          amountUsdc,
          merchantAddress,
          ...(webhookUrl.trim() ? { webhookUrl: webhookUrl.trim() } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? res.statusText);
      }
      setResult({
        payUrl: data.payUrl as string,
        agentResourceUrl: data.agentResourceUrl as string,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  const input =
    "mt-2 w-full rounded-xl border border-line bg-panel px-3 py-2.5 text-sm text-ink outline-none transition placeholder:text-faint focus:border-teal-muted focus:ring-2 focus:ring-teal-soft";

  return (
    <form
      onSubmit={(e) => void onSubmit(e)}
      className="flex flex-col gap-5 rounded-2xl border border-line bg-panel p-6 shadow-[var(--shadow-card)] ring-1 ring-ink/[0.02] sm:p-8"
    >
      <div className="flex items-start justify-between gap-4 border-b border-line/80 pb-4">
        <div>
          <h1 className="text-lg font-semibold text-ink">New payment intent</h1>
          <p className="mt-1 text-sm text-muted">
            One record: human checkout URL and machine resource URL.
          </p>
        </div>
        <InfoTip
          label="What is an intent?"
          content={
            <>
              Server-side row: label, USDC amount, mint, merchant recipient, status.
              Public links use an opaque id, not the merchant address in the path.
            </>
          }
        />
      </div>

      <div>
        <FieldLabel
          htmlFor="intent-label"
          label="Label"
          tip="Shown on checkout — invoice title, product, or campaign name."
        />
        <input id="intent-label" className={input} value={label} onChange={(e) => setLabel(e.target.value)} />
      </div>
      <div>
        <FieldLabel
          htmlFor="intent-amount"
          label="Amount (USDC)"
          tip="Decimal USDC. Stored in smallest units (6 decimals) for SPL."
        />
        <input
          id="intent-amount"
          type="text"
          inputMode="decimal"
          className={input}
          value={amountUsdc}
          onChange={(e) => setAmountUsdc(e.target.value)}
        />
      </div>
      <div>
        <FieldLabel
          htmlFor="intent-merchant"
          label="Merchant Solana address"
          tip="Wallet that receives the Umbra receiver-claimable UTXO. Must be Umbra-ready to claim."
        />
        <input
          id="intent-merchant"
          className={`${input} font-mono text-xs`}
          placeholder="Base58 public key"
          value={merchantAddress}
          onChange={(e) => setMerchantAddress(e.target.value)}
        />
      </div>
      <div>
        <FieldLabel
          htmlFor="intent-webhook"
          label="Webhook URL (optional)"
          tip="https URL — server POSTs JSON intent.settled once after first successful confirm. Leave empty to skip."
        />
        <input
          id="intent-webhook"
          type="url"
          className={`${input} font-mono text-xs`}
          placeholder="https://your-server.example/hooks/umbra"
          value={webhookUrl}
          onChange={(e) => setWebhookUrl(e.target.value)}
        />
        <p className="mt-1.5 text-xs text-faint">
          Must be <code className="text-muted">http:</code> or{" "}
          <code className="text-muted">https:</code>. Invalid URLs are rejected with 400.
        </p>
      </div>
      <button
        type="submit"
        disabled={busy}
        className="rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-panel shadow-[var(--shadow-card)] transition hover:bg-brand-hover disabled:opacity-50"
      >
        {busy ? "Creating…" : "Create private payment link"}
      </button>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {result ? (
        <div className="space-y-4 rounded-xl border border-teal-muted/50 bg-teal-soft/40 p-4 text-sm">
          <div>
            <span className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold uppercase tracking-wider text-teal">
              <span className="flex items-center gap-2">
                Human pay link
                <InfoTip
                  label="Human pay link"
                  content="For people: open in a browser, connect wallet, run Umbra checkout."
                />
              </span>
              <CopyButton text={result.payUrl} label="Copy URL" />
            </span>
            <a
              href={result.payUrl}
              className="mt-2 block break-all rounded-lg border border-line/60 bg-panel px-3 py-2 font-mono text-xs text-teal hover:border-teal-muted"
            >
              {result.payUrl}
            </a>
          </div>
          <div>
            <span className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold uppercase tracking-wider text-teal">
              <span className="flex items-center gap-2">
                Agent resource (402)
                <InfoTip
                  label="Agent resource URL"
                  content="Automation GETs this. 402 + requirements until settled, then 200 + payload."
                />
              </span>
              <CopyButton text={result.agentResourceUrl} label="Copy URL" />
            </span>
            <code className="mt-2 block break-all rounded-lg border border-line/60 bg-panel px-3 py-2 font-mono text-[11px] text-ink">
              {result.agentResourceUrl}
            </code>
          </div>
        </div>
      ) : null}
    </form>
  );
}
