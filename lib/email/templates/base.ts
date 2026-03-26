export const generateBrandedTemplate = (title: string, content: string, actionUrl?: string, actionText?: string) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #334155; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; }
        .header { text-align: center; padding-bottom: 20px; border-bottom: 2px solid #0ea5e9; }
        .logo { width: 80px; height: 80px; margin-bottom: 10px; }
        .content { padding: 30px 0; }
        .footer { text-align: center; font-size: 12px; color: #94a3b8; padding-top: 20px; border-top: 1px solid #e2e8f0; }
        .button { display: inline-block; padding: 12px 24px; background-color: #0ea5e9; color: white !important; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px; }
        .paras-text { color: #0ea5e9; font-weight: bold; font-size: 20px; margin: 0; }
        .supplier-text { font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #64748b; margin-top: -5px; display: block; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <p class="paras-text">Paras Pharmacy</p>
          <span class="supplier-text">Supplier</span>
          <h1 style="color: #1e293b; margin-top: 15px;">${title}</h1>
        </div>
        <div class="content">
          ${content}
          ${actionUrl ? `<div style="text-align: center;"><a href="${actionUrl}" class="button">${actionText || 'View Order'}</a></div>` : ''}
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Paras Pharmacy Supplier. All rights reserved.</p>
          <p>416-575-7598 | verify@paraspharmacysupplier.ca</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
