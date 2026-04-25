import { NextResponse } from "next/server";
import { getIntent, markSettled } from "@/lib/intents";
import { clientKeyFromRequest, rateLimitAllow } from "@/lib/rate-limit";
import {
  requireOnchainConfirmForSettle,
  verifySettlementSignaturesOnChain,
} from "@/lib/solana-verify-signatures";
import { notifyIntentWebhook } from "@/lib/webhook-notify";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * Marks the intent settled after optional on-chain verification of settlement tx
 * signatures. Set `REQUIRE_ONCHAIN_CONFIRM_FOR_SETTLE=true` in production-like envs.
 */
export async function POST(req: Request, context: RouteContext) {
  const ip = clientKeyFromRequest(req);
  if (!rateLimitAllow(`confirm:${ip}`, 30, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { id } = await context.params;
  const intent = await getIntent(id);
  if (!intent) {
    return NextResponse.json({ error: "Intent not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const sigs = (body as { signatures?: string[] }).signatures;
  if (!Array.isArray(sigs) || sigs.length === 0) {
    return NextResponse.json(
      { error: "signatures array is required" },
      { status: 400 },
    );
  }

  if (requireOnchainConfirmForSettle()) {
    const v = await verifySettlementSignaturesOnChain(sigs);
    if (!v.ok) {
      console.warn(
        JSON.stringify({ event: "confirm.verify_failed", intentId: id, error: v.error }),
      );
      return NextResponse.json(
        { error: `On-chain verification failed: ${v.error}` },
        { status: 400 },
      );
    }
  }

  const result = await markSettled(id, sigs);
  if (!result) {
    return NextResponse.json({ error: "Intent not found" }, { status: 404 });
  }
  if ("conflict" in result) {
    return NextResponse.json(
      { error: "Intent already settled with different signatures" },
      { status: 409 },
    );
  }

  const { intent: updated, alreadySettled } = result;
  console.info(
    JSON.stringify({
      event: "confirm.settled",
      intentId: id,
      alreadySettled,
      signatureCount: sigs.length,
      verify: requireOnchainConfirmForSettle(),
    }),
  );

  if (!alreadySettled) {
    void notifyIntentWebhook(updated);
  }

  return NextResponse.json({
    ok: true,
    intent: { ...updated, webhookUrl: undefined },
  });
}
