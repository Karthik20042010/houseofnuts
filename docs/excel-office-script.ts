/**
 * House of Nuts — Microsoft Excel Office Script (Strict OfficeScript Standard)
 * -----------------------------------------------------------------------------
 * Designed for Microsoft Excel: Automate → New Script
 * Automatically sets up and maintains all 7 database tabs.
 */

function main(workbook: ExcelScript.Workbook) {
  interface SheetConfig {
    name: string;
    headers: string[];
    defaultRows: string[][];
  }

  const sheetsToEnsure: SheetConfig[] = [
    {
      name: "Config",
      headers: ["key", "value"],
      defaultRows: [
        ["adminPassword", "AdminSecret123"],
        ["ownerEmail", "owner@houseofnuts.in"],
        ["siteUrl", "https://houseofnuts.in"],
      ],
    },
    {
      name: "Orders",
      headers: [
        "timestamp",
        "orderId",
        "name",
        "phone",
        "email",
        "address",
        "notes",
        "itemsSummary",
        "total",
        "status",
        "paymentStatus",
        "itemsJson",
      ],
      defaultRows: [],
    },
    {
      name: "Inventory",
      headers: ["variantId", "productId", "size", "stock", "reorderLevel"],
      defaultRows: [],
    },
    {
      name: "Products",
      headers: ["productId", "name", "category", "description", "image", "badge"],
      defaultRows: [],
    },
    {
      name: "Prices",
      headers: ["variantId", "productId", "size", "price", "discountPrice"],
      defaultRows: [],
    },
    {
      name: "Users",
      headers: ["userId", "email", "name", "phone", "role", "password", "createdAt"],
      defaultRows: [],
    },
    {
      name: "AnalyticsLogs",
      headers: ["timestamp", "action", "level", "details", "userName", "location", "path"],
      defaultRows: [],
    },
  ];

  sheetsToEnsure.forEach((item: SheetConfig) => {
    let sheet: ExcelScript.Worksheet | undefined = workbook.getWorksheet(item.name);
    if (!sheet) {
      sheet = workbook.addWorksheet(item.name);
    }

    const used: ExcelScript.Range | undefined = sheet.getUsedRange();
    if (!used) {
      const colLetter: string = String.fromCharCode(64 + item.headers.length);
      const headerRange: ExcelScript.Range = sheet.getRange(`A1:${colLetter}1`);
      headerRange.setValues([item.headers]);
      headerRange.getFormat().getFont().setBold(true);

      if (item.defaultRows.length > 0) {
        const rowCount: number = item.defaultRows.length;
        const dataRange: ExcelScript.Range = sheet.getRange(`A2:${colLetter}${1 + rowCount}`);
        dataRange.setValues(item.defaultRows);
      }
    }
  });

  console.log("✅ Excel Multi-Sheet Database Initialization & Headers Ready!");
}
