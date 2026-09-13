import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { BUSINESS_INFO } from "./businessInfo";

export interface BillPdfData {
  billNumber: string;
  billType: "estimate" | "final";
  date: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string | null;
  items: Array<{
    name: string;
    unit: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  subtotal: number;
  discount: number;
  total: number;
  notes?: string | null;
}

// ---- Number to Indian words ----
function numToWords(num: number): string {
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  const twoDigit = (n: number): string => {
    if (n < 20) return ones[n];
    return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
  };
  const threeDigit = (n: number): string => {
    const h = Math.floor(n / 100);
    const r = n % 100;
    return (h ? ones[h] + " Hundred" + (r ? " " : "") : "") + (r ? twoDigit(r) : "");
  };

  const rupees = Math.floor(num);
  const paise = Math.round((num - rupees) * 100);

  if (rupees === 0 && paise === 0) return "Zero Only";

  const crore = Math.floor(rupees / 10000000);
  const lakh = Math.floor((rupees % 10000000) / 100000);
  const thousand = Math.floor((rupees % 100000) / 1000);
  const hundred = rupees % 1000;

  let words = "";
  if (crore) words += threeDigit(crore) + " Crore ";
  if (lakh) words += twoDigit(lakh) + " Lakh ";
  if (thousand) words += twoDigit(thousand) + " Thousand ";
  if (hundred) words += threeDigit(hundred);
  words = words.trim();

  let result = "INR " + words + (paise ? " and " + twoDigit(paise) + " Paise" : "") + " Only";
  return result.replace(/\s+/g, " ");
}

export function generateBillPdf(data: BillPdfData): Blob {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const M = 8;
  const isEstimate = data.billType === "estimate";

  // ---- Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(isEstimate ? "ESTIMATE" : "TAX INVOICE", pageW / 2, M + 5, { align: "center" });

  // ---- Outer border start
  let y = M + 9;
  doc.setLineWidth(0.3);
  doc.rect(M, y, pageW - M * 2, pageH - y - M);

  // ---- Top section: seller (left) | invoice meta (right)
  const headerH = 48;
  const sellerW = (pageW - M * 2) * 0.55;
  const metaW = (pageW - M * 2) * 0.45;

  // vertical divider
  doc.line(M + sellerW, y, M + sellerW, y + headerH);
  // horizontal under header
  doc.line(M, y + headerH, pageW - M, y + headerH);

  // Seller block
  let sy = y + 5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(BUSINESS_INFO.name, M + 3, sy);
  sy += 4.5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text(`Proprietor: ${BUSINESS_INFO.proprietor}`, M + 3, sy);
  sy += 4;
  const addrLines = doc.splitTextToSize(BUSINESS_INFO.address, sellerW - 6);
  addrLines.forEach((ln: string) => {
    doc.text(ln, M + 3, sy);
    sy += 3.8;
  });
  doc.text(`Mobile: ${BUSINESS_INFO.mobiles.join(", ")}`, M + 3, sy);
  sy += 4;
  doc.text(`FSSAI No: ${BUSINESS_INFO.fssai}`, M + 3, sy);
  sy += 4;
  doc.text("State: Andhra Pradesh", M + 3, sy);

  // Meta block (right): grid of cells
  const metaX = M + sellerW;
  const metaCellH = headerH / 3;
  const metaColW = metaW / 2;
  // horizontal lines inside meta
  doc.line(metaX, y + metaCellH, pageW - M, y + metaCellH);
  doc.line(metaX, y + metaCellH * 2, pageW - M, y + metaCellH * 2);
  // vertical line in meta
  doc.line(metaX + metaColW, y, metaX + metaColW, y + headerH);

  const metaCell = (col: number, row: number, label: string, value: string) => {
    const cx = metaX + col * metaColW + 2;
    const cy = y + row * metaCellH + 4;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.text(label, cx, cy);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(value, cx, cy + 5);
  };
  metaCell(0, 0, isEstimate ? "Estimate No." : "Invoice No.", data.billNumber);
  metaCell(1, 0, "Dated", data.date);
  metaCell(0, 1, "Mode/Terms of Payment", "Cash");
  metaCell(1, 1, "Reference", "-");
  metaCell(0, 2, "Buyer's Order No.", "-");
  metaCell(1, 2, "Dispatched Through", "Counter");

  // ---- Buyer section
  y += headerH;
  const buyerH = 30;
  doc.line(M + sellerW, y, M + sellerW, y + buyerH);
  doc.line(M, y + buyerH, pageW - M, y + buyerH);

  // Buyer (Bill to) - left
  let by = y + 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Buyer (Bill to)", M + 3, by);
  by += 4.5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(data.customerName, M + 3, by);
  by += 4.5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  if (data.customerAddress) {
    const cAddr = doc.splitTextToSize(data.customerAddress, sellerW - 6);
    cAddr.slice(0, 2).forEach((ln: string) => {
      doc.text(ln, M + 3, by);
      by += 3.8;
    });
  }
  doc.text(`Contact: ${data.customerPhone}`, M + 3, by);

  // Right: place of supply / state
  let py = y + 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.text("Place of Supply", metaX + 2, py);
  py += 4;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Andhra Pradesh", metaX + 2, py);
  py += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.text("Terms of Delivery", metaX + 2, py);
  py += 4;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Immediate", metaX + 2, py);

  // ---- Items table
  y += buyerH;
  autoTable(doc, {
    startY: y,
    head: [["Sl\nNo.", "Description of Goods", "HSN", "Quantity", "Rate", "per", "Amount"]],
    body: data.items.map((it, i) => [
      String(i + 1),
      it.name,
      "0801",
      `${it.quantity} ${it.unit}`,
      it.price.toFixed(2),
      it.unit,
      it.total.toFixed(2),
    ]),
    theme: "grid",
    margin: { left: M, right: M },
    tableWidth: pageW - M * 2,
    styles: { fontSize: 9, cellPadding: 2, lineColor: [0, 0, 0], lineWidth: 0.2, textColor: [0, 0, 0] },
    headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: "bold", halign: "center" },
    columnStyles: {
      0: { cellWidth: 12, halign: "center" },
      1: { cellWidth: 70, fontStyle: "bold" },
      2: { cellWidth: 18, halign: "center" },
      3: { cellWidth: 25, halign: "right" },
      4: { cellWidth: 22, halign: "right" },
      5: { cellWidth: 14, halign: "center" },
      6: { halign: "right", fontStyle: "bold" },
    },
  });

  let ay = (doc as any).lastAutoTable.finalY;
  const innerL = M;
  const innerR = pageW - M;
  const innerW = pageW - M * 2;

  // ---- Totals rows (continue inside outer border)
  const drawTotalRow = (label: string, value: string, opts?: { bold?: boolean; fill?: boolean }) => {
    const rowH = 7;
    if (opts?.fill) {
      doc.setFillColor(240, 240, 240);
      doc.rect(innerL, ay, innerW, rowH, "F");
    }
    doc.setLineWidth(0.2);
    doc.line(innerL, ay, innerR, ay);
    doc.line(innerL, ay + rowH, innerR, ay + rowH);
    // vertical separator before amount
    doc.line(innerR - 35, ay, innerR - 35, ay + rowH);
    doc.setFont("helvetica", opts?.bold ? "bold" : "normal");
    doc.setFontSize(opts?.bold ? 10 : 9);
    doc.text(label, innerR - 37, ay + 4.8, { align: "right" });
    doc.text(value, innerR - 2, ay + 4.8, { align: "right" });
    ay += rowH;
  };

  drawTotalRow("Subtotal", `Rs. ${data.subtotal.toFixed(2)}`);
  if (data.discount > 0) drawTotalRow("Discount", `- Rs. ${data.discount.toFixed(2)}`);
  drawTotalRow("TOTAL", `Rs. ${data.total.toFixed(2)}`, { bold: true, fill: true });

  // ---- Amount in words band
  const wordsH = 12;
  doc.line(innerL, ay, innerR, ay);
  doc.line(innerL, ay + wordsH, innerR, ay + wordsH);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Amount Chargeable (in words)", innerL + 3, ay + 4.5);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  const wordsText = numToWords(data.total);
  doc.text(wordsText, innerL + 3, ay + 9.5);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.text("E. & O.E", innerR - 3, ay + 4.5, { align: "right" });
  ay += wordsH;

  // ---- Notes
  if (data.notes) {
    const nlines = doc.splitTextToSize(`Note: ${data.notes}`, innerW - 6);
    const nh = nlines.length * 4 + 4;
    doc.line(innerL, ay + nh, innerR, ay + nh);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.text(nlines, innerL + 3, ay + 4.5);
    ay += nh;
  }

  // ---- Declaration + signatory
  const footerStartY = ay;
  const footerH = pageH - M - footerStartY;
  const decW = innerW * 0.6;

  // vertical split
  doc.line(innerL + decW, footerStartY, innerL + decW, pageH - M);

  // Declaration left
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("Declaration", innerL + 3, footerStartY + 5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  const decl = isEstimate
    ? "This is an estimate / quotation only and not a tax invoice. Prices are subject to change without prior notice."
    : "We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.";
  const dlines = doc.splitTextToSize(decl, decW - 6);
  doc.text(dlines, innerL + 3, footerStartY + 10);

  // Signatory right
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(`for ${BUSINESS_INFO.name}`, innerR - 3, footerStartY + 6, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text("Authorised Signatory", innerR - 3, pageH - M - 4, { align: "right" });

  // Bottom centered note
  doc.setFont("helvetica", "italic");
  doc.setFontSize(7.5);
  doc.text("This is a Computer Generated Invoice", pageW / 2, pageH - M - 1, { align: "center" });

  return doc.output("blob");
}
