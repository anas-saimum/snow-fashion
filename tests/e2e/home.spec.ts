import { expect, test } from "@playwright/test";

test.describe("homepage", () => {
  test("renders every section in order", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/Snow Fashion/);
    await expect(
      page.getByRole("heading", { level: 1, name: /Style That\s+Defines You/ }),
    ).toBeVisible();

    await expect(page.getByRole("link", { name: "Shop Now", exact: true })).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Explore Collection", exact: true }).first(),
    ).toBeVisible();

    for (const heading of [
      "Find your silhouette",
      "New Arrivals",
      "Winter Collection 2026",
      "Best Sellers",
      "Elevate Your Everyday Style",
      "Built on the details",
      "Stay in Style",
    ]) {
      await expect(
        page.getByRole("heading", { name: heading }).first(),
      ).toBeVisible();
    }
  });

  test("category cards link to their category page", async ({ page }) => {
    await page.goto("/");

    const card = page.getByRole("link", { name: /Women's Fashion/ }).first();
    await card.click();

    await expect(page).toHaveURL(/\/category\/womens-fashion/);
    await expect(
      page.getByRole("heading", { level: 1, name: "Women's Fashion" }),
    ).toBeVisible();
  });

  test("product cards deep link to the product page", async ({ page }) => {
    await page.goto("/");

    const firstCard = page.locator("article").first();
    const name = (await firstCard.getByRole("heading").innerText()).trim();
    await firstCard.getByRole("heading").getByRole("link").click();

    await expect(page).toHaveURL(/\/product\//);
    await expect(page.getByRole("heading", { level: 1, name })).toBeVisible();
  });

  test("newsletter rejects a bad address then accepts a good one", async ({
    page,
  }) => {
    await page.goto("/");

    const email = page.getByPlaceholder("Enter your email");
    const subscribe = page.getByRole("button", { name: "Subscribe" });

    await email.fill("not-an-email");
    await subscribe.click();
    await expect(page.getByText("Please enter a valid email address.")).toBeVisible();
    await expect(email).toHaveAttribute("aria-invalid", "true");

    await email.fill("shopper@example.com");
    await subscribe.click();
    await expect(page.getByText(/we have your email address/i)).toBeVisible();
    await expect(email).toHaveValue("");
  });

  test("emits organisation and website structured data", async ({ page }) => {
    await page.goto("/");

    const blocks = await page
      .locator('script[type="application/ld+json"]')
      .allTextContents();

    const parsed = blocks.flatMap((block) => JSON.parse(block));
    const types = parsed.map((entry: { "@type": string }) => entry["@type"]);

    expect(types).toContain("Organization");
    expect(types).toContain("WebSite");
  });
});
