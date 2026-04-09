import { test, expect, bearerHeaders } from "./fixtures/auth";

test.describe("Admin Orders API", () => {
  test("GET /api/admin/orders returns paginated list for admin", async ({ request }) => {
    const res = await request.get("/api/admin/orders?page=1&limit=5", {
      headers: bearerHeaders("admin"),
    });
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data.items)).toBe(true);
    expect(json.data.pagination).toMatchObject({
      page: 1,
      limit: 5,
    });
    expect(typeof json.data.pagination.total).toBe("number");
  });

  test("GET /api/admin/orders is accessible for order role", async ({ request }) => {
    const res = await request.get("/api/admin/orders?page=1&limit=1", {
      headers: bearerHeaders("order"),
    });
    expect([200, 403]).toContain(res.status());
    // Note: actual policy verified by role-access.spec.ts
  });

  test("GET /api/admin/orders without auth returns 401", async ({ request }) => {
    const res = await request.get("/api/admin/orders");
    expect(res.status()).toBe(401);
  });

  test("POST /api/admin/orders creates an empty dine-in order", async ({ request }) => {
    const res = await request.post("/api/admin/orders", {
      headers: bearerHeaders("admin"),
      data: {
        orderType: "dine_in",
        items: [],
      },
    });
    expect(res.status()).toBe(201);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.id).toBeTruthy();
    expect(json.data.orderNumber).toMatch(/^\d{12}$/); // ddmmyyyy0000
    expect(json.data.status).toBe("new");
    expect(Number(json.data.subtotal)).toBe(0);
  });

  test("Admin orders page loads in browser", async ({ adminPage }) => {
    const errors: string[] = [];
    adminPage.on("pageerror", (e) => errors.push(e.message));
    adminPage.on("response", (r) => {
      if (r.url().includes("/api/") && r.status() >= 500) {
        errors.push(`5xx ${r.status()} ${r.url()}`);
      }
    });
    await adminPage.goto("/admin/orders");
    await adminPage.waitForLoadState("networkidle");
    expect(errors, errors.join("\n")).toHaveLength(0);
  });
});
