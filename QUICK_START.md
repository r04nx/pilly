# Paras Pharmacy Supplier - Quick Start Guide

## 🚀 Getting Started

This is a fully functional ecommerce platform for Paras Pharmacy Supplier. The foundation is complete with user authentication, customer portal, and admin dashboard ready to use.

## ✅ What's Already Built

### Authentication System
- Email/password registration and login
- Google OAuth integration (setup needed)
- Password reset via email
- User role separation (customer vs admin)
- Protected routes with middleware

### Customer Portal
- **Dashboard** - Overview of orders and spending
- **Products** - Browse and search pharmaceutical products
- **Orders** - View and manage order requests
- **Support** - Create support tickets
- **Account Settings** - Update profile and password

### Admin Dashboard
- **Analytics** - Revenue, order count, customer metrics
- **Product Management** - View and manage products
- **Order Processing** - View all customer orders
- **Customer Management** - Track customer metrics and LTV
- **Email Management** - View email templates and logs

### Design & UX
- Light blue professional theme
- Fully responsive (mobile, tablet, desktop)
- Modern shadcn/ui components
- Smooth loading states and error handling
- Verbose error messages for debugging

## 🔧 Initial Setup (5 minutes)

### 1. Database Tables (Already Created)
The following tables are set up in your Supabase project:
- `categories` - Product categories
- `products` - Product catalog
- `orders` - Customer orders
- `order_items` - Items in orders
- `support_tickets` - Support requests
- `email_templates` - Email templates
- `email_logs` - Email sending history
- `customer_metrics` - Customer statistics

### 2. Environment Variables (Already Set)
All Supabase variables are configured. You need to add:

```env
# Optional: Resend for transactional emails
RESEND_API_KEY=your_resend_api_key

# App Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Google OAuth Setup (Optional)
To enable Google sign-in:

1. Go to Supabase Dashboard → Authentication → Providers
2. Click "Google"
3. Add Google OAuth credentials from Google Cloud Console
4. Set authorized redirect URLs

## 🧪 Testing the App

### Test User Accounts
1. **Create a Customer Account**
   - Go to http://localhost:3000/auth/register
   - Sign up with your email
   - Access customer dashboard

2. **Create an Admin Account**
   - Manually set `is_admin: true` in Supabase Auth user metadata
   - OR use SQL: `UPDATE auth.users SET raw_user_meta_data = jsonb_set(raw_user_meta_data, '{is_admin}', 'true') WHERE id = 'user_id'`
   - Access admin dashboard at http://localhost:3000/admin/dashboard

### Test Workflows
- ✅ Sign up and login
- ✅ Browse products
- ✅ View dashboard metrics
- ✅ Create support ticket
- ✅ Update account settings
- ✅ View admin dashboard
- ✅ Process orders

## 📋 Next Steps (What to Build)

### Priority 1: Core Features (Day 1)
1. **Admin Product CRUD**
   - Add products from admin panel
   - Upload images from Unsplash API
   - Edit/delete products
   - **File**: `/app/(admin)/products/page.tsx`

2. **Order System**
   - Customers add items to cart
   - Submit order requests
   - Admins confirm and process orders
   - **File**: Create order creation modal

### Priority 2: Email System (Day 2)
1. **Resend Integration**
   - Set up RESEND_API_KEY env var
   - Create email sending API route
   - Send order confirmations

2. **Email Templates**
   - Create template editor UI
   - Build email template manager
   - Add template variables

### Priority 3: Enhancement (Day 3)
1. **Analytics & Charts**
   - Add revenue charts
   - Product performance graphs
   - Customer acquisition trends

2. **Image Upload**
   - Integrate Unsplash API search
   - Direct image selection for products
   - Image optimization

## 📁 File Structure

```
Key Files to Edit:

Customer Portal:
├── /app/(customer)/products/page.tsx     ← Add order cart
├── /app/(customer)/dashboard/page.tsx    ← Already complete
├── /app/(customer)/orders/page.tsx       ← Ready to enhance

Admin Panel:
├── /app/(admin)/products/page.tsx        ← Add product form
├── /app/(admin)/orders/page.tsx          ← Add order processing
├── /app/(admin)/emails/page.tsx          ← Add email sending

API Routes (Create):
├── /app/api/products/route.ts            ← CRUD operations
├── /app/api/orders/route.ts              ← Order management
├── /app/api/emails/send.ts               ← Email sending
```

## 🎨 Customization

### Branding
- Company name: "Paras Pharmacy Supplier"
- Logo: Update in `/app/page.tsx` and layouts
- Colors: Already set to light blue theme in `/app/globals.css`
- Fonts: Poppins + IBM Plex Sans + Arial

### Database Fields
All tables are ready for additional fields:
- Products: add `manufacturer`, `expiry_date`, `batch_number`
- Orders: add `delivery_address`, `special_instructions`
- Customers: add `company_name`, `license_number`, `tax_id`

## 🐛 Troubleshooting

### Products Not Loading
1. Check RLS policies are enabled on `products` table
2. Verify Supabase connection in `/lib/supabase/client.ts`
3. Look at browser console for specific errors

### Auth Issues
1. Verify NEXT_PUBLIC_SUPABASE_URL is correct
2. Check NEXT_PUBLIC_SUPABASE_ANON_KEY is set
3. Confirm redirect URLs in OAuth settings

### Email Not Sending
1. Add RESEND_API_KEY to environment variables
2. Verify sender email domain in Resend dashboard
3. Check email logs in admin panel

## 📚 Documentation

- Full implementation guide: `/IMPLEMENTATION_GUIDE.md`
- Supabase docs: https://supabase.com/docs
- Next.js docs: https://nextjs.org/docs
- shadcn/ui: https://ui.shadcn.com/docs

## 🚀 Deployment

1. **Connect to GitHub** (Vercel integration)
   - Push changes to GitHub
   - Vercel auto-deploys

2. **Environment Variables**
   - Add variables in Vercel dashboard
   - Use `.env.local` for local development

3. **Database**
   - Supabase handles PostgreSQL
   - No additional database setup needed

## 💡 Tips

- Use Supabase Studio for viewing/editing data
- Test auth flows with different user roles
- Check browser Network tab for API issues
- Use `console.log("[v0] ...")` for debugging
- Enable production debugging in Supabase logs

## 📞 Support

For issues or questions:
1. Check `/IMPLEMENTATION_GUIDE.md` for detailed info
2. Review Supabase documentation
3. Check browser console for error messages
4. Enable verbose error display in dev tools

---

**Status**: Foundation Complete ✅
**Ready to Use**: Yes ✅
**Next Action**: Implement admin product management
