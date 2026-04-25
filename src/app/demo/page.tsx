import type { Metadata } from "next";
import { Agent402Simulation } from "@/components/demo/agent-402-simulation";
import { DEMO_ANCHORS } from "@/components/demo/demo-anchors";
import { DemoCheckoutProvider } from "@/components/demo/demo-checkout-sync";
import { DemoPageIntro } from "@/components/demo/demo-page-intro";
import { PcStoreDemo } from "@/components/demo/pc-store-demo";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Demo center · Umbra Pay Links",
  description:
    "VECTOR SILICON retail lab and staged 402 → Umbra → 200 agent flow — in-browser only.",
};

export default function DemoPage() {
  return (
    <DemoCheckoutProvider>
      <div className="space-y-4 pb-6">
        <aside className="rounded-2xl border border-teal-muted/50 bg-gradient-to-br from-teal-soft/50 to-panel px-5 py-4 text-center shadow-sm">
          <p className="text-sm font-medium text-ink">
            Staged demos below use in-browser simulation.
          </p>
          <p className="mt-2 text-sm text-muted">
            For a real wallet, Umbra SDK, and live API routes, open the{" "}
            <Link
              href="/"
              className="font-semibold text-teal underline-offset-2 hover:underline"
            >
              live home flow
            </Link>
            .
          </p>
        </aside>

        <DemoPageIntro />

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
