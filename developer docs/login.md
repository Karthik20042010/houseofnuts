# "Continue with Google" — Full Integration Guide

A complete walkthrough for adding Google Sign-In to a website: how it works, setup steps, frontend + backend code, session handling, and production checklist.

---

## 1. How It Works (Overview)

"Continue with Google" uses **OAuth 2.0 / OpenID Connect** via Google Identity Services (GIS) — the modern replacement for the old Google Sign-In JS library.

**The flow, end to end:**

1. Your site loads a Google-provided script and renders a "Sign in with Google" button (or a One Tap prompt).
2. User clicks it → Google shows their account picker/consent screen.
3. Google returns an **ID token** (a signed JWT) to your frontend containing the user's verified email, name, and profile photo.
4. Your frontend sends that ID token to **your backend**.
5. Your backend **verifies the token's signature** with Google's public keys (never trust it blindly).
6. Once verified, your backend creates or looks up the user in your database, then starts a session (cookie or your own JWT) — this is what actually logs the user into *your* app.

Key point: Google's token proves *who the person is*. It does **not** create a session in your app — you have to do that yourself on your backend.

---

## 2. Google Cloud Console Setup

### Step 1 — Create a project
1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (or select an existing one) — e.g. "House of Nuts".

### Step 2 — Configure the OAuth consent screen
1. Navigate to **APIs & Services → OAuth consent screen**.
2. Choose **External** (unless this is an internal company tool).
3. Fill in:
   - App name (shown to users on the consent screen)
   - Support email
   - App logo (recommended — builds trust)
   - Authorized domains (e.g. `houseofnuts.store`)
   - Privacy policy & terms of service URLs (**required** to go live — Google will keep your app in "testing" mode without these, capped at 100 test users)
4. Add scopes: `email`, `profile`, `openid` (the defaults are usually enough).
5. Save.

### Step 3 — Create OAuth credentials
1. Go to **APIs & Services → Credentials → Create Credentials → OAuth Client ID**.
2. Application type: **Web application**.
3. Add:
   - **Authorized JavaScript origins**: `https://houseofnuts.store` (and `http://localhost:3000` for local dev)
   - **Authorized redirect URIs**: only needed if using the redirect-based flow (not needed for the popup/One Tap flow described below)
4. Save — you'll get a **Client ID** (public, safe to expose in frontend code) and a **Client Secret** (backend only, never expose this).

### Step 4 — Publish the app
- While in "Testing" mode, only pre-approved test users can sign in.
- Once ready, submit for **verification** (required if requesting sensitive scopes, or once you exceed 100 users) — Google reviews it, which can take a few days.

---

## 3. Frontend Implementation

### Step 1 — Load the Google script
```html
<script src="https://accounts.google.com/gsi/client" async defer></script>
```

### Step 2 — Render the button
```html
<div id="g_id_onload"
     data-client_id="YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com"
     data-callback="handleGoogleCredentialResponse"
     data-auto_prompt="false">
</div>

<div class="g_id_signin"
     data-type="standard"
     data-size="large"
     data-theme="outline"
     data-text="continue_with"
     data-shape="pill"
     data-logo_alignment="left">
</div>
```

### Step 3 — Handle the returned token
```javascript
function handleGoogleCredentialResponse(response) {
  const idToken = response.credential; // JWT from Google

  fetch("/api/auth/google", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: idToken }),
    credentials: "include" // so the session cookie gets set
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        window.location.href = "/dashboard"; // or wherever post-login goes
      } else {
        alert("Login failed. Please try again.");
      }
    });
}
```

**Optional — One Tap prompt** (shows a floating prompt without the user clicking a button, for returning visitors):
```javascript
google.accounts.id.prompt();
```

---

## 4. Backend Implementation (Node.js / Express example)

### Step 1 — Install the verification library
```bash
npm install google-auth-library
```

### Step 2 — Verify the token and create a session
```javascript
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

app.post("/api/auth/google", async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    // payload contains: sub (Google user ID), email, email_verified, name, picture

    if (!payload.email_verified) {
      return res.status(401).json({ success: false, error: "Email not verified" });
    }

    // Look up or create the user in your database
    let user = await db.users.findOne({ googleId: payload.sub });
    if (!user) {
      user = await db.users.create({
        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
        avatar: payload.picture,
      });
    }

    // Create YOUR app's session (example: signed cookie with your own JWT)
    const sessionToken = createSessionJWT(user); // your own function
    res.cookie("session", sessionToken, {
      httpOnly: true,
      secure: true,       // HTTPS only
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Google token verification failed:", err);
    res.status(401).json({ success: false, error: "Invalid token" });
  }
});
```

**Why verify server-side and never trust the frontend token directly:** anyone can forge a request claiming to be any email if you skip signature verification. `verifyIdToken` checks the JWT signature against Google's public keys, confirms the audience matches your client ID, and confirms it hasn't expired.

---

## 5. Linking Google Login with Existing Accounts

If users can already sign up with email/password, decide how to handle overlap:

- **Match by email**: if a Google sign-in email matches an existing account, link the Google ID to that account rather than creating a duplicate.
- **Flag unverified matches**: only auto-link if `email_verified` is `true` in the Google payload — otherwise, ask the user to confirm/verify first.
- Store `googleId` as a separate field so a user can have both a password login and a Google login pointing to the same account.

---

## 6. Session & Security Checklist

- [ ] Store sessions as `httpOnly`, `secure`, `sameSite` cookies — never in `localStorage` (vulnerable to XSS).
- [ ] Always verify the ID token server-side — never trust decoded frontend JWT claims.
- [ ] Check `email_verified === true` before treating the email as trustworthy.
- [ ] Set a reasonable session expiry and support logout (clear the cookie + any server-side session record).
- [ ] Use HTTPS everywhere — Google Sign-In requires it in production (localhost is exempted for dev).
- [ ] Rate-limit the `/api/auth/google` endpoint to prevent abuse.
- [ ] Keep your Client Secret out of frontend code and out of version control (use environment variables).

---

## 7. Common Pitfalls

| Issue | Cause | Fix |
|---|---|---|
| Button doesn't render | Script blocked/adblocker, or wrong client ID | Check browser console for errors; verify client ID matches Cloud Console |
| "redirect_uri_mismatch" error | Origin/redirect URI not added in Cloud Console | Add exact URL (including https/http and port) to Authorized JavaScript origins |
| Works on localhost, fails in production | Production domain not added to Authorized origins, or site not on HTTPS | Add production domain; ensure HTTPS is enforced |
| Token verification fails | Verifying against wrong `audience`, or expired token | Ensure `audience` matches your Client ID exactly; tokens expire ~1 hour after issue — verify immediately after receipt |
| Stuck in "Testing" mode / limited to 100 users | OAuth consent screen not submitted for verification | Complete consent screen requirements (privacy policy, logo, etc.) and submit for Google review |
| One Tap not showing for returning users | Browser blocking third-party cookies, or user dismissed it recently | Google enforces a cool-down after dismissal; test in a fresh browser profile |

---

## 8. Testing Checklist Before Launch

- [ ] Test sign-in with a brand-new Google account (first-time user creation flow)
- [ ] Test sign-in with an existing Google account (returning user, correct data loaded)
- [ ] Test on mobile browsers (Safari iOS often behaves differently with third-party cookies)
- [ ] Test logout — confirm session is fully cleared
- [ ] Test what happens if the user denies/cancels the Google consent prompt
- [ ] Confirm HTTPS is enforced sitewide
- [ ] Confirm privacy policy and terms links are live (required for consent screen approval)

---

## Summary of What You Need
1. Google Cloud project + OAuth consent screen configured and (eventually) verified
2. Client ID (frontend) and Client Secret (backend, kept private)
3. Frontend button + callback handler
4. Backend endpoint that verifies the token and creates your own session
5. Database fields to store `googleId`, `email`, `name`, `avatar`
6. Secure cookie-based session handling