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
            Create a payment intent, share a human checkout URL, and expose the same bill
            to machines via an{" "}
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
            build).
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
