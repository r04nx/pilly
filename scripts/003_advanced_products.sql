-- Migration to add advanced product fields and image support
-- Run this in Supabase SQL Editor

-- Extend products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS long_description TEXT,
ADD COLUMN IF NOT EXISTS short_description TEXT,
ADD COLUMN IF NOT EXISTS brand TEXT,
ADD COLUMN IF NOT EXISTS manufacturer TEXT,
ADD COLUMN IF NOT EXISTS model_number TEXT,
ADD COLUMN IF NOT EXISTS barcode TEXT,
ADD COLUMN IF NOT EXISTS compare_at_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS cost_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(10,4) DEFAULT 0,
ADD COLUMN IF NOT EXISTS shipping_cost DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS stock_status TEXT DEFAULT 'in_stock',
ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS track_inventory BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS allow_backorder BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS reorder_point INTEGER DEFAULT 20,
ADD COLUMN IF NOT EXISTS reorder_quantity INTEGER DEFAULT 50,
ADD COLUMN IF NOT EXISTS weight DECIMAL(10,3),
ADD COLUMN IF NOT EXISTS dimensions TEXT,
ADD COLUMN IF NOT EXISTS estimated_delivery_days INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS estimated_delivery_text TEXT DEFAULT '3-5 business days',
ADD COLUMN IF NOT EXISTS shipping_method TEXT DEFAULT 'standard',
ADD COLUMN IF NOT EXISTS free_shipping BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS free_shipping_threshold DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS is_digital BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS requires_prescription BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS min_order_quantity INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS max_order_quantity INTEGER,
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS meta_title TEXT,
ADD COLUMN IF NOT EXISTS meta_description TEXT,
ADD COLUMN IF NOT EXISTS meta_keywords TEXT[],
ADD COLUMN IF NOT EXISTS return_policy TEXT DEFAULT '30-day return policy',
ADD COLUMN IF NOT EXISTS warranty TEXT,
ADD COLUMN IF NOT EXISTS safety_warnings TEXT,
ADD COLUMN IF NOT EXISTS directions TEXT,
ADD COLUMN IF NOT EXISTS ingredients TEXT,
ADD COLUMN IF NOT EXISTS allergens TEXT[],
ADD COLUMN IF NOT EXISTS storage_instructions TEXT,
ADD COLUMN IF NOT EXISTS expiration_date DATE,
ADD COLUMN IF NOT EXISTS batch_number TEXT,
ADD COLUMN IF NOT EXISTS supplier TEXT,
ADD COLUMN IF NOT EXISTS supplier_sku TEXT,
ADD COLUMN IF NOT EXISTS admin_notes TEXT,
ADD COLUMN IF NOT EXISTS internal_code TEXT;

-- Create product_images table if not exists
CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    alt_text TEXT,
    position INTEGER DEFAULT 0,
    is_thumbnail BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Associate products with multiple categories
CREATE TABLE IF NOT EXISTS public.product_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, category_id)
);

-- Update RLS policies for new tables
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "product_images_select" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "product_images_manage_admin" ON public.product_images FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.is_admin = true
    )
);

CREATE POLICY "product_categories_select" ON public.product_categories FOR SELECT USING (true);
CREATE POLICY "product_categories_manage_admin" ON public.product_categories FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.is_admin = true
    )
);
