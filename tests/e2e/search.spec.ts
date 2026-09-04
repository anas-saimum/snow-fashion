import { expect, test } from "@playwright/test";

test.describe("search", () => {
  test("the overlay suggests products as you type", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: "Search products" }).click();

    const dialog = page.getByRole("dialog", { name: "Search products" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("Popular right now")).toBeVisible();

    await dialog.getByLabel("Search products").fill("gown");

    await expect(dialog.getByText("Products")).toBeVisible();
    await expect(dialog.getByRole("link", { name: /Gown/ }).first()).toBeVisible();
  });

  test("submitting the overlay lands on the results page", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: "Search products" }).click();
    const dialog = page.getByRole("dialog", { name: "Search products" });

    await dialog.getByLabel("Search products").fill("denim");
    await dialog.getByLabel("Search products").press("Enter");

    await expect(page).toHaveURL(/\/search\?q=denim/);
    await expect(
      page.getByRole("heading", { level: 1, name: 'Search results for: "denim"' }),
    ).toBeVisible();
    expect(await page.locator("article").count()).toBeGreaterThan(0);
  });

  test("Escape closes the overlay", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: "Search products" }).click();
    const dialog = page.getByRole("dialog", { name: "Search products" });
    await expect(dialog).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("matches by category and by colour, not just name", async ({ page }) => {
    await page.goto("/search?q=accessories");
    expect(await page.locator("article").count()).toBeGreaterThan(0);

    await page.goto("/search?q=burgundy");
    expect(await page.locator("article").count()).toBeGreaterThan(0);
  });

  test("no results offers a way out", async ({ page }) => {
    await page.goto("/search?q=zzzzqqqq");

    await expect(
      page.getByRole("heading", { name: /No results for "zzzzqqqq"/ }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Shop all" })).toBeVisible();
  });

  test("an empty query invites browsing instead of erroring", async ({ page }) => {
    await page.goto("/search");

    await expect(page.getByRole("heading", { level: 1, name: "Search" })).toBeVisible();
    await expect(page.getByText("Browse by category")).toBeVisible();
  });

  test("the suggestions endpoint returns lightweight results", async ({
    request,
  }) => {
    const response = await request.get("/api/search?q=gown&limit=3");
    expect(response.ok()).toBe(true);

    const body = await response.json();
    expect(body.results.length).toBeGreaterThan(0);
    expect(body.results.length).toBeLessThanOrEqual(3);
    expect(Object.keys(body.results[0]).sort()).toEqual([
      "categoryName",
      "currency",
      "image",
      "imageAlt",
      "name",
      "price",
      "slug",
    ]);

    const tooShort = await request.get("/api/search?q=g");
    expect((await tooShort.json()).results).toHaveLength(0);
  });
});
