import { transport, defaultFrom } from './transport';
import { generateBrandedTemplate } from './templates/base';
import { generateInvoicePDF } from './invoice';
import { createClient } from '@/lib/supabase/server';

interface Attachment {
  filename: string;
  content: Buffer;
}

interface OrderItem {
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface OrderData {
  id: string;
  order_number?: string;
  customer_email: string;
  customer_name?: string;
  items: OrderItem[];
  total_amount: number;
  shipping_amount?: number;
  tax_amount?: number;
  created_at: string;
}

export const sendOrderConfirmationEmail = async (order: OrderData) => {
  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #f1f5f9;">${item.product_name} x ${item.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #f1f5f9; text-align: right;">$${item.total_price.toFixed(2)}</td>
    </tr>
  `).join('');

  const content = `
    <p>Hello,</p>
    <p>Thank you for your order with <strong>Paras Pharmacy Supplier</strong>. We have received your order and it is currently being processed.</p>
    <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #334155;">Order Summary (#${order.order_number || order.id.slice(0, 8)})</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="text-align: left; color: #64748b; font-size: 12px; text-transform: uppercase;">
            <th style="padding: 8px; border-bottom: 2px solid #e2e8f0;">Item</th>
            <th style="padding: 8px; border-bottom: 2px solid #e2e8f0; text-align: right;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
        <tfoot>
          <tr>
            <td style="padding: 15px 8px 0; font-weight: bold; font-size: 16px;">Total</td>
            <td style="padding: 15px 8px 0; font-weight: bold; font-size: 16px; text-align: right;">$${order.total_amount.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
    <p>Please find your itemized invoice attached to this email.</p>
    <p>A representative will contact you shortly if any items are out of stock or require further verification.</p>
  `;

  const html = generateBrandedTemplate(
    'Order Confirmation',
    content,
    `${process.env.NEXT_PUBLIC_APP_URL}/customer/orders/${order.id}`,
    'View Order Details'
  );

  // Generate PDF attachment
  const pdfBuffer = await generateInvoicePDF({
    orderNumber: order.order_number || order.id.slice(0, 8),
    date: new Date(order.created_at).toLocaleDateString(),
    customerName: order.customer_name || 'Valued Customer',
    customerEmail: order.customer_email,
    items: order.items.map(i => ({
      name: i.product_name,
      quantity: i.quantity,
      price: i.unit_price,
      total: i.total_price
    })),
    totalAmount: order.total_amount,
    shippingAmount: order.shipping_amount || 0,
    taxAmount: order.tax_amount || 0
  });

  return transport.sendMail({
    from: defaultFrom,
    to: order.customer_email,
    subject: `Order Confirmation - #${order.order_number || order.id.slice(0, 8)} - Paras Pharmacy Supplier`,
    html,
    attachments: [
      {
        filename: `Invoice_${order.order_number || order.id.slice(0, 8)}.pdf`,
        content: pdfBuffer
      }
    ]
  });
};

export const sendAdminOrderAlert = async (order: OrderData) => {
  const supabase = await createClient();
  
  // Fetch all admin emails from the database
  const { data: adminList } = await supabase
    .from('admin_emails')
    .select('email');
    
  const adminEmails = adminList?.map(a => a.email) || [process.env.SMTP_USER || 'verify@paraspharmacysupplier.ca'];

  const content = `
    <p>A new order has been placed by <strong>${order.customer_email}</strong>.</p>
    <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #fcd34d;">
      <h3 style="margin-top: 0; color: #92400e;">New Order Details</h3>
      <p><strong>Order ID:</strong> ${order.id}</p>
      <p><strong>Order Number:</strong> ${order.order_number || 'N/A'}</p>
      <p><strong>Customer:</strong> ${order.customer_email}</p>
      <p><strong>Total Amount:</strong> $${order.total_amount.toFixed(2)}</p>
      <p><strong>Items Count:</strong> ${order.items.length}</p>
      <p><strong>Time:</strong> ${new Date(order.created_at).toLocaleString()}</p>
    </div>
    <p>The itemized invoice is attached for your records.</p>
  `;

  const html = generateBrandedTemplate(
    'New Order Received',
    content,
    `${process.env.NEXT_PUBLIC_APP_URL}/admin/orders/${order.id}`,
    'Process Order in Admin Panel'
  );

  // Generate PDF attachment
  const pdfBuffer = await generateInvoicePDF({
    orderNumber: order.order_number || order.id.slice(0, 8),
    date: new Date(order.created_at).toLocaleDateString(),
    customerName: order.customer_name || 'Valued Customer',
    customerEmail: order.customer_email,
    items: order.items.map(i => ({
      name: i.product_name,
      quantity: i.quantity,
      price: i.unit_price,
      total: i.total_price
    })),
    totalAmount: order.total_amount,
    shippingAmount: order.shipping_amount || 0,
    taxAmount: order.tax_amount || 0
  });

  return transport.sendMail({
    from: defaultFrom,
    to: adminEmails,
    subject: `[NEW ORDER] #${order.order_number || order.id.slice(0, 8)} from ${order.customer_email}`,
    html,
    attachments: [
      {
        filename: `Order_${order.order_number || order.id.slice(0, 8)}.pdf`,
        content: pdfBuffer
      }
    ]
  });
};

export const sendOrderStatusUpdate = async (
  customerEmail: string, 
  orderId: string, 
  status: string,
  customMessage?: string,
  attachments?: Attachment[]
) => {
  const supabase = await createClient();
  const { data: adminList } = await supabase.from('admin_emails').select('email');
  const adminEmails = adminList?.map(a => a.email) || [process.env.SMTP_USER || 'verify@paraspharmacysupplier.ca'];

  const titles: Record<string, string> = {
    confirmed: 'Order Confirmed',
    processing: 'Order Processing',
    shipped: 'Order Shipped',
    delivered: 'Order Delivered',
    cancelled: 'Order Cancelled',
    out_of_stock: 'Items Out of Stock',
    rejected: 'Order Rejected'
  };

  const messages: Record<string, string> = {
    confirmed: 'Great news! Your order has been confirmed and is being prepared for dispatch.',
    processing: 'Your order is now being processed by our pharmacy team.',
    shipped: 'Your order has been shipped and is on its way to you.',
    delivered: 'Your order has been delivered successfully. Thank you for choosing Paras!',
    cancelled: 'Your order has been cancelled.',
    out_of_stock: 'Some items in your order are currently out of stock. We will contact you shortly.',
    rejected: 'We regret to inform you that your order could not be processed at this time.'
  };

  const title = titles[status] || 'Order Update';
  const message = messages[status] || `Your order status has been updated to: ${status}`;

  const content = `
    <p>Hello,</p>
    <p>${message}</p>
    ${customMessage ? `<div style="padding: 15px; background: #f1f5f9; border-radius: 8px; border-left: 4px solid #0ea5e9; margin: 15px 0;"><strong>Message from Team:</strong> ${customMessage}</div>` : ''}
    <p>Order ID: #${orderId.slice(0, 8)}</p>
  `;

  const html = generateBrandedTemplate(
    title,
    content,
    `${process.env.NEXT_PUBLIC_APP_URL}/customer/orders/${orderId}`,
    'View Order'
  );

  // Send to Customer
  const customerMail = transport.sendMail({
    from: defaultFrom,
    to: customerEmail,
    subject: `Update on Order #${orderId.slice(0, 8)} - Paras Pharmacy Supplier`,
    html,
    attachments,
  });

  // If cancelled or rejected, also notify admins
  if (['cancelled', 'rejected'].includes(status)) {
    const adminContent = `
      <p>Order <strong>#${orderId.slice(0, 8)}</strong> has been marked as <strong>${status.toUpperCase()}</strong>.</p>
      <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #fee2e2;">
        <p><strong>Status:</strong> ${status}</p>
        <p><strong>Customer:</strong> ${customerEmail}</p>
        ${customMessage ? `<p><strong>Reason/Note:</strong> ${customMessage}</p>` : ''}
      </div>
    `;

    const adminHtml = generateBrandedTemplate(
      `Order ${status.charAt(0).toUpperCase() + status.slice(1)} Alert`,
      adminContent,
      `${process.env.NEXT_PUBLIC_APP_URL}/admin/orders/${orderId}`,
      'View in Admin Panel'
    );

    await transport.sendMail({
      from: defaultFrom,
      to: adminEmails,
      subject: `[${status.toUpperCase()}] Order Alert - #${orderId.slice(0, 8)}`,
      html: adminHtml,
    });
  }

  return customerMail;
};
