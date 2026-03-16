# Customer Portal Setup Guide

This guide will help you set up the complete customer portal with Supabase backend integration.

## 🚀 Features Implemented

### ✅ Account Settings
- Profile management (name, phone, bio, avatar upload)
- Email verification system
- Password reset functionality
- Security settings (2FA ready)
- Notification preferences
- Regional settings (language, timezone, theme)

### ✅ Products Page
- Advanced search and filtering
- Category-based browsing
- Price range slider
- Multiple sorting options
- Grid/List view modes
- Wishlist functionality
- Shopping cart integration
- **Pagination** (12 products per page)
- Real placeholder images

### ✅ Orders Page
- Order history with filtering
- Real-time order tracking
- Detailed order information
- Order status timeline
- Invoice downloads
- Order cancellation

### ✅ Support Page
- Ticket creation and management
- FAQ system with helpful voting
- Live chat interface
- Contact forms
- Phone support information

### ✅ Enhanced Dashboard
- Personalized statistics
- Recent activity timeline
- Loyalty program with tiers
- Quick action buttons
- Product recommendations
- Order summaries

## 📋 Prerequisites

1. **Supabase Account**
   - Create account at [supabase.com](https://supabase.com)
   - Create new project

2. **Environment Variables**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

## 🗄️ Database Setup

### 1. Run SQL Schema

1. Go to your Supabase project
2. Navigate to **SQL Editor**
3. Copy and paste the entire contents of `supabase-schema.sql`
4. Click **Run** to execute all queries

This will create:
- All required tables with proper relationships
- Row Level Security (RLS) policies
- Triggers for automatic timestamps
- Sample data for testing

### 2. Set Up Storage

1. Go to **Storage** section
2. Create two buckets:
   - `avatars` (public)
   - `product-images` (public)

3. Set up CORS policies for both buckets to allow your domain

## 🔧 Configuration Files

### 1. Environment Setup

Create `.env.local` in your project root:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Supabase Client

Ensure `lib/supabase/client.ts` is configured:
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const createClient = () => 
  createClient(supabaseUrl, supabaseAnonKey)
```

## 🎯 Key Features

### Pagination System
- **Products per page**: 12
- **Smart pagination**: Shows current page ± 2 pages
- **Total count**: Displays total products and current range
- **URL sync**: Page state reflected in URL

### Wishlist Integration
- Real-time wishlist updates
- Persistent across sessions
- One-click add/remove
- Visual feedback

### Shopping Cart
- Add to cart functionality
- Quantity management
- Price calculation
- User-specific carts

### Order Management
- Complete order lifecycle
- Status tracking
- Item details
- Address management

### Support System
- Ticket creation with categories
- Priority levels
- Status tracking
- Reply system
- FAQ management

## 🔐 Security Features

### Row Level Security (RLS)
- Users can only access their own data
- Public read access for products and FAQs
- Admin-only access for management functions

### Authentication
- Secure user sessions
- Email verification
- Password reset
- Profile management

## 🚀 Getting Started

1. **Clone and Install**
   ```bash
   npm install
   ```

2. **Set Up Environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

3. **Run Database Setup**
   - Execute `supabase-schema.sql` in Supabase SQL Editor
   - Set up storage buckets

4. **Start Development**
   ```bash
   npm run dev
   ```

5. **Access Customer Portal**
   - Navigate to `http://localhost:3000/customer/dashboard`
   - Register/login with test credentials

## 📊 Database Schema Overview

### Core Tables
- `profiles` - User profiles and loyalty data
- `products` - Product catalog
- `orders` - Order information
- `order_items` - Order line items
- `cart_items` - Shopping cart
- `wishlist` - User wishlists
- `support_tickets` - Customer support
- `ticket_replies` - Ticket communications
- `faqs` - Frequently asked questions
- `product_reviews` - Product ratings
- `user_activity` - Activity logging

### Relationships
- Users → Orders (1:many)
- Users → Cart Items (1:many)
- Users → Wishlist (1:many)
- Users → Support Tickets (1:many)
- Orders → Order Items (1:many)
- Products → Order Items (1:many)
- Products → Wishlist (1:many)

## 🎨 UI Components

The portal uses modern, accessible components:
- **shadcn/ui** - Component library
- **Lucide React** - Icons
- **Tailwind CSS** - Styling
- **Responsive Design** - Mobile-first approach

## 🔄 Real-time Features

### Automatic Updates
- Order status changes
- Wishlist modifications
- Cart updates
- Activity logging

### User Experience
- Loading states
- Error handling
- Success feedback
- Smooth transitions

## 📱 Mobile Optimization

- Responsive layouts
- Touch-friendly interfaces
- Mobile navigation
- Optimized images

## 🔧 Customization

### Theming
- Light/Dark mode support
- Custom color schemes
- Component overrides

### Branding
- Logo customization
- Color palette
- Typography

## 📈 Performance

### Optimizations
- Image lazy loading
- Pagination for large datasets
- Efficient database queries
- Component memoization

### Caching
- Product data caching
- User session caching
- Static asset optimization

## 🚨 Important Notes

1. **Environment Variables**: Never expose service role keys in client-side code
2. **RLS Policies**: Always test security policies in development
3. **Storage**: Set up proper CORS policies for production
4. **Images**: Use CDN for production image serving
5. **Error Handling**: Implement proper error boundaries

## 🛠️ Development Tips

### Debugging
- Use Supabase Dashboard to monitor queries
- Check browser console for errors
- Test with different user roles

### Testing
- Test all user flows
- Verify RLS policies
- Check mobile responsiveness
- Test error scenarios

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)

## 🤝 Support

For issues with the setup:
1. Check Supabase logs
2. Verify environment variables
3. Test database connections
4. Review RLS policies

---

**Happy Coding! 🎉**

This customer portal provides a complete e-commerce experience with modern features and robust backend integration.
