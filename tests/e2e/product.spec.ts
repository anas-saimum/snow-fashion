import { expect, test } from "@playwright/test";

const PRODUCT = "/product/aria-floral-wrap-dress";

test.describe("product detail", () => {
  test("requires a size before it can be added", async ({ page }) => {
    await page.goto(PRODUCT);

    const cta = page.getByRole("button", { name: "Select a size" });
    await expect(cta).toBeVisible();
    await expect(cta).toBeDisabled();
    await expect(page.getByRole("button", { name: "Buy Now", exact: true })).toBeDisabled();

    await page.getByRole("button", { name: "M", exact: true }).click();

    await expect(page.getByRole("button", { name: "Add to Cart", exact: true })).toBeEnabled();
    await expect(page.getByRole("button", { name: "Buy Now", exact: true })).toBeEnabled();
  });

  test("marks a sold-out size as unavailable rather than hiding it", async ({
    page,
  }) => {
    await page.goto(PRODUCT);

    const soldOut = page.getByRole("button", { name: "L — out of stock" });
    await expect(soldOut).toBeVisible();
    await expect(soldOut).toBeDisabled();

    // Screen readers get the reason, not just a visual strike-through.
    await expect(soldOut).toContainText("out of stock");
  });

  test("adds to the cart and opens the drawer with the right line", async ({
    page,
  }) => {
    await page.goto(PRODUCT);

    await page.getByRole("button", { name: "M", exact: true }).click();
    await page.getByRole("button", { name: "Add to Cart", exact: true }).click();

    const drawer = page.getByRole("dialog", { name: /^Cart/ });
    await expect(drawer).toBeVisible();
    await expect(drawer.getByText("Aria Floral Wrap Dress")).toBeVisible();
    await expect(drawer.getByText(/Ivory Bloom · M/)).toBeVisible();
    await expect(drawer.getByText("$148.00").first()).toBeVisible();

    await expect(
      page.getByRole("button", { name: /Open cart, 1 item/ }),
    ).toBeVisible();
  });

  test("changing colour narrows the available sizes", async ({ page }) => {
    await page.goto(PRODUCT);

    await page.getByRole("button", { name: "M", exact: true }).click();
    await expect(page.getByRole("button", { name: "Add to Cart", exact: true })).toBeEnabled();

    // Ivory has L sold out; Deep Sable has XXL. Switching colour must
    // re-derive which sizes are buyable.
    await expect(page.getByRole("button", { name: "L — out of stock" })).toBeDisabled();

    await page.getByRole("button", { name: "Deep Sable" }).click();
    await expect(page.getByRole("button", { name: "L", exact: true })).toBeEnabled();
    await expect(
      page.getByRole("button", { name: "XXL — out of stock" }),
    ).toBeDisabled();
  });

  test("quantity respects the variant stock ceiling", async ({ page }) => {
    await page.goto(PRODUCT);
    await page.getByRole("button", { name: "M", exact: true }).click();

    const qty = page.getByLabel(/quantity of Aria Floral Wrap Dress/);
    await expect(qty).toHaveValue("1");

    // Decrement is disabled at the minimum rather than going to zero here.
    await expect(page.getByRole("button", { name: /Decrease quantity/ })).toBeDisabled();

    await page.getByRole("button", { name: /Increase quantity/ }).click();
    await expect(qty).toHaveValue("2");

    // The ceiling is the variant's stock, capped at 10.
    const max = Number(await qty.getAttribute("max"));
    for (let i = 2; i < max; i++) {
      await page.getByRole("button", { name: /Increase quantity/ }).click();
    }
    await expect(qty).toHaveValue(String(max));
    await expect(page.getByRole("button", { name: /Increase quantity/ })).toBeDisabled();
  });

  test("the size guide opens as an accessible dialog and closes on Escape", async ({
    page,
  }) => {
    await page.goto(PRODUCT);

    await page.getByRole("button", { name: "Size guide" }).click();

    const dialog = page.getByRole("dialog", { name: /size guide/i });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("table")).toBeVisible();
    await expect(dialog.getByRole("columnheader", { name: "Bust" })).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("the gallery switches image from a thumbnail", async ({ page }) => {
    await page.goto(PRODUCT);

    const tabs = page.getByRole("tab");
    await expect(tabs.first()).toHaveAttribute("aria-selected", "true");

    await tabs.nth(1).click();
    await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
    await expect(tabs.first()).toHaveAttribute("aria-selected", "false");
  });

  test("product information accordion discloses each panel", async ({ page }) => {
    await page.goto(PRODUCT);

    const materials = page.getByRole("button", { name: "Materials" });
    await expect(materials).toHaveAttribute("aria-expanded", "false");

    await materials.click();
    await expect(materials).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByText("100% viscose")).toBeVisible();
  });

  test("publishes Product structured data without a fabricated rating", async ({
    page,
  }) => {
    await page.goto(PRODUCT);

    const blocks = await page
      .locator('script[type="application/ld+json"]')
      .allTextContents();
    const parsed = blocks.flatMap((block) => JSON.parse(block));
    const product = parsed.find(
      (entry: { "@type": string }) => entry["@type"] === "Product",
    );

    expect(product).toBeTruthy();
    expect(product.offers.price).toBe("148.00");
    expect(product.offers.priceCurrency).toBe("USD");
    // Placeholder ratings must never be published as structured data.
    expect(product.aggregateRating).toBeUndefined();
  });

  test("quick view adds to the cart from the grid", async ({ page, isMobile }) => {
    test.skip(isMobile, "quick view is triggered by a desktop hover overlay");

    await page.goto("/shop?category=accessories");

    const card = page.locator("article").first();
    await card.hover();
    await card.getByRole("button", { name: "Quick view" }).click();

    const dialog = page.getByRole("dialog").first();
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: "Add to cart" }).click();

    await expect(page.getByRole("dialog", { name: /^Cart/ })).toBeVisible();
  });

  test("an unknown product 404s", async ({ page }) => {
    const response = await page.goto("/product/does-not-exist");
    expect(response?.status()).toBe(404);
  });
});
