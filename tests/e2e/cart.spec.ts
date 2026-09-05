import { expect, test, type Page } from "@playwright/test";

async function addItem(page: Page, slug: string, size = "M") {
  await page.goto("/product/" + slug);
  await page.getByRole("button", { name: size, exact: true }).click();
  await page.getByRole("button", { name: "Add to Cart", exact: true }).click();
  await expect(page.getByRole("dialog", { name: /^Cart/ })).toBeVisible();
  await page.keyboard.press("Escape");
}

test.describe("cart", () => {
  test("shows an empty state before anything is added", async ({ page }) => {
    await page.goto("/cart");

    await expect(
      page.getByRole("heading", { name: "Your cart is empty" }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Shop all" })).toBeVisible();
  });

  test("adjusts quantity and recalculates the total", async ({ page }) => {
    await addItem(page, "aria-floral-wrap-dress");
    await page.goto("/cart");

    await expect(page.getByText("Aria Floral Wrap Dress")).toBeVisible();
    await expect(page.getByText("$148.00").first()).toBeVisible();

    // 148.00 + 9.95 shipping
    await expect(page.getByText("$157.95")).toBeVisible();

    await page.getByRole("button", { name: /Increase quantity/ }).click();
    // Line total, subtotal and grand total all read $296.00 once shipping is free.
    await expect(page.getByText("$296.00").first()).toBeVisible();
    // Two dresses clear the $150 free-shipping threshold.
    await expect(page.getByText("Free")).toBeVisible();
    await expect(page.getByText("Shipping is on us.")).toBeVisible();
  });

  test("the quantity stepper stops at one instead of deleting the line", async ({
    page,
  }) => {
    await addItem(page, "aria-floral-wrap-dress");
    await page.goto("/cart");

    // Removal is deliberate, via the bin — never an accidental extra tap.
    await expect(
      page.getByRole("button", { name: /Decrease quantity/ }),
    ).toBeDisabled();
    await expect(page.getByText("Aria Floral Wrap Dress")).toBeVisible();
  });

  test("removes a line from the bin icon", async ({ page }) => {
    await addItem(page, "aria-floral-wrap-dress");
    await page.goto("/cart");

    await page.getByRole("button", { name: /Remove .* from cart/ }).click();
    await expect(
      page.getByRole("heading", { name: "Your cart is empty" }),
    ).toBeVisible();
  });

  test("keeps separate lines per variant", async ({ page }) => {
    await addItem(page, "aria-floral-wrap-dress", "M");
    await addItem(page, "aria-floral-wrap-dress", "S");
    await page.goto("/cart");

    await expect(page.getByText(/Ivory Bloom · M/)).toBeVisible();
    await expect(page.getByText(/Ivory Bloom · S/)).toBeVisible();
    await expect(page.getByText("2 items in your cart")).toBeVisible();
  });

  test("merges a repeat add of the same variant", async ({ page }) => {
    await addItem(page, "aria-floral-wrap-dress", "M");
    await addItem(page, "aria-floral-wrap-dress", "M");
    await page.goto("/cart");

    await expect(page.getByText("2 items in your cart")).toBeVisible();
    await expect(page.getByLabel(/quantity of Aria/)).toHaveValue("2");
  });

  test("survives a reload", async ({ page }) => {
    await addItem(page, "aria-floral-wrap-dress");
    await page.goto("/cart");
    await expect(page.getByText("Aria Floral Wrap Dress")).toBeVisible();

    await page.reload();
    await expect(page.getByText("Aria Floral Wrap Dress")).toBeVisible();
  });

  test("clear cart empties it", async ({ page }) => {
    await addItem(page, "aria-floral-wrap-dress");
    await page.goto("/cart");

    await page.getByRole("button", { name: "Clear cart" }).click();
    await expect(
      page.getByRole("heading", { name: "Your cart is empty" }),
    ).toBeVisible();
  });

  test("the drawer traps focus and closes on Escape", async ({ page }) => {
    await addItem(page, "aria-floral-wrap-dress");

    await page.getByRole("button", { name: /Open cart/ }).click();
    const drawer = page.getByRole("dialog", { name: /^Cart/ });
    await expect(drawer).toBeVisible();
    await expect(drawer).toHaveAttribute("aria-modal", "true");

    // Focus moves in asynchronously (the trap waits a tick so it does not
    // steal the caret from an autofocused field), so poll rather than
    // sampling once.
    await expect
      .poll(() =>
        page.evaluate(() => {
          const dialog = document.querySelector('[role="dialog"]');
          return dialog?.contains(document.activeElement) ?? false;
        }),
      )
      .toBe(true);

    await page.keyboard.press("Escape");
    await expect(drawer).toBeHidden();
  });
});
