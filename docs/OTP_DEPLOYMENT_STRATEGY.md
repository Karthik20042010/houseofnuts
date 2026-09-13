# House of Nuts — SMS & WhatsApp OTP Gateway Deployment Strategy

> **Technical Architecture & Production Deployment Guide for OTP Authentication**
> *Document Version: 1.0 | Target Audience: Developers, Administrators, Operations*

---

## 1. Overview & Architecture

House of Nuts supports a multi-provider OTP Authentication engine for customer login, order verification, and mobile account management.

```
                   +---------------------------------------+
                   |       House of Nuts Web Frontend      |
                   |   (GoogleLoginModal / Checkout OTP)   |
                   +-------------------+-------------------+
                                       |
                                       v
                   +-------------------+-------------------+
                   |     OTP Dispatch Engine Service       |
                   |       (src/lib/otpService.ts)         |
                   +-------------------+-------------------+
                                       |
         +-----------------------------+-----------------------------+
         |                             |                             |
         v                             v                             v
+------------------+         +-------------------+         +-------------------+
|  Fast2SMS / MSG91|         | Meta WhatsApp API |         | Apps Script API   |
| (India DLT SMS)  |         | (Cloud Graph API) |         | (Google Sheet DB) |
+------------------+         +-------------------+         +-------------------+
```

---

## 2. Gateway Provider Comparison in India

| Provider | Channel | Average Cost | Delivery Speed | DLT Required? | Best Used For |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Fast2SMS** | SMS | ₹0.15 - ₹0.20 | 2 - 5 seconds | Yes (TRAI DLT) | Standard Indian SMS OTP |
| **MSG91** | SMS + WhatsApp | ₹0.20 - ₹0.75 | 1 - 3 seconds | Yes (TRAI DLT) | Multi-channel failover |
| **Meta WhatsApp Cloud API** | WhatsApp Direct | ₹0.75 / conv | < 2 seconds | No (Facebook Verified) | High conversion & instant WhatsApp OTP |
| **Google Apps Script Webhook** | Webhook Proxy | Free | 3 - 6 seconds | Optional | Zero-cost development & testing |

---

## 3. TRAI DLT Registration Process (India SMS Requirement)

Telecom Regulatory Authority of India (TRAI) mandates DLT (Distributed Ledger Technology) registration for all commercial SMS senders in India.

### Step 1: Principal Entity (PE) Registration
1. Register on any TRAI DLT Portal:
   - [Jio DLT Portal](https://vilpower.in/)
   - [Airtel DLT Portal](https://dltregistration.airtel.in/)
   - [Tata DLT Portal](https://telemarketer.tatateleservices.com/)
2. Upload business documents: Business PAN, GST Registration, Certificate of Incorporation.
3. Obtain your **Entity ID** (19-digit numeric ID).

### Step 2: Header / Sender ID Approval
1. Request a 6-character alphabetic Header / Sender ID e.g., `HONUTS`.
2. Classification: **Transactional / Service Implicit**.

### Step 3: Content Template Approval
Create an approved Content Template:
- **Template Name**: `HONUTS_OTP_VERIFICATION`
- **Template Type**: Service Implicit
- **Header**: `HONUTS`
- **Template Text**:
  ```
  Your verification OTP for House of Nuts is {#var#}. Valid for 5 minutes. Do not share this code with anyone.
  ```
- Save the approved **DLT Template ID (TE ID)** for environment configuration.

---

## 4. Production Integration Setup

### Option A: Fast2SMS DLT Gateway Setup
Add environment variables to `.env`:
```env
VITE_OTP_PROVIDER=fast2sms
VITE_FAST2SMS_API_KEY=your_fast2sms_api_key_here
VITE_FAST2SMS_DLT_TE_ID=1207161829304857291
```

### Option B: Meta WhatsApp Business Cloud API
1. Create an app on [Meta for Developers](https://developers.facebook.com/).
2. Add **WhatsApp Business API** product.
3. Register phone number & generate permanent Access Token.
4. Create an approved message template `otp_verification_code` in Meta Business Manager.
5. Add environment variables:
```env
VITE_OTP_PROVIDER=whatsapp
VITE_WHATSAPP_CLOUD_API_TOKEN=EAAG...
VITE_WHATSAPP_PHONE_ID=109283746501928
```

### Option C: Apps Script Backend Proxy Webhook
Add the following POST action handler to `docs/apps-script.js`:
```js
if (action === 'sendOtp') {
  var mobile = e.parameter.mobile;
  var otp = e.parameter.otp;
  var channel = e.parameter.channel || 'sms';
  
  // Forward request to Fast2SMS / MSG91 / Twilio securely from server-side
  var url = "https://www.fast2sms.com/dev/bulkV2";
  var payload = {
    "route": "dlt",
    "sender_id": "HONUTS",
    "message": "1207161829304857291",
    "variables_values": otp,
    "numbers": mobile
  };
  
  var response = UrlFetchApp.fetch(url, {
    "method": "post",
    "headers": { "authorization": "YOUR_SERVER_SECRET_KEY" },
    "contentType": "application/json",
    "payload": JSON.stringify(payload)
  });
  
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    message: "OTP sent via Apps Script server proxy"
  })).setMimeType(ContentService.MimeType.JSON);
}
```

---

## 5. Developer Console Controls

In **Developer Console** (`/admin/developer` -> **OTP Gateway & Telemetry** tab):
- Switch active provider live between `Demo`, `Fast2SMS`, `MSG91`, `WhatsApp Cloud`, and `Apps Script Webhook`.
- Trigger live test OTP dispatches to any mobile number.
- Inspect telemetry logs (latency in ms, channel, status code, response details).

---

## 6. Staging / Demo Master Override Code

For QA testing, local offline development, and automated test runners, the master staging code `1234` is enabled in `src/lib/otpService.ts` to allow instant verification without burning gateway credits.
