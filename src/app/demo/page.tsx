import type { Metadata } from "next";
import { Agent402Simulation } from "@/components/demo/agent-402-simulation";
import { DEMO_ANCHORS } from "@/components/demo/demo-anchors";
import { DemoCheckoutProvider } from "@/components/demo/demo-checkout-sync";
import { PcStoreDemo } from "@/components/demo/pc-store-demo";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Demo center · Umbra Pay Links",
  description:
    "In-browser simulations: retail checkout, then 402 → Umbra path → 200 — recordable for a pitch video without a wallet.",
};

export default function DemoPage() {
  return (
    <DemoCheckoutProvider>
      <div className="space-y-4 pb-6">
        <div className="space-y-4">
          <section id={DEMO_ANCHORS.retail} className="scroll-mt-24">
            <PcStoreDemo />
          </section>

          <Agent402Simulation />
        </div>

        <p className="text-center text-[11px] text-faint">
          Use cases, visibility matrix, and diagrams live on{" "}
          <Link href="/how-it-works" className="text-teal underline-offset-2 hover:underline">
            How it works
          </Link>{" "}
          and{" "}
          <Link href="/agents" className="text-teal underline-offset-2 hover:underline">
            Agents &amp; APIs
          </Link>
          .
        </p>
      </div>
    </DemoCheckoutProvider>
  );
}
