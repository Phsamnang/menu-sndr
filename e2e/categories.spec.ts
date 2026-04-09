import { test, expect, bearerHeaders } from "./fixtures/auth";

test.describe("Categories API", () => {
  test("GET /api/admin/categories returns the seeded categories", async ({ request }) => {
    const res = await request.get("/api/admin/categories", {
      headers: bearerHeaders("admin"),
    });
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    const items = json.data?.items ?? json.data;
    expect(Array.isArray(items)).toBe(true);
    expect(items.length).toBeGreaterThanOrEqual(1);
  });

  test("create → delete a category", async ({ request }) => {
    const uniqueName = `__e2e_cat_${Date.now()}`;
    const createRes = await request.post("/api/admin/categories", {
      headers: bearerHeaders("admin"),
      data: { name: uniqueName, displayName: uniqueName },
    });
    expect(
      createRes.status(),
      `create failed: ${await createRes.text()}`
    ).toBe(201);
    const id = (await createRes.json()).data.id;

    const delRes = await request.delete(`/api/admin/categories/${id}`, {
      headers: bearerHeaders("admin"),
    });
    expect([200, 204]).toContain(delRes.status());
  });

  test("Categories page loads in browser", async ({ adminPage }) => {
    const errors: string[] = [];
    adminPage.on("pageerror", (e) => errors.push(e.message));
    await adminPage.goto("/admin/categories");
    await adminPage.waitForLoadState("networkidle");
    expect(errors, errors.join("\n")).toHaveLength(0);
  });
});
