"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export const VECTOR_STORE_BASE = "https://vector-silicon.demo";

/** Values mirrored into the agent 402 mock when the user checks out in VECTOR SILICON. */
export type SyncedVectorCheckout = {
  intentId: string;
  amountAtomic: string;
  subtotalLabel: string;
  lineItems: string[];
};

type Ctx = {
  synced: SyncedVectorCheckout | null;
  setSynced: (value: SyncedVectorCheckout | null) => void;
};

const DemoCheckoutContext = createContext<Ctx | null>(null);

export function DemoCheckoutProvider({ children }: { children: ReactNode }) {
  const [synced, setSynced] = useState<SyncedVectorCheckout | null>(null);
  const value = useMemo(() => ({ synced, setSynced }), [synced]);
  return (
    <DemoCheckoutContext.Provider value={value}>{children}</DemoCheckoutContext.Provider>
  );
}

export function useDemoCheckoutOptional() {
  return useContext(DemoCheckoutContext);
}
