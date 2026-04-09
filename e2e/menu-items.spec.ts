import { test, expect, bearerHeaders } from "./fixtures/auth";

test.describe("Menu Items API (admin)", () => {
  test("GET /api/admin/menu-items returns paginated list", async ({ request }) => {
    const res = await request.get("/api/admin/menu-items?page=1&limit=5", {
      headers: bearerHeaders("admin"),
    });
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data.items)).toBe(true);
  });

  test("create → fetch → delete a menu item", async ({ request }) => {
    // Need a category to attach to
    const catRes = await request.get("/api/admin/categories", {
      headers: bearerHeaders("admin"),
    });
    expect(catRes.status()).toBe(200);
    const cats = (await catRes.json()).data?.items ?? (await catRes.json()).data;
    const categoryId = (Array.isArray(cats) ? cats : cats?.items || [])[0]?.id;
    test.skip(!categoryId, "No categories seeded");

    const uniqueName = `__e2e_item_${Date.now()}`;
    const createRes = await request.post("/api/admin/menu-items", {
      headers: bearerHeaders("admin"),
      data: {
        name: uniqueName,
        description: "playwright test item",
        image: "https://placehold.co/100",
        categoryId,
        isCook: false,
        isAvailable: true,
        prices: [],
      },
    });
    expect(
      createRes.status(),
      `create-menu-item failed: ${await createRes.text()}`
    ).toBe(201);
    const created = (await createRes.json()).data;
    expect(created.name).toBe(uniqueName);

    // Cleanup
    const delRes = await request.delete(`/api/admin/menu-items/${created.id}`, {
      headers: bearerHeaders("admin"),
    });
    expect([200, 204]).toContain(delRes.status());
  });

  test("non-admin cannot list menu items via admin endpoint", async ({ request }) => {
    const res = await request.get("/api/admin/menu-items", {
      headers: bearerHeaders("chef"),
    });
    expect([401, 403]).toContain(res.status());
  });

  test("Menu items page loads in browser", async ({ adminPage }) => {
    const errors: string[] = [];
    adminPage.on("pageerror", (e) => errors.push(e.message));
    await adminPage.goto("/admin/menu-items");
    await adminPage.waitForLoadState("networkidle");
    expect(errors, errors.join("\n")).toHaveLength(0);
  });
});
