-- Updated Supabase Database Schema for Customer Portal
-- Includes all fields needed for profile settings
-- Run these SQL commands in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('customer', 'admin');
CREATE TYPE order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');
CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
CREATE TYPE ticket_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE membership_tier AS ENUM ('Bronze', 'Silver', 'Gold', 'Platinum');

-- Profiles table (extends auth.users) - UPDATED
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    bio TEXT,
    loyalty_points INTEGER DEFAULT 0,
    membership_tier membership_tier DEFAULT 'Bronze',
    
    -- Email verification fields
    email_verified BOOLEAN DEFAULT false,
    email_verification_token TEXT,
    
    -- Security fields
    password_reset_token TEXT,
    password_reset_expires TIMESTAMP WITH TIME ZONE,
    two_factor_enabled BOOLEAN DEFAULT false,
    two_factor_secret TEXT,
    
    -- Notification preferences
    email_notifications_orders BOOLEAN DEFAULT true,
    email_notifications_marketing BOOLEAN DEFAULT false,
    email_notifications_security BOOLEAN DEFAULT true,
    email_notifications_products BOOLEAN DEFAULT false,
    
    -- User preferences
    language TEXT DEFAULT 'English',
    timezone TEXT DEFAULT 'UTC-5',
    theme TEXT DEFAULT 'light',
    
    -- Address fields (for shipping)
    address_street TEXT,
    address_city TEXT,
    address_state TEXT,
    address_postal_code TEXT,
    address_country TEXT DEFAULT 'Canada',
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category TEXT NOT NULL,
    image_url TEXT,
    rating DECIMAL(3,2) DEFAULT 0,
    reviews_count INTEGER DEFAULT 0,
    in_stock BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    order_number TEXT UNIQUE NOT NULL,
    status order_status DEFAULT 'pending',
    total_amount DECIMAL(10,2) NOT NULL,
    shipping_address JSONB,
    billing_address JSONB,
    tracking_number TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cart items table
CREATE TABLE IF NOT EXISTS cart_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- Wishlist table
CREATE TABLE IF NOT EXISTS wishlist (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- Support tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    ticket_number TEXT UNIQUE NOT NULL,
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    priority ticket_priority DEFAULT 'medium',
    status ticket_status DEFAULT 'open',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ticket replies table
CREATE TABLE IF NOT EXISTS ticket_replies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_admin_reply BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FAQs table
CREATE TABLE IF NOT EXISTS faqs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT NOT NULL,
    helpful INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product reviews table
CREATE TABLE IF NOT EXISTS product_reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- User activity table
CREATE TABLE IF NOT EXISTS user_activity (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
('avatars', 'avatars', true),
('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Row Level Security Policies

-- Profiles table policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Orders table policies
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders" ON orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders" ON orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Cart items policies
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own cart" ON cart_items
    FOR ALL USING (auth.uid() = user_id);

-- Wishlist policies
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own wishlist" ON wishlist
    FOR ALL USING (auth.uid() = user_id);

-- Support tickets policies
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own tickets" ON support_tickets
    FOR ALL USING (auth.uid() = user_id);

-- Product reviews policies
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own reviews" ON product_reviews
    FOR ALL USING (auth.uid() = user_id);

-- User activity policies
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activity" ON user_activity
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activity" ON user_activity
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Public policies
CREATE POLICY "Products are publicly viewable" ON products
    FOR SELECT USING (active = true);

CREATE POLICY "FAQs are publicly viewable" ON faqs
    FOR SELECT USING (active = true);

-- Functions for automatic timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_faqs_updated_at BEFORE UPDATE ON faqs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data
INSERT INTO profiles (id, full_name, phone, bio, loyalty_points, membership_tier) VALUES
(uuid_generate_v4(), 'John Doe', '+1 (555) 123-4567', 'Regular customer with excellent ordering history.', 1500, 'Gold'),
(uuid_generate_v4(), 'Jane Smith', '+1 (555) 987-6543', 'New customer interested in pharmaceutical products.', 250, 'Bronze')
ON CONFLICT DO NOTHING;

INSERT INTO products (name, description, price, category, image_url, rating, in_stock, featured) VALUES
('Paracetamol 500mg', 'Pain relief medication for headaches and fever', 12.99, 'Pain Relief', 'https://picsum.photos/300/200?random=paracetamol', 4.5, true, true),
('Ibuprofen 400mg', 'Anti-inflammatory medication for pain and swelling', 15.99, 'Pain Relief', 'https://picsum.photos/300/200?random=ibuprofen', 4.2, true, false),
('Amoxicillin 500mg', 'Antibiotic for bacterial infections', 25.99, 'Antibiotics', 'https://picsum.photos/300/200?random=amoxicillin', 4.8, true, true),
('Loratadine 10mg', 'Allergy relief medication', 18.99, 'Allergy', 'https://picsum.photos/300/200?random=loratadine', 4.1, true, false),
('Omeprazole 20mg', 'Acid reflux and heartburn medication', 22.99, 'Digestive Health', 'https://picsum.photos/300/200?random=omeprazole', 4.6, true, true)
ON CONFLICT DO NOTHING;

INSERT INTO faqs (question, answer, category, helpful) VALUES
('How can I track my order?', 'You can track your order by going to Orders page and clicking on "View Details" for your specific order. You will find tracking number and real-time updates there.', 'orders', 45),
('What is your return policy?', 'We offer a 30-day return policy for most items. Products must be unused and in original packaging. Please visit our Returns page for detailed instructions.', 'returns', 38),
('How do I reset my password?', 'Click on "Forgot Password" on login page, enter your email address, and follow instructions sent to your email to reset your password.', 'account', 52),
('What payment methods do you accept?', 'We accept all major credit cards, debit cards, PayPal, Apple Pay, and Google Pay for your convenience.', 'payments', 29)
ON CONFLICT DO NOTHING;
