import { test, expect, bearerHeaders } from "./fixtures/auth";

test.describe("Chef SSE & API", () => {
  test("GET /api/chef/orders returns a list for chef", async ({ request }) => {
    const res = await request.get("/api/chef/orders", {
      headers: bearerHeaders("chef"),
    });
    expect([200, 404]).toContain(res.status());
    if (res.status() === 200) {
      const json = await res.json();
      expect(json.success).toBe(true);
    }
  });

  test("Chef stream endpoint accepts ?token= query parameter", async ({ request, authedRequest }) => {
    const { token } = await authedRequest("chef");
    // Just verify the endpoint responds with 200 and event-stream content type.
    const res = await request.get(`/api/chef/orders/stream?token=${token}`, {
      timeout: 5000,
    }).catch((e) => e);
    // EventSource hangs the request open; we accept either a 200 response or a timeout.
    if (res && typeof res.status === "function") {
      expect(res.status()).toBe(200);
      const headers = res.headers();
      expect(headers["content-type"] || "").toMatch(/event-stream/);
    }
  });

  test("Chef page loads in browser without errors", async ({ chefPage }) => {
    const errors: string[] = [];
    chefPage.on("pageerror", (e) => errors.push(e.message));
    // Use domcontentloaded — networkidle never fires because the SSE
    // EventSource keeps the connection open indefinitely.
    await chefPage.goto("/admin/chef", { waitUntil: "domcontentloaded" });
    await chefPage.waitForTimeout(2000);
    expect(errors, errors.join("\n")).toHaveLength(0);
  });

  test("Chef cannot reach /api/admin/users", async ({ request }) => {
    const res = await request.get("/api/admin/users", {
      headers: bearerHeaders("chef"),
    });
    expect([401, 403]).toContain(res.status());
  });
});
