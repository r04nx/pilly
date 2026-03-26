-- Updated Supabase Database Schema for Paras Pharmacy Supplier
-- Run these SQL commands in your Supabase SQL editor
-- Fixes issues with table definitions and adds missing tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types (fixed typos)
CREATE TYPE user_role AS ENUM ('customer', 'admin');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');
CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
CREATE TYPE ticket_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE membership_tier AS ENUM ('Bronze', 'Silver', 'Gold', 'Platinum');

-- Categories table (was missing)
CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    parent_category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    image_url TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profiles table (extends auth.users) - Fixed
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    postal_code TEXT,
    company_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    loyalty_points INTEGER DEFAULT 0,
    membership_tier membership_tier DEFAULT 'Bronze',
    is_admin BOOLEAN DEFAULT false,
    must_reset_password BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table - Fixed stock_quantity field
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    sku TEXT UNIQUE,
    price DECIMAL(10,2) NOT NULL,
    stock_quantity INTEGER DEFAULT 0,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    image_url TEXT,
    rating DECIMAL(3,2) DEFAULT 0,
    reviews_count INTEGER DEFAULT 0,
    in_stock BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table - Fixed default status
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    order_number TEXT UNIQUE NOT NULL,
    status order_status DEFAULT 'pending',
    total_amount DECIMAL(10,2) NOT NULL,
    notes TEXT,
    shipping_address JSONB,
    billing_address JSONB,
    tracking_number TEXT,
    estimated_delivery DATE,
    scheduled_delivery_date DATE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table - Fixed product_id reference
CREATE TABLE IF NOT EXISTS order_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    variant TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cart items table (was missing)
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

-- Wishlist table (was missing)
CREATE TABLE IF NOT EXISTS wishlist (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- Support tickets table - Fixed category field
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

-- Ticket replies table (was missing)
CREATE TABLE IF NOT EXISTS ticket_replies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_admin_reply BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email templates table (was missing)
CREATE TABLE IF NOT EXISTS email_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    subject TEXT NOT NULL,
    html_content TEXT NOT NULL,
    variables TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email logs table (was missing)
CREATE TABLE IF NOT EXISTS email_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    recipient_email TEXT NOT NULL,
    template_id UUID REFERENCES email_templates(id) ON DELETE SET NULL,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    subject TEXT NOT NULL,
    status TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customer metrics table (was missing)
CREATE TABLE IF NOT EXISTS customer_metrics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    total_orders INTEGER DEFAULT 0,
    total_spent DECIMAL(10,2) DEFAULT 0,
    lifetime_value DECIMAL(10,2) DEFAULT 0,
    average_order_value DECIMAL(10,2) DEFAULT 0,
    last_order_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FAQ table
CREATE TABLE IF NOT EXISTS faqs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT NOT NULL,
    helpful INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product reviews table
CREATE TABLE IF NOT EXISTS product_reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    verified_purchase BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id, order_id)
);

-- User activity log
CREATE TABLE IF NOT EXISTS user_activity (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email preferences table
CREATE TABLE IF NOT EXISTS email_preferences (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    marketing_emails BOOLEAN DEFAULT true,
    order_updates BOOLEAN DEFAULT true,
    newsletter BOOLEAN DEFAULT true,
    promotions BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email templates table
CREATE TABLE IF NOT EXISTS email_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    type TEXT CHECK (type IN ('marketing', 'order_update', 'newsletter', 'promotion')) DEFAULT 'marketing',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Coming soon products table
CREATE TABLE IF NOT EXISTS coming_soon_products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    expected_date DATE,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
    is_active BOOLEAN DEFAULT true,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
('avatars', 'avatars', true),
('product-images', 'product-images', true);

-- Row Level Security (RLS) Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE coming_soon_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- Profiles RLS
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Categories RLS (public read access)
CREATE POLICY "Categories are viewable by everyone" ON categories
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage categories" ON categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );

-- Products RLS (public read access)
CREATE POLICY "Active products are viewable by everyone" ON products
    FOR SELECT USING (active = true);

CREATE POLICY "Admins can manage products" ON products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );

-- Orders RLS
CREATE POLICY "Users can view own orders" ON orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders" ON orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders" ON orders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );

-- Order items RLS
CREATE POLICY "Users can view own order items" ON order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id = auth.uid()
        )
    );

-- Cart items RLS
CREATE POLICY "Users can view own cart items" ON cart_items
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own cart items" ON cart_items
    FOR ALL USING (auth.uid() = user_id);

-- Wishlist RLS
CREATE POLICY "Users can view own wishlist" ON wishlist
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own wishlist" ON wishlist
    FOR ALL USING (auth.uid() = user_id);

-- Support tickets RLS
CREATE POLICY "Users can view own tickets" ON support_tickets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own tickets" ON support_tickets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all tickets" ON support_tickets
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );

-- Ticket replies RLS
CREATE POLICY "Users can view own ticket replies" ON ticket_replies
    FOR SELECT USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM support_tickets 
            WHERE support_tickets.id = ticket_replies.ticket_id 
            AND support_tickets.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create ticket replies" ON ticket_replies
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM support_tickets 
            WHERE support_tickets.id = ticket_replies.ticket_id 
            AND support_tickets.user_id = auth.uid()
        )
    );

-- Email templates RLS (admin only)
CREATE POLICY "Admins can manage email templates" ON email_templates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );

-- Email logs RLS (admin only)
CREATE POLICY "Admins can view email logs" ON email_logs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );

-- Customer metrics RLS (admin only)
CREATE POLICY "Admins can manage customer metrics" ON customer_metrics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );

-- FAQs RLS (public read access)
CREATE POLICY "FAQs are viewable by everyone" ON faqs
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage FAQs" ON faqs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );

-- Product reviews RLS
CREATE POLICY "Users can view own reviews" ON product_reviews
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own reviews" ON product_reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User activity RLS
CREATE POLICY "Users can view own activity" ON user_activity
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own activity" ON user_activity
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Coming soon products RLS
CREATE POLICY "Coming soon products are viewable by everyone" ON coming_soon_products
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage coming soon products" ON coming_soon_products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );

-- Email preferences RLS
CREATE POLICY "Users can view and update own email preferences" ON email_preferences
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all email preferences" ON email_preferences
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );

-- Email templates RLS
CREATE POLICY "Admins can manage email templates" ON email_templates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );

-- Functions and Triggers

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Apply trigger to all relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_order_items_updated_at BEFORE UPDATE ON order_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON support_tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ticket_replies_updated_at BEFORE UPDATE ON ticket_replies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_logs_updated_at BEFORE UPDATE ON email_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_metrics_updated_at BEFORE UPDATE ON customer_metrics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_faqs_updated_at BEFORE UPDATE ON faqs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_reviews_updated_at BEFORE UPDATE ON product_reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_activity_updated_at BEFORE UPDATE ON user_activity
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_coming_soon_products_updated_at BEFORE UPDATE ON coming_soon_products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_preferences_updated_at BEFORE UPDATE ON email_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to log user activity
CREATE OR REPLACE FUNCTION log_user_activity()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_activity (user_id, activity_type, title, description, metadata)
    VALUES (
        COALESCE(NEW.user_id, OLD.user_id),
        TG_OP,
        COALESCE(NEW.order_number, OLD.order_number, 'Activity'),
        COALESCE(NEW.status, OLD.status, 'Status change'),
        row_to_json(NEW)
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE 'plpgsql';

-- Trigger to log order changes
CREATE TRIGGER log_order_activity
    AFTER INSERT OR UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION log_user_activity();

-- Function to update customer metrics
CREATE OR REPLACE FUNCTION update_customer_metrics()
RETURNS TRIGGER AS $$
BEGIN
    -- Update or insert customer metrics when order is placed
    IF TG_OP = 'INSERT' THEN
        INSERT INTO customer_metrics (user_id, total_orders, total_spent, lifetime_value, average_order_value, last_order_date)
        VALUES (
            NEW.user_id,
            1,
            NEW.total_amount,
            NEW.total_amount,
            NEW.total_amount,
            NEW.created_at,
            NEW.created_at
        )
        ON CONFLICT (user_id) 
        DO UPDATE SET 
            total_orders = customer_metrics.total_orders + 1,
            total_spent = customer_metrics.total_spent + NEW.total_amount,
            lifetime_value = customer_metrics.lifetime_value + NEW.total_amount,
            average_order_value = (customer_metrics.total_spent + NEW.total_amount) / (customer_metrics.total_orders + 1),
            last_order_date = NEW.created_at,
            updated_at = NOW()
        WHERE customer_metrics.user_id = EXCLUDED.user_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Trigger to update customer metrics on order changes
CREATE TRIGGER update_customer_metrics_trigger
    AFTER INSERT ON orders
    FOR EACH ROW EXECUTE FUNCTION update_customer_metrics();

-- Insert sample data (pharmacy-related products)
INSERT INTO categories (name, slug, description, sort_order) VALUES 
('Prescription Medications', 'prescription-meds', 'FDA-approved prescription medications and over-the-counter drugs', 1),
('Over-the-Counter Medicine', 'otc-medicine', 'Non-prescription medications and health supplements', 2),
('Medical Supplies', 'medical-supplies', 'Medical equipment and supplies for home healthcare', 3),
('Personal Care', 'personal-care', 'Personal hygiene and wellness products', 4),
('Vitamins & Supplements', 'vitamins-supplements', 'Dietary supplements and vitamins for health maintenance', 5);

INSERT INTO products (name, description, sku, price, stock_quantity, category_id, image_url, rating, reviews_count, in_stock, featured, active) VALUES 
('Paracetamol 500mg', 'Pain reliever and fever reducer', 'PARA500', 12.99, 100, (SELECT id FROM categories WHERE slug = 'prescription-meds'), 'https://picsum.photos/seed/paracetamol/300/200', 4.5, 234, true, true, true),
('Ibuprofen 400mg', 'Anti-inflammatory medication', 'IBU400', 15.99, 85, (SELECT id FROM categories WHERE slug = 'otc-medicine'), 'https://picsum.photos/seed/ibuprofen/300/200', 4.2, 189, true, true, true),
('Blood Pressure Monitor', 'Digital blood pressure monitoring device', 'BPM200', 89.99, 25, (SELECT id FROM categories WHERE slug = 'medical-supplies'), 'https://picsum.photos/seed/bp-monitor/300/200', 4.7, 67, true, true, true),
('Digital Thermometer', 'Contactless digital thermometer', 'DT100', 29.99, 50, (SELECT id FROM categories WHERE slug = 'medical-supplies'), 'https://picsum.photos/seed/thermometer/300/200', 4.3, 45, true, false, true),
('Face Masks', 'Disposable face masks for protection', 'FM50PK', 9.99, 200, (SELECT id FROM categories WHERE slug = 'personal-care'), 'https://picsum.photos/seed/face-masks/300/200', 4.1, 156, true, false, true),
('Hand Sanitizer', 'Alcohol-based hand sanitizer', 'HS500ML', 4.99, 150, (SELECT id FROM categories WHERE slug = 'personal-care'), 'https://picsum.photos/seed/hand-sanitizer/300/200', 4.4, 203, true, false, true),
('Vitamin D3', 'Vitamin D3 supplement for bone health', 'VITD3', 19.99, 120, (SELECT id FROM categories WHERE slug = 'vitamins-supplements'), 'https://picsum.photos/seed/vitamin-d3/300/200', 4.6, 89, true, true, true),
('Multivitamins', 'Complete daily multivitamin supplement', 'MULTI30', 24.99, 80, (SELECT id FROM categories WHERE slug = 'vitamins-supplements'), 'https://picsum.photos/seed/multivitamins/300/200', 4.4, 167, true, true, true);

INSERT INTO email_templates (name, type, subject, html_content, variables) VALUES 
('Order Confirmation', 'order_confirmation', 'Your Order #{{order_number}} is Confirmed', '<h2>Order Confirmation</h2><p>Thank you for your order #{{order_number}}!</p><p>Status: {{status}}</p><p>Total: ${{total_amount}}</p>', ARRAY['order_number', 'status', 'total_amount']),
('Order Shipped', 'order_shipped', 'Your Order #{{order_number}} has Shipped', '<h2>Order Shipped</h2><p>Your order #{{order_number}} has been shipped!</p><p>Tracking: {{tracking_number}}</p>', ARRAY['order_number', 'tracking_number']),
('Password Reset', 'password_reset', 'Reset Your Password', '<h2>Password Reset</h2><p>Click here to reset your password: {{reset_link}}</p>', ARRAY['reset_link']);

INSERT INTO faqs (question, answer, category, helpful) VALUES 
('How can I track my order?', 'You can track your order by going to the Orders page and clicking on "View Details" for your specific order. You will find the tracking number and real-time status updates there.', 'orders', 45),
('What payment methods do you accept?', 'We accept all major credit cards, debit cards, PayPal, Apple Pay, Google Pay, and cash on delivery for local orders.', 'payments', 38),
('What is your return policy?', 'We offer a 30-day return policy for most items. Products must be unused and in original packaging. Please visit our Returns page for detailed instructions.', 'returns', 52),
('How do I contact customer support?', 'You can reach our customer support team through the Support page, by email at support@paraspharmacy.com, or by phone at 1-800-PHARMACY during business hours (9 AM - 6 PM EST).', 'account', 67),
('Do you offer prescription services?', 'Yes, we work with licensed pharmacists and can fill valid prescriptions. Please upload your prescription through our secure portal or bring it to our store.', 'services', 73),
('What are your business hours?', 'Our stores are open Monday-Friday 9 AM - 8 PM, Saturday 10 AM - 6 PM, and Sunday 11 AM - 5 PM. Our online store is available 24/7 for ordering.', 'general', 29);
