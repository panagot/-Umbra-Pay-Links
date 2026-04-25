import type { Metadata } from "next";
import {
  ContentPageShell,
  DocFooterNav,
  DocHero,
  DocNavLink,
  DocSection,
} from "@/components/ui/content-page";

export const metadata: Metadata = {
  title: "Agents & APIs · Umbra Pay Links",
  description:
    "Resource URL, HTTP 402 body, settlement extra fields, and the agent-pay script.",
};

export default function AgentsPage() {
  return (
    <ContentPageShell>
      <DocHero
        eyebrow="Automation"
        eyebrowTone="teal"
        title="Agents & APIs"
        description="Machine clients treat your intent as a gated HTTP resource, then settle with the same Umbra flow as humans — GET, 402, fund, retry."
      />

      <DocSection title="Resource URL">
        <p>
          <code className="!block !break-all !rounded-xl !border-line !bg-canvas/80 !p-3 !text-xs !text-teal">
            GET /api/resources/&lt;intent-id&gt;
          </code>
        </p>
        <ul>
          <li>
            <strong>402</strong> while open — JSON includes <code>x402Version</code>,{" "}
            <code>accepts[]</code>, and <code>extra.settlement</code> ={" "}
            <code>umbra-receiver-claimable-utxo</code> so clients know not to treat{" "}
            <code>payTo</code> as a plain SPL send alone.
          </li>
          <li>
            <strong>200</strong> after the intent is marked settled.
          </li>
        </ul>
      </DocSection>

      <DocSection title="Headless payer">
        <p>
          <code>npm run agent:pay</code> runs <code>scripts/agent-pay.mjs</code>: load a
          keypair, read 402, run Umbra + UTXO create, POST confirm, re-fetch the resource.
          Environment variables are documented in <code>README.md</code>.
        </p>
      </DocSection>

      <DocSection title="Umbra SDK parity (browser vs agent)">
        <p>
          Both paths call <code>getUmbraClient</code>, optional registration, then{" "}
          <code>getPublicBalanceToReceiverClaimableUtxoCreatorFunction</code> with the same
          browser ZK prover package. The only deliberate difference is the signer: Wallet
          Standard in React vs private key bytes in Node — same settlement path, not a
          server-side fake payment.
        </p>
      </DocSection>

      <DocSection title="OpenAPI">
        <p>
          Machine-readable contract:{" "}
          <DocNavLink href="/openapi.json">/openapi.json</DocNavLink> (OpenAPI 3.1). Import
          into Postman, Insomnia, or codegen tools.
        </p>
      </DocSection>

      <DocSection title="REST surface">
        <p className="mb-3 text-sm text-muted">
          Routes are rate-limited per client IP (see <code>README.md</code>).{" "}
          <code>POST /api/intents</code> validates Solana addresses with{" "}
          <code>@solana/kit</code> <code>address()</code>.
        </p>
        <dl>
          <div>
            <dt className="font-mono text-xs font-semibold text-brand">POST /api/intents</dt>
            <dd className="mt-1">
              Create intent; returns pay URL and resource URL. Optional{" "}
              <code>webhookUrl</code> for a server POST on first settlement.
            </dd>
          </div>
          <div>
            <dt className="font-mono text-xs font-semibold text-brand">
              GET /api/intents/&lt;id&gt;
            </dt>
            <dd className="mt-1">Intent fields for the checkout UI.</dd>
          </div>
          <div>
            <dt className="font-mono text-xs font-semibold text-brand">
              POST /api/intents/&lt;id&gt;/confirm
            </dt>
            <dd className="mt-1">
              Mark settled with an array of transaction signatures. Idempotent if signatures
              match an already-settled intent. Optional RPC verification when{" "}
              <code>REQUIRE_ONCHAIN_CONFIRM_FOR_SETTLE</code> is enabled.
            </dd>
          </div>
          <div>
            <dt className="font-mono text-xs font-semibold text-teal">
              GET /api/resources/&lt;id&gt;
            </dt>
            <dd className="mt-1">402 paywall or 200 when paid.</dd>
          </div>
        </dl>
      </DocSection>

      <DocFooterNav>
        <DocNavLink href="/settlement">Settlement details</DocNavLink>
        <span className="text-line-strong" aria-hidden>
          ·
        </span>
        <DocNavLink href="/how-it-works">How it works</DocNavLink>
        <span className="text-line-strong" aria-hidden>
          ·
        </span>
        <DocNavLink href="/demo">Demo center</DocNavLink>
      </DocFooterNav>
    </ContentPageShell>
  );
}
