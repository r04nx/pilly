import nodemailer from 'nodemailer';

const smtpHost = process.env.SMTP_HOST;
const smtpPort = parseInt(process.env.SMTP_PORT || '465');
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASSWORD;
const smtpFrom = process.env.SMTP_FROM || 'verify@paraspharmacysupplier.ca';

export const transport = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: true, // true for 465, false for other ports
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
});

export const defaultFrom = `"Paras Pharmacy Supplier" <${smtpFrom}>`;
