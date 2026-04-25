import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type IntentStatus = "open" | "settled";

export type PaymentIntent = {
  id: string;
  label: string;
  /** SPL amount in smallest units (e.g. USDC 6 decimals). */
  amountAtomic: string;
  mint: string;
  /** Umbra / Solana destination for receiver-claimable UTXO (merchant wallet). */
  merchantAddress: string;
  status: IntentStatus;
  createdAt: string;
  /** Optional HTTPS URL — receives JSON `intent.settled` after confirm (best-effort). */
  webhookUrl?: string;
  /** Populated after payer completes Umbra settlement (client-reported; verify in prod). */
  settlementSignatures?: string[];
};

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "intents.json");

type StoreFile = {
  intents: PaymentIntent[];
};

async function readStore(): Promise<StoreFile> {
  try {
    const raw = await readFile(STORE_PATH, "utf8");
    return JSON.parse(raw) as StoreFile;
  } catch {
    return { intents: [] };
  }
}

async function writeStore(store: StoreFile): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
}

export async function createIntent(input: {
  label: string;
  amountAtomic: string;
  mint: string;
  merchantAddress: string;
  webhookUrl?: string;
}): Promise<PaymentIntent> {
  const store = await readStore();
  const id = crypto.randomUUID();
  const intent: PaymentIntent = {
    id,
    label: input.label,
    amountAtomic: input.amountAtomic,
    mint: input.mint,
    merchantAddress: input.merchantAddress,
    status: "open",
    createdAt: new Date().toISOString(),
    ...(input.webhookUrl ? { webhookUrl: input.webhookUrl } : {}),
  };
  store.intents.unshift(intent);
  await writeStore(store);
  return intent;
}

export async function getIntent(id: string): Promise<PaymentIntent | null> {
  const store = await readStore();
  return store.intents.find((i) => i.id === id) ?? null;
}

function sameSignatureSet(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  return a.every((x, i) => x === b[i]);
}

export async function markSettled(
  id: string,
  signatures: string[],
): Promise<
  | { intent: PaymentIntent; alreadySettled: boolean }
  | { conflict: true }
  | null
> {
  const store = await readStore();
  const idx = store.intents.findIndex((i) => i.id === id);
  if (idx === -1) return null;
  const intent = store.intents[idx];
  if (intent.status === "settled") {
    const prev = intent.settlementSignatures ?? [];
    if (sameSignatureSet(prev, signatures)) {
      return { intent, alreadySettled: true };
    }
    return { conflict: true };
  }
  intent.status = "settled";
  intent.settlementSignatures = signatures;
  store.intents[idx] = intent;
  await writeStore(store);
  return { intent, alreadySettled: false };
}
