import { test, expect, type APIRequestContext } from "@playwright/test";
const live = process.env.PERSO_E2E_LIVE === "1";
const password = process.env.PERSO_E2E_PASSWORD || "perso-e2e-password-test-only-123";
async function login(api: APIRequestContext, username: string) {
  const response = await api.post("/api/v1/auth/login", { data: { username, password } });
  expect(response.status()).toBe(200);
  return (await response.json()).data.csrf_token as string;
}
test.describe("release integration", () => {
  test.skip(!live, "Requires disposable full stack");
  test("persists source grants and isolates two buyers before and after revocation", async ({page, browser}) => {
    const owner = process.env.PERSO_E2E_USERNAME || "owner";
    const csrf = await login(page.request, owner);
    const headers = { "X-CSRF-Token": csrf };
    const stamp = Date.now();
    const names = [`release_a_${stamp}`, `release_b_${stamp}`];
    const buyers = [];
    for (const username of names) {
      const response = await page.request.post("/api/v1/users", {headers, data: {username,password,role:"buyer"}});
      expect(response.status()).toBe(201);
      buyers.push((await response.json()).data);
    }
    const source = (await (await page.request.get("/api/v1/sources")).json()).data.find((s: {telegram_peer_id: number}) => s.telegram_peer_id === -1001234567890);
    expect(source).toBeTruthy();
    await page.goto("/#tab=sources");
    const card = page.locator(".live-source-card").filter({hasText: source.title});
    await card.getByRole("button", {name:"Assign buyers",exact:true}).click();
    await card.getByLabel(names[0],{exact:true}).check();
    await card.getByRole("button",{name:"Save access",exact:true}).click();
    await expect(page.getByRole("status")).toContainText("Buyer assignments saved");
    await page.reload();
    await card.getByRole("button",{name:"Assign buyers",exact:true}).click();
    await expect(card.getByLabel(names[0],{exact:true})).toBeChecked();
    const a = await browser.newContext({baseURL:new URL(page.url()).origin});
    const b = await browser.newContext({baseURL:new URL(page.url()).origin});
    try {
      const aCsrf = await login(a.request,names[0]);
      await login(b.request,names[1]);
      const visible = await (await a.request.get("/api/v1/offers")).json();
      expect(visible.data.length).toBeGreaterThan(0);
      const offerID = visible.data[0].offer.id;
      expect((await b.request.get(`/api/v1/offers/${offerID}`)).status()).toBe(404);
      const hidden = await (await b.request.get("/api/v1/offers")).json();
      expect(hidden.data).toEqual([]);
      expect(hidden.meta.total).toBe(0);
      expect((await a.request.put(`/api/v1/sources/${source.id}/assignments`,{headers:{"X-CSRF-Token":aCsrf},data:{buyer_ids:[buyers[1].id],version:1}})).status()).toBe(403);
      const grant = (await (await page.request.get(`/api/v1/sources/${source.id}/assignments`)).json()).data;
      expect((await page.request.put(`/api/v1/sources/${source.id}/assignments`,{headers,data:{buyer_ids:[],version:grant.version}})).status()).toBe(200);
      expect((await a.request.get(`/api/v1/offers/${offerID}`)).status()).toBe(404);
      expect((await (await a.request.get("/api/v1/offers")).json()).data).toEqual([]);
      expect((await (await a.request.get("/api/v1/sources")).json()).data).toEqual([]);
    } finally { await a.close(); await b.close(); }
  });
  test("creates healthcare catalog data and persists personal buying filters", async ({page}) => {
    await login(page.request, process.env.PERSO_E2E_USERNAME || "owner");
    await page.goto("/#tab=interests");
    const name = `Healthcare release ${Date.now()}`;
    await page.getByLabel("Product name",{exact:true}).fill(name);
    await page.getByLabel("Category",{exact:true}).fill("healthcare");
    await page.getByLabel("Unit",{exact:true}).fill("box");
    await page.getByLabel("Pack size",{exact:true}).fill("20");
    await page.locator(".live-catalog-form").getByRole("button",{name:"Add",exact:true}).click();
    const card = page.locator(".live-catalog-card").filter({hasText:name});
    await card.getByRole("button",{name:"Add",exact:true}).click();
    await card.getByLabel("Max price",{exact:true}).fill("250000");
    await card.getByLabel("Min quantity",{exact:true}).fill("2");
    await card.getByLabel("City",{exact:true}).fill("تهران");
    await card.getByRole("button",{name:"Filters",exact:true}).click();
    await expect(page.getByRole("status")).toContainText("saved");
    await page.reload();
    await expect(card.getByLabel("Max price",{exact:true})).toHaveValue("250000");
    await expect(card.getByLabel("Min quantity",{exact:true})).toHaveValue("2");
    await expect(card.getByLabel("City",{exact:true})).toHaveValue("تهران");
  });
});
