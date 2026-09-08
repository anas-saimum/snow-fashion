import { expect, test, type Page } from "@playwright/test";

/**
 * Admin dashboard, against a dev server running the in-memory backend.
 *
 * The store is shared by the whole server process, so these run serially —
 * two tests creating products at once would trip over each other's counts.
 */
test.describe.configure({ mode: "serial" });

const UNIQUE = () => "test-" + Date.now().toString(36) + Math.floor(Math.random() * 1000);

async function fillBasics(page: Page, name: string) {
  await page.getByLabel("Product name").fill(name);
  await page.getByLabel("One-line description").fill("A test piece, created by the suite.");
  await page.getByLabel("Price (USD)").fill("120");
}

test.describe("admin — access", () => {
  test("loads in demo mode and says so", async ({ page }) => {
    await page.goto("/admin");

    // The banner is not decoration: it stops someone editing for an hour in a
    // mode that forgets everything on restart.
    await expect(page.getByText(/Demo mode/)).toBeVisible();
    await expect(page.getByRole("heading", { level: 1, name: "Your catalogue" })).toBeVisible();
  });

  test("is never indexable", async ({ page }) => {
    await page.goto("/admin");
    const robots = await page.locator('meta[name="robots"]').getAttribute("content");
    expect(robots).toContain("noindex");
  });

  test("does not show the storefront header or cart", async ({ page }) => {
    await page.goto("/admin");

    await expect(page.getByRole("button", { name: /Open cart/ })).toHaveCount(0);
    await expect(page.getByRole("navigation", { name: "Main" })).toHaveCount(0);
    await expect(page.getByRole("navigation", { name: "Admin" })).toBeVisible();
  });

  test("the storefront still shows its own header", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("navigation", { name: "Main" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Open cart/ })).toBeVisible();
  });
});

test.describe("admin — overview", () => {
  test("reports real catalogue figures", async ({ page }) => {
    await page.goto("/admin");

    // <dt> only maps to role=term as a direct child of <dl>; these sit inside
    // a card wrapper, so match the text.
    await expect(page.getByText("Live products")).toBeVisible();

    // 37 demo products, all active.
    await expect(page.getByText("37 in the catalogue")).toBeVisible();
    await expect(page.getByText(/Stock value at retail/)).toBeVisible();
  });

  test("links through to the editor", async ({ page }) => {
    await page.goto("/admin");
    await page.getByRole("link", { name: /All products/ }).click();
    await expect(page).toHaveURL(/\/admin\/products/);
  });
});

test.describe("admin — product list", () => {
  test("lists products with price, stock and status", async ({ page }) => {
    await page.goto("/admin/products");

    await expect(page.getByRole("table")).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Product" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Stock" })).toBeVisible();
    await expect(page.getByText(/^\d+ products/)).toBeVisible();
  });

  test("search narrows by name and puts the term in the URL", async ({ page }) => {
    await page.goto("/admin/products");

    await page.getByLabel(/Search products/).fill("gown");
    await expect(page).toHaveURL(/q=gown/);

    const rows = page.getByRole("row");
    // Header row plus the matches.
    await expect(rows).not.toHaveCount(1);
    await expect(page.getByRole("cell", { name: /Gown/ }).first()).toBeVisible();
  });

  test("filters by status", async ({ page }) => {
    await page.goto("/admin/products");

    await page.getByLabel("Filter by status").selectOption("draft");
    await expect(page).toHaveURL(/status=draft/);
    // The demo catalogue is entirely live, so drafts show the empty state.
    await expect(page.getByRole("heading", { name: "No products match" })).toBeVisible();
  });

  test("publish and unpublish from the row", async ({ page }) => {
    await page.goto("/admin/products");

    const firstRow = page.getByRole("row").nth(1);
    const unpublish = firstRow.getByRole("button", { name: /^Unpublish/ });

    await unpublish.click();
    await expect(firstRow.getByRole("button", { name: /^Publish/ })).toBeVisible();
    await expect(firstRow.getByText("Draft")).toBeVisible();

    // Put it back so later tests see the catalogue as they expect.
    await firstRow.getByRole("button", { name: /^Publish/ }).click();
    await expect(firstRow.getByText("Live")).toBeVisible();
  });
});

test.describe("admin — creating a product", () => {
  test("validates before saving anything", async ({ page }) => {
    await page.goto("/admin/products/new");

    await page.getByRole("button", { name: "Create product" }).click();

    await expect(page.getByText("Give the product a name.")).toBeVisible();
    await expect(page.getByText("Enter a price above zero.")).toBeVisible();
    await expect(page.getByText(/Add at least one photograph/)).toBeVisible();
    await expect(
      page.getByText(/Choose at least one category/),
    ).toBeVisible();

    // Nothing was created.
    await expect(page).toHaveURL(/\/admin\/products\/new$/);
  });

  test("derives the web address from the name", async ({ page }) => {
    await page.goto("/admin/products/new");

    await page.getByLabel("Product name").fill("Ivory Silk Wrap Dress");
    await expect(page.getByLabel("Web address")).toHaveValue("ivory-silk-wrap-dress");
  });

  test("previews the discount as you type", async ({ page }) => {
    await page.goto("/admin/products/new");

    await page.getByLabel("Price (USD)").fill("120");
    await page.getByLabel("Original price (optional)").fill("200");

    await expect(page.getByText("−40% off")).toBeVisible();
    await expect(page.getByText(/saving \$80\.00/)).toBeVisible();
  });

  test("rejects an original price below the current price", async ({ page }) => {
    await page.goto("/admin/products/new");

    await fillBasics(page, "Discount Test " + UNIQUE());
    await page.getByLabel("Original price (optional)").fill("100");
    await page.getByLabel(/^Dresses/).check();
    await page.getByRole("button", { name: "Create product" }).click();

    await expect(
      page.getByText(/original price must be higher/i),
    ).toBeVisible();
  });

  test("builds the stock grid from colours and sizes", async ({ page }) => {
    await page.goto("/admin/products/new");

    await expect(page.getByText(/Add a colour or a size above/)).toBeVisible();

    // Two colours × five sizes = ten sellable combinations.
    await page.getByPlaceholder("Colour name, e.g. Ivory Bloom").fill("Ivory");
    await page.getByRole("button", { name: "Add", exact: true }).first().click();
    await page.getByPlaceholder("Colour name, e.g. Ivory Bloom").fill("Ink");
    await page.getByRole("button", { name: "Add", exact: true }).first().click();

    await page.getByRole("button", { name: "Men's S–XXL" }).click();

    await expect(page.getByText("10 combinations · 0 in stock")).toBeVisible();

    // Stock set here is preserved when another colour is added.
    const firstStock = page.getByLabel(/^Stock for Ivory S$/);
    await firstStock.fill("7");
    await page.getByPlaceholder("Colour name, e.g. Ivory Bloom").fill("Sage");
    await page.getByRole("button", { name: "Add", exact: true }).first().click();

    await expect(page.getByText(/15 combinations/)).toBeVisible();
    await expect(page.getByLabel(/^Stock for Ivory S$/)).toHaveValue("7");
  });

  test("requires alt text on every image", async ({ page }) => {
    await page.goto("/admin/products/new");

    await fillBasics(page, "Alt Text Test " + UNIQUE());
    await page.getByLabel(/^Dresses/).check();

    // Demo mode accepts a path instead of an upload.
    await page.getByLabel("Image path").fill("/images/products/aria-floral-wrap-dress-1.jpg");
    await page.getByRole("button", { name: "Add image" }).click();

    await page.getByRole("button", { name: "One size" }).click();
    await page.getByRole("button", { name: "Create product" }).click();

    await expect(page.getByText(/Image 1 needs alt text/)).toBeVisible();
  });

  test("creates a product and puts it on the storefront", async ({ page }) => {
    const slugPart = UNIQUE();
    const name = "Suite Test Dress " + slugPart;

    await page.goto("/admin/products/new");

    await fillBasics(page, name);
    await page.getByLabel(/^Dresses/).check();

    await page.getByLabel("Image path").fill("/images/products/aria-floral-wrap-dress-1.jpg");
    await page.getByRole("button", { name: "Add image" }).click();
    await page
      .getByPlaceholder(/Describe the photo/)
      .fill("Model wearing the suite test dress");

    await page.getByRole("button", { name: "Women's XS–XXL" }).click();
    await page.getByRole("button", { name: "Set all to 10" }).click();

    // Live, so it should appear on the site immediately.
    await page.getByLabel("Status").selectOption("active");
    await page.getByRole("button", { name: "Create product" }).click();

    // Redirected to the saved product's editor.
    await expect(page).toHaveURL(/\/admin\/products\/[^/]+$/, { timeout: 20_000 });
    await expect(page.getByRole("heading", { level: 1, name })).toBeVisible();
    await expect(page.getByText("60 in stock across 6 combinations")).toBeVisible();

    // And on the storefront, at the derived URL.
    const slug = await page.getByLabel("Web address").inputValue();
    await page.goto("/product/" + slug);
    await expect(page.getByRole("heading", { level: 1, name })).toBeVisible();
    await expect(page.getByText("$120.00")).toBeVisible();
  });
});

test.describe("admin — editing a product", () => {
  /** Opens a product's editor and hands back its URL, so restoring later
   *  does not depend on re-finding it through search and filters. */
  async function openEditor(page: Page, name: string) {
    await page.goto("/admin/products");
    await page.getByLabel(/Search products/).fill(name);
    await page.getByRole("link", { name: new RegExp(name) }).first().click();
    await expect(page.getByRole("button", { name: "Save changes" })).toBeVisible();
    return page.url();
  }

  test("a price change reaches the storefront", async ({ page }) => {
    const editor = await openEditor(page, "Margot Corduroy Shirt Dress");

    await page.getByLabel("Price (USD)").fill("199");
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByText("Changes saved.")).toBeVisible({ timeout: 20_000 });

    await page.goto("/product/margot-corduroy-shirt-dress");
    await expect(page.getByText("$199.00")).toBeVisible();

    // Put it back, using the URL we already hold.
    await page.goto(editor);
    await page.getByLabel("Price (USD)").fill("165");
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByText("Changes saved.")).toBeVisible({ timeout: 20_000 });

    await page.goto("/product/margot-corduroy-shirt-dress");
    await expect(page.getByText("$165.00")).toBeVisible();
  });

  test("unpublishing removes it from the storefront, and republishing brings it back", async ({
    page,
  }) => {
    const editor = await openEditor(page, "Verde Lace Bandeau Top");

    await page.getByLabel("Status").selectOption("draft");
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByText("Changes saved.")).toBeVisible({ timeout: 20_000 });

    // Gone from the shop. It renders the 404 page rather than the product; the
    // status is 200 because dynamicParams is true so newly added products
    // resolve — see the comment on the product page.
    await page.goto("/product/verde-lace-bandeau-top");
    await expect(
      page.getByRole("heading", { name: /This page has moved on/ }),
    ).toBeVisible();

    await page.goto(editor);
    await page.getByLabel("Status").selectOption("active");
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByText("Changes saved.")).toBeVisible({ timeout: 20_000 });

    await page.goto("/product/verde-lace-bandeau-top");
    await expect(
      page.getByRole("heading", { level: 1, name: "Verde Lace Bandeau Top" }),
    ).toBeVisible();
  });
});

test.describe("admin — deleting", () => {
  test("asks before deleting and offers unpublishing instead", async ({ page }) => {
    const name = "Delete Me " + UNIQUE();

    // Create something disposable.
    await page.goto("/admin/products/new");
    await fillBasics(page, name);
    await page.getByLabel(/^Accessories/).check();
    await page.getByLabel("Image path").fill("/images/products/leather-card-wallet-1.jpg");
    await page.getByRole("button", { name: "Add image" }).click();
    await page.getByPlaceholder(/Describe the photo/).fill("A disposable test product");
    await page.getByRole("button", { name: "One size" }).click();
    await page.getByRole("button", { name: "Create product" }).click();
    await expect(page).toHaveURL(/\/admin\/products\/[^/]+$/, { timeout: 20_000 });

    await page.goto("/admin/products");
    await page.getByLabel(/Search products/).fill(name);

    const row = page.getByRole("row").nth(1);
    await row.getByRole("button", { name: /^Delete/ }).click();

    const dialog = page.getByRole("dialog", { name: /Delete this product\?/ });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(/cannot be undone/)).toBeVisible();
    await expect(dialog.getByText(/unpublish it instead/)).toBeVisible();

    // Backing out leaves it alone.
    await dialog.getByRole("button", { name: "Keep it" }).click();
    await expect(dialog).toBeHidden();
    await expect(page.getByRole("cell", { name })).toBeVisible();

    // Confirming removes it.
    await row.getByRole("button", { name: /^Delete/ }).click();
    await page.getByRole("button", { name: "Delete permanently" }).click();

    await expect(page.getByRole("heading", { name: "No products match" })).toBeVisible({
      timeout: 20_000,
    });
  });
});

test.describe("admin — brand settings", () => {
  test("explains that uploads need Supabase in demo mode", async ({ page }) => {
    await page.goto("/admin/settings");

    await expect(page.getByRole("heading", { level: 1, name: /Brand/ })).toBeVisible();
    await expect(page.getByText(/Logo upload needs Supabase Storage/)).toBeVisible();

    // Honest about what is not editable yet, rather than showing dead inputs.
    await expect(page.getByRole("heading", { name: /Set in code, for now/ })).toBeVisible();
  });
});
