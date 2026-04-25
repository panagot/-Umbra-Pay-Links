import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PayWithUmbra } from "@/components/pay-with-umbra";
import {
  ContentPageShell,
  DocHero,
} from "@/components/ui/content-page";
import { getIntent } from "@/lib/intents";
import { getAppBaseUrl } from "@/lib/umbra-config";
import { CopyButton } from "@/components/ui/copy-button";
import { InfoTip } from "@/components/ui/tooltip";

export const metadata: Metadata = {
  title: "Checkout · Umbra Pay Links",
  description: "Pay with Umbra for a shared intent — human wallet flow.",
};

type PageProps = { params: Promise<{ id: string }> };

export default async function PayPage({ params }: PageProps) {
  const { id } = await params;
  const intent = await getIntent(id);
  if (!intent) notFound();

  const base = getAppBaseUrl();
  const resourceUrl = `${base}/api/resources/${intent.id}`;

  return (
    <ContentPageShell>
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center rounded-full border border-line bg-canvas px-3 py-1.5 text-xs font-medium text-muted transition hover:border-teal/40 hover:text-teal"
        >
          ← New intent
        </Link>
      </div>

      <DocHero
        eyebrow="Checkout"
        title="Private checkout"
        description="Everything below runs on Umbra’s SDK in your browser — Wallet Standard signer, indexer-backed client, and receiver-claimable UTXO creation. The agent URL on the right is the same bill for HTTP clients; one Umbra settlement unlocks both."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,18rem)] lg:items-start">
        <PayWithUmbra
          agentResourceUrl={resourceUrl}
          intent={{
            id: intent.id,
            label: intent.label,
            amountAtomic: intent.amountAtomic,
            mint: intent.mint,
            merchantAddress: intent.merchantAddress,
            status: intent.status,
          }}
        />

        <aside className="flex flex-col gap-4 rounded-2xl border border-line bg-panel p-5 shadow-[var(--shadow-card)] ring-1 ring-ink/[0.02] sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-ink">Agent resource</h2>
              <InfoTip
                label="Agent resource URL"
                content={
                  <>
                    HTTP 402 with payment requirements until settled, then 200 JSON. Point
                    automation at this URL.
                  </>
                }
              />
            </div>
            <CopyButton text={resourceUrl} label="Copy" />
          </div>
          <code className="break-all rounded-xl border border-line bg-canvas/80 p-3 font-mono text-[11px] leading-relaxed text-teal">
            {resourceUrl}
          </code>
          <p className="text-xs leading-relaxed text-muted">
            After Umbra settlement and{" "}
            <code className="rounded border border-teal/20 bg-teal-soft px-1.5 py-0.5 font-mono text-[10px] text-teal">
              /confirm
            </code>
            , GET returns{" "}
            <code className="rounded border border-teal/20 bg-teal-soft px-1.5 py-0.5 font-mono text-[10px] text-teal">
              200
            </code>{" "}
            with an unlocked payload.
          </p>
          <Link
            href="/demo"
            className="text-center text-xs font-medium text-teal hover:underline"
          >
            Open demo center →
          </Link>
        </aside>
      </div>
    </ContentPageShell>
  );
}
