import { CreateIntentForm } from "@/components/create-intent-form";
import {
  ContentPageShell,
  DocHero,
} from "@/components/ui/content-page";
import { InfoTip } from "@/components/ui/tooltip";
import Link from "next/link";

const pill =
  "inline-flex items-center justify-center rounded-full border border-line bg-canvas px-4 py-2 text-sm font-semibold text-ink shadow-sm transition hover:border-teal/40 hover:bg-teal-soft/40 hover:text-teal";

const pillGhost =
  "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium text-muted transition hover:text-teal";

export default function Home() {
  return (
    <ContentPageShell>
      <DocHero
        eyebrow="Umbra · Private pay intents"
        title={
          <>
            One link for people and{" "}
            <span className="underline decoration-brand/35 decoration-4 underline-offset-4">
              AI agents
            </span>
          </>
        }
        description={
          <>
            Create a payment intent, share a human checkout URL, and expose the same
            bill to machines via an{" "}
            <span className="inline-flex items-center gap-1 font-medium text-ink">
              HTTP 402
              <InfoTip
                label="What is HTTP 402 here?"
                content={
                  <>
                    Agents call your resource URL. Until payment is recorded, the API
                    returns status 402 with JSON describing how to pay — the same shape
                    many x402 clients already expect.
                  </>
                }
              />
            </span>{" "}
            resource. Settlement uses the Umbra SDK (receiver-claimable UTXO in this
            build). Built for merchants, SaaS checkouts, and agent builders who want one
            intent record for both audiences.
          </>
        }
        actions={
          <div className="flex flex-wrap gap-2">
            <Link href="/demo" className={pill}>
              Demo center →
            </Link>
            <Link href="/how-it-works" className={pillGhost}>
              How it works →
            </Link>
          </div>
        }
      />

      <section
        className="grid gap-4 sm:grid-cols-3"
        aria-label="Why Umbra is central to this product"
      >
        {(
          [
            {
              title: "Umbra is the product",
              body: "There is no alternative settlement path. Checkout and the headless agent script both call the same Umbra APIs: client, registration, ZK prover, and receiver-claimable UTXO creation — not a decorative wrapper.",
            },
            {
              title: "Privacy × automation",
              body: "Confidential Umbra settlement pairs with an x402-shaped 402 resource so humans and machines settle the same invoice without exposing a public payment graph per payer.",
            },
            {
              title: "Built to ship",
              body: "Rate limits, optional on-chain confirm, webhooks, OpenAPI, and Vitest tests support real deployments — not a one-off demo only.",
            },
          ] as const
        ).map((card) => (
          <div
            key={card.title}
            className="rounded-2xl border border-line bg-panel p-4 shadow-sm ring-1 ring-ink/[0.02] sm:p-5"
          >
            <h2 className="text-sm font-semibold tracking-tight text-ink">{card.title}</h2>
            <p className="mt-2 text-xs leading-relaxed text-muted sm:text-[13px]">
              {card.body}
            </p>
          </div>
        ))}
      </section>

      <div className="max-w-xl">
        <CreateIntentForm />
      </div>

      <nav
        className="flex flex-wrap gap-6 border-t border-line pt-6 text-xs text-muted"
        aria-label="Docs shortcuts"
      >
        <Link href="/settlement" className="font-medium text-teal hover:underline">
          Settlement
        </Link>
        <Link href="/agents" className="font-medium text-teal hover:underline">
          Agents &amp; APIs
        </Link>
      </nav>
    </ContentPageShell>
  );
}
