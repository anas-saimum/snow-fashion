import { expect, test } from "@playwright/test";

const PAGES = [
  "/",
  "/shop",
  "/product/aria-floral-wrap-dress",
  "/category/dresses",
  "/about",
  "/contact",
  "/collections",
  "/new-arrivals",
  "/cart",
  "/wishlist",
  "/search?q=dress",
  "/shipping",
  "/returns",
  "/privacy",
  "/terms",
];

test.describe("accessibility and semantics", () => {
  for (const path of PAGES) {
    test('"' + path + '" has one h1, a main landmark and titled images', async ({
      page,
    }) => {
      await page.goto(path);

      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("main#main")).toHaveCount(1);

      // Every image carries an alt attribute (decorative ones use alt="").
      const missingAlt = await page.locator("img:not([alt])").count();
      expect(missingAlt).toBe(0);

      const title = await page.title();
      expect(title.length).toBeGreaterThan(5);
    });
  }

  test("the skip link is the first focusable element and reaches main", async ({
    page,
  }) => {
    await page.goto("/");

    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to content" });
    await expect(skip).toBeFocused();

    await skip.press("Enter");
    await expect(page).toHaveURL(/#main$/);
  });

  test("the mobile menu is reachable and closes on Escape", async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, "the hamburger is mobile-only");

    await page.goto("/");
    await page.getByRole("button", { name: "Open menu" }).click();

    const drawer = page.getByRole("dialog", { name: "Menu" });
    await expect(drawer).toBeVisible();
    await expect(drawer.getByRole("link", { name: "Shop" })).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(drawer).toBeHidden();
  });

  test("dialogs restore focus to the trigger when closed", async ({ page }) => {
    await page.goto("/");

    const trigger = page.getByRole("button", { name: "Search products" });
    await trigger.click();
    await expect(page.getByRole("dialog", { name: "Search products" })).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(trigger).toBeFocused();
  });

  test("body scroll is locked while a dialog is open", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: "Search products" }).click();
    await expect(page.getByRole("dialog", { name: "Search products" })).toBeVisible();
    expect(await page.evaluate(() => document.body.style.overflow)).toBe("hidden");

    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog", { name: "Search products" })).toBeHidden();
    expect(await page.evaluate(() => document.body.style.overflow)).not.toBe("hidden");
  });

  test("the page never scrolls horizontally", async ({ page }) => {
    for (const path of ["/", "/shop", "/product/aria-floral-wrap-dress", "/cart"]) {
      await page.goto(path);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, "horizontal overflow on " + path).toBeLessThanOrEqual(1);
    }
  });

  test("exactly one wordmark is visible in the header", async ({ page }) => {
    // Regression guard: conflicting Tailwind display classes once rendered
    // both the desktop and mobile wordmarks at the same time, overflowing
    // the header row on small screens.
    await page.goto("/");

    const header = page.getByRole("banner");
    const visible = await header
      .getByRole("link", { name: /Snow Fashion . home/ })
      .evaluateAll((els) =>
        els.filter((el) => (el as HTMLElement).offsetParent !== null).length,
      );

    expect(visible).toBe(1);
  });

  test("the promotional CTA is legible against its own background", async ({
    page,
  }) => {
    // Regression guard: built by overriding Button's classes, this CTA
    // rendered white text on a white background, because Tailwind resolves
    // conflicting utilities by stylesheet order.
    await page.goto("/");

    const colours = await page
      .getByRole("link", { name: "Shop Collection" })
      .evaluate((el) => {
        const s = getComputedStyle(el);
        return { bg: s.backgroundColor, fg: s.color };
      });

    expect(colours.bg).not.toBe(colours.fg);
  });

  test("reduced motion is respected", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    // Reveal content must be visible immediately, not animated in.
    const opacity = await page
      .locator(".u-reveal")
      .first()
      .evaluate((el) => getComputedStyle(el).opacity);
    expect(Number(opacity)).toBe(1);
  });

  test("robots and sitemap are served", async ({ request }) => {
    const robots = await request.get("/robots.txt");
    expect(robots.ok()).toBe(true);
    const robotsBody = await robots.text();
    expect(robotsBody).toContain("Sitemap:");
    expect(robotsBody).toContain("/checkout");

    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.ok()).toBe(true);
    const sitemapBody = await sitemap.text();
    expect(sitemapBody).toContain("/product/aria-floral-wrap-dress");
    expect(sitemapBody).not.toContain("/checkout");
  });

  test("transactional pages are excluded from the index", async ({ page }) => {
    for (const path of ["/cart", "/checkout", "/wishlist", "/search"]) {
      await page.goto(path);
      const robots = await page
        .locator('meta[name="robots"]')
        .getAttribute("content");
      expect(robots, path).toContain("noindex");
    }
  });
});
