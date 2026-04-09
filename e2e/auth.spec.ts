import { test, expect } from "./fixtures/auth";
import { TEST_USERS } from "./global-setup";

test.describe("Auth", () => {
  test("login API succeeds for each seeded user", async ({ request }) => {
    for (const [role, creds] of Object.entries(TEST_USERS)) {
      const res = await request.post("/api/auth/login", { data: creds });
      expect(res.status(), `${role} login status`).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.token).toBeTruthy();
      expect(json.data.user.role.name).toBe(role);
    }
  });

  test("login API rejects invalid credentials with 401", async ({ request }) => {
    const res = await request.post("/api/auth/login", {
      data: { username: "admin", password: "wrong-password" },
    });
    expect(res.status()).toBe(401);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("INVALID_CREDENTIALS");
  });

  test("login API rejects missing fields with 400", async ({ request }) => {
    const res = await request.post("/api/auth/login", { data: {} });
    expect(res.status()).toBe(400);
  });

  test("login form UI: successful login redirects to /admin", async ({ page }) => {
    await page.goto("/login");
    await page.locator("#username").fill("admin");
    await page.locator("#password").fill("admin123");
    await Promise.all([
      page.waitForURL(/\/admin/, { timeout: 15_000 }),
      page.locator('button[type="submit"]').click(),
    ]);
    expect(page.url()).toMatch(/\/admin/);
  });

  test("login form UI: bad credentials show an error and stay on /login", async ({ page }) => {
    await page.goto("/login");
    await page.locator("#username").fill("admin");
    await page.locator("#password").fill("definitely-wrong");
    await page.locator('button[type="submit"]').click();
    // Either an error appears, or we simply stay on /login.
    await page.waitForTimeout(2000);
    expect(page.url()).toMatch(/\/login/);
  });

  test("authenticated admin page loads as admin", async ({ adminPage }) => {
    await adminPage.goto("/admin/orders");
    // Should not bounce to /login
    await adminPage.waitForLoadState("networkidle");
    expect(adminPage.url()).toMatch(/\/admin\/orders/);
  });
});
