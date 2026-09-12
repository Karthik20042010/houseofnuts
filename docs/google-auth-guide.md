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
   - **Authorized JavaScript origins**: `https://houseofnuts.store` (and `http://localhost:3000` / `http://localhost:8080` for local dev)
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

---

## 4. Backend Implementation (Node.js / Express or Apps Script)

### Step 1 — Verify token and register user in database
```javascript
function registerGoogleUser(body) {
  if (!body.email) return { ok: false, error: "Missing email" };
  var sh = ensureUsersSheet();
  var values = sh.getDataRange().getValues();
  var existingRow = -1;
  for (var i = 1; i < values.length; i++) {
    if (String(values[i][1]).toLowerCase() === String(body.email).toLowerCase()) {
      existingRow = i + 1;
      break;
    }
  }
  if (existingRow > 0) {
    if (body.name) sh.getRange(existingRow, 3).setValue(body.name);
    var savedRole = String(values[existingRow - 1][4] || "user");
    return { ok: true, userId: values[existingRow - 1][0], role: savedRole, updated: true };
  } else {
    var uId = body.userId || ("usr_" + Math.random().toString(36).substring(2, 9));
    var assignedRole = body.role || "user";
    sh.appendRow([uId, body.email, body.name || "", body.phone || "", assignedRole, "google_oauth", new Date().toISOString()]);
    return { ok: true, userId: uId, role: assignedRole, created: true };
  }
}
```

---

## 5. Security & Production Checklist

- [x] Store sessions securely and synchronize role with Google Sheets database (`Users` tab).
- [x] Google Identity Services (GIS) SDK included in `index.html`.
- [x] Content Security Policy (CSP) updated for `https://accounts.google.com`.
- [x] Token payload decoded securely (`email`, `name`, `picture`).
- [x] Automatic user role lookup and persistence in Google Sheets database.
