import { expect, test } from "@playwright/test";

test.describe("wishlist", () => {
  test("shows an empty state first", async ({ page }) => {
    await page.goto("/wishlist");

    await expect(
      page.getByRole("heading", { name: "Your wishlist is empty" }),
    ).toBeVisible();
  });

  test("saves from a product card and appears on the wishlist page", async ({
    page,
  }) => {
    await page.goto("/shop?category=dresses");

    const card = page.locator("article").first();
    const name = (await card.getByRole("heading").innerText()).trim();

    const save = card.getByRole("button", { name: /wishlist/ });
    await expect(save).toHaveAttribute("aria-pressed", "false");
    await save.click();
    await expect(save).toHaveAttribute("aria-pressed", "true");

    await page.goto("/wishlist");
    await expect(page.getByText("1 piece saved")).toBeVisible();
    await expect(page.getByRole("heading", { name })).toBeVisible();
  });

  test("saves from the product page and toggles back off", async ({ page }) => {
    await page.goto("/product/margot-corduroy-shirt-dress");

    const save = page.getByRole("button", { name: /Add to wishlist/ });
    await save.click();
    await expect(page.getByRole("button", { name: /Saved/ })).toBeVisible();

    await page.getByRole("button", { name: /Saved/ }).click();
    await expect(page.getByRole("button", { name: /Add to wishlist/ })).toBeVisible();

    await page.goto("/wishlist");
    await expect(
      page.getByRole("heading", { name: "Your wishlist is empty" }),
    ).toBeVisible();
  });

  test("persists across a reload and can be cleared", async ({ page }) => {
    await page.goto("/product/margot-corduroy-shirt-dress");
    await page.getByRole("button", { name: /Add to wishlist/ }).click();

    await page.goto("/wishlist");
    await expect(page.getByText("1 piece saved")).toBeVisible();

    await page.reload();
    await expect(page.getByText("1 piece saved")).toBeVisible();

    await page.getByRole("button", { name: "Clear wishlist" }).click();
    await expect(
      page.getByRole("heading", { name: "Your wishlist is empty" }),
    ).toBeVisible();
  });

  test("a saved item can be added to the cart from the wishlist", async ({
    page,
    isMobile,
  }) => {
    // A one-size accessory needs no variant choice, so it adds directly.
    await page.goto("/product/leather-card-wallet");
    await page.getByRole("button", { name: /Add to wishlist/ }).click();

    await page.goto("/wishlist");
    const card = page.locator("article").first();

    if (isMobile) {
      // Touch gets a persistent quick-add button under the price.
      await card.getByRole("button", { name: /Add .* to cart/ }).click();
    } else {
      // Desktop reveals the add-to-cart bar on hover.
      await card.hover();
      await card.getByRole("button", { name: "Add to cart" }).click();
    }

    await expect(page.getByRole("dialog", { name: /^Cart/ })).toBeVisible();
  });
});
