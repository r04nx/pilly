import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import fs from 'fs';
import path from 'path';

interface InvoiceData {
  orderNumber: string;
  date: string;
  customerName: string;
  customerEmail: string;
  items: Array<{
    name: string;
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
  doc.rect(0, 0, 210, 40, 'F');
  
  if (logoBase64) {
    doc.addImage(`data:image/png;base64,${logoBase64}`, 'PNG', 20, 8, 24, 24);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('Paras Pharmacy', 50, 25);
    doc.setFontSize(10);
    doc.text('Premium B2B Pharmaceutical Supplier', 50, 32);
  } else {
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('Paras Pharmacy', 20, 25);
    doc.setFontSize(10);
    doc.text('Premium B2B Pharmaceutical Supplier', 20, 32);
  }

  // Invoice Info
  doc.setTextColor(51, 65, 85);
  doc.setFontSize(18);
  doc.text('INVOICE', 150, 60);
  
  doc.setFontSize(10);
  doc.text(`Invoice #: ${data.orderNumber}`, 150, 70);
  doc.text(`Date: ${data.date}`, 150, 75);

  // Customer Details
  doc.setFontSize(12);
  doc.text('Bill To:', 20, 60);
  doc.setFontSize(10);
  doc.text(data.customerName || 'Valued Customer', 20, 70);
  doc.text(data.customerEmail, 20, 75);

  // Table
  const tableRows = data.items.map(item => [
    item.name,
    item.quantity.toString(),
    `$${item.price.toFixed(2)}`,
    `$${item.total.toFixed(2)}`
  ]);

  autoTable(doc, {
    startY: 90,
    head: [['Product', 'Qty', 'Unit Price', 'Total']],
    body: tableRows,
    headStyles: { fillColor: [14, 165, 233], textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 20, right: 20 },
    styles: { fontSize: 9 }
  });

  // Totals
  const finalY = (doc as any).lastAutoTable.finalY + 15 || 150;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  
  const subtotal = data.totalAmount - (data.shippingAmount + data.taxAmount);
  
  doc.text(`Subtotal:`, 130, finalY);
  doc.text(`$${subtotal.toFixed(2)}`, 190, finalY, { align: 'right' });
  
  doc.text(`Shipping:`, 130, finalY + 8);
  doc.text(`$${data.shippingAmount.toFixed(2)}`, 190, finalY + 8, { align: 'right' });
  
  doc.text(`Tax:`, 130, finalY + 16);
  doc.text(`$${data.taxAmount.toFixed(2)}`, 190, finalY + 16, { align: 'right' });
  
  doc.setLineWidth(0.5);
  doc.setDrawColor(226, 232, 240);
  doc.line(130, finalY + 20, 190, finalY + 20);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(14, 165, 233);
  doc.text(`Total Amount:`, 130, finalY + 28);
  doc.text(`$${data.totalAmount.toFixed(2)} CAD`, 190, finalY + 28, { align: 'right' });

  // Seal
  if (sealBase64) {
    doc.addImage(`data:image/png;base64,${sealBase64}`, 'PNG', 20, finalY, 35, 35);
  }

  // Footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  const footerY = 280;
  doc.text('Thank you for your business!', 105, footerY, { align: 'center' });
  doc.text('Paras Pharmacy | 416-575-7598 | verify@paraspharmacysupplier.ca', 105, footerY + 5, { align: 'center' });

  return Buffer.from(doc.output('arraybuffer'));
};
