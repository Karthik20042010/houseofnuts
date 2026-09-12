# Gmail and Email Functionality Audit

**Scope:** Code and documentation review of the current Gmail/MailApp, checkout email, contact/wholesale enquiry, and Google sign-in implementation. This is a repository audit; the deployed Apps Script permissions, Config-sheet values, domain DNS, and Gmail account settings still need to be checked in Google.

## Current behaviour

| Event | What the code actually does | Recipient |
| --- | --- | --- |
| Successful order | Saves the order, then tries to send a plain-text alert | `Config.ownerEmail` only |
| Contact or wholesale enquiry | Saves the message, then tries to send a plain-text alert | `Config.ownerEmail` only |
| Customer order confirmation | Not implemented | Nobody |
| Order status or payment update | Updates the Sheet only | Nobody |
| “Continue with Google” | Reads the browser-provided token payload, then stores the user in local storage | No server-verified Gmail identity |

## Findings and gaps

### Critical

1. **Customer notification promises are not implemented.**

   The checkout success screen promises that order updates and tracking will be sent to the customer, and `docs/GO-LIVE.md` says email is sent for confirmation, shipment, delivery, cancellation, and payment. In reality, `placeOrder()` sends one message only to `ownerEmail`; `updateOrder()` sends no email at all. See `docs/apps-script.js:506-513` and `docs/apps-script.js:561-571`.

   **Impact:** Customers receive no receipt, no status changes, and no tracking email. The shop can appear unresponsive and support volume will rise.

   **Fix:** Add dedicated server-side functions for order receipt and order-status notifications. Send only after the order write succeeds, and include the order ID, item list, amount, current status, support contact, and a `siteUrl + /track` link. Store notification state/attempts in the order record to prevent duplicates.

2. **Google sign-in is not securely verified, despite the documentation claiming it is.**

   The client decodes an ID-token payload without validating its signature, issuer, audience, expiry, or nonce. It then treats its email as authenticated and registers that user. The Apps Script endpoint accepts an arbitrary email and role from any caller. See `src/contexts/AuthContext.tsx:134-155` and `docs/apps-script.js:271-293`.

   **Impact:** A forged token payload or direct API request can impersonate an email address. The “Verified with Google” checkout label is not trustworthy. This also makes role assignment unsafe because a caller controls the submitted role.

   **Fix:** Verify the Google ID token on a trusted backend before creating a session; validate signature, `iss`, `aud`, `exp`, and `email_verified`. Derive role exclusively on the server from an allow-list or existing user record—never from the request. Use a short-lived, secure, HTTP-only session cookie rather than local storage.

3. **The public Apps Script endpoint allows unauthenticated email spam.**

   `submitMessage`, `wholesaleEnquiry`, and `placeOrder` can be called by anyone. The server only rate-limits order placement, keyed by an attacker-controlled phone number; message forms have no server-side rate limit, CAPTCHA, honeypot, or validation. Every accepted message attempts an owner email. See `docs/apps-script.js:124-138` and `docs/apps-script.js:625-652`.

   **Impact:** Mailbox flooding, wasted MailApp quota, fake spreadsheet entries, and possible Gmail delivery/reputation problems.

   **Fix:** Validate and normalize all inputs on Apps Script, rate-limit by a combination of IP/proxy edge control and a stable abuse signal, add a bot challenge/honeypot, and reject malformed/oversized fields. For production, place the public form behind a serverless endpoint/WAF rather than exposing a write-capable Apps Script web app directly.

### High

4. **Email failures are silently discarded.**

   Both MailApp calls use empty `catch` blocks. A missing authorization, invalid recipient, quota limit, outage, or Gmail policy error becomes invisible while the order/message endpoint still reports success. See `docs/apps-script.js:513` and `docs/apps-script.js:651`.

   **Impact:** The owner may believe alerts work when no mail is being sent; there is no way to reconcile failed notifications.

   **Fix:** Log a structured failure record (order/message ID, recipient, error, timestamp) in a `NotificationLog` sheet. Return a non-sensitive warning to the admin, add retry logic for transient errors, and alert the owner through a separate monitoring path if failures cross a threshold.

5. **There is no delivery, bounce, or send audit trail.**

   The Orders and Messages sheets do not record notification recipient, template, send time, provider message ID, error, or retry status.

   **Impact:** The team cannot answer “was the receipt sent?”, distinguish a send from a delivered email, or safely retry a failed notification.

   **Fix:** Add a `Notifications` sheet/table with a deterministic idempotency key such as `orderId:notificationType:version`, status (`queued`, `sent`, `failed`), attempt count, and error detail. Avoid marking a message delivered unless the chosen provider supplies verified delivery events.

6. **MailApp is suitable only for basic, low-volume owner alerts.**

   It sends from the Google account that owns/executes the script, not from a properly authenticated shop mailbox. The code contains no branded sender configuration, reply-to strategy, HTML template, unsubscribe handling, or delivery-event integration.

   **Impact:** Customer-facing mail may look personal or unbranded, have weaker deliverability, and cannot be reliably observed at scale.

   **Fix:** Keep MailApp for internal owner alerts if desired. For customer transactional mail, use a dedicated domain address such as `orders@yourdomain`, SPF/DKIM/DMARC, and a transactional provider with logs and webhooks. Do not use marketing mail from this path.

7. **`ownerEmail` is optional and no configuration health check exists.**

   An empty or mistyped `Config.ownerEmail` merely suppresses alert emails. The setup guide instructs manual sheet configuration but the app has no startup/admin diagnostic to confirm that the setting, Apps Script deployment, and MailApp authorization are working. See `docs/apps-script.js:207` and `docs/GO-LIVE.md:27-44`.

   **Fix:** Add an authenticated “email health check” in the admin area that validates config and sends a test message. Display last successful send, current sender account, and the latest failure. Do not expose config values publicly.

### Medium

8. **Checkout calls the email a “Google Mail Address” but permits editing it.**

   After Google sign-in, the address is placed in a normal editable email field. A signed-in person can enter a different recipient, while the UI still says “Verified with Google.” See `src/pages/Checkout.tsx:253-263`.

   **Impact:** Receipts can be sent to the wrong address and the verification wording is misleading.

   **Fix:** Either make the verified account email read-only, or clearly allow a separate delivery-contact email and require a verification flow for it. Treat every recipient address as unverified unless proof is actually stored.

9. **The guide is internally inconsistent and can lead to a false go-live sign-off.**

   It says customer notifications work “out of the box” and lists five notification triggers, but no code implements them. It also mentions Fast2SMS status messages, but the supplied backend contains no Fast2SMS code.

   **Fix:** Correct the guide immediately. State that the current implementation supports only owner alerts for new orders and enquiries. Add acceptance tests before documenting customer email/SMS features as available.

10. **The sender/reply workflow is weak for support.**

   Owner alert messages place the customer email in the body but do not set `replyTo`; replying opens the Gmail account that sent the alert rather than automatically addressing the customer.

   **Fix:** For validated customer addresses, use MailApp options with `replyTo` where appropriate, or create a support workflow that uses the admin message view and safely constructs replies. Never set a user-controlled address as sender.

11. **No input validation exists on the email-sending backend.**

   Frontend validation can be bypassed. Apps Script accepts arbitrary message fields and formats them directly into emails and sheet rows.

   **Fix:** On the server, enforce field lengths, email/phone format, permitted status values, item/price validation, and newline-safe subject generation. Escape content in any future HTML templates.

12. **The API URL has no explicit fail-fast configuration check.**

   If `VITE_APPS_SCRIPT_URL` is missing, `fetch` is called with an empty URL and the user receives a generic failure. See `src/lib/api.ts:4`.

   **Fix:** Fail at build/deploy time when the URL is absent, show a clear configuration error in non-production environments, and maintain separate dev/staging/production endpoints.

## Recommended implementation order

1. Remove the incorrect customer-email/SMS claims from the UI and go-live guide until implemented.
2. Secure Google authentication and role assignment before relying on “verified” Gmail identities.
3. Add server-side validation, abuse controls, and structured MailApp error logging.
4. Implement transactional templates and idempotent customer receipt/status notifications.
5. Add an admin email health check and notification log.
6. Move customer transactional mail to an authenticated domain sender/provider when volume, deliverability, or auditability matters.

## Minimum go-live checklist

- [ ] `ownerEmail` is set to a monitored mailbox in the production Sheet.
- [ ] The Apps Script deployment runs as the intended sender account and MailApp authorization has been granted.
- [ ] A test order produces a visible owner alert and a `NotificationLog` entry.
- [ ] Customer receipt, shipment, delivery, cancellation, and payment emails are implemented and tested—or all claims about them have been removed.
- [ ] Google ID tokens are verified on a trusted backend; roles cannot be supplied by the browser.
- [ ] Public forms have server-side validation and abuse controls.
- [ ] Production sender domain has SPF, DKIM, and DMARC when sending customer mail.
- [ ] Failure/retry behaviour and support ownership are documented.

## Verification still required outside this repository

The code cannot prove whether the deployed web app is using the latest Apps Script version, whether MailApp has been authorized, whether `ownerEmail` is populated, whether sends are hitting quota, or whether the sender domain’s DNS authentication is configured. Perform the minimum checklist against the live Google account before launch.
