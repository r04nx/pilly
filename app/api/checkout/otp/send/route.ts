import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { createAdminClient } from '@/lib/supabase/admin';

const supabase = createAdminClient();

export async function POST(req: Request) {
  try {
    const { email, userId } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

    // Store in DB
    const { error: dbError } = await supabase
      .from('verification_otps')
      .insert({
        user_id: userId,
        email,
        otp_code: otp,
        expires_at: expiresAt
      });

    if (dbError) throw dbError;

    // Send Email
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"Pilly Verification" <${process.env.SMTP_FROM}>`,
      to: email,
      subject: `Your Verification Code: ${otp}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px;">
          <h2 style="color: #0284c7; text-align: center;">Verify Your Order</h2>
          <p style="color: #475569; font-size: 16px;">Hello,</p>
          <p style="color: #475569; font-size: 16px;">Please use the following code to confirm your order at Pilly:</p>
          <div style="background: #f1f5f9; padding: 20px; text-align: center; border-radius: 8px; margin: 24px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #0f172a;">${otp}</span>
          </div>
          <p style="color: #64748b; font-size: 12px; text-align: center;">This code will expire in 10 minutes. If you didn't request this, please ignore this email.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="color: #94a3b8; font-size: 11px; text-align: center;">&copy; 2026 Pilly E-Commerce. All rights reserved.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('OTP Send Error:', err);
    return NextResponse.json({ error: err.message || 'Failed to send OTP' }, { status: 500 });
  }
}
