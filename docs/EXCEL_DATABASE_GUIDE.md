# Excel & Google Sheets Multi-Sheet Database Guide

This guide details how to use **`C:\Users\DELL\OneDrive\house of nuts.xlsx`** (or its Google Sheets equivalent) as a live, multi-sheet database with full automated scripting.

---

## 📊 Database Multi-Sheet Structure

Your spreadsheet (`house of nuts.xlsx`) supports 7 dedicated sheets/tabs:

| Sheet Name | Purpose & Contents |
| :--- | :--- |
| **`Config`** | Store settings (Admin password, owner email, currency symbol, site URL) |
| **`Orders`** | Customer order records (Timestamp, Order ID, Customer Name, Phone, Email, Items, Total, Status, Payment Status) |
| **`Inventory`** | Stock levels & reorder alerts (Variant ID, Product ID, Size, Available Stock, Reorder Level) |
| **`Products`** | Product catalog (Product ID, Name, Category, Description, Image URL, Badge) |
| **`Prices`** | Price master (Variant ID, Product ID, Size, Standard Price, Discount Price) |
| **`Users`** | Registered user accounts & roles (User ID, Email, Name, Phone, Role: admin/developer/staff/user) |
| **`AnalyticsLogs`** | System audit logs (Timestamp, Action, Level, Details, User, Location, Path) |

---

## 🚀 How to Enable Multi-Sheet Live Scripting

### Method 1: Google Sheets Cloud Sync (Recommended for 24/7 Web App)

1. **Upload your Excel File**:
   - Go to [Google Drive](https://drive.google.com).
   - Upload `C:\Users\DELL\OneDrive\house of nuts.xlsx`.
   - Double-click to open it in **Google Sheets**.

2. **Paste Backend Script**:
   - Inside Google Sheets, click **Extensions** → **Apps Script**.
   - Copy all code from your project file: [docs/apps-script.js](file:///c:/Users/DELL/OneDrive/Desktop/houseofnuts/docs/apps-script.js).
   - Paste it into `Code.gs` and click **Save** (`Ctrl + S`).

3. **Configure Config Sheet**:
   - On the `Config` tab of your spreadsheet, set your admin password:
     - Row 1: `key` \| `value`
     - Row 2: `adminPassword` \| `YourSecretAdminPassword123`
     - Row 3: `ownerEmail` \| `your-email@gmail.com`

4. **Deploy Web App**:
   - Click **Deploy** → **New Deployment**.
   - Select type: **Web App**.
   - Set **Execute as**: *Me*.
   - Set **Who has access**: *Anyone*.
   - Click **Deploy** and copy the Web App URL.

5. **Connect to Application**:
   - In your `houseofnuts` project, open `.env` and set:
     ```env
     VITE_APPS_SCRIPT_URL="https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec"
     ```

---

## 💻 Method 2: Local Excel Sync Script (`scripts/excelServer.js`)

If you want to sync directly with **`C:\Users\DELL\OneDrive\house of nuts.xlsx`** on your local machine, we provide a local sync helper script that reads and writes `.xlsx` worksheets directly.

To run local sync:
```bash
node scripts/excelServer.js
```

This will automatically create and update the worksheets inside `C:\Users\DELL\OneDrive\house of nuts.xlsx` whenever local orders or inventory updates take place!
