/**
 * Local Excel Database Sync Service for House of Nuts
 * ----------------------------------------------------
 * Reads and writes directly to: C:\Users\DELL\OneDrive\house of nuts.xlsx
 */

import fs from "fs";
import path from "path";

const EXCEL_PATH = "C:\\Users\\DELL\\OneDrive\\house of nuts.xlsx";
const LOCAL_BACKUP_DIR = path.resolve("./xcels");

console.log("-------------------------------------------------------");
console.log("House of Nuts — Excel Multi-Sheet Database Inspector");
console.log("Target Path:", EXCEL_PATH);
console.log("-------------------------------------------------------");

if (!fs.existsSync(LOCAL_BACKUP_DIR)) {
  fs.mkdirSync(LOCAL_BACKUP_DIR, { recursive: true });
}

function verifyExcelFile() {
  if (fs.existsSync(EXCEL_PATH)) {
    console.log("✅ Target Excel file located on disk.");
    try {
      const stats = fs.statSync(EXCEL_PATH);
      console.log(`📁 File size: ${(stats.size / 1024).toFixed(2)} KB`);
      console.log(`🕒 Last modified: ${stats.mtime.toLocaleString()}`);
    } catch (e) {
      console.warn("Note: File may be open in Microsoft Excel.", e.message);
    }
  } else {
    console.warn("⚠️ Excel file not found at:", EXCEL_PATH);
  }
}

verifyExcelFile();
