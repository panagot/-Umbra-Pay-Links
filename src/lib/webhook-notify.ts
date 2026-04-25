import type { PaymentIntent } from "@/lib/intents";

/** Fire-and-forget POST when an intent becomes settled (never throws). */
export async function notifyIntentWebhook(intent: PaymentIntent): Promise<void> {
  const url = intent.webhookUrl?.trim();
  if (!url) return;
  try {
    const u = new URL(url);
    if (u.protocol !== "https:" && u.protocol !== "http:") return;
  } catch {
    return;
  }
  const payload = {
    event: "intent.settled" as const,
    intentId: intent.id,
    label: intent.label,
    amountAtomic: intent.amountAtomic,
    mint: intent.mint,
    merchantAddress: intent.merchantAddress,
    settledAt: new Date().toISOString(),
  };
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), 8000);
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "User-Agent": "UmbraPayLinks/1.0" },
      body: JSON.stringify(payload),
      signal: ac.signal,
    });
  } catch (e) {
    console.warn(
      "[webhook]",
      intent.id,
      e instanceof Error ? e.message : String(e),
    );
  } finally {
    clearTimeout(t);
  }
}
