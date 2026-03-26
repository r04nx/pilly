import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

const supabase = createAdminClient();

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
    }

    // Check latest valid OTP
    const { data: validOtp, error: dbError } = await supabase
      .from('verification_otps')
      .select('*')
      .eq('email', email)
      .eq('otp_code', otp)
      .eq('verified', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (dbError || !validOtp) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
    }

    // Mark as verified
    await supabase
      .from('verification_otps')
      .update({ verified: true })
      .eq('id', validOtp.id);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('OTP Verify Error:', err);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
