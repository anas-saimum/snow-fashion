import { expect, test, type Page } from "@playwright/test";

async function addAndGoToCheckout(page: Page) {
  await page.goto("/product/aria-floral-wrap-dress");
  await page.getByRole("button", { name: "M", exact: true }).click();
  await page.getByRole("button", { name: "Add to Cart", exact: true }).click();
  await expect(page.getByRole("dialog", { name: /^Cart/ })).toBeVisible();
  await page.keyboard.press("Escape");
  await page.goto("/checkout");
}

/** The footer also has an email field, so scope to the checkout form. */
function checkoutForm(page: Page) {
  return page.locator("form").first();
}

async function fillValidDetails(page: Page) {
  const form = checkoutForm(page);
  await form.getByLabel("Full name").fill("Ada Lovelace");
  await form.getByLabel("Email").fill("ada@example.com");
  await form.getByLabel("Phone").fill("+1 555 014 2200");
  await form.getByLabel("Street address").fill("24 Atelier Lane");
  await form.getByLabel("City").fill("New York");
  await form.getByLabel("Postal code").fill("10013");
  await form.getByLabel("Country").selectOption("United States");
}

test.describe("checkout", () => {
  test("refuses to check out an empty cart", async ({ page }) => {
    await page.goto("/checkout");

    await expect(
      page.getByRole("heading", { name: "There is nothing to check out" }),
    ).toBeVisible();
  });

  test("states plainly that no payment will be taken", async ({ page }) => {
    await addAndGoToCheckout(page);

    await expect(
      page.getByRole("heading", { name: "No payment will be taken" }),
    ).toBeVisible();
    await expect(page.getByText(/unpaid order request/)).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Place order request" }),
    ).toBeVisible();
  });

  test("shows the order summary with the correct arithmetic", async ({ page }) => {
    await addAndGoToCheckout(page);

    const summary = page.getByRole("region", { name: "Order summary" });
    await expect(summary.getByText("Aria Floral Wrap Dress")).toBeVisible();
    await expect(summary.getByText("Qty 1")).toBeVisible();
    await expect(summary.getByText("$148.00").first()).toBeVisible();
    await expect(summary.getByText("$9.95")).toBeVisible();
    await expect(summary.getByText("$157.95")).toBeVisible();
  });

  test("validates every required field before submitting", async ({ page }) => {
    await addAndGoToCheckout(page);

    await page.getByRole("button", { name: "Place order request" }).click();

    for (const message of [
      "Please enter your full name.",
      "Please enter your email address.",
      "Please enter a phone number.",
      "Please enter your street address.",
      "Please enter your city.",
      "Please enter your postal code.",
      "Please select a country.",
    ]) {
      await expect(page.getByText(message)).toBeVisible();
    }

    // Focus moves to the first offending field so keyboard users are not lost.
    await expect(checkoutForm(page).getByLabel("Full name")).toBeFocused();
    await expect(page).toHaveURL(/\/checkout$/);
  });

  test("rejects a malformed email and phone", async ({ page }) => {
    await addAndGoToCheckout(page);
    await fillValidDetails(page);

    await checkoutForm(page).getByLabel("Email").fill("nope");
    await checkoutForm(page).getByLabel("Phone").fill("abc");
    await page.getByRole("button", { name: "Place order request" }).click();

    await expect(page.getByText("Please enter a valid email address.")).toBeVisible();
    await expect(page.getByText("Please enter a valid phone number.")).toBeVisible();
  });

  test("places an order, clears the cart and reports it as unpaid", async ({
    page,
  }) => {
    await addAndGoToCheckout(page);
    await fillValidDetails(page);

    await page.getByRole("button", { name: "Place order request" }).click();

    await expect(page).toHaveURL(/\/checkout\/confirmation\/sf-/);
    await expect(
      page.getByRole("heading", { level: 1, name: "Order received" }),
    ).toBeVisible();
    await expect(page.getByText(/Order SF-\d+-\d+ is recorded/)).toBeVisible();

    // The honest bit: no payment was taken and the page says so.
    await expect(
      page.getByRole("heading", { name: "Payment status: unpaid" }),
    ).toBeVisible();
    await expect(
      page.getByText(/No payment has been taken and no card details were collected/),
    ).toBeVisible();
    await expect(page.getByText("ada@example.com").first()).toBeVisible();
    await expect(page.getByText("24 Atelier Lane")).toBeVisible();

    // Cart is emptied once the order is recorded.
    await page.goto("/cart");
    await expect(
      page.getByRole("heading", { name: "Your cart is empty" }),
    ).toBeVisible();
  });

  test("an unknown order id explains itself instead of crashing", async ({
    page,
  }) => {
    await page.goto("/checkout/confirmation/sf-000000-0000");

    await expect(
      page.getByRole("heading", { name: "We could not find that order" }),
    ).toBeVisible();
  });

  test("Buy Now goes straight to checkout with the item", async ({ page }) => {
    await page.goto("/product/aria-floral-wrap-dress");
    await page.getByRole("button", { name: "M", exact: true }).click();
    await page.getByRole("button", { name: "Buy Now", exact: true }).click();

    await expect(page).toHaveURL(/\/checkout/);
    await expect(
      page.getByRole("region", { name: "Order summary" }).getByText("Aria Floral Wrap Dress"),
    ).toBeVisible();
  });
});
