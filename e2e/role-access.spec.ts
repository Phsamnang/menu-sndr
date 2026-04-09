import { test, expect, bearerHeaders } from "./fixtures/auth";

/**
 * Verifies that the withAuth() middleware enforces role restrictions consistently
 * across the admin API surface. These tests intentionally make NO assumptions
 * about exact policy — they only check that non-admin roles are blocked from
 * admin-only endpoints.
 */
test.describe("Role-based access control", () => {
  const ADMIN_ONLY_ENDPOINTS = [
    "/api/admin/menu-items",
    "/api/admin/categories",
    "/api/admin/users",
    "/api/admin/tables",
  ];

  const NON_ADMIN_ROLES = ["chef", "waiter", "order"] as const;

  for (const endpoint of ADMIN_ONLY_ENDPOINTS) {
    for (const role of NON_ADMIN_ROLES) {
      test(`${role} cannot GET ${endpoint}`, async ({ request }) => {
        const res = await request.get(endpoint, {
          headers: bearerHeaders(role),
        });
        expect(
          [401, 403],
          `${role} got ${res.status()} from ${endpoint}`
        ).toContain(res.status());
      });
    }
  }

  test("missing token returns 401 on any admin endpoint", async ({ request }) => {
    const res = await request.get("/api/admin/orders");
    expect(res.status()).toBe(401);
  });

  test("invalid token returns 401", async ({ request }) => {
    const res = await request.get("/api/admin/orders", {
      headers: { Authorization: "Bearer not-a-real-token" },
    });
    expect(res.status()).toBe(401);
  });

  test("admin sidebar shows menu items page for admin", async ({ adminPage }) => {
    await adminPage.goto("/admin/orders");
    await adminPage.waitForLoadState("networkidle");
    // The admin sidebar lists "menu-items" link for admin role
    const menuItemsLink = adminPage.locator('a[href="/admin/menu-items"]');
    await expect(menuItemsLink.first()).toBeVisible();
  });

  test("chef sidebar does NOT show menu items page", async ({ chefPage }) => {
    // Avoid networkidle — the chef SSE stream keeps the connection open.
    await chefPage.goto("/admin/chef", { waitUntil: "domcontentloaded" });
    await chefPage.waitForTimeout(1500);
    const menuItemsLink = chefPage.locator('a[href="/admin/menu-items"]');
    expect(await menuItemsLink.count()).toBe(0);
  });
});
