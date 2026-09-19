# House of Nuts — Website Audit & Improvement Plan

**Audit date:** 19 September 2026  
**Scope:** storefront, catalog/inventory, checkout, Google Apps Script backend, privacy, security, SEO, performance, operations, and release process.

## Executive summary

The storefront has a strong visual foundation and an improving catalog workflow, but it is **not ready to be treated as a fully secure production commerce system** until the P0 items below are closed. The highest risks are not cosmetic: unauthenticated catalog writes, a public authentication bypass, client-held admin credentials, payment being treated as an order placement without payment verification, and visitor analytics collecting personal/location data without a consent and retention model.

Use this order: **P0 security and payment → P1 data consistency and operations → P2 conversion/performance → growth/SEO routine.** Do not spend on SEO or ads before P0 is complete; traffic magnifies operational and security failures.

## P0 — fix before promotion, ads, or broad public launch

| Finding | Evidence | Risk | Required fix | Done when |
| --- | --- | --- | --- | --- |
| Public catalog configuration write | `docs/apps-script.js` routes `saveCatalogConfig` without `requireAuth`. | Anyone who discovers the Apps Script URL can replace category order, prices/images/custom product configuration. Client-side XOR obfuscation is not authentication. | Require server-side authorization for every write endpoint. Remove public `saveCatalogConfig`; use one authenticated catalog publish API with a short-lived signed session/token. | An unauthenticated POST cannot change a single catalog field; tested with a curl/Postman negative test. |
| Hard-coded admin bypass password | `checkPassword` accepts `hon_setup_bypass_2026` in `docs/apps-script.js`. | Full administrative access is available to anyone who reads the bundled code or documentation. | Delete the bypass completely. Rotate the current sheet password immediately after deploying. | The string is absent from source, Apps Script, tests, deployment history, and sheet notes. |
| Client receives/stores the admin password | `src/lib/admin.ts` stores the password in `sessionStorage` and sends it on each request. | Browser extensions, XSS, shared machines, or DevTools can expose the credential. Password rotation breaks active sessions unpredictably. | Move to server-issued, short-lived, HttpOnly/Secure/SameSite session cookies or a proper authentication provider. Never persist the administrator password in browser storage. | Browser storage and network requests contain no reusable administrator password. |
| OAuth fallback can assign privileged roles from a supplied email | `registerGoogleUser` in `docs/apps-script.js` falls back to the request email, while role derivation uses email substrings such as `houseofnuts`, `admin`, and `developer`. | An attacker can submit a crafted email and potentially receive an elevated role. | Require verified Google ID tokens only; validate issuer, audience/client ID, expiry, and email verification. Assign staff roles only from an allowlisted user ID/email stored in the database—not substring matching. | Attempts using a fabricated email or token fail; only explicitly allowlisted accounts receive staff/admin roles. |
| UPI payment is not verified | `src/pages/Checkout.tsx` places the order after a customer clicks the payment-complete action; the comment correctly states the deep link cannot prove payment. | Unpaid orders can consume stock, create fulfilment work, and reduce revenue. | Integrate a PSP/payment gateway with server-side order creation and verified webhook signature. Reserve stock briefly; mark paid only from the signed webhook; release expired unpaid reservations. | A manual click cannot mark or advance payment. Test paid, failed, duplicate webhook, timeout, and refund flows. |
| Dependency vulnerability backlog | `npm audit --omit=dev` found **10 high**, 1 moderate vulnerability. Directly affected packages include `react-router-dom` and `postcss`; transitive packages include router, glob, lodash, minimatch, nanoid, picomatch, yaml. | Known dependency vulnerabilities and unsupported patch level. | Update direct dependencies and lockfile in a dedicated branch; run build, tests, and checkout/admin smoke tests. Do not use `npm audit fix --force` blindly. | `npm audit --omit=dev` is reviewed and contains no exploitable production high/critical findings, with any exception documented. |
| Visitor PII/location collection lacks consent and retention policy | `src/lib/analytics.ts` stores emails, names, inferred IP location and can request precise GPS; it calls third-party IP/geocoding services. | Privacy-law exposure, user trust loss, and unnecessary sharing of visitor data with third parties. | Remove visitor email from client analytics; default to privacy-preserving aggregated analytics. Add consent before non-essential analytics/location calls, a privacy-policy disclosure, retention limit, opt-out, and a data-deletion process. | No third-party location request occurs before consent; analytics cannot identify a guest by email; policy matches implementation. |

## P1 — correctness, reliability, and staff operations

| Finding | Current gap | Required fix | Done when |
| --- | --- | --- | --- |
| Static catalog imports remain in customer flows | `Gifting.tsx`, `Orders.tsx`, `AdminOrderDetail.tsx`, `GuidesAndRecipes.tsx`, and `reviews.ts` still import `src/data/products` rather than the shared catalog hook/service. | Refactor every customer/admin lookup to one catalog repository. Pass product snapshots into orders so historical orders remain accurate even if a product is renamed. | A product created/renamed/disabled in Inventory appears consistently—or intentionally does not—on every relevant page without rebuilding. |
| Duplicate suppression is heuristic | The current de-duplication key uses category, name, local name, and pack sizes. Two legitimate products with the same display name and weights can be silently merged; an accidental duplicate can retain the wrong price based on row order. | Add immutable SKU/product IDs, unique constraints in the backend, a product status (`draft`, `active`, `archived`), and an admin “duplicate review” screen. Never infer identity from names. | Backend rejects duplicate SKU/variant IDs and staff can deliberately merge/archive duplicates with an audit log. |
| Google Sheet database lacks transactional/version safeguards | Catalog publishing rebuilds product/price sheets; concurrent staff edits can overwrite each other. | Use `LockService`, revision numbers/ETags, server validation, and append-only audit events. Show “this item was changed by X at time Y” before overwrite. | Two simultaneous saves cannot lose data; each change has actor, time, before/after values, and rollback path. |
| Inventory failure becomes “unlimited” inventory | `src/lib/inventory.ts` returns `{}` on API failure, and missing variants are treated as untracked. | During an inventory API outage, out-of-stock items can appear purchasable. | Fail closed for tracked products: show “availability temporarily unavailable” and disable checkout/add-to-cart until the inventory response succeeds. | Simulated API failure never permits a stock-controlled SKU to be purchased. |
| Reviews are device-local and can influence product schema | `src/lib/reviews.ts` stores reviews in localStorage and “verified” is inferred from local order history. | Reviews are not shared, cannot be moderated, and must not be used for public aggregate-rating markup. | Store reviews server-side, verify against delivered order ID/customer, add moderation/reporting, and only emit ratings markup from approved reviews. | Review content and ratings are consistent across devices and cannot be forged by editing localStorage. |
| Images are public, unversioned Drive URLs | Product images use shared Drive URLs; no retention/ownership/cleanup workflow is defined. | Orphaned files, wrong image reuse, broken files, slow images, and no audit trail. | Use a dedicated storage bucket/folder policy, content validation, size limits, WebP/AVIF derivatives, immutable URLs, and image metadata linked to SKU. | Each image is traceable to a SKU and replaced safely without breaking cached product pages. |
| No durable operational monitoring | Errors mostly fall back to console logs/local browser state. | Store owners cannot reliably see backend failures, failed orders, failed image uploads, or catalog sync conflicts. | Add centralized error reporting, health checks, alerting for failed order/payment/catalog jobs, and daily database backup/export. | A deliberately failed order/sync sends an actionable alert and appears in an admin incident log. |
| Role controls are split between UI and password APIs | `accessControl.ts` reads browser session state while Apps Script authorizes mostly with a shared password. | Role changes and UI permissions are not a trustworthy authorization boundary. | Enforce permissions server-side per authenticated user and endpoint (staff: inventory only; admin: roles/orders; developer: diagnostics). | Direct API calls with a staff session cannot perform administrator-only actions. |
| Checkout conversion barrier | Checkout forces a Google sign-in before a shopper can place an order. | This may reduce sales and creates unnecessary account friction. | Support guest checkout with OTP/email confirmation; offer Google sign-in as optional autofill/account convenience. | Guest checkout works end-to-end with fraud controls and verified contact details. |

## P2 — performance, accessibility, and conversion

| Finding | Required improvement | Done when |
| --- | --- | --- |
| Large initial JavaScript | Production build reports an initial `index` chunk around 550 kB minified. | Split optional features (chatbot, build-a-box, game, analytics/admin code) and inspect bundle with a visualizer. | Mobile Lighthouse/real-user LCP and INP targets are measured and improved; storefront JS is materially smaller. |
| Product image quality/performance is inconsistent | Many local JPG/PNG assets and Drive images are used directly. | Create responsive WebP/AVIF sizes, set image dimensions, preload only the LCP hero image, and lazy-load below-the-fold images. | No layout shift from images and product/category pages meet agreed mobile LCP target on 4G. |
| No error boundary/recovery UI | A component/API exception can blank a page. | Add route-level error boundaries with customer-friendly retry/back buttons and diagnostic IDs. | Simulated component/API failures show a recoverable page, not a white screen. |
| Claims need evidence | Cards repeatedly claim “100% Natural”, “Freshly packed”, and “Free Delivery”. | Ensure every claim is true for every SKU/order; make delivery threshold and regions explicit. | Claims, FAQ, shipping policy, checkout, and fulfilment process agree. |
| Accessibility needs formal testing | The UI uses custom controls, dialogs, image-heavy cards, and color status indicators. | Run keyboard, screen-reader, mobile and automated accessibility checks; fix focus order, dialog focus trap, labels, contrast, and non-color status cues. | No critical axe violations; checkout and admin stock update work by keyboard. |
| No end-to-end regression suite | Existing tests are mostly unit/component tests and local-storage mocks. | Add Playwright/Cypress flows for browse → cart → stock conflict → checkout → webhook/payment → order tracking; add admin catalog/image workflow. | CI runs critical customer and staff paths against a staging backend before deploy. |

## SEO and growth gaps

1. **Dynamic staff-added products are not guaranteed to enter `public/sitemap.xml`.** The sitemap generator reads the build-time `src/data/products`; staff-added catalog products need a server-generated sitemap or a deployment-integrated catalog export.
2. **Do not use localStorage reviews for rating rich results.** It is not trustworthy review data and can create structured-data policy risk.
3. **Google Business Profile, Search Console, Merchant Center, and real reviews are operational requirements**, not code changes. Follow `docs/SEO_LAUNCH_CHECKLIST.md`.
4. **Use useful content, not doorway pages.** Publish genuine buying guides, storage guidance, recipes, gifting guidance, and local store information; link each article to relevant product/category pages.
5. **Measure before optimizing.** Configure privacy-compliant conversion events for product view, add to cart, checkout start, purchase, WhatsApp enquiry, and search; review them monthly alongside Search Console queries.
6. **Validate markup after every release.** Test the home, category, product, FAQ, and contact pages with Google Rich Results Test and Search Console URL Inspection.

## Release and data process to establish

1. Maintain separate **development, staging, and production** Apps Script/database deployments.
2. Make a daily export/backup of products, prices, inventory, orders, users, and config. Test restoring it quarterly.
3. Require pull-request review and a release checklist: migration reviewed, tests/build pass, sitemap checked, order/payment smoke test, rollback prepared.
4. Keep secrets out of `.env`, frontend `VITE_*` variables, repository history, screenshots, and documentation. Rotate any key that may already have been committed.
5. Define catalog ownership: one staff member creates a SKU; another reviews prices/images; only approved items become `active`.
6. Record an incident procedure for a wrong price, stock oversell, payment failure, customer-data request, and compromised admin account.

## Suggested delivery sequence

### Sprint 1 — production safety

- Close every P0 security/auth/payment item.
- Rotate credentials and redeploy the Apps Script.
- Upgrade vulnerable dependencies and add a dependency update policy.
- Implement backups and error alerting.

### Sprint 2 — catalog and checkout reliability

- Replace static catalog imports with the shared catalog service.
- Add backend SKU constraints, revisions, audit log, archive state, and duplicate-review workflow.
- Implement guest checkout plus real payment verification.
- Fail closed when live inventory is unavailable.

### Sprint 3 — quality and acquisition

- Add end-to-end tests, error boundaries, image optimization, and bundle splitting.
- Build a dynamic sitemap for staff-created products.
- Complete Google Business Profile, Search Console, Merchant Center, reviews, and content routine.

## Verification commands run for this audit

- `npm run build` — passes (with a large initial-chunk warning).
- `npm audit --omit=dev` — reports 10 high and 1 moderate vulnerability; remediation is required.

## Important note

This document is a prioritized technical and operational backlog, not a claim that every issue can be fixed only in the frontend. Several P0 fixes require changing the Apps Script deployment or moving sensitive functions to a proper server/payment provider.
