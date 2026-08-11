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

## 6. Publish / Hosting

You can host **House of Nuts** on any static host or platform:

### Option A: Vercel / Netlify / Cloudflare Pages
- Connect this GitHub repository to Vercel or Netlify.
- Framework Preset: **Vite**.
- Build Command: `npm run build`.
- Output Directory: `dist`.
- Set your custom domain (e.g. `houseofnuts.in` or `houseofnuts.com`).

### Option B: Lovable Editor
- Click **Publish** in the Lovable editor to publish immediately to your custom domain or project URL. Add a custom domain under **Project Settings ➜ Domains**.

### Setting your domain in Google Sheet:
In your Google Sheet's `Config` tab, add a row:
`siteUrl` | `https://yourdomain.com`
This ensures customer status update emails link directly to your custom domain's `/track` page.

---

### Notes

- **Admin URL is public** (`/admin/login`) but useless without your password. Pick a strong one and keep it out of chat/email.
- **Inventory is per size variant** and updated atomically via `LockService`, so two customers can't oversell the last unit.
- **Local order history** on customer devices still works via `localStorage` — the Sheet is the source of truth.

## 7. Customer notifications (email + SMS)

Whenever the admin changes an order's status (confirmed / shipped / delivered / cancelled)
or marks it paid, the customer is notified automatically.

### Email — free, works out of the box
Uses Google's built-in `MailApp` in Apps Script. Sent from your Google account,
no setup needed. Goes to the email the customer entered at checkout (if any).
Daily quota: 100 recipients/day on free Gmail, 1,500/day on Workspace.

### SMS — optional, activate when ready
SMS uses [Fast2SMS](https://www.fast2sms.com/) (India-focused, prepaid, ~₹0.20-0.30 per SMS).

To turn it on:
1. Create a Fast2SMS account and buy a small credit pack.
2. Copy your API key from Fast2SMS → **Dev API**.
3. In Apps Script open **Project Settings** (⚙️) → **Script Properties** → **Add script property**.
4. Name: `FAST2SMS_API_KEY`, Value: *(paste your key)* → **Save**.
5. Redeploy the web app (Deploy → Manage deployments → edit → New version).

That's it — SMS starts flowing on the next status change. Remove the property
to disable SMS again; email keeps working.

### What triggers what
| Admin action        | Email | SMS |
| ------------------- | :---: | :-: |
| Confirm order       |  ✅   | ✅  |
| Mark Shipped (+ tracking#) | ✅ | ✅ |
| Mark Delivered      |  ✅   | ✅  |
| Cancel Order        |  ✅   | ✅  |
| Mark Paid           |  ✅   | ✅  |

When marking shipped, you'll be prompted for an optional tracking number that's
included in the message.
