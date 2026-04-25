import type { Metadata } from "next";
import {
  ContentPageShell,
  DocFooterNav,
  DocHero,
  DocNavLink,
  DocSection,
} from "@/components/ui/content-page";

export const metadata: Metadata = {
  title: "How it works · Umbra Pay Links",
  description:
    "Payment intents, human checkout, agent resources, and what happens on chain.",
};

export default function HowItWorksPage() {
  return (
    <ContentPageShell>
      <DocHero
        eyebrow="Product"
        title="How it works"
        description="One server-side intent drives two URLs: a browser checkout and an HTTP resource agents can poll until the bill is satisfied."
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <DocSection title="Payment intent">
          <p>
            When you submit the form on the home page, the app stores an{" "}
            <strong>intent</strong>: label, USDC amount, SPL mint, merchant Solana
            address, and status (<code>open</code> or <code>settled</code>). The public
            link only contains an opaque id — not the merchant address in the path.
          </p>
        </DocSection>

        <DocSection title="Human payer">
          <p>
            The <code className="text-brand">/pay/&lt;id&gt;</code> page loads that intent,
            connects a Wallet Standard wallet, and runs the Umbra SDK: registration if
            needed, then{" "}
            <code>getPublicBalanceToReceiverClaimableUtxoCreatorFunction</code> so USDC
            moves through Umbra&apos;s receiver-claimable UTXO path toward the merchant
            address you configured.
          </p>
        </DocSection>
      </div>

      <DocSection title="x402 shape vs Umbra settlement">
        <p>
          The <strong>402 response</strong> follows the familiar x402 pattern:{" "}
          <code>x402Version</code>, <code>accepts[]</code>, <code>maxAmountRequired</code>,{" "}
          <code>payTo</code>, and <code>asset</code> so generic agents can parse the bill.
          Umbra is <em>not</em> a plain SPL transfer to <code>payTo</code>: the{" "}
          <code>extra.settlement</code> field is set to{" "}
          <code>umbra-receiver-claimable-utxo</code>, and <code>extra</code> includes{" "}
          <code>humanPayUrl</code>, <code>confirmUrl</code>, and SDK docs so implementers
          route funds through the Umbra proof flow instead of mis-reading{" "}
          <code>payTo</code> as “send tokens here in one click.”
        </p>
      </DocSection>

      <DocSection title="Agent client">
        <p>
          The same intent id backs <code>GET /api/resources/&lt;id&gt;</code>. While the
          intent is open, the response is <strong>402</strong> with a JSON body shaped
          like common x402 examples, plus an <code>extra</code> block that names Umbra as
          the settlement mechanism. After the payer (human or script) completes Umbra and
          the app records settlement signatures via{" "}
          <code>POST /api/intents/&lt;id&gt;/confirm</code>, the same GET returns{" "}
          <strong>200</strong>.
        </p>
        <p className="text-faint">
          Request/response details and the confirm step:{" "}
          <DocNavLink href="/agents">Agents &amp; APIs</DocNavLink>.
        </p>
      </DocSection>

      <DocSection title="Lifecycle checklist">
        <ol className="list-inside list-decimal space-y-2 text-muted">
          <li>Mint intent → receive pay URL + resource URL.</li>
          <li>Human or agent settles via Umbra; client POSTs signatures to confirm.</li>
          <li>Resource GET flips from 402 to 200; ledger can key off one intent id.</li>
        </ol>
      </DocSection>

      <DocFooterNav>
        <DocNavLink href="/settlement">Settlement &amp; Umbra</DocNavLink>
        <span className="text-line-strong" aria-hidden>
          ·
        </span>
        <DocNavLink href="/demo">Demo center</DocNavLink>
        <span className="text-line-strong" aria-hidden>
          ·
        </span>
        <DocNavLink href="/agents">Agents &amp; APIs</DocNavLink>
      </DocFooterNav>
    </ContentPageShell>
  );
}
