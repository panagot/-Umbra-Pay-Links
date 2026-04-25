import type { ReactNode } from "react";
import { InfoTip } from "@/components/ui/tooltip";

export function FieldLabel({
  htmlFor,
  label,
  tip,
}: {
  htmlFor?: string;
  label: string;
  tip: ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <label
        htmlFor={htmlFor}
        className="text-sm font-medium text-ink"
      >
        {label}
      </label>
      <InfoTip label={`Help: ${label}`} content={tip} />
    </div>
  );
}
