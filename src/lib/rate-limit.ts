/** Simple in-memory sliding window rate limiter (per process). */

const buckets = new Map<string, number[]>();

function prune(now: number, windowMs: number, stamps: number[]) {
  return stamps.filter((t) => now - t < windowMs);
}

/**
 * @returns true if allowed, false if over limit
 */
export function rateLimitAllow(
  key: string,
  max: number,
  windowMs: number,
): boolean {
  const now = Date.now();
  const prev = buckets.get(key) ?? [];
  const fresh = prune(now, windowMs, prev);
  if (fresh.length >= max) {
    buckets.set(key, fresh);
    return false;
  }
  fresh.push(now);
  buckets.set(key, fresh);
  return true;
}

export function clientKeyFromRequest(req: Request): string {
  const h = req.headers;
  const forwarded = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = h.get("x-real-ip")?.trim();
  return forwarded || realIp || "unknown";
}
