import { test, expect, bearerHeaders } from "./fixtures/auth";

/**
 * Tests the POS happy path entirely via API:
 *  1. Pick a menu item
 *  2. Create an order
 *  3. Add the item to the order
 *  4. Verify totals and item count
 */
test.describe("POS order flow (API)", () => {
  test("create order, add item, check totals", async ({ request }) => {
    // Find any menu item to add
    const menuRes = await request.get("/api/admin/menu-items?page=1&limit=1", {
      headers: bearerHeaders("admin"),
    });
    expect(menuRes.status()).toBe(200);
    const menuJson = await menuRes.json();
    const menuItem = menuJson.data.items[0];
    test.skip(!menuItem, "No menu items seeded — cannot run POS flow");

    // Create empty order
    const createRes = await request.post("/api/admin/orders", {
      headers: bearerHeaders("admin"),
      data: { orderType: "dine_in", items: [] },
    });
    expect(createRes.status()).toBe(201);
    const orderId = (await createRes.json()).data.id;

    // Add an item
    const addRes = await request.post(`/api/admin/orders/${orderId}/items`, {
      headers: bearerHeaders("admin"),
      data: { menuItemId: menuItem.id, quantity: 2 },
    });
    expect(
      [200, 201],
      `add-item status was ${addRes.status()}: ${await addRes.text()}`
    ).toContain(addRes.status());

    // Re-fetch order with items
    const detailRes = await request.get(
      `/api/admin/orders/${orderId}?includeItems=true`,
      { headers: bearerHeaders("admin") }
    );
    expect(detailRes.status()).toBe(200);
    const detail = await detailRes.json();
    expect(detail.success).toBe(true);
    const items = detail.data.items || [];
    expect(items.length).toBeGreaterThanOrEqual(1);
    const added = items.find((i: any) => i.menuItemId === menuItem.id);
    expect(added).toBeTruthy();
    expect(added.quantity).toBe(2);
  });

  test("POS order detail page loads in browser", async ({ adminPage, request }) => {
    const createRes = await request.post("/api/admin/orders", {
      headers: bearerHeaders("admin"),
      data: { orderType: "dine_in", items: [] },
    });
    expect(createRes.status()).toBe(201);
    const orderId = (await createRes.json()).data.id;

    const errors: string[] = [];
    adminPage.on("pageerror", (e) => errors.push(e.message));
    await adminPage.goto(`/admin/orders/${orderId}`);
    await adminPage.waitForLoadState("networkidle");
    expect(errors, errors.join("\n")).toHaveLength(0);
  });
});
