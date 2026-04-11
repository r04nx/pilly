-- Fix 1: Make your account an admin
-- IMPORTANT: Replace 'your-admin-email@example.com' with the exact email you use to log in to the admin dashboard!
UPDATE profiles SET is_admin = true WHERE email = 'YOUR_ADMIN_EMAIL_HERE';

-- Fix 2: Allow Admins to see all profiles (so customer names and emails show up on the order)
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles AS p 
            WHERE p.id = auth.uid() 
            AND p.is_admin = true
        )
    );

-- Fix 3: Allow Admins to see all order items (so the purchased products show up)
DROP POLICY IF EXISTS "Admins can view all order items" ON order_items;
CREATE POLICY "Admins can view all order items" ON order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );
