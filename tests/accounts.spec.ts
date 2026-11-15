import { test, expect, type Page } from "@playwright/test";
const live = process.env.PERSO_E2E_LIVE === "1";
const owner = process.env.PERSO_E2E_USERNAME || "owner";
const password =
  process.env.PERSO_E2E_PASSWORD || "perso-e2e-password-test-only-123";

async function login(page: Page, username: string, pass: string) {
  await page.addInitScript(() => localStorage.setItem("perso.language", "en"));
  await page.goto("/");
  await page.getByLabel("Username", { exact: true }).fill(username);
  await page.getByLabel("Password", { exact: true }).fill(pass);
  await page
    .getByRole("button", { name: "Connect securely", exact: true })
    .click();
  await expect(page.locator(".live-header")).toBeVisible();
}
test.describe("server-backed accounts", () => {
  test.skip(!live, "Requires disposable identity/database fixture");
  test("creates a buyer, persists customization, blocks user administration, and signs out", async ({
    page,
    browser,
  }) => {
    await login(page, owner, password);
    await page.getByRole("button", { name: "Settings", exact: true }).click();
    const buyerName = `buyer${Date.now()}`;
    await page.getByLabel("New username", { exact: true }).fill(buyerName);
    await page.getByLabel("Initial password", { exact: true }).fill(password);
    await page
      .getByRole("button", { name: "Create user", exact: true })
      .click();
    await expect(
      page.locator(".live-user-row").filter({ hasText: buyerName }),
    ).toBeVisible();
    const context = await browser.newContext({
      baseURL: new URL(page.url()).origin,
    });
    const buyer = await context.newPage();
    await login(buyer, buyerName, password);
    // New users start in Persian; change the language through the persisted header control.
    await buyer
      .getByRole("button", { name: "تغییر زبان", exact: true })
      .click();
    await buyer.getByRole("button", { name: "Settings", exact: true }).click();
    await expect(
      buyer.getByRole("heading", { name: "User management", exact: true }),
    ).toHaveCount(0);
    await buyer
      .getByLabel("Display name", { exact: true })
      .fill("Healthcare Buyer");
    await buyer
      .getByRole("button", { name: "Save profile", exact: true })
      .click();
    await expect(buyer.getByRole("status")).toContainText("Profile saved");
    await buyer.getByLabel("Preferred city", { exact: true }).fill("تهران");
    await buyer
      .getByRole("combobox", { name: "Number format", exact: true })
      .selectOption("latin");
    await buyer
      .getByRole("button", { name: "Save preferences", exact: true })
      .click();
    await expect(buyer.getByRole("status")).toContainText("Preferences saved");
    await buyer.reload();
    await buyer.screenshot({
      path: "test-results/account-preferences.png",
      fullPage: true,
    });
    await expect(buyer.getByLabel("Display name", { exact: true })).toHaveValue(
      "Healthcare Buyer",
    );
    await expect(
      buyer.getByLabel("Preferred city", { exact: true }),
    ).toHaveValue("تهران");
    expect((await context.request.get("/api/v1/users")).status()).toBe(403);
    expect((await context.request.get("/api/v1/offers")).status()).toBe(403);
    await buyer.getByRole("button", { name: "Sign out", exact: true }).click();
    await expect(buyer.locator("#username")).toBeVisible();
    expect((await context.request.get("/api/v1/session")).status()).toBe(401);
    await context.close();
  });
  test("super admin cannot deactivate the last super admin through the UI", async ({
    page,
  }) => {
    await login(page, owner, password);
    await page.getByRole("button", { name: "Settings", exact: true }).click();
    await page
      .getByRole("button", { name: `Edit ${owner}`, exact: true })
      .click();
    await page.getByLabel("Account active", { exact: true }).uncheck();
    await page
      .getByRole("button", { name: "Save account", exact: true })
      .click();
    await expect(page.getByRole("alert")).toContainText(
      "Keep at least one active super_admin",
    );
  });
});
