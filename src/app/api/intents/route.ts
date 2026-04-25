import { address } from "@solana/kit";
import { NextResponse } from "next/server";
import { createIntent } from "@/lib/intents";
import { clientKeyFromRequest, rateLimitAllow } from "@/lib/rate-limit";
import { getAppBaseUrl, getDefaultUsdcMint } from "@/lib/umbra-config";

function parseOptionalWebhook(raw: string | undefined): string | undefined {
  const s = raw?.trim();
  if (!s) return undefined;
  let u: URL;
  try {
    u = new URL(s);
  } catch {
    return undefined;
  }
  if (u.protocol !== "https:" && u.protocol !== "http:") return undefined;
  return s;
}

export async function POST(req: Request) {
  const ip = clientKeyFromRequest(req);
  if (!rateLimitAllow(`intents-post:${ip}`, 20, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const b = body as {
    label?: string;
    amountUsdc?: string;
    merchantAddress?: string;
    mint?: string;
    webhookUrl?: string;
  };
  const label = (b.label ?? "Payment").trim() || "Payment";
  const merchantAddress = (b.merchantAddress ?? "").trim();
  if (!merchantAddress) {
    return NextResponse.json(
      { error: "merchantAddress is required" },
      { status: 400 },
    );
  }
  try {
    address(merchantAddress);
  } catch {
    return NextResponse.json(
      { error: "merchantAddress must be a valid Solana address (base58)" },
      { status: 400 },
    );
  }
  const amountStr = (b.amountUsdc ?? "").trim();
  const parsed = Number(amountStr);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return NextResponse.json(
      { error: "amountUsdc must be a positive number" },
      { status: 400 },
    );
  }
  const amountAtomic = BigInt(Math.round(parsed * 1_000_000));
  const mint = (b.mint ?? getDefaultUsdcMint()).trim();
  try {
    address(mint);
  } catch {
    return NextResponse.json({ error: "mint must be a valid SPL mint address" }, { status: 400 });
  }

  const webhookUrl = parseOptionalWebhook(b.webhookUrl);
  if (b.webhookUrl?.trim() && !webhookUrl) {
    return NextResponse.json(
      { error: "webhookUrl must be a valid http(s) URL if provided" },
      { status: 400 },
    );
  }

  const intent = await createIntent({
    label,
    amountAtomic: amountAtomic.toString(),
    mint,
    merchantAddress,
    webhookUrl,
  });

  const base = getAppBaseUrl();
  return NextResponse.json({
    intent: {
      id: intent.id,
      label: intent.label,
      amountAtomic: intent.amountAtomic,
      mint: intent.mint,
      status: intent.status,
      createdAt: intent.createdAt,
    },
    payUrl: `${base}/pay/${intent.id}`,
    agentResourceUrl: `${base}/api/resources/${intent.id}`,
  });
}
