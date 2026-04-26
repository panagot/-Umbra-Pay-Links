import { test, expect } from "@playwright/test";

/** Valid Solana address for API validation (USDC mint on mainnet — used only as test recipient). */
const TEST_MERCHANT =
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

test.describe("intent + pay + resource API", () => {
  test("POST /api/intents creates intent; GET pay, intents, resources behave", async ({
    page,
    request,
  }) => {
    const post = await request.post("/api/intents", {
      data: {
        label: "E2E intent",
        amountUsdc: "0.01",
        merchantAddress: TEST_MERCHANT,
      },
    });
    expect(post.ok(), await post.text()).toBeTruthy();
    const created = (await post.json()) as {
      intent: { id: string };
      payUrl: string;
      agentResourceUrl: string;
    };
    const { id } = created.intent;
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
    expect(created.payUrl).toContain(`/pay/${id}`);
    expect(created.agentResourceUrl).toContain(`/api/resources/${id}`);

    const payRes = await page.goto(`/pay/${id}`, { waitUntil: "domcontentloaded" });
    expect(payRes?.ok()).toBeTruthy();
    await expect(page.getByText("Private checkout")).toBeVisible();
    await expect(
      page.locator("span.text-lg.font-medium.text-teal").filter({ hasText: /^USDC$/ }),
    ).toBeVisible();

    const intentGet = await request.get(`/api/intents/${id}`);
    expect(intentGet.ok()).toBeTruthy();
    const intentJson = (await intentGet.json()) as { status: string; id: string };
    expect(intentJson.id).toBe(id);
    expect(intentJson.status).toBe("open");

    const resource = await request.get(`/api/resources/${id}`);
    expect(resource.status()).toBe(402);
    const body = (await resource.json()) as { x402Version?: number; accepts?: unknown[] };
    expect(body.x402Version).toBe(1);
    expect(Array.isArray(body.accepts)).toBeTruthy();
    expect(resource.headers()["retry-after"]).toBeTruthy();
  });

  test("GET /api/resources unknown id → 404", async ({ request }) => {
    const res = await request.get(
      "/api/resources/00000000-0000-0000-0000-000000000001",
    );
    expect(res.status()).toBe(404);
  });

  test("POST /api/intents rejects invalid merchant", async ({ request }) => {
    const res = await request.post("/api/intents", {
      data: {
        label: "x",
        amountUsdc: "1",
        merchantAddress: "not-a-valid-solana-address",
      },
    });
    expect(res.status()).toBe(400);
  });
});
