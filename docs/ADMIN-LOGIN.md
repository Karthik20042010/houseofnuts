# Setting up your admin login (2 minutes, free)

Your admin password lives in your own Google spreadsheet — nowhere in the website
code — so only you can see or change it.

## Steps

1. Open your orders spreadsheet:
   https://docs.google.com/spreadsheets/d/1zAyptCDzPE5V-GO4y-kS1s5OUaQ0lPY4tB8j_saD17w/edit
2. At the bottom, click the tab named **Config**.
   (If you don't see it, place one order on the site or open the admin page once —
   the tab is created automatically.)
3. Find the row where column A says `adminPassword`.
4. In column B of that row, type the password you want, e.g. `HouseOfNuts@2026`.
5. Also fill `ownerEmail` with your email so you get order and message alerts.
6. Close the sheet (it saves by itself).

## Logging in

- Go to `/admin/login` on your site.
- Choose the role: **Admin** (full access), **Developer**, or **Staff**.
- Enter the password from step 4.

Once inside you can update order statuses, reply to and mark customer messages,
manage stock, prices and images.

## Tips

- Use a strong password: letters, numbers and a symbol.
- To change it later, just edit the same cell — the old one stops working instantly.
- Sessions expire automatically after 8 hours or when the browser tab is closed.
