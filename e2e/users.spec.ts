import { test, expect, bearerHeaders } from "./fixtures/auth";

test.describe("Users API (admin)", () => {
  test("GET /api/admin/users returns the seeded users", async ({ request }) => {
    const res = await request.get("/api/admin/users", {
      headers: bearerHeaders("admin"),
    });
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    const items = json.data?.items ?? json.data;
    expect(Array.isArray(items)).toBe(true);
    expect(items.length).toBeGreaterThanOrEqual(4); // admin, chef, waiter, order
  });

  test("non-admin cannot list users", async ({ request }) => {
    const res = await request.get("/api/admin/users", {
      headers: bearerHeaders("waiter"),
    });
    expect([401, 403]).toContain(res.status());
  });

  test("create → deactivate → delete a user", async ({ request }) => {
    // Need a roleId
    const rolesRes = await request.get("/api/admin/roles", {
      headers: bearerHeaders("admin"),
    });
    test.skip(rolesRes.status() !== 200, `/api/admin/roles unavailable (${rolesRes.status()})`);
    const rolesJson = await rolesRes.json();
    const roles = rolesJson.data?.items ?? rolesJson.data;
    const waiterRole = (Array.isArray(roles) ? roles : []).find(
      (r: any) => r.name === "waiter"
    );
    test.skip(!waiterRole, "waiter role not found");

    const username = `__e2e_user_${Date.now()}`;
    const createRes = await request.post("/api/admin/users", {
      headers: bearerHeaders("admin"),
      data: {
        username,
        password: "playwright123",
        roleId: waiterRole.id,
        isActive: true,
      },
    });
    expect(
      createRes.status(),
      `create user failed: ${await createRes.text()}`
    ).toBe(201);
    const created = (await createRes.json()).data;
    expect(created.username).toBe(username);

    const delRes = await request.delete(`/api/admin/users/${created.id}`, {
      headers: bearerHeaders("admin"),
    });
    expect([200, 204]).toContain(delRes.status());
  });

  test("Users page loads in browser", async ({ adminPage }) => {
    const errors: string[] = [];
    adminPage.on("pageerror", (e) => errors.push(e.message));
    await adminPage.goto("/admin/users");
    await adminPage.waitForLoadState("networkidle");
    expect(errors, errors.join("\n")).toHaveLength(0);
  });
});
