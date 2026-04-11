import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import fs from 'fs';
import path from 'path';

interface InvoiceData {
  orderNumber: string;
  date: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  billingAddress?: string;
  shippingAddress?: string;
  paymentMethod?: string;
  notes?: string;
  items: Array<{
    name: string;
    sku?: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  totalAmount: number;
  shippingAmount: number;
  taxAmount: number;
}

export const generateInvoicePDF = async (data: InvoiceData): Promise<Buffer> => {
  const doc = new jsPDF();

  const brand = {
    name: 'Paras Pharmacy Supplier',
    tagline: 'Premium B2B Pharmaceutical Supplier',
    phone: '416-575-7598',
    fax: '905-475-2868',
    website: 'www.paraspharmacysupplier.ca',
    emailOrders: process.env.SMTP_FROM || process.env.SMTP_USER || 'verify@paraspharmacysupplier.ca',
    emailGeneral: 'contact@paraspharmacy.ca',
    addressLine: 'Toronto, Ontario, Canada',
    currency: 'CAD',
  };
  
  // Load brand assets
  let logoBase64 = '';
  let sealBase64 = '';
  try {
    const logoPath = path.join(process.cwd(), 'public', 'brand-logo.png');
    const sealPath = path.join(process.cwd(), 'public', 'assets', 'paras_blue_seal.png');
    
    if (fs.existsSync(logoPath)) {
      logoBase64 = fs.readFileSync(logoPath, { encoding: 'base64' });
    }
    if (fs.existsSync(sealPath)) {
      sealBase64 = fs.readFileSync(sealPath, { encoding: 'base64' });
    }
  } catch (error) {
    console.error('Error loading invoice assets:', error);
  }

  // Header Branding
  doc.setFillColor(14, 165, 233); // Sky-500
  doc.rect(0, 0, 210, 46, 'F');

  doc.setTextColor(255, 255, 255);
  if (logoBase64) {
    doc.addImage(`data:image/png;base64,${logoBase64}`, 'PNG', 18, 10, 22, 22);
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(brand.name, 44, 20);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(brand.tagline, 44, 28);

  doc.setFontSize(9);
  doc.text(`Phone: ${brand.phone}  |  Fax: ${brand.fax}`, 44, 36);
  doc.text(`${brand.website}  |  ${brand.emailOrders}`, 44, 42);

  // Invoice Title + meta
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('INVOICE', 190, 64, { align: 'right' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(`Invoice #: ${data.orderNumber}`, 190, 72, { align: 'right' });
  doc.text(`Date: ${data.date}`, 190, 78, { align: 'right' });
  if (data.paymentMethod) {
    doc.text(`Payment: ${data.paymentMethod}`, 190, 84, { align: 'right' });
  }

  // Company address
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(brand.addressLine, 20, 64);

  // Billing / Shipping blocks (horizontal, better space usage)
  const boxTop = 92;
  const boxHeight = 42;
  const colGap = 8;
  const leftX = 20;
  const rightX = 20 + (170 - colGap) / 2 + colGap;
  const boxWidth = (170 - colGap) / 2;

  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(leftX, boxTop, boxWidth, boxHeight, 3, 3, 'FD');
  doc.roundedRect(rightX, boxTop, boxWidth, boxHeight, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text('BILL TO', leftX + 4, boxTop + 8);
  doc.text('SHIP TO', rightX + 4, boxTop + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);

  // Wrap long addresses to fit box width
  const wrapText = (text: string, maxWidth: number) => {
    if (!text) return [];
    return doc.splitTextToSize(text, maxWidth, { fontSize: 9 });
  };

  const billLines = [
    data.customerName || 'Valued Customer',
    data.customerEmail || 'N/A',
    data.customerPhone || '',
    ...(data.billingAddress ? wrapText(data.billingAddress, boxWidth - 8) : [])
  ].filter(Boolean);

  const shipLines = [
    data.customerName || 'Valued Customer',
    ...(data.shippingAddress ? wrapText(data.shippingAddress, boxWidth - 8) : (data.billingAddress ? wrapText(data.billingAddress, boxWidth - 8) : []))
  ].filter(Boolean);

  let billY = boxTop + 16;
  const maxLines = 4;
  for (const line of billLines.slice(0, maxLines)) {
    if (typeof line === 'string') {
      doc.text(String(line), leftX + 4, billY);
      billY += 5;
    } else if (Array.isArray(line)) {
      for (const subLine of line) {
        doc.text(String(subLine), leftX + 4, billY);
        billY += 5;
      }
    }
  }

  let shipY = boxTop + 16;
  for (const line of shipLines.slice(0, maxLines)) {
    if (typeof line === 'string') {
      doc.text(String(line), rightX + 4, shipY);
      shipY += 5;
    } else if (Array.isArray(line)) {
      for (const subLine of line) {
        doc.text(String(subLine), rightX + 4, shipY);
        shipY += 5;
      }
    }
  }

  // Line items table (responsive)
  const tableRows = data.items.map(item => [
    item.sku ? `${item.name}\n${item.sku}` : item.name,
    item.quantity.toString(),
    `$${item.price.toFixed(2)}`,
    `$${item.total.toFixed(2)}`
  ]);

  // Dynamic column widths based on page and item count
  const availableWidth = 170; // (210 - 20*2 margins)
  const itemColWidth = Math.max(60, Math.min(95, availableWidth * 0.55));
  const qtyColWidth = 18;
  const priceColWidth = 28;
  const totalColWidth = availableWidth - itemColWidth - qtyColWidth - priceColWidth;

  autoTable(doc, {
    startY: boxTop + boxHeight + 12,
    head: [['Item', 'Qty', 'Unit Price', 'Line Total']],
    body: tableRows,
    headStyles: { fillColor: [14, 165, 233], textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 20, right: 20 },
    styles: { fontSize: 9, textColor: [30, 41, 59], cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: itemColWidth, cellPadding: { left: 3, right: 3 } },
      1: { cellWidth: qtyColWidth, halign: 'right', cellPadding: { left: 2, right: 3 } },
      2: { cellWidth: priceColWidth, halign: 'right', cellPadding: { left: 2, right: 3 } },
      3: { cellWidth: totalColWidth, halign: 'right', cellPadding: { left: 2, right: 3 } },
    },
    didParseCell: (data) => {
      // Wrap long item names
      if (data.section === 'body' && data.column.index === 0) {
        const cell = data.cell;
        const txt = cell.raw || '';
        if (typeof txt === 'string' && txt.length > 60) {
          cell.text = doc.splitTextToSize(txt, itemColWidth - 6, { fontSize: 9 });
        }
      }
    },
    // Ensure table does not exceed page
    pageBreak: 'auto',
    rowPageBreak: 'avoid',
  });

  // Totals (responsive placement)
  let tableEndY = (doc as any).lastAutoTable.finalY || boxTop + boxHeight + 60;
  const pageHeight = doc.internal.pageSize.height;
  const minBottomSpace = 50; // space needed for footer + notes
  const totalsTop = Math.max(tableEndY + 10, pageHeight - 120);
  const subtotal = data.totalAmount - (data.shippingAmount + data.taxAmount);

  // Add new page if needed before totals
  if (totalsTop > pageHeight - 60) {
    doc.addPage();
    // Repeat header on new page
    doc.setFillColor(14, 165, 233);
    doc.rect(0, 0, 210, 46, 'F');
    doc.setTextColor(255, 255, 255);
    if (logoBase64) {
      doc.addImage(`data:image/png;base64,${logoBase64}`, 'PNG', 18, 10, 22, 22);
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text(brand.name, 44, 20);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(brand.tagline, 44, 28);
    doc.setFontSize(9);
    doc.text(`Phone: ${brand.phone}  |  Fax: ${brand.fax}`, 44, 36);
    doc.text(`${brand.website}  |  ${brand.emailOrders}`, 44, 42);
    // Reset tableEndY for new page
    tableEndY = 60;
  }

  // Totals box
  const totalsBoxWidth = 70;
  const totalsBoxX = 210 - 20 - totalsBoxWidth;
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(totalsBoxX, totalsTop, totalsBoxWidth, 40, 3, 3, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);

  doc.text('Subtotal', totalsBoxX + 6, totalsTop + 10);
  doc.text(`$${subtotal.toFixed(2)}`, totalsBoxX + totalsBoxWidth - 4, totalsTop + 10, { align: 'right' });

  doc.text('Shipping', totalsBoxX + 6, totalsTop + 18);
  doc.text(`$${data.shippingAmount.toFixed(2)}`, totalsBoxX + totalsBoxWidth - 4, totalsTop + 18, { align: 'right' });

  doc.text('Tax', totalsBoxX + 6, totalsTop + 26);
  doc.text(`$${data.taxAmount.toFixed(2)}`, totalsBoxX + totalsBoxWidth - 4, totalsTop + 26, { align: 'right' });

  doc.setLineWidth(0.5);
  doc.line(totalsBoxX + 6, totalsTop + 30, totalsBoxX + totalsBoxWidth - 4, totalsTop + 30);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(14, 165, 233);
  doc.text('Total', totalsBoxX + 6, totalsTop + 38);
  doc.text(`$${data.totalAmount.toFixed(2)} ${brand.currency}`, totalsBoxX + totalsBoxWidth - 4, totalsTop + 38, { align: 'right' });

  // Seal (if space)
  if (sealBase64 && totalsTop + 52 < pageHeight - 20) {
    doc.addImage(`data:image/png;base64,${sealBase64}`, 'PNG', 20, totalsTop + 2, 28, 28);
  }

  // Notes (responsive wrapping)
  const notesY = totalsTop + 52;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  const notes = data.notes || 'Thank you for your business. For questions about this invoice, please contact us.';
  const maxNotesWidth = 170;
  const wrappedNotes = doc.splitTextToSize(notes, maxNotesWidth, { fontSize: 9 });
  const notesHeight = wrappedNotes.length * 5; // approximate line height

  // Add new page if notes won't fit
  if (notesY + notesHeight > pageHeight - 30) {
    doc.addPage();
    doc.text(wrappedNotes, 20, 70);
  } else {
    doc.text(wrappedNotes, 20, notesY);
  }

  // Footer (always at bottom)
  const footerY = pageHeight - 25;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(`© ${new Date().getFullYear()} ${brand.name}. All rights reserved.`, 105, footerY, { align: 'center' });
  doc.text(
    `${brand.addressLine}  |  Phone: ${brand.phone}  |  Fax: ${brand.fax}`,
    105,
    footerY + 5,
    { align: 'center' }
  );
  doc.text(`${brand.website}  |  ${brand.emailGeneral}`, 105, footerY + 10, { align: 'center' });

  return Buffer.from(doc.output('arraybuffer'));
};
