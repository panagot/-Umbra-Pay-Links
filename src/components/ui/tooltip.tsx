"use client";

import { useId } from "react";

type TooltipProps = {
  children: React.ReactNode;
  content: React.ReactNode;
  side?: "top" | "bottom";
};

/**
 * Hover / focus-visible tooltip. Trigger should include an accessible name
 * (e.g. aria-label on the child).
 */
export function Tooltip({
  children,
  content,
  side = "top",
}: TooltipProps) {
  const id = useId();
  const place =
    side === "top"
      ? "bottom-full left-1/2 mb-2 -translate-x-1/2"
      : "top-full left-1/2 mt-2 -translate-x-1/2";

  return (
    <span className="relative inline-flex items-center">
      <span
        className="group/tooltip inline-flex cursor-default items-center focus:outline-none"
        tabIndex={0}
        aria-describedby={id}
      >
        {children}
        <span
          id={id}
          role="tooltip"
          className={`pointer-events-none absolute ${place} z-50 w-max max-w-[min(20rem,calc(100vw-2rem))] scale-95 rounded-xl border border-line-strong bg-panel px-3.5 py-2.5 text-xs font-normal leading-snug text-ink opacity-0 shadow-[var(--shadow-card)] transition duration-150 group-hover/tooltip:scale-100 group-hover/tooltip:opacity-100 group-focus-visible/tooltip:scale-100 group-focus-visible/tooltip:opacity-100`}
        >
          {content}
        </span>
      </span>
    </span>
  );
}

export function InfoTip({
  label,
  content,
  triggerClassName,
}: {
  label: string;
  content: React.ReactNode;
  /** Override trigger styles (e.g. on dark headers). */
  triggerClassName?: string;
}) {
  const trigger =
    triggerClassName ??
    "inline-flex h-5 w-5 shrink-0 cursor-default items-center justify-center rounded-full border border-line bg-surface text-[10px] font-bold text-muted tabular-nums transition hover:border-teal-muted hover:bg-teal-soft hover:text-teal";
  return (
    <Tooltip content={content}>
      <span className={trigger} aria-label={label}>
        ?
      </span>
    </Tooltip>
  );
}
