import type { Metadata } from "next";
import { Agent402Simulation } from "@/components/demo/agent-402-simulation";
import { DEMO_ANCHORS } from "@/components/demo/demo-anchors";
import { DemoCheckoutProvider } from "@/components/demo/demo-checkout-sync";
import { PcStoreDemo } from "@/components/demo/pc-store-demo";
import { DocHero } from "@/components/ui/content-page";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Demo center · Umbra Pay Links",
  description:
    "In-browser simulations: retail checkout, then 402 to Umbra path to 200. Recordable for a pitch video without a wallet; then cut to the live create flow on the home page.",
};

export default function DemoPage() {
  return (
    <DemoCheckoutProvider>
      <div className="space-y-4 pb-6">
        <DocHero
          eyebrow="Pitch & demos"
          eyebrowTone="teal"
          title="Demo center"
          description={
            <>
              Use the retail sim and the 402 timeline below for a clean screen recording
              (no wallet, no RPC). Then show the real product:{" "}
              <Link href="/" className="font-medium text-teal hover:underline">
                create an intent
              </Link>
              , pay on <code className="text-ink">/pay/&lt;id&gt;</code>, and poll{" "}
              <code className="text-ink">/api/resources/&lt;id&gt;</code> until 200. Judges:
              see also{" "}
              <Link href="/judges" className="font-medium text-teal hover:underline">
                For reviewers
              </Link>
              .
            </>
          }
        />
        <div className="space-y-4">
          <section id={DEMO_ANCHORS.retail} className="scroll-mt-24">
            <PcStoreDemo />
          </section>

          <Agent402Simulation />
        </div>

        <p className="text-center text-[11px] text-faint">
          Use cases and diagrams:{" "}
          <Link href="/how-it-works" className="text-teal underline-offset-2 hover:underline">
            How it works
          </Link>
          ,{" "}
          <Link href="/agents" className="text-teal underline-offset-2 hover:underline">
            Agents &amp; APIs
          </Link>
          ,{" "}
          <Link href="/judges" className="text-teal underline-offset-2 hover:underline">
            For reviewers
          </Link>
          .
        </p>
      </div>
    </DemoCheckoutProvider>
  );
}
