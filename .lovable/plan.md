
# House of Nuts — Go-Live Plan (100% Google Sheets)

Everything stays free. We extend your existing Apps Script into a small JSON API that the site reads and writes. No database, no server.

## 1. Upgrade the Google Apps Script (you paste, I guide)

Your current Sheet gets **3 tabs**:

- `Orders` — already exists (order log)
- `Inventory` — new: one row per size variant (`productId`, `variantId`, `size`, `stock`)
- `Config` — new: single row with `ownerEmail`, `adminPasswordHash`

The Apps Script gets new actions (dispatched by a `?action=` param):

| action | method | purpose |
|---|---|---|
| `getInventory` | GET | Returns stock for all variants (site reads on load) |
| `placeOrder` | POST | Appends to `Orders`, decrements `Inventory`, emails you |
| `getOrders` | GET | Returns all orders (admin dashboard) — requires token |
| `updateOrder` | POST | Change status / paymentStatus — requires token |
| `adminLogin` | POST | Verifies password, returns a signed token |

I'll give you the full Apps Script code to paste and redeploy. You keep the same web-app URL.

## 2. Inventory sync on the storefront

- On app load, fetch `getInventory` once (cached ~2 min).
- `ProductCard` and `ProductDetail` show `Out of stock` and disable "Add" when `stock <= 0`.
- Low-stock badge ("Only 3 left") when `stock <= 5`.
- On successful checkout, Apps Script decrements stock atomically. If a variant went out of stock between add-to-cart and checkout, the API returns `{ error: "out_of_stock", variant: "..." }` and checkout shows a clear message.

## 3. Admin dashboard (`/admin`)

Single-owner login gated by password (verified server-side in Apps Script — the password is stored **only in the Sheet**, never in the code).

Pages:

- `/admin/login` — password form
- `/admin` — orders table with filters (status, date, search by name/phone/orderId), click row → detail
- `/admin/orders/:id` — full order, change **Order Status** (pending → confirmed → shipped → delivered → cancelled) and **Payment Status** (pending → paid → refunded). Updates write back to the Sheet.
- `/admin/inventory` — table of every variant with editable stock number; save writes to `Inventory` tab.

Session token stored in `sessionStorage`, expires after 8h. Logout button clears it.

```text
┌─ /admin ─────────────────────────────────┐
│ Orders  Inventory       [Logout]         │
│ Filter: [All ▾] [Search…]                │
│ ┌──────────────────────────────────────┐ │
│ │ HON-… │ Ravi │ ₹1240 │ Pending │ →  │ │
│ │ HON-… │ Sita │ ₹  680│ Shipped │ →  │ │
│ └──────────────────────────────────────┘ │
└──────────────────────────────────────────┘
```

## 4. Email notification on new order

Add one line to the Apps Script `placeOrder` handler:

```js
MailApp.sendEmail(config.ownerEmail, "New Order " + orderId, summary);
```

You'll get an email the moment a customer checks out.

## 5. Publish

After the above ships, publish to `houseofnuts.lovable.app`. Custom domain can be connected later from Project Settings → Domains.

---

## Technical details

- **New files:** `src/lib/inventory.ts`, `src/lib/admin.ts`, `src/pages/AdminLogin.tsx`, `src/pages/AdminDashboard.tsx`, `src/pages/AdminOrderDetail.tsx`, `src/pages/AdminInventory.tsx`, `src/contexts/InventoryContext.tsx`.
- **Edits:** `src/App.tsx` (routes), `src/components/ProductCard.tsx` + `src/pages/ProductDetail.tsx` (stock UI), `src/pages/Checkout.tsx` (call `placeOrder` instead of just append; handle `out_of_stock`), `src/lib/orders.ts` (route through new API), `src/data/products.ts` (ensure every variant has a stable `variantId`).
- **Security note (honest):** Since there's no real backend, the admin password check happens inside Apps Script but the endpoint URL is public. We mitigate by (a) requiring password on every login, (b) short-lived session token, (c) rate-limit-friendly single-owner use. This is fine for a small shop; if you ever want stronger auth we'd move to Lovable Cloud.
- **Concurrency:** Apps Script uses `LockService` around inventory decrements so two simultaneous orders can't oversell.
- **Existing localStorage orders** stay as a customer-facing "My Orders" history (device-local). The Sheet is the source of truth.

## What I need from you after building

1. Replace your Apps Script with the new version I'll provide (copy-paste, then Deploy → New version → same access "Anyone").
2. In the Sheet, add the two new tabs (`Inventory`, `Config`) — I'll give you the exact headers and a starter row.
3. Set the admin password and your notification email in the `Config` tab.
