# House of Nuts — Premium Dry Fruits, Nuts, Spices & Honey

An e-commerce web application for **House of Nuts**, offering premium dry fruits, nuts, Kashmiri saffron, solar-dried fruits, seeds, and raw forest honey.

Built with React, Vite, TypeScript, TailwindCSS, and a serverless Google Sheets & Apps Script backend.

---

## ✨ Features

- **Storefront**:
  - Full product catalog with real-time category filtering (Nuts, Dry Fruits, Solar Dried, Seeds, Spices, Honey).
  - Price sorting, search modal with keyboard shortcuts (`Cmd+K`), and recent searches.
  - Multi-size variant selection with stock tracking ("Only X left", "Sold Out" badges).
  - Customer review system with verified buyer badges.
  - Interactive shopping cart drawer with promo code validation (`WELCOME10`, `BULK15`, `FLAT100`, `NUTS20`).
  - Direct UPI payment integration with QR code generation & deep linking for GPay, PhonePe, Paytm.
  - Device-persisted order history ("My Orders") and live order tracking page.
  - Floating WhatsApp support & interactive AI assistant ("Nutty").
  - Mobile bottom tab bar optimized for touch interactions.

- **Admin Management Panel (`/admin`)**:
  - Secure authentication backed by Google Sheet `Config` tab password.
  - Live order management dashboard: filter by status, payment status, date range, search by customer/phone/order ID.
  - One-click status updates (Confirmed, Shipped with tracking #, Delivered, Cancelled) and payment status toggles.
  - CSV Export of order data.
  - Visual inventory manager: edit per-variant stock, set low-stock thresholds, or mark as untracked (`∞`).
  - Catalog image manager: upload product photos to Google Drive or use custom image URLs with instant local preview overrides.

- **Backend Architecture**:
  - Serverless architecture running on Google Apps Script + Google Sheets.
  - Automated customer notifications via Email (`MailApp`) & optional SMS (`Fast2SMS`).
  - Atomic inventory locking (`LockService`) to prevent overselling.

---

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18+)
- npm or bun

### Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:8080](http://localhost:8080) in your browser.

---

## 🚀 Deployment & Go-Live

Refer to [docs/GO-LIVE.md](docs/GO-LIVE.md) for the complete 5-minute setup guide to connect your Google Sheet backend and host the storefront.

### Build for Production
```bash
npm run build
```

---

## 📜 License
© House of Nuts. All rights reserved.
