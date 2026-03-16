# 🚀 Complete Supabase Setup Guide

This guide covers everything needed to fully configure your Supabase instance for the customer portal.

## 📋 Table of Contents
1. [Database Schema Setup](#database-schema-setup)
2. [Storage Buckets](#storage-buckets)
3. [Row Level Security](#row-level-security)
4. [Environment Variables](#environment-variables)
5. [Testing](#testing)

---

## 🗄️ Database Schema Setup

### Step 1: Run the Updated Schema
1. Go to your Supabase project
2. Navigate to **SQL Editor**
3. Copy and paste the entire contents of `supabase-schema-updated.sql`
4. Click **Run** to execute all queries
5. Verify all tables were created successfully

### Tables Created:
- ✅ `profiles` - Extended user profiles with all settings
- ✅ `products` - Product catalog
- ✅ `orders` - Order management
- ✅ `order_items` - Order line items
- ✅ `cart_items` - Shopping cart
- ✅ `wishlist` - User wishlists
- ✅ `support_tickets` - Customer support
- ✅ `ticket_replies` - Support ticket responses
- ✅ `faqs` - Frequently asked questions
- ✅ `product_reviews` - Product ratings
- ✅ `user_activity` - Activity tracking

---

## 📦 Storage Buckets Setup

### Step 2: Create Storage Buckets
1. Go to **Storage** section in Supabase dashboard
2. Create the following buckets:

#### **Avatar Bucket**
- **Name**: `avatars`
- **Public**: ✅ (for profile pictures)
- **File size limit**: 2MB
- **Allowed types**: `image/jpeg`, `image/png`, `image/gif`

#### **Product Images Bucket**
- **Name**: `product-images`
- **Public**: ✅ (for product catalog images)
- **File size limit**: 5MB
- **Allowed types**: `image/jpeg`, `image/png`, `image/webp`

### Step 3: Configure Bucket Policies
Run these SQL commands in the SQL Editor:

```sql
-- Avatar bucket policies
CREATE POLICY "Public avatar access" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = owner);

CREATE POLICY "Users can update own avatar" ON storage.objects
FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = owner);

-- Product images bucket policies
CREATE POLICY "Public product image access" ON storage.objects
FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Admins can upload product images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.uid()::text = owner);
```

---

## 🔐 Row Level Security (RLS)

### Step 4: Verify RLS Policies
All tables already have RLS policies configured in the schema. Verify they're active:

1. Go to **Authentication** → **Policies**
2. Check these policies are enabled:
   - ✅ `profiles` table policies
   - ✅ `orders` table policies
   - ✅ `cart_items` table policies
   - ✅ `wishlist` table policies
   - ✅ `support_tickets` table policies
   - ✅ `product_reviews` table policies
   - ✅ `user_activity` table policies
   - ✅ Public access for `products` and `faqs`

---

## 🔧 Environment Variables

### Step 5: Configure Environment Variables
Create `.env.local` file with these variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: Service Role Key (server-side only)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Development
NODE_ENV=development
```

### Where to Find These Values:
1. **Project URL**: Supabase Dashboard → Settings → API
2. **Anon Key**: Supabase Dashboard → Settings → API
3. **Service Role Key**: Supabase Dashboard → Settings → API (⚠️ Keep secret!)

---

## 🧪 Testing

### Step 6: Test All Features

#### 1. Authentication Test
```sql
-- Test user creation
SELECT * FROM auth.users LIMIT 5;

-- Test profile creation
INSERT INTO profiles (id, full_name, email) 
VALUES (uuid_generate_v4(), 'Test User', 'test@example.com');
```

#### 2. Storage Test
Upload a test image to verify buckets work:
1. Go to Storage → avatars
2. Upload a small profile picture
3. Check the public URL works

#### 3. API Test
Test these endpoints in your application:
- ✅ User registration
- ✅ User login
- ✅ Profile update
- ✅ Product browsing
- ✅ Order creation
- ✅ Support ticket creation

---

## 🚨 Troubleshooting

### Common Issues:

#### **RLS Policy Errors**
```sql
-- If you get "permission denied" errors, run:
SELECT * FROM pg_policies WHERE tablename = 'your_table_name';
```

#### **Storage Permission Errors**
```sql
-- Check storage policies:
SELECT * FROM pg_policies WHERE tablename = 'storage';
```

#### **Missing Relations**
```sql
-- Verify foreign key constraints:
SELECT 
    tc.table_name, 
    tc.constraint_name, 
    tc.constraint_type
FROM information_schema.table_constraints tc
WHERE tc.constraint_type = 'FOREIGN KEY';
```

---

## 📚 Additional Features to Implement

### 1. Email Templates (Priority)
- **Welcome email** for new registrations
- **Order confirmation** for successful orders
- **Password reset** for security
- **Support ticket** notifications

### 2. Advanced Profile Features
- **Address validation** with postal code lookup
- **Phone number verification** via SMS
- **Profile completion** percentage

### 3. Enhanced Security
- **Login attempt tracking**
- **Session management** with proper timeouts
- **Account deletion** with data retention

---

## 🔄 Maintenance

### Regular Tasks:
1. **Monitor storage usage** in Supabase dashboard
2. **Check query performance** with Database insights
3. **Review RLS policies** quarterly
4. **Update sample data** for testing
5. **Backup database** regularly

---

## 📞 Support

If you encounter issues:
1. Check **Supabase logs** in Dashboard
2. Verify **RLS policies** are enabled
3. Test **environment variables** are correct
4. Review **SQL execution** for errors
5. Check **network connectivity** to Supabase

---

## ✅ Completion Checklist

- [ ] Database schema executed
- [ ] Storage buckets created
- [ ] RLS policies verified
- [ ] Environment variables configured
- [ ] Authentication flow tested
- [ ] File uploads working
- [ ] All features tested

---

**🎉 Your Supabase is now fully configured!**

All customer portal features should work seamlessly with proper security, storage, and data management.
