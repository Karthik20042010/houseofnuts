# Going Live — House of Nuts (5-minute setup)

Everything runs on your existing Google Sheet. No database, no server, no cost.

## 1. Open your Sheet's Apps Script

Open the sheet ➜ **Extensions ➜ Apps Script**.

## 2. Paste the new backend

Delete everything in `Code.gs` and paste the contents of **`docs/apps-script.js`** from this repo.
Click **Save** (💾).

## 3. Add these tabs to your Sheet

You already have **Orders**. Add two more (tab names must match exactly):

### `Inventory` tab
Row 1 headers:

| variantId | productId | size | stock |
| --------- | --------- | ---- | ----- |

Leave it empty for now — you'll fill stock from the admin panel. Any variant not
listed here is treated as **unlimited stock**.

### `Config` tab
Row 1 headers, then two data rows:

| key            | value                          |
| -------------- | ------------------------------ |
| adminPassword  | pick-a-strong-password         |
| ownerEmail     | your-email@gmail.com           |

`adminPassword` is what you'll type on `/admin/login`.
`ownerEmail` is where new-order notifications are sent.

## 4. Redeploy

**Deploy ➜ Manage deployments ➜ pencil icon ➜ Version: New version ➜ Deploy.**
Keep the same Web App URL (the code is already wired to it).

The first time Apps Script runs it will ask for permission to send email
(MailApp) and edit the sheet — approve both.

## 5. Test

- Open the site, add items to cart, checkout with a small order. You should get an email within ~30s.
- Go to `/admin/login`, enter your password.
- You'll see the order in the dashboard. Click it, change status to "shipped", save. Confirm the Sheet reflects it.
- Go to `/admin/inventory`, set stock for a variant to `2`, save. Reload the storefront — "Only 2 left" badge should appear.

## 6. Publish

Click **Publish** in the Lovable editor. Your site goes live at
`https://houseofnuts.lovable.app`. Add a custom domain later via **Project
Settings ➜ Domains**.

---

### Notes

- **Admin URL is public** (`/admin/login`) but useless without your password. Pick a strong one and keep it out of chat/email.
- **Inventory is per size variant** and updated atomically via `LockService`, so two customers can't oversell the last unit.
- **Local order history** on customer devices still works via `localStorage` — the Sheet is the source of truth.
