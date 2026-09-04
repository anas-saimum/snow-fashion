import { expect, test } from "@playwright/test";

test.describe("shop listing", () => {
  test("filters by category through the sidebar and reflects it in the URL", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "sidebar is desktop-only; the drawer is covered separately");

    await page.goto("/shop");
    await expect(page.getByText("37 products")).toBeVisible();

    await page
      .getByRole("complementary", { name: "Product filters" })
      .getByLabel(/^Dresses/)
      .check();

    await expect(page).toHaveURL(/category=dresses/);
    await expect(page.getByText("6 products")).toBeVisible();
    await expect(page.locator("article")).toHaveCount(6);
  });

  test("stacks filters and clears them from the chips", async ({ page, isMobile }) => {
    test.skip(isMobile, "sidebar is desktop-only");

    await page.goto("/shop?category=tops");
    const before = await page.getByText(/^[0-9]+ products$/).innerText();

    await page
      .getByRole("complementary", { name: "Product filters" })
      .getByRole("button", { name: "M", exact: true })
      .click();

    await expect(page).toHaveURL(/size=m/);

    // Chips describe both active filters and can remove them.
    await expect(page.getByRole("list", { name: "Active filters" })).toBeVisible();
    await page.getByRole("button", { name: /Clear all/ }).click();

    await expect(page).not.toHaveURL(/size=m/);
    await expect(page).not.toHaveURL(/category=tops/);
    await expect(page.getByText(/^[0-9]+ products$/)).not.toHaveText(before);
  });

  test("sorting reorders the grid", async ({ page }) => {
    await page.goto("/shop");

    await page.getByRole("combobox").first().selectOption("price-asc");
    await expect(page).toHaveURL(/sort=price-asc/);

    const firstAsc = await page.locator("article").first().getByRole("heading").innerText();

    await page.getByRole("combobox").first().selectOption("price-desc");
    await expect(page).toHaveURL(/sort=price-desc/);

    const firstDesc = await page.locator("article").first().getByRole("heading").innerText();
    expect(firstAsc).not.toBe(firstDesc);
  });

  test("load more appends a page without losing the filters", async ({ page }) => {
    await page.goto("/shop?sort=newest");

    await expect(page.locator("article")).toHaveCount(12);
    await page.getByRole("button", { name: /Load 12 more/ }).click();

    await expect(page.locator("article")).toHaveCount(24);
    await expect(page).toHaveURL(/sort=newest/);
    await expect(page).toHaveURL(/show=24/);
  });

  test("shows an empty state instead of a blank grid", async ({ page }) => {
    await page.goto("/shop?min=99999");

    await expect(
      page.getByRole("heading", { name: /No products match those filters/ }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Clear filters" })).toBeVisible();
    await expect(page.locator("article")).toHaveCount(0);
  });

  test("mobile filters open in a drawer", async ({ page, isMobile }) => {
    test.skip(!isMobile, "drawer is the mobile-only presentation");

    await page.goto("/shop");
    await page.getByRole("button", { name: /^Filter/ }).click();

    const drawer = page.getByRole("dialog", { name: "Filter" });
    await expect(drawer).toBeVisible();

    await drawer.getByLabel(/^Dresses/).check();
    await expect(page).toHaveURL(/category=dresses/);

    await drawer.getByRole("button", { name: "Show results" }).click();
    await expect(drawer).toBeHidden();
    await expect(page.getByText("6 products")).toBeVisible();
  });

  test("category pages fix their own category", async ({ page }) => {
    await page.goto("/category/accessories");

    await expect(
      page.getByRole("heading", { level: 1, name: "Accessories" }),
    ).toBeVisible();
    await expect(page.getByText("4 products")).toBeVisible();

    // The category filter group is hidden because the page already scopes it,
    // but size and colour must still be offered.
    const filters = page.getByRole("complementary", { name: "Product filters" });
    if (await filters.isVisible()) {
      await expect(filters.getByText("Category", { exact: true })).toHaveCount(0);
      await expect(filters.getByText("Size", { exact: true })).toBeVisible();
      await expect(filters.getByText("Colour", { exact: true })).toBeVisible();
    }
  });

  test("an unknown category 404s", async ({ page }) => {
    const response = await page.goto("/category/not-a-real-category");
    expect(response?.status()).toBe(404);
    await expect(
      page.getByRole("heading", { name: /This page has moved on/ }),
    ).toBeVisible();
  });
});
