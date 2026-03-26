import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 465),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export function getInvitationEmailTemplate(fullName: string, invitationLink: string) {
  const primaryColor = '#0284c7';

  return {
    subject: 'Complete your Paras Pharmacy Supplier registration',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: ${primaryColor};">Welcome, ${fullName}!</h1>
        <p>You have been invited to join the <strong>Paras Pharmacy Supplier</strong> platform.</p>
        <p>Please click the link below to set up your account password and complete your registration:</p>
        <div style="margin: 30px 0;">
          <a href="${invitationLink}" style="background-color: ${primaryColor}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Set Up Account</a>
        </div>
        <p style="color: #666; font-size: 14px;">If you did not expect this invitation, please ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="font-size: 12px; color: #999;">&copy; ${new Date().getFullYear()} Paras Pharmacy Supplier. Toronto, Canada.</p>
      </div>
    `
  };
}
