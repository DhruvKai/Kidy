# KiDDY WiDDY: clickable store prototype

A frontend-only prototype of a FirstCry-style kids clothing store for India, built to show a client before the real build on Shopify. It covers the full shopping flow (home, search, filters, product page, bag, checkout, tracking, returns, GST invoice) and a no-code admin (dashboard, add product with auto variants, bulk CSV upload, orders, inventory, discounts, returns, customers).

There is no backend. Data starts from seed files and is saved in the browser's localStorage, so the storefront and admin act as one live demo. **Reset demo data** (footer or admin sidebar) restores everything.

The walkthrough for client meetings is in [DEMO.md](DEMO.md).

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build into dist/
npm run preview    # serve dist/ locally on http://localhost:4173
```

Requires Node 18 or newer.

## Deploy (free hosting)

**Netlify Drop (no account setup or CLI needed):**
1. Run `npm run build`.
2. Open https://app.netlify.com/drop and drag the `dist` folder onto the page.
3. Netlify gives you a URL straight away. Optionally rename the site (for example `kiddy-widdy-demo`) under *Site configuration*.

**Vercel:** run `npx vercel --prod` in this folder. It detects Vite on its own.

**GitHub Pages (current live demo):** every push to `main` runs `.github/workflows/pages.yml`, which builds with `BASE_PATH=/<repo name>/` and publishes `dist/` to the `gh-pages` branch. The site is at `https://<user>.github.io/<repo>/`. In the repo settings, *Pages* must be set to deploy from the `gh-pages` branch (root).

Deep links such as `/p/...` work on refresh because of `public/_redirects` (Netlify), `vercel.json` (Vercel) and a copy of `index.html` saved as `404.html` (GitHub Pages). The page has `noindex` so search engines skip the demo.

## Change things before a demo

| What | Where |
| --- | --- |
| Store name, seller address, GSTIN, WhatsApp number, free-shipping threshold, COD fee and limit, GST slabs, demo OTP, admin login | `src/config.js` |
| Products, prices, sizes, colours, photos | `src/data/products.js` (photos in `public/images/products/`) |
| Categories, size and colour lists, HSN codes | `src/data/catalog.js` |
| Coupons and the 3-for-₹999 bundle | `src/data/coupons.js` |
| Deals of the day | `DEAL_PRICES` in `src/data/products.js` |
| Home page banners and copy | `src/pages/Home.jsx` (photos in `public/images/banners/`) |
| Seed orders and customers | `src/data/seedOrders.js` |
| Policy page text | `src/pages/StaticPage.jsx` |
| Colours and fonts | `src/index.css` (`@theme` tokens) |

## Stack

React 19 and Vite, Tailwind CSS v4, React Router, Zustand (state saved to localStorage), Phosphor icons, Fuse.js (typo-tolerant search), Papa Parse (CSV), Recharts (admin chart, loaded only in the admin). Fonts (Baloo 2, Nunito) are bundled, so there are no external font requests.

```
src/
  config.js            store settings in one place
  data/                seed catalogue, coupons, pincodes, size charts, orders
  store/               Zustand stores (persisted demo data, UI state)
  lib/                 pricing and GST, delivery estimates, search, filters, image compression
  components/          header, footer, product card, filters, modals
  pages/               storefront pages
  admin/               admin pages (lazy-loaded)
```

## What is simulated

Payments (a mock gateway sheet with success and failure buttons, and no card fields), OTP (always `123456`), WhatsApp and SMS messages (shown as a log in the admin), Shiprocket courier selection, the AI description writer (template based), and reviews and sales history (sample data). Image compression in the admin is real: photos are resized and compressed in the browser.

## Checks done

- End-to-end run in headless Edge: create a product in the admin, find it in search, buy it with COD and OTP, see the order in the admin, confirm it, see the customer tracking update, log in with OTP and see past orders, then reset the demo.
- Lighthouse: accessibility 100, best practices 100. Performance is 98 on desktop and 77 to 82 on throttled mobile; this app renders entirely in the browser, while the final Shopify theme will be rendered on the server.

## Image credits

Product and banner photos are from [Pexels](https://www.pexels.com) under the Pexels licence (free for commercial use, no attribution required). Pexels photo IDs match the file names in `public/images/`. Replace them with the client's own product photography for the real store.
