-- Migration Script to Update Existing Database
-- Run this after applying the main schema to fix existing data

-- Fix any existing data issues
UPDATE products SET 
    stock_quantity = CASE 
        WHEN stock_quantity IS NULL THEN 0
        WHEN stock_quantity < 0 THEN 0
        ELSE stock_quantity
    END,
    in_stock = CASE 
        WHEN in_stock IS NULL THEN true
        WHEN stock_quantity > 0 THEN true
        ELSE false
    END
WHERE stock_quantity IS NULL OR stock_quantity < 0 OR in_stock IS NULL;

-- Update customer metrics for existing users
INSERT INTO customer_metrics (user_id, total_orders, total_spent, lifetime_value, average_order_value, last_order_date)
SELECT 
    o.user_id,
    COUNT(o.id) as total_orders,
    COALESCE(SUM(o.total_amount), 0) as total_spent,
    COALESCE(SUM(o.total_amount), 0) as lifetime_value,
    COALESCE(AVG(o.total_amount), 0) as average_order_value,
    MAX(o.created_at) as last_order_date,
    NOW() as created_at,
    NOW() as updated_at
FROM orders o
WHERE o.status != 'cancelled'
GROUP BY o.user_id
ON CONFLICT (user_id) 
DO UPDATE SET 
    total_orders = EXCLUDED.total_orders,
    total_spent = EXCLUDED.total_spent,
    lifetime_value = EXCLUDED.lifetime_value,
    average_order_value = EXCLUDED.average_order_value,
    last_order_date = EXCLUDED.last_order_date,
    updated_at = NOW()
WHERE customer_metrics.user_id = EXCLUDED.user_id;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock_quantity);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_customer_metrics_user_id ON customer_metrics(user_id);

-- Update existing profiles to ensure they have required fields
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS postal_code TEXT,
ADD COLUMN IF NOT EXISTS company_name TEXT;
