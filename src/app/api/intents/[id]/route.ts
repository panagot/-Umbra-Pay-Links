import { NextResponse } from "next/server";
import { getIntent } from "@/lib/intents";

type RouteContext = { params: Promise<{ id: string }> };

/** Public metadata for the payer UI (merchant address is required for Umbra UTXO creation). */
export async function GET(_req: Request, context: RouteContext) {
  const { id } = await context.params;
  const intent = await getIntent(id);
  if (!intent) {
    return NextResponse.json({ error: "Intent not found" }, { status: 404 });
  }
  return NextResponse.json({
    id: intent.id,
    label: intent.label,
    amountAtomic: intent.amountAtomic,
    mint: intent.mint,
    status: intent.status,
    merchantAddress: intent.merchantAddress,
    createdAt: intent.createdAt,
  });
}
