import { describe, expect, it } from "vitest";
import { rateLimitAllow } from "@/lib/rate-limit";

describe("rateLimitAllow", () => {
  it("allows up to max requests per window", () => {
    const key = `t-${crypto.randomUUID()}`;
    expect(rateLimitAllow(key, 3, 10_000)).toBe(true);
    expect(rateLimitAllow(key, 3, 10_000)).toBe(true);
    expect(rateLimitAllow(key, 3, 10_000)).toBe(true);
    expect(rateLimitAllow(key, 3, 10_000)).toBe(false);
  });

  it("isolates keys", () => {
    const a = `a-${crypto.randomUUID()}`;
    const b = `b-${crypto.randomUUID()}`;
    expect(rateLimitAllow(a, 1, 10_000)).toBe(true);
    expect(rateLimitAllow(a, 1, 10_000)).toBe(false);
    expect(rateLimitAllow(b, 1, 10_000)).toBe(true);
  });
});
