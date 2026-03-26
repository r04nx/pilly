const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'mail.paraspharmacysupplier.ca',
  port: 465,
  secure: true,
  auth: {
    user: 'verify@paraspharmacysupplier.ca',
    pass: 'uS0!vW2?YJ_O'
  }
});

const mailOptions = {
  from: '"Admin Verification" <verify@paraspharmacysupplier.ca>',
  to: 'r04nx.work@gmail.com', // testing their main email
  subject: 'Direct SMTP Test - Pilly Localhost Link Test',
  text: 'Please confirm your signup by visiting: http://localhost:3000/auth/callback?code=test-code',
  html: '<h2>Confirm your signup</h2><p>Follow this link to confirm your user:</p><p><a href="http://localhost:3000/auth/callback?code=test-code">Confirm your mail</a></p>'
};

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error("DEBUG: Direct SMTP Send Error:", error);
  } else {
    console.log("DEBUG: Direct SMTP Send Success:", info.response);
  }
});
