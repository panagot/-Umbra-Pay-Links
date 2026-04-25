import Link from "next/link";
import { InfoTip } from "@/components/ui/tooltip";
import { DEMO_NAV_LINKS } from "@/components/demo/demo-anchors";

export function DemoPageIntro() {
  return (
    <header className="flex flex-col gap-3 rounded-2xl border border-line bg-panel px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-3.5">
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal">
            Demo
          </p>
          <h1 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">
            Demo center
            <span className="ml-1.5 inline-flex align-middle">
              <InfoTip
                label="About"
                content="Two stacked simulations: retail checkout links, then the headless 402 → Umbra path. No wallet or RPC on this page."
              />
            </span>
          </h1>
        </div>
        <p className="max-w-2xl text-xs leading-relaxed text-muted sm:text-sm">
          Retail lab first, then the agent timeline — same intent story, different client.
          Pair <strong className="font-medium text-ink">x402-style discovery</strong>{" "}
          (machines already speak 402) with{" "}
          <strong className="font-medium text-ink">Umbra settlement</strong> (humans and
          scripts share one confidential path). Real Umbra:{" "}
          <Link
            href="/"
            className="font-medium text-teal underline decoration-teal/30 underline-offset-2 hover:decoration-teal"
          >
            Create link
          </Link>
          .
        </p>
      </div>
      <nav
        className="flex shrink-0 flex-wrap gap-1.5"
        aria-label="On this page"
      >
        {DEMO_NAV_LINKS.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="rounded-full border border-line bg-canvas px-2.5 py-1 text-[11px] font-medium text-muted transition hover:border-teal/40 hover:text-teal"
          >
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
