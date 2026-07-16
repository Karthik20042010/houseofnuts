# Admin Dashboard Improvements

Focus is entirely on the `/admin` area (login, dashboard, order detail, inventory). Storefront is untouched. All work is presentation + workflow polish — no backend/Apps Script changes.

## 1. Shared admin shell with sidebar
Wrap all admin routes in a new `AdminLayout` using shadcn `Sidebar` (collapsible to icon rail):

- Sidebar sections: **Orders**, **Inventory**, **Storefront ↗**, **Logout** (bottom).
- Top bar with `SidebarTrigger`, current page title, quick refresh, and a live "last synced" timestamp.
- Consistent earthy palette (clay-light bg, Fraunces headings) matching site brand.
- Highlights active route via `NavLink`.

New file: `src/components/admin/AdminLayout.tsx` + `AdminSidebar.tsx`. `AdminDashboard`, `AdminOrderDetail`, `AdminInventory` become the layout's children (route restructure in `App.tsx`).

## 2. Dashboard (orders list) upgrades

Visual & workflow polish:

- **Stat cards**: add Revenue Today, Pending Payment count, low-stock count; add trend delta (vs previous 7 days). Use accent icons and tabular numerals.
- **Filters row**: keep search + status; add **date range** (Today / 7d / 30d / All) and **payment status** filter; add "Unpaid only" quick toggle.
- **Table**:
  - Sortable columns (date, total, status) with header click.
  - Row hover shows quick actions: mark **Confirmed**, mark **Paid**, **WhatsApp** the customer (opens `wa.me/<phone>` with a prewritten message including order id + total).
  - Colored status pills already exist — swap to design-token classes so they respect theme.
  - Sticky header; zebra rows; mobile card fallback under `md`.
- **Empty / error / loading** states get proper illustrations and retry buttons.
- **Export CSV** button (client-side, from current filtered set).
- **Pagination** (25/page) so large sheets stay fast.
- Auto-refresh every 60s with a toggle.

## 3. Order detail upgrades

- Two-column layout with a sticky right-side "Actions" panel.
- **Status timeline** (Placed → Confirmed → Shipped → Delivered) — visual stepper matching customer's `OrderDetail`.
- **Quick action buttons**: Mark Paid, Mark Shipped, Mark Delivered, Cancel — one click updates and toasts, no dropdown save trip.
- **Customer card**: click-to-copy phone/email, WhatsApp + Call links, Google-Maps link on address.
- **Items card**: product thumbnails, per-line subtotal, itemized total block with tax/discount lines.
- **Print / Invoice** button opens a print-styled invoice view (uses `window.print()` with print CSS).
- Save state uses toast (sonner) instead of inline text.

## 4. Inventory page upgrades

- **Search + category filter** at top.
- **Bulk actions**: "Set all to ∞", "Set all to 0", "Fill from CSV" (optional; scoped simple).
- Per-variant row shows: thumbnail, name, size, current stock input, low-stock warning chip when ≤5, out-of-stock chip when 0.
- **+ / − steppers** next to number input for fast edits on mobile.
- **Dirty indicator** on changed rows and a sticky "Save (N changes)" bar so admin knows what will be pushed.
- Group by product with collapsible sections; sticky product header.

## 5. Login polish

- Centered card with soft gradient/texture background, brand mark, subtle motion on submit.
- Show/hide password toggle.
- Better error copy for network vs wrong password.

## 6. Design tokens & consistency

- Replace ad-hoc `bg-yellow-100`/`bg-blue-100` status colors with new semantic tokens in `index.css` (`--status-pending`, `--status-shipped`, etc.) and matching Tailwind classes so dark mode / theme changes work.
- Standardize spacing scale, use `rounded-sm` corners consistently, unify button variants via existing `buttonVariants`.

## Technical details

- **New files**: `src/components/admin/AdminLayout.tsx`, `src/components/admin/AdminSidebar.tsx`, `src/components/admin/StatusPill.tsx`, `src/components/admin/StatusTimeline.tsx`, `src/components/admin/InvoicePrint.tsx`, `src/lib/adminCsv.ts` (CSV export helper).
- **Edited**: `src/App.tsx` (nest admin routes inside `AdminLayout` via `<Outlet/>`), `src/pages/AdminDashboard.tsx`, `src/pages/AdminOrderDetail.tsx`, `src/pages/AdminInventory.tsx`, `src/pages/AdminLogin.tsx`, `src/index.css` (status tokens), `tailwind.config.ts` (register tokens).
- No changes to `src/lib/admin.ts`, `src/lib/orders.ts`, `docs/apps-script.js`, or any storefront code.
- Uses existing shadcn primitives (`sidebar`, `button`, `input`, `select`, `dialog`, `sonner`) — no new deps.

## Out of scope

- Storefront visual polish, checkout flow, product detail improvements (can be a follow-up plan).
- Apps Script or Sheet schema changes.
- Auth hardening (still password-in-Sheet model).
