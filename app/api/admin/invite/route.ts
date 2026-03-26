import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { transporter, getInvitationEmailTemplate } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Verify admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();
    
    if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { email, fullName } = await request.json();

    if (!email || !fullName) {
      return NextResponse.json({ error: 'Missing email or full name' }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // 1. Generate invitation link
    // We use /auth/callback to handle the verification and session setup, 
    // then redirect to /auth/reset-password so they can set their password.
    const { data, error: inviteError } = await adminClient.auth.admin.generateLink({
      type: 'invite',
      email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/auth/reset-password`,
        data: {
          full_name: fullName,
          is_admin: false,
        }
      }
    });

    if (inviteError) {
      console.error('Supabase Invite Link Error:', inviteError);
      return NextResponse.json({ error: `Supabase Auth Error: ${inviteError.message}` }, { status: 500 });
    }

    console.log('Successfully generated invitation link');
    const invitationLink = data.properties.action_link;

    // 2. Send custom invitation email
    const { subject, html } = getInvitationEmailTemplate(fullName, invitationLink);
    
    try {
      console.log('Attempting to send invitation email via SMTP:', process.env.SMTP_HOST);

      await transporter.sendMail({
        from: `"Paras Pharmacy Supplier" <${process.env.SMTP_FROM}>`,
        to: email,
        subject,
        html,
      });
      console.log('Invitation email sent successfully');
    } catch (emailError: any) {
      console.error('SMTP Email Error:', emailError);
      return NextResponse.json({ error: `Email Delivery Error: ${emailError.message}` }, { status: 500 });
    }

    // 3. Log the invitation (optional, can use email_logs table)
    try {
      await supabase.from('email_logs').insert({
        to_email: email,
        subject,
        type: 'invitation',
        status: 'sent',
        metadata: { invited_by: user.id }
      });
    } catch (logError) {
      console.error('Logging error:', logError);
    }

    return NextResponse.json({ success: true, message: 'Invitation sent successfully' });
  } catch (error) {
    console.error('Invite API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send invitation' },
      { status: 500 }
    );
  }
}
