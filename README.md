# Snow Fashion

A premium fashion e-commerce storefront built with Next.js 15, React 19, TypeScript and Tailwind CSS v4.

This is a **functional MVP**: 37 demo products across 8 categories, working filters, search, cart, wishlist and a checkout flow. **No payment provider is connected** — see [What is deliberately stubbed](#what-is-deliberately-stubbed) before going anywhere near real customers.

---

## Quick start

```bash
npm install
```

```bash
npm run dev
```

Then open <http://localhost:3000>.

Requires Node.js 20 or newer (developed against 24 LTS).

| Script | What it does |
|---|---|
| `npm run dev` | Dev server on :3000 |
| `npm run build` | Production build (67 prerendered pages) |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint, including `jsx-a11y` rules |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest unit tests (115) |
| `npm run test:e2e` | Playwright e2e: storefront (desktop + mobile) and admin (170) |

---

## Architecture

```
app/            Routes (App Router). Server Components by default.
components/     UI. Client components only where interaction lives.
lib/            Domain logic — the layer components talk to.
  repositories/ THE SWAP SEAM: swap local data for a real backend here.
  payments/     PaymentProvider interface + the honest MVP no-op.
  orders/       Order creation.
data/           Demo catalogue. The only file a real backend deletes.
store/          Client state (cart, wishlist, UI) — Zustand + localStorage.
config/         Brand, contact, shipping, feature flags.
types/          Domain model.
tests/          unit/ (Vitest) and e2e/ (Playwright).
```

Three rules keep this maintainable:

1. **No component imports from `data/`.** Pages call a repository; components take props. Grep-enforceable.
2. **Repositories are async from day one**, even though the demo data is synchronous — so becoming a `fetch` breaks no call sites.
3. **Money is integers in minor units.** `12999` is `$129.99`. Formatted only at the render edge, in `lib/pricing.ts`. No floats in a cart, ever.

### Filters live in the URL

`/shop?category=dresses,tops&size=m&color=black&min=50&max=300&sort=price-asc&show=24`

Every filtered view is shareable, back-button correct and server-rendered. `lib/url-state.ts` owns the parsing and serialising. The controls also hold an optimistic copy of the selection, so a tick lands on the frame you click it rather than after the round trip.

### Why `/shop` and `/category/[slug]` share everything

Both render `ShopResults` → `ShopView`, differing only in the `ProductQuery` handed in. Filtering, sorting, faceting, paging and empty states exist once.

`ShopResults` is the component that awaits `searchParams`, and it is rendered inside `<Suspense>`. That is load-bearing: awaiting `searchParams` in a page makes the whole route dynamic, which meant unknown category URLs answered **200 with 404 content** (a soft 404). Keeping the await in a streaming child lets the page shell stay static, so `dynamicParams = false` produces a real 404 — and the masthead paints before the grid.

---

## Swapping in a real backend

Implement the interfaces in `lib/repositories/*.repository.ts` and change three lines in `lib/repositories/index.ts`:

```ts
export const productRepository = supabaseProductRepository;
export const categoryRepository = supabaseCategoryRepository;
export const collectionRepository = supabaseCollectionRepository;
```

Then delete `data/products.ts`. Nothing in `app/` or `components/` changes.

`ProductQuery` is the single query shape — category, size, colour, price, search, sort, page and flags. In a SQL implementation it becomes one query builder.

Also flip `dynamicParams` to `true` in `app/product/[slug]/page.tsx` and `app/category/[slug]/page.tsx` once products can appear between deployments, and drop `middleware.ts` (it exists only to give unknown category slugs a hard 404 while the category list is static).

### Connecting a payment provider

`lib/payments/provider.ts` defines the contract. Today `pendingPaymentProvider` implements it by taking no money and saying so.

1. Add `lib/payments/stripe.provider.ts` implementing `PaymentProvider`.
2. Register it in `lib/payments/index.ts`.
3. Set `NEXT_PUBLIC_PAYMENT_PROVIDER=stripe`.

`PaymentNotice` and the confirmation screen react to `provider.isLive` automatically — the "no payment will be taken" copy disappears on its own.

**Before you do:** `lib/orders/order.service.ts` records orders in `localStorage` and trusts the client's price snapshot. That is fine for a demo and unacceptable for real money. Recalculate totals server-side from the repository before authorising any payment. The `OrderService` seam is where that goes.

---

## What is deliberately stubbed

Nothing here pretends to work. Each item is explicit in the UI, not just in this file.

| Area | State | Where |
|---|---|---|
| **Payments** | No provider. Orders are recorded as `paymentStatus: "unpaid"`, and both checkout and the confirmation page say plainly that no payment was taken and no card details collected. | `lib/payments/`, `components/checkout/PaymentNotice.tsx` |
| **Orders** | Stored in the browser only. An order will not appear on another device or after clearing site data — the confirmation page explains this if a lookup fails. | `lib/orders/order.service.ts` |
| **Newsletter** | Validates and logs server-side. No email provider connected, so the success copy claims only that we received the address. | `app/api/newsletter/route.ts` |
| **Contact form** | Same: validates, logs, and says only that the message was received. | `app/api/contact/route.ts` |
| **Accounts** | Not in scope. The header account icon is a disabled affordance with a screen-reader explanation, not a dead link. Toggle `siteConfig.features.accountsEnabled` when auth arrives. | `config/site.config.ts` |
| **Legal pages** | Shipping, Returns, Privacy and Terms carry sensible starting text behind a visible "placeholder content, not legally reviewed" banner. Replace before trading, then set `draft={false}`. | `app/(legal)/` |
| **Ratings** | The star ratings are **demo layout values, not customer reviews.** They are never published as `aggregateRating` structured data, and `Rating` renders nothing when data is absent. Set `siteConfig.features.showRatings = false` to remove the review UI entirely until a reviews provider is connected. | `config/site.config.ts`, `lib/structured-data.ts` |

---

## Replacing the placeholder content

**Imagery.** 100 photographs live in `public/images/` (products, categories, editorial, social), downloaded from Unsplash under its licence for development. They are not Snow Fashion garments. Replace the files in place and the site picks them up — every reference is a path in `data/`, organised per product:

```
public/images/products/<product-slug>-1.jpg   # primary, 1200×1600 (3:4)
public/images/products/<product-slug>-2.jpg   # card hover image
```

Two caveats worth knowing:

- Most products list two or three colourways but only have photography for the first. `colorSlug` on each image is the hook that ties a swatch to its photo — populate it as real photography arrives. (`leather-card-wallet` is deliberately single-colour: it is the one product with exactly one variant, which exercises the add-straight-to-cart path.)
- **Traditional Wear has no traditional-wear photography.** The category is wired up and populated with the occasion pieces, but the images show western formalwear. This category needs its own shoot before launch.

**Copy and details.** Everything a non-developer would want to change is in `config/` and `data/`:

| Change | File |
|---|---|
| Social handles (`@snowfashion`) | `config/site.config.ts` → `social` |
| Email, phone, address, hours | `config/site.config.ts` → `contact` |
| Shipping rate, free threshold, countries | `config/shipping.config.ts` |
| Navigation and footer links | `data/navigation.ts` |
| Categories | `data/categories.ts` |
| Collections | `data/collections.ts` |
| Size charts | `data/size-guides.ts` |

---

## Admin dashboard

A back office at `/admin` for the catalogue: sign in, add and edit products,
set prices and discounts, manage colours, sizes and per-variant stock, upload
photography, and publish or unpublish. It has its own chrome — no shop header,
no cart drawer — and is `noindex, nofollow` throughout.

### Why it needs a database

The storefront is happy reading `data/products.ts`, a file compiled into the
build. An admin that *writes* is a different problem: Vercel's filesystem is
read-only and every request may reach a different instance, so an edit has
nowhere to go. Product photography has the same problem.

So the dashboard runs in one of three modes, and it tells you which:

| Mode | When | Behaviour |
|---|---|---|
| **supabase** | `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` set | Real and durable. Sign-in required. |
| **memory** | No config, `next dev` | Full dashboard against an in-memory copy of the demo catalogue. No sign-in, and a red banner says edits vanish on restart. This is how the admin was built and is tested. |
| **read-only** | No config, production | Storefront works on demo data; `/admin` refuses to load and explains why. Better than an editor that appears to save and silently discards. |

### Setting up Supabase

1. Create a free project at [supabase.com](https://supabase.com).
2. In **SQL Editor → New query**, run `supabase/migrations/0001_catalogue.sql`,
   then `supabase/migrations/0002_upsert_product.sql`. Both are idempotent.
3. In **Authentication → Users**, add a user with your email and a password.
4. Back in the SQL editor, make that user an admin:

   ```sql
   insert into public.admins (user_id, email)
   select id, email from auth.users where email = 'you@example.com';
   ```

5. From **Project Settings → API**, copy the URL and the `anon` key into
   `.env.local`:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```

6. Add the same two variables in Vercel and redeploy.
7. Open `/admin`, sign in, and use **Import demo catalogue** on the overview
   to load the 37 demo products — a new project starts empty, which would
   otherwise leave the shop looking broken.

The `anon` key is safe in the browser: it is public by design, and row-level
security is what protects the data. Never put the **service role** key in this
project — nothing here needs it.

### How access control works

Two independent gates, so neither is a single point of failure:

* **Middleware** refreshes the session and redirects anonymous visitors away
  from `/admin`. Authentication only.
* **The admin layout** then checks the user has a row in `admins`. Being able
  to sign in is not the same as being allowed to edit — a customer account
  reaching `/admin` gets nothing.
* **Row-level security** enforces the same rule in Postgres. Even a leaked
  session with no `admins` row cannot read a draft or write a product. Writes
  go through the `upsert_product` function, which re-checks admin status
  itself.

### Saving is atomic

A product touches six tables (product, categories, colours, sizes, images,
variants). Doing that as six client calls means no transaction: a failure
between deleting the old variants and inserting the new ones leaves a live
product with no stock rows — unbuyable, silently. All of it happens inside the
`upsert_product` Postgres function instead, so a save either lands completely
or not at all.

### Caches are cleared on save

Storefront reads are cached (`unstable_cache`, tagged `products`). Every
mutating action calls `revalidateStorefront()`, which drops that tag and the
affected pages, so a price change is visible on the shop immediately rather
than whenever the cache happened to expire.

### One trade-off worth knowing

`/product/[slug]` sets `dynamicParams = true`. Products created after a
deploy are not in `generateStaticParams`, and without this they would 404
until the next build — which would make the dashboard pointless. The cost is
that an unknown product URL renders the 404 page at HTTP 200 rather than 404.
That page is `noindex` and the sitemap lists only real products, so it will
not be indexed. Unknown *category* URLs still get a hard 404, because that
list is static and middleware can check it for nothing.

### What the dashboard does not do yet

Deliberately out of scope for this phase, and not stubbed out in the UI:

* **Orders, sales figures and invoices.** Orders still live in the customer's
  browser (see [What is deliberately stubbed](#what-is-deliberately-stubbed)).
  Moving them into Postgres is the next phase, and is also what unlocks
  server-side price validation before any payment can be taken.
* **Categories and collections** are still edited in `data/`. The dashboard
  reads them.
* **Contact details, shipping rates and social handles** remain in `config/`.
  The settings page shows the current values rather than offering inputs that
  do nothing.
* **Multiple staff accounts and roles.** The `admins` table is ready for more
  than one row; there is no UI for it and no permission tiers.

---

## Design system

Editorial luxury: photography carries the visuals, the UI gets out of the way. All tokens are in the `@theme` block of `app/globals.css`.

**Colour** — five neutrals, one accent, two semantics. Nothing outside this set.

| Token | Value | Use |
|---|---|---|
| `ink` | `#0B0B0B` | Primary text, buttons, wordmark |
| `ink-soft` | `#3D3D3D` | Body copy |
| `muted` | `#767676` | Meta, captions (4.6:1 on paper) |
| `paper` / `canvas` | `#FFFFFF` / `#F6F5F3` | Page / alternating sections |
| `stone` / `stone-dark` | `#E4E1DC` / `#CFCAC2` | Hairlines, borders |
| `accent` | `#8C7A63` | Taupe, used sparingly |
| `sale` | `#9A2A2A` | Discount badges only |

**Type** — two faces. *Cormorant Garamond* for the wordmark and headlines, *Inter* for everything else, both self-hosted via `next/font`. Fluid sizes via `clamp()`; the `text-display`…`text-micro` scale is in `@theme`.

**Form** — radius 0–2px, no shadows except one soft elevation for modals and drawers. Depth comes from 1px hairlines. Product images are 3:4 throughout.

**Motion** — 150/250/400ms on `cubic-bezier(.22,1,.36,1)`, and only four patterns: scroll reveal, product-card image crossfade, link underline draw, drawer/modal slide. No animation library: CSS keyframes plus a small IntersectionObserver hook. Everything collapses under one `prefers-reduced-motion` block, which is covered by a test.

### One trap worth knowing

Tailwind resolves conflicting utilities by **stylesheet order, not attribute order**. Appending `bg-paper text-ink` to a `Button` whose variant already sets `bg-ink text-paper` produced a white-on-white CTA, and a `hidden` on the desktop wordmark lost to the component's own `inline-block`, rendering both header logos at once and overflowing the mobile header.

So: **colour, background and display live in one place per element.** `Button` has an `inverse` variant for dark photography; `Logo` and `HeaderActions` carry no base display class and let each instance declare its own. Both bugs now have regression tests in `tests/e2e/accessibility.spec.ts`.

---

## Accessibility

- Semantic landmarks, one `h1` per page, skip link as the first focusable element — asserted across 15 routes.
- Dialogs (cart, mobile nav, filters, quick view, size guide) trap focus, close on Escape, restore focus to their trigger and lock body scroll.
- Every image has an `alt`; decorative duplicates use `alt=""`. Category card links are labelled so a screen reader announces "Women's Fashion", not the photo description.
- Sold-out sizes are disabled and carry a text reason, not just a visual strike-through.
- Colour, size and quantity controls are real `fieldset`/`legend`/`button` groups with `aria-pressed`. Sort is a native `<select>`.
- Focus ring: 2px ink, 2px offset, never removed.
- No horizontal scroll at any breakpoint (tested).

## SEO

Per-page titles and meta descriptions, Open Graph and Twitter cards, `Organization` + `WebSite` + `Product` + `BreadcrumbList` + `CollectionPage` JSON-LD, `sitemap.xml` and `robots.txt` generated from the repositories.

Cart, checkout, wishlist and search are `noindex`. Filtered `/shop` permutations are `noindex,follow` to avoid near-duplicates while letting crawlers reach the products. Unknown product and category URLs return a real 404 status, not a soft 404.

Set `NEXT_PUBLIC_SITE_URL` to your domain so canonical URLs and OG tags are right. If it is missing or blank, `config/site-url.ts` falls back to Vercel's deployment URL and then to localhost — it never returns a value `new URL()` would reject, because `metadataBase` passes it straight to that constructor and an invalid one fails the whole production build.

## Performance

- 103 kB shared JS; the heaviest route is 127 kB first load.
- 67 pages prerendered at build. Products and categories are static; listing grids stream.
- No animation library, no CSS-in-JS, no form library, no icon font. Runtime dependencies are Next, React, Zustand and lucide-react.
- `next/image` everywhere with explicit `sizes`; AVIF/WebP; above-the-fold hero and first grid row are priority, everything else lazy.
- 2 columns on mobile for product grids — deliberate, so shoppers can compare without doubling the scroll.

---

## Testing

```bash
npm test          # 74 unit tests
npm run test:e2e  # 151 e2e tests, desktop + mobile viewports
```

Unit tests cover the parts where a silent error costs money: site-URL resolution (which can break the production build), cart arithmetic, discount and shipping rules, the filter/facet engine, search scoring, URL-state round-tripping, form validation, and catalogue integrity (unique slugs, alt text present, variant counts, inventory matching its variants).

E2E covers the journeys, on both a desktop and a Pixel 7 viewport: browsing, filtering through the real sidebar and mobile drawer, sorting, load-more, product variant selection with sold-out states, add to cart, quick view, cart maths and persistence, wishlist, search overlay and results page, the full checkout including validation failures and the unpaid-order confirmation, plus the accessibility and SEO assertions listed above.

The Playwright config builds and starts the production bundle on port 3100, so tests run against the same output that ships.

---

## Decisions taken without you

You asked for these to be made rather than queried. Each is cheap to reverse.

| Decision | Reasoning | Reverse it in |
|---|---|---|
| **Serif display type** (Cormorant Garamond + Inter) | Reads couture and slightly warmer than an all-sans treatment. | `app/layout.tsx` + `--font-serif` |
| **USD, US-first shipping** | Needed for price formatting and the shipping rules. | `config/site.config.ts`, `config/shipping.config.ts` |
| **Demo ratings visible** | The brief asked for ratings on cards and PDPs; they are labelled as demo data throughout, excluded from structured data, and behind a flag. | `config/site.config.ts` |
| **Load-more over numbered pages** | Better on mobile, and `?show=` keeps the URL a complete description of the view. | `lib/url-state.ts` |
| **Dresses/Tops/Bottoms as flat categories, Dresses nested under Women's** | Gave a working breadcrumb trail and mega-menu without inventing a taxonomy you may not want. | `data/categories.ts` → `parentSlug` |
| **Alpha sizes for tops, numeric waists for bottoms** | Standard split; the size guides match. | `data/products.ts` → `sizeSet` |
| **Flat $9.95 shipping, free over $150** | A believable rule the cart, PDP and checkout all read from one config. | `config/shipping.config.ts` |
| **No account system** | Out of scope; the icon is honest about it rather than linking nowhere. | `config/site.config.ts` |

## Still needed from you

1. Real product photography — the single biggest visual dependency, and the only fix for the Traditional Wear category.
2. Real policy text for Shipping, Returns, Privacy and Terms.
3. Social handles, contact details and business hours.
4. Currency and primary market, if not USD/US.
5. Which payment provider to integrate.
6. A domain, for `NEXT_PUBLIC_SITE_URL`.

## Ready for later, not built yet

The data model already carries what an admin dashboard needs: `status` (`active`/`draft`/`archived`) on products, per-variant `sku` and `inventory`, `publishedAt`, an `Order` type with `status` and `paymentStatus`, and `Category.sortOrder`. Adding Products / Categories / Inventory / Orders / Customers / Discounts / Analytics screens means writing against the same repositories, not reshaping the domain.

## Deployment

Vercel is the zero-config path: push the repo and deploy. `npm run build && npm start` works anywhere Node 20+ runs.

Set `NEXT_PUBLIC_SITE_URL` to your production domain once you have one. Until then the site resolves its own URL from Vercel's environment, so a deploy without it still produces correct absolute URLs for that deployment.

**One trap, already fixed:** an environment variable that *exists but is empty* is not the same as a missing one. `process.env.X ?? fallback` does not catch `""`, which is how the first deploy of this project failed with:

```
Failed to collect configuration for /_not-found
TypeError: Invalid URL … input: ''
```

`config/site-url.ts` now treats blank as missing, accepts the bare host Vercel supplies, and validates before returning. `tests/unit/site-url.test.ts` covers it.
