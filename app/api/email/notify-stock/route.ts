import { NextRequest, NextResponse } from 'next/server';
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

export async function POST(request: NextRequest) {
  try {
    const { email, productName, productId } = await request.json();

    if (!email || !productId) {
      return NextResponse.json({ error: 'Missing email or productId' }, { status: 400 });
    }

    // Import Supabase server client
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();

    // Get product details
    const { data: product } = await supabase
      .from('products')
      .select('name, stock_quantity')
      .eq('id', productId)
      .single();

    if (product && product.stock_quantity > 0) {
      return NextResponse.json({ error: 'Product is currently in stock' }, { status: 400 });
    }

    // Check if already registered
    const { error: insertError } = await supabase
      .from('stock_notifications')
      .insert({ product_id: productId, email, user_id: null });

    if (insertError && insertError.code === '23505') {
      return NextResponse.json({ message: 'You are already on the notification list' });
    }

    // Send confirmation email to user
    await transporter.sendMail({
      from: `"Paras Pharmacy Supplier" <${process.env.SMTP_FROM}>`,
      to: email,
      subject: `Back-in-Stock Alert Set – ${productName || product?.name}`,
      html: `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;background:#f0f9ff;padding:40px 20px;">
<div style="max-width:500px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.07);">
  <div style="background:#0284c7;padding:30px;text-align:center;">
    <img src="https://flem.xo.je/uploads/brand-logo_2e73a483.png" alt="Paras Pharmacy Supplier" style="height:50px;" />
  </div>
  <div style="padding:30px;">
    <h2 style="color:#0284c7;margin:0 0 15px;">You're on the list! 🔔</h2>
    <p style="color:#64748b;">We'll email you at <strong>${email}</strong> as soon as <strong>${productName || product?.name}</strong> is back in stock.</p>
    <p style="color:#64748b;font-size:14px;">Thank you for your patience!</p>
  </div>
  <div style="background:#f8fafc;padding:20px;text-align:center;color:#64748b;font-size:12px;">
    <p>Paras Pharmacy Supplier | Toronto, Canada</p>
  </div>
</div>
</body></html>`,
    });

    return NextResponse.json({ success: true, message: 'Notification registered successfully' });
  } catch (error) {
    console.error('Stock notification error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to register notification' },
      { status: 500 }
    );
  }
}
