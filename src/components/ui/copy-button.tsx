"use client";

import { useCallback, useState } from "react";

type CopyButtonProps = {
  text: string;
  label?: string;
  copiedLabel?: string;
  className?: string;
};

export function CopyButton({
  text,
  label = "Copy",
  copiedLabel = "Copied",
  className,
}: CopyButtonProps) {
  const [done, setDone] = useState(false);

  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setDone(true);
      window.setTimeout(() => setDone(false), 2000);
    } catch {
      window.prompt("Copy:", text);
    }
  }, [text]);

  return (
    <button
      type="button"
      onClick={() => void onCopy()}
      className={
        className ??
        "shrink-0 rounded-lg border border-line-strong bg-surface px-2.5 py-1 text-[11px] font-semibold text-muted transition hover:border-teal-muted hover:text-teal"
      }
    >
      {done ? copiedLabel : label}
    </button>
  );
}
