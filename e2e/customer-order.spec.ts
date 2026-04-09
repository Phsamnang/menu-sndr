import { test, expect, bearerHeaders } from "./fixtures/auth";

test.describe("Customer order page (no auth)", () => {
  test("loads /order/[orderId] for an existing order without auth", async ({ browser, request }) => {
    // Create an order via admin API
    const createRes = await request.post("/api/admin/orders", {
      headers: bearerHeaders("admin"),
      data: { orderType: "dine_in", items: [] },
    });
    expect(createRes.status()).toBe(201);
    const orderId = (await createRes.json()).data.id;

    // Open in a fresh context (no auth)
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("response", (r) => {
      if (r.url().includes("/api/") && r.status() >= 500) {
        errors.push(`5xx ${r.status()} ${r.url()}`);
      }
    });

    const res = await page.goto(`/order/${orderId}`);
    expect(res?.status()).toBeLessThan(500);
    await page.waitForLoadState("networkidle");
    expect(errors, errors.join("\n")).toHaveLength(0);

    await ctx.close();
  });

  test("public /api/menu (if exists) returns menu items", async ({ request }) => {
    const res = await request.get("/api/menu");
    // Endpoint may or may not exist; if it does, it should return 200
    if (res.status() === 404) test.skip(true, "/api/menu does not exist");
    expect(res.status()).toBe(200);
  });
});
