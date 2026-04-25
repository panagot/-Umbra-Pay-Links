import { NextResponse } from "next/server";
import { getIntent } from "@/lib/intents";
import { clientKeyFromRequest, rateLimitAllow } from "@/lib/rate-limit";
import {
  getAppBaseUrl,
  getDefaultUsdcMint,
  x402SolanaNetwork,
} from "@/lib/umbra-config";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * x402-style gated resource: same URL for AI agents and automation.
 * Settlement is Umbra (see `extra`); standard `payTo` is included for tooling compatibility.
 */
export async function GET(req: Request, context: RouteContext) {
  const ip = clientKeyFromRequest(req);
  if (!rateLimitAllow(`resource-get:${ip}`, 120, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { id } = await context.params;
  const intent = await getIntent(id);
  if (!intent) {
    return NextResponse.json({ error: "Intent not found" }, { status: 404 });
  }

  if (intent.status === "settled") {
    return NextResponse.json({
      unlocked: true,
      intentId: intent.id,
      label: intent.label,
      message:
        "Payment recorded. In production you would return the protected payload here.",
    });
  }

  const base = getAppBaseUrl();
  const resource = `${base}/api/resources/${intent.id}`;
  const mint = intent.mint || getDefaultUsdcMint();

  const body = {
    x402Version: 1,
    error: "Payment required — settle with Umbra per `extra` (not a raw SPL transfer).",
    accepts: [
      {
        scheme: "exact",
        network: x402SolanaNetwork(),
        maxAmountRequired: intent.amountAtomic,
        resource,
        description: intent.label,
        payTo: intent.merchantAddress,
        maxTimeoutSeconds: 600,
        asset: mint,
        mimeType: "application/json",
        outputSchema: null,
        extra: {
          name: "USDC",
          settlement: "umbra-receiver-claimable-utxo",
          intentId: intent.id,
          mint,
          amountAtomic: intent.amountAtomic,
          merchantAddress: intent.merchantAddress,
          humanPayUrl: `${base}/pay/${intent.id}`,
          confirmUrl: `${base}/api/intents/${intent.id}/confirm`,
          docs: "https://sdk.umbraprivacy.com/quickstart",
        },
      },
    ],
  };

  // Poller hint: Umbra settlement often spans more than one slot vs a naive SPL send.
  return NextResponse.json(body, {
    status: 402,
    headers: { "Retry-After": "15" },
  });
}
