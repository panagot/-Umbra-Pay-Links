import { afterEach, describe, expect, it, vi } from "vitest";
import { verifySettlementSignaturesOnChain } from "@/lib/solana-verify-signatures";

describe("verifySettlementSignaturesOnChain", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("rejects empty signatures", async () => {
    const r = await verifySettlementSignaturesOnChain([]);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/No signatures/);
  });

  it("accepts confirmed statuses from RPC", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        json: async () => ({
          result: {
            value: [
              { confirmationStatus: "confirmed", err: null },
              { confirmationStatus: "finalized", err: null },
            ],
          },
        }),
      }),
    );
    const r = await verifySettlementSignaturesOnChain(["sig1", "sig2"]);
    expect(r).toEqual({ ok: true });
  });

  it("rejects when RPC returns error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        json: async () => ({ error: { message: "rate limited" } }),
      }),
    );
    const r = await verifySettlementSignaturesOnChain(["abc"]);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain("rate limited");
  });
});
