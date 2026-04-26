import type { Metadata } from "next";
import Link from "next/link";
import {
  DeveloperApiCreditsPanel,
  DeveloperSimProvider,
  DeveloperTerminalAgentLog,
  DeveloperWebhookInbox,
} from "@/components/demo/developer-simulations";
import { DocHero } from "@/components/ui/content-page";

export const metadata: Metadata = {
  title: "Platform sim · Umbra Pay Links",
  description:
    "SaaS API credits, headless terminal 402→200 poll, and webhook inbox. In-browser only; optional sync from Demo center retail checkout.",
};

export default function DemoDeveloperPage() {
  return (
    <DeveloperSimProvider>
      <div className="space-y-4 pb-6">
        <DocHero
          eyebrow="Interactive"
          eyebrowTone="teal"
          title="Platform simulations"
          description={
            <>
              Three panels for the same story: monetize an HTTP resource, let an agent poll
              it, and notify your backend. Optional: generate checkout links on the{" "}
              <Link href="/demo#demo-retail" className="font-medium text-teal hover:underline">
                Demo center
              </Link>{" "}
              retail page to sync intent id and USDC totals into this page.
            </>
          }
        />

        <DeveloperApiCreditsPanel />
        <DeveloperTerminalAgentLog />
        <DeveloperWebhookInbox />

        <p className="text-center text-[11px] text-faint">
          <Link href="/demo" className="text-teal underline-offset-2 hover:underline">
            Demo center
          </Link>
          {" · "}
          <Link href="/how-it-works" className="text-teal underline-offset-2 hover:underline">
            How it works
          </Link>
          {" · "}
          <Link href="/agents" className="text-teal underline-offset-2 hover:underline">
            Agents &amp; APIs
          </Link>
        </p>
      </div>
    </DeveloperSimProvider>
  );
}
