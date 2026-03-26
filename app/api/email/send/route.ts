import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 465),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

function generateInvoiceHTML(order: any, items: any[], customer: any) {
  const now = new Date().toLocaleDateString('en-CA', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
  const subtotal = items.reduce((s, i) => s + (i.unit_price * i.quantity), 0);
  const tax = subtotal * 0.13; // Ontario HST
  const total = subtotal + tax;

  const rows = items.map(item => `
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:10px 0;">${item.product?.name || 'Product'}</td>
      <td style="padding:10px 0;text-align:center;">${item.quantity}</td>
      <td style="padding:10px 0;text-align:right;">$${Number(item.unit_price).toFixed(2)}</td>
      <td style="padding:10px 0;text-align:right;">$${(item.unit_price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Invoice - ${order.order_number}</title></head>
<body style="font-family:Arial,Helvetica,sans-serif;color:#1a202c;max-width:700px;margin:0 auto;padding:40px 20px;">
  
  <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:40px;">
    <div>
      <img src="https://flem.xo.je/uploads/brand-logo_2e73a483.png" alt="Paras Pharmacy Supplier" style="height:60px;object-fit:contain;" />
      <p style="color:#64748b;margin:8px 0 0;font-size:14px;">Toronto, Canada</p>
      <p style="color:#64748b;margin:2px 0;font-size:14px;">no-reply@paraspharmacysupplier.ca</p>
    </div>
    <div style="text-align:right;">
      <h1 style="font-size:28px;color:#0284c7;margin:0;">INVOICE</h1>
      <p style="color:#64748b;margin:6px 0;font-size:14px;">${order.order_number}</p>
      <p style="color:#64748b;margin:2px 0;font-size:14px;">Date: ${now}</p>
    </div>
  </div>

  <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:20px;margin-bottom:30px;">
    <h3 style="margin:0 0 10px;color:#0284c7;font-size:14px;text-transform:uppercase;letter-spacing:0.5px;">Bill To</h3>
    <p style="margin:0;font-weight:600;">${customer?.full_name || 'Valued Customer'}</p>
    <p style="margin:4px 0;color:#64748b;font-size:14px;">${customer?.company_name || ''}</p>
    <p style="margin:4px 0;color:#64748b;font-size:14px;">${customer?.email || ''}</p>
    <p style="margin:4px 0;color:#64748b;font-size:14px;">${customer?.phone || ''}</p>
  </div>

  <table style="width:100%;border-collapse:collapse;">
    <thead>
      <tr style="background:#0284c7;color:white;">
        <th style="padding:12px 0;text-align:left;font-size:13px;">Item</th>
        <th style="padding:12px 0;text-align:center;font-size:13px;">Qty</th>
        <th style="padding:12px 0;text-align:right;font-size:13px;">Unit Price</th>
        <th style="padding:12px 0;text-align:right;font-size:13px;">Total</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  <div style="margin-top:30px;text-align:right;background:#f8fafc;padding:20px;border-radius:8px;">
    <p style="margin:4px 0;color:#64748b;font-size:14px;">Subtotal: <strong>$${subtotal.toFixed(2)}</strong></p>
    <p style="margin:4px 0;color:#64748b;font-size:14px;">HST (13%): <strong>$${tax.toFixed(2)}</strong></p>
    <p style="margin:10px 0 0;font-size:20px;color:#0284c7;font-weight:700;">Total: $${total.toFixed(2)} CAD</p>
  </div>

  <div style="margin-top:40px;padding-top:20px;border-top:1px solid #e2e8f0;color:#64748b;font-size:12px;text-align:center;">
    <p>Thank you for your business! This invoice was generated automatically by Paras Pharmacy Supplier.</p>
    <p>For questions, contact support@paraspharmacysupplier.ca</p>
  </div>
</body>
</html>`;
}

function getStatusEmailTemplate(type: string, order: any, customer: any, extra?: any) {
  const logo = 'https://flem.xo.je/uploads/brand-logo_2e73a483.png';
  const baseStyle = `font-family:Arial,Helvetica,sans-serif;color:#1a202c;`;
  const headerBg = '#0284c7';

  const wrapper = (content: string) => `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="${baseStyle}background:#f0f9ff;padding:40px 20px;">
<div style="max-width:600px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.07);">
  <div style="background:${headerBg};padding:30px;text-align:center;">
    <img src="${logo}" alt="Paras Pharmacy Supplier" style="height:50px;object-fit:contain;" />
  </div>
  <div style="padding:40px 30px;">
    ${content}
  </div>
  <div style="background:#f8fafc;padding:20px;text-align:center;color:#64748b;font-size:12px;">
    <p>Paras Pharmacy Supplier | Toronto, Canada</p>
    <p>support@paraspharmacysupplier.ca</p>
  </div>
</div>
</body></html>`;

  const greeting = `<p style="color:#64748b;margin-bottom:20px;">Hi <strong>${customer?.full_name || 'Valued Customer'}</strong>,</p>`;

  switch (type) {
    case 'order_confirmation':
      return {
        subject: `Order Confirmed – ${order.order_number} | Paras Pharmacy Supplier`,
        html: wrapper(`
          ${greeting}
          <h2 style="color:#0284c7;margin:0 0 10px;">Your order is confirmed! 🎉</h2>
          <p style="color:#64748b;">Thank you for your order. We're preparing it now!</p>
          <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:20px;margin:20px 0;">
            <p style="margin:4px 0;font-size:14px;"><strong>Order #:</strong> ${order.order_number}</p>
            <p style="margin:4px 0;font-size:14px;"><strong>Status:</strong> Confirmed</p>
            <p style="margin:4px 0;font-size:14px;"><strong>Total:</strong> $${Number(order.total_amount).toFixed(2)} CAD</p>
            <p style="margin:4px 0;font-size:14px;"><strong>Date:</strong> ${new Date(order.created_at).toLocaleDateString('en-CA')}</p>
          </div>
          <p style="color:#64748b;font-size:14px;">Your invoice is attached to this email. You'll receive another email when your order is shipped.</p>
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/customer/orders" style="display:inline-block;margin-top:20px;background:#0284c7;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">Track Your Order</a>
        `)
      };

    case 'order_shipped':
      return {
        subject: `Your Order ${order.order_number} Has Shipped! 🚚`,
        html: wrapper(`
          ${greeting}
          <h2 style="color:#0284c7;">Your order is on its way!</h2>
          <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:20px;margin:20px 0;">
            <p style="margin:4px 0;font-size:14px;"><strong>Order #:</strong> ${order.order_number}</p>
            <p style="margin:4px 0;font-size:14px;"><strong>Tracking #:</strong> ${order.tracking_number || 'Will be updated'}</p>
            <p style="margin:4px 0;font-size:14px;"><strong>Estimated Delivery:</strong> ${order.estimated_delivery ? new Date(order.estimated_delivery).toLocaleDateString('en-CA') : 'Within 3-5 business days'}</p>
          </div>
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/customer/orders" style="display:inline-block;margin-top:20px;background:#0284c7;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">Track Your Order</a>
        `)
      };

    case 'order_delayed':
      return {
        subject: `Update on Your Order ${order.order_number}`,
        html: wrapper(`
          ${greeting}
          <h2 style="color:#f59e0b;">Order Update – Delay Notice</h2>
          <p style="color:#64748b;">We sincerely apologize for the inconvenience. Your order <strong>${order.order_number}</strong> is experiencing a slight delay.</p>
          <div style="background:#fffbeb;border:1px solid #fcd34d;border-radius:8px;padding:20px;margin:20px 0;">
            <p style="margin:4px 0;font-size:14px;">${extra?.message || 'We are working diligently to process and ship your order as soon as possible.'}</p>
          </div>
          <p style="color:#64748b;font-size:14px;">We appreciate your patience. If you have questions, please contact our support team.</p>
        `)
      };

    case 'out_of_stock':
      return {
        subject: `Important Notice About Your Order ${order.order_number}`,
        html: wrapper(`
          ${greeting}
          <h2 style="color:#ef4444;">Item Availability Update</h2>
          <p style="color:#64748b;">We regret to inform you that one or more items in your order <strong>${order.order_number}</strong> are currently out of stock.</p>
          <div style="background:#fef2f2;border:1px solid #fca5a5;border-radius:8px;padding:20px;margin:20px 0;">
            <p style="margin:4px 0;font-size:14px;">${extra?.message || 'We will notify you as soon as the item becomes available, or you may cancel your order for a full refund.'}</p>
          </div>
          <p style="color:#64748b;font-size:14px;">Please contact our support team if you would like to modify or cancel your order.</p>
        `)
      };

    case 'order_delivered':
      return {
        subject: `Order ${order.order_number} Delivered! Thank You 🌟`,
        html: wrapper(`
          ${greeting}
          <h2 style="color:#10b981;">Your order has been delivered!</h2>
          <p style="color:#64748b;">We hope you are satisfied with your purchase from Paras Pharmacy Supplier.</p>
          <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:20px;margin:20px 0;">
            <p style="margin:4px 0;font-size:14px;"><strong>Order #:</strong> ${order.order_number}</p>
            <p style="margin:4px 0;font-size:14px;"><strong>Status:</strong> Delivered</p>
          </div>
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/customer/orders" style="display:inline-block;margin-top:20px;background:#0284c7;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">View Order Details</a>
        `)
      };

    case 'order_cancelled':
      return {
        subject: `Order ${order.order_number} Cancelled`,
        html: wrapper(`
          ${greeting}
          <h2 style="color:#ef4444;">Order Cancellation Confirmation</h2>
          <p style="color:#64748b;">Your order <strong>${order.order_number}</strong> has been cancelled as requested.</p>
          <div style="background:#fef2f2;border:1px solid #fca5a5;border-radius:8px;padding:20px;margin:20px 0;">
            <p style="margin:4px 0;font-size:14px;">${extra?.message || 'If you did not request this cancellation or need assistance, please contact our support team immediately.'}</p>
          </div>
        `)
      };

    default:
      return {
        subject: `Update from Paras Pharmacy Supplier – Order ${order.order_number}`,
        html: wrapper(`${greeting}<p>${extra?.message || 'Thank you for your continued business.'}</p>`)
      };
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Verify admin
    const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
    if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { type, orderId, toEmail, message } = await request.json();

    if (!type || !orderId) {
      return NextResponse.json({ error: 'Missing required fields: type, orderId' }, { status: 400 });
    }

    // Fetch order with items and customer
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, order_items(*, product:products(name, sku))')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Fetch customer profile
    const { data: customer } = await supabase
      .from('profiles')
      .select('full_name, email, company_name, phone, address, city, province, postal_code')
      .eq('id', order.user_id)
      .single();

    // Get auth user email as fallback
    const recipientEmail = toEmail || customer?.email || '';
    if (!recipientEmail) {
      return NextResponse.json({ error: 'No recipient email found' }, { status: 400 });
    }

    const { subject, html } = getStatusEmailTemplate(type, order, customer, { message });

    // Generate invoice for order confirmation
    const attachments: any[] = [];
    if (type === 'order_confirmation') {
      const invoiceHtml = generateInvoiceHTML(order, order.order_items || [], customer);
      attachments.push({
        filename: `Invoice-${order.order_number}.html`,
        content: invoiceHtml,
        contentType: 'text/html',
      });
    }

    // Send email
    await transporter.sendMail({
      from: `"Paras Pharmacy Supplier" <${process.env.SMTP_FROM}>`,
      to: recipientEmail,
      subject,
      html,
      attachments,
    });

    // Log the email
    await supabase.from('email_logs').insert({
      to_email: recipientEmail,
      subject,
      type,
      order_id: orderId,
      status: 'sent',
      metadata: { sent_by: user.id, message },
    });

    return NextResponse.json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Email send error:', error);
    
    // Log failed email
    try {
      const supabase = await createClient();
      const body = await request.json().catch(() => ({}));
      await supabase.from('email_logs').insert({
        to_email: body.toEmail || 'unknown',
        subject: `Failed email - ${body.type}`,
        type: body.type || 'unknown',
        order_id: body.orderId || null,
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error',
      });
    } catch {}

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send email' },
      { status: 500 }
    );
  }
}
