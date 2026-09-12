# Going Live — House of Nuts Production Setup

Everything runs on your existing Google Sheet Apps Script backend. No database, no server, zero cost.

## 1. Open your Sheet's Apps Script

Open the sheet ➜ **Extensions ➜ Apps Script**.

## 2. Paste the Updated Backend Code

Delete everything in `Code.gs` and paste the exact contents of **`docs/apps-script.js`** from this repo.
Click **Save** (💾).

## 3. Database Sheet Tabs

The system automatically initializes and manages **8 dedicated sheet tabs**:

1. **`Config`**: Store settings (`adminPassword`, `ownerEmail`, `siteUrl`).
2. **`Users`**: User accounts, contact details, authentication & roles (`admin`, `developer`, `staff`, `user`).
3. **`Products`**: Product catalog (Names, Categories, Descriptions, Badges, Images).
4. **`Prices`**: Price Master (Product ID, Variant ID, Size, Price, Discount Price).
5. **`Inventory`**: Stock Master (Variant ID, Product ID, Size, Available Stock, Reorder Level).
6. **`Orders`**: Customer Orders (Timestamp, Order ID, Customer Info, Items, Total, Status, Payment).
7. **`Messages`**: Customer messages & wholesale enquiries.
8. **`Notifications`**: Email delivery log, notification audit trail & bounce tracking.

### `Config` Tab Configuration
In your Google Sheet's `Config` tab:

| key            | value                          |
| -------------- | ------------------------------ |
| adminPassword  | pick-a-strong-password         |
| ownerEmail     | your-email@gmail.com           |
| siteUrl        | https://houseofnuts.store      |

- `adminPassword`: Password required for `/admin/login` and protected admin endpoints.
- `ownerEmail`: Store owner email where new order & enquiry alerts are sent.
- `siteUrl`: Production domain (used for customer tracking links `https://houseofnuts.store/orders/<id>`).

## 4. Deploy Web App

**Deploy ➜ Manage deployments ➜ Edit (Pencil) ➜ Version: New version ➜ Deploy.**

*The first time Apps Script runs, approve permissions for MailApp (email sending) and Google Sheets.*

## 5. Email & Notification Architecture

### Customer Transactional Emails (Automatic)
- **Order Confirmation Receipt**: Sent immediately after successful order placement to the customer's email. Includes HTML formatted itemized table, total amount, shipping address, support phone (+91 96525 26920), and a direct tracking link (`https://houseofnuts.store/orders/<id>`).
- **Order Status Update Emails**: Automatically sent to the customer whenever an admin updates the order status to `processing`, `shipped`, `delivered`, or `cancelled`.
- **Reply-To Integration**: All customer notification emails set `replyTo: ownerEmail`. Store owner alerts set `replyTo: customerEmail` so replying in Gmail directly addresses the customer.

### Notification Audit Trail & Health Diagnostics
- Every email attempt (success or error) is logged with timestamp, recipient, subject, and error details in the **`Notifications`** sheet tab.
- Admins can trigger the **Email Health Check** diagnostic tool via `/admin` to verify remaining daily MailApp quota (100/day on free Gmail, 1,500/day on Workspace) and test configuration.

## 6. Security & Google OAuth 2.0 Token Verification

- **Google ID Token Server Verification**: Google Identity Services ID tokens are verified against Google's Token Info service (`https://oauth2.googleapis.com/tokeninfo?id_token=`). Signature, issuer, and email verification status are checked server-side.
- **Server-Derived Roles**: Roles (`admin`, `developer`, `staff`, `user`) are derived exclusively on the server from existing user records or domain allowlists—never from client request parameters.
- **Anti-Spam & Rate Limiting**: Form submissions contain hidden honeypot fields (`hp_field`) and IP/email rate limiting (max attempts per 10 minutes) to block automated web spammers.

---

## 7. Hosting & Domain Setup

### Deploying Frontend (Vercel / Netlify / Cloudflare Pages)
1. Framework Preset: **Vite**.
2. Build Command: `npm run build`.
3. Output Directory: `dist`.
4. Environment Variables:
   - `VITE_APPS_SCRIPT_URL`: Your Apps Script Web App URL (`https://script.google.com/macros/s/.../exec`).
   - `VITE_GOOGLE_CLIENT_ID`: Your Google OAuth Client ID (`9652526920-houseofnuts.apps.googleusercontent.com`).
   - `VITE_GOOGLE_DRIVE_FOLDER_ID`: `16BLOa7rZQ1O6Ob54l89ABTbVSfi1xui3`.

