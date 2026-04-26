import { CreateIntentForm } from "@/components/create-intent-form";
import { ContentPageShell } from "@/components/ui/content-page";
import Link from "next/link";

const pill =
  "inline-flex items-center justify-center rounded-full border border-line bg-canvas px-3 py-1.5 text-xs font-semibold text-ink shadow-sm transition hover:border-teal/40 hover:bg-teal-soft/40 hover:text-teal sm:text-sm";

const pillGhost =
  "inline-flex items-center justify-center rounded-full px-3 py-1.5 text-xs font-medium text-muted transition hover:text-teal sm:text-sm";

export default function Home() {
  return (
    <ContentPageShell>
      <div className="space-y-5">
        <div className="max-w-xl">
          <CreateIntentForm />
        </div>

        <section
          className="flex max-w-2xl flex-col gap-3 border-t border-line pt-5 sm:flex-row sm:items-start sm:justify-between"
          aria-label="About this app"
        >
          <div className="min-w-0 space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal">
              Superteam Frontier · Umbra Side Track
            </p>
            <p className="text-xs leading-snug text-muted sm:text-sm">
              <span className="font-medium text-ink">Private pay link</span> plus the same
              bill for machines as an HTTP 402 resource until Umbra settlement, then 200
              with structured content.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Link href="/demo" className={pill}>
              Demo center →
            </Link>
            <Link href="/how-it-works" className={pillGhost}>
              How it works →
            </Link>
            <Link href="/reference" className={pillGhost}>
              Reference →
            </Link>
          </div>
        </section>

        <nav
          className="flex flex-wrap gap-6 border-t border-line pt-5 text-xs text-muted"
          aria-label="Docs shortcuts"
        >
          <Link href="/settlement" className="font-medium text-teal hover:underline">
            Settlement
          </Link>
          <Link href="/agents" className="font-medium text-teal hover:underline">
            Agents &amp; APIs
          </Link>
        </nav>
      </div>
    </ContentPageShell>
  );
}
