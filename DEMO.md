# Kidy: client demo script

A 10 to 12 minute walkthrough. Open the site on your phone, or use Chrome DevTools in iPhone size, for the store part. Use a laptop for the admin part.

Before every meeting: scroll to the footer and click **Reset demo data** (or use it in the admin sidebar). That restores the catalogue, orders and stock.

## Demo cheat sheet

| What | Value |
| --- | --- |
| Customer login (OTP) | Mobile `98765 43210`, OTP `123456`. This customer already has 2 orders. |
| Admin login | `/admin`. The email and password are pre-filled. Click Log in. |
| Coupons | `FIRST10` (10% off, max ₹200), `KIDY100` (₹100 off above ₹999), `FESTIVE15` (Festive Edit items) |
| Automatic offer | Any 3 tees for ₹999 (add 3 T-shirts or tops) |
| Pincodes | `302017` Jaipur (next day, COD), `110001` New Delhi (2 days), `560001` Bengaluru, `781001` Guwahati (no COD), `744101` Port Blair (not serviceable) |
| Track without login | `/track`: order `KD260112`, mobile `9849456789` |
| Product code search | Type `KD-1005` in search |

## The story

1. **Home on a phone.** Swipe the hero banners (Diwali, new season, 3 tees for ₹999). Show *Shop by age*, the category tiles, and **Deals of the day**: the timer is real and ends at midnight, so it is not a fake countdown.
2. **Search with a typo.** Type `tshrt`. Instant suggestions appear, and the results page still finds the T-shirts.
3. **Filters.** Open Girls, then filter by *4-8 Years* and *Cotton* and sort by price. Point out that the URL changes, so a filtered page can be shared on WhatsApp.
4. **Product page.** Open any product:
   - Tap **Size chart**, then *Find my size* (enter the child's age).
   - Show the honest "only N left" on low-stock sizes.
   - Enter pincode `302017`: delivery date and COD availability appear. Delivery times are counted from the shop in Jaipur.
   - Scroll to the legal info (MRP, country of origin, manufacturer, seller), which the e-commerce rules require.
5. **Bag.** Add 3 tees to show the bundle discount applying itself and the free-shipping bar filling up, then apply `FIRST10`.
6. **Checkout.**
   - Log in with OTP, or check out as a guest and type pincode `560001`: city and state fill in by themselves.
   - Pick **UPI**, then **Simulate successful payment**. You can also show *Simulate failed payment*.
   - Or pick **Cash on delivery** to show the OTP confirmation that cuts fake COD orders.
7. **After the order.** Show the order success page, then **GST invoice** (IGST for orders outside Rajasthan, CGST and SGST inside it, HSN codes, amount in words; order `KD260106` in the admin ships to Udaipur and shows the CGST and SGST split). Then go to *My account*, open the order and its tracking, and show **Return or exchange**.
8. **Switch to the admin** (`/admin` on the laptop). Start with the dashboard: sales chart, today's numbers, and "needs your attention".
9. **Add a product in under 5 minutes** (the main selling point). Click *Add product*. A timer shows in the corner.
   - Type a name, add 2 keywords and press **Write with AI**.
   - Drag in a photo from the laptop and show it being compressed (for example "3.4 MB to 120 KB"). If you have no photo handy, tap a sample.
   - Pick *Boys*, then *T-Shirts*, and tap **+ Kids 4-8Y** and 2 colours. The variants and SKUs appear by themselves. Set all stock to 10.
   - Enter MRP and price. The discount and GST slab show automatically.
   - **Publish product**. The popup shows how long it took. Click *View on store*: it is live.
10. **Process the order you placed.** Go to *Orders* (the new one is marked NEW), then **Confirm**, **Mark packed**, and **Ship with Shiprocket** (pick a courier). Show the WhatsApp messages log, then print the invoice and shipping label. Open the customer's tracking page: it has updated.
11. **Quick tour.** *Bulk upload* then **Try the sample file** (5 products checked and imported). Then *Inventory* (sold-out items hide by themselves), *Discounts* (create `DIWALI20` and use it in the bag straight away), *Returns* (approve, then refund or exchange) and *Customers* (export CSV).

## What to say about the prototype

- It is a clickable design prototype. There is no backend: payments, OTP, WhatsApp and Shiprocket are simulated, and data is saved only in this browser.
- The real store will be built on **Shopify**, as the spec recommends. This prototype is the agreed look and flow for that theme, and its admin mirrors what Shopify's admin and apps will do.
- Photos are free stock images from Pexels. The client's own product photos will replace them.
- The *Reports*, *Home page editor* and *Staff permissions* items in the admin sidebar are listed as part of the full build.
