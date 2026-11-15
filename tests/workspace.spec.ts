import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
const key =
  process.env.PERSO_E2E_TOKEN ||
  "perso-local-test-token-at-least-32-characters";
const live = process.env.PERSO_E2E_LIVE === "1";
async function signIn(page: Page) {
  await page.addInitScript(() => localStorage.setItem("perso.language", "en"));
  await page.goto("/");
  await page.getByLabel("Access key").fill(key);
  await page.getByRole("button", { name: "Connect securely" }).click();
  await expect(
    page.getByRole("heading", { name: "Offers", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Mock connection", { exact: true }),
  ).toBeVisible();
}
test("sample preview stays explicit and can return to the live login", async ({
  page,
}) => {
  await page.goto("/?mode=demo");
  await expect(page.locator(".demo-return")).toBeVisible();
  await page.locator(".demo-return").click();
  await expect(page.locator("#access-key")).toBeVisible();
  await expect(page.locator(".live-offer")).toHaveCount(0);
});
test.describe("server-backed workspace", () => {
  test.skip(
    !live,
    "Set PERSO_E2E_LIVE=1 with the isolated full-stack fixture.",
  );
  test("rejects invalid credentials and preserves the login form", async ({
    page,
  }) => {
    await page.addInitScript(() =>
      localStorage.setItem("perso.language", "en"),
    );
    await page.goto("/");
    await page.getByLabel("Access key").fill("invalid");
    await page.getByRole("button", { name: "Connect securely" }).click();
    await expect(page.getByRole("alert")).toContainText(
      "Access key is invalid",
    );
    await expect(page.locator(".live-offer")).toHaveCount(0);
  });
  test("shows an ingested offer and retains product routes on reload", async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await signIn(page);
    await expect(page.locator(".live-offer").first()).toBeVisible({
      timeout: 20000,
    });
    await expect(page.locator(".live-offer").first()).toContainText("iPhone");
    const product = await page
      .locator(".live-select option")
      .nth(1)
      .getAttribute("value");
    await page.locator(".live-select select").selectOption(product!);
    await expect(page).toHaveURL(new RegExp("product=" + product));
    await page.reload();
    await expect(page.locator(".live-select select")).toHaveValue(product!);
    expect(errors).toEqual([]);
  });
  test("persists interest changes across reload", async ({ page }) => {
    await signIn(page);
    await page.getByRole("button", { name: "Interests", exact: true }).click();
    const card = page.locator(".live-catalog-card").last();
    await expect(card).toBeVisible();
    const button = card.getByRole("button");
    const saved = await button.innerText();
    await button.click();
    await expect(button).toHaveText(saved.trim() === "Saved" ? "Add" : "Saved");
    await page.reload();
    await expect(
      page.locator(".live-catalog-card").last().getByRole("button"),
    ).toHaveText(saved.trim() === "Saved" ? "Add" : "Saved");
  });
  test("resolves a source through the gateway and persists pause/resume", async ({
    page,
  }) => {
    await signIn(page);
    await page.getByRole("button", { name: "Sources", exact: true }).click();
    await page
      .getByLabel("Telegram link or username")
      .fill("@tech_super_fixture");
    await page
      .getByRole("button", { name: "Resolve source", exact: true })
      .click();
    await expect(page.locator(".live-resolution")).toContainText("supergroup");
    await page.getByRole("button", { name: "Add source", exact: true }).click();
    const card = page
      .locator(".live-source-card")
      .filter({ hasText: "supergroup" });
    await expect(card).toBeVisible();
    await card.getByRole("button", { name: "Pause", exact: true }).click();
    await expect(card).toContainText("paused");
    await page.reload();
    await expect(
      page.locator(".live-source-card").filter({ hasText: "supergroup" }),
    ).toContainText("paused");
    await card.getByRole("button", { name: "Resume", exact: true }).click();
    await expect(card).toContainText("active");
  });
  test("API failure never displays sample offers", async ({ page }) => {
    await page.route("**/api/v1/offers?**", (route) =>
      route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({
          success: false,
          error: "Temporarily unavailable",
        }),
      }),
    );
    await signIn(page);
    await expect(page.getByRole("alert")).toContainText(
      "Temporarily unavailable",
    );
    await expect(page.locator(".live-offer")).toHaveCount(0);
    await expect(page.locator(".demo-return")).toHaveCount(0);
  });
  test("mobile RTL/LTR layout has five usable tabs and no overflow", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await signIn(page);
    await expect(page.locator(".live-bottom-nav")).toBeVisible();
    await expect(page.locator(".live-bottom-nav button")).toHaveCount(5);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.getByRole("button", { name: "Change language" }).click();
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: "test-results/mobile-rtl.png",
      fullPage: true,
    });
  });
  test("live offer page passes automated WCAG AA checks", async ({ page }) => {
    await signIn(page);
    await expect(page.locator(".live-offer").first()).toBeVisible();
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(result.violations).toEqual([]);
  });
});
