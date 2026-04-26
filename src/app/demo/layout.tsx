import type { ReactNode } from "react";
import { DemoCheckoutProvider } from "@/components/demo/demo-checkout-sync";

/** Shared intent/cart sync between retail demo, agent 402 sim, and platform developer sims. */
export default function DemoLayout({ children }: { children: ReactNode }) {
  return <DemoCheckoutProvider>{children}</DemoCheckoutProvider>;
}
