-- Categories: public read, admin write
CREATE POLICY "categories_select_all" ON public.categories FOR SELECT USING (true);
CREATE POLICY "categories_insert_admin" ON public.categories FOR INSERT WITH CHECK (
  (SELECT raw_user_meta_data->>'is_admin' FROM auth.users WHERE id = auth.uid()) = 'true'
);
CREATE POLICY "categories_update_admin" ON public.categories FOR UPDATE USING (
  (SELECT raw_user_meta_data->>'is_admin' FROM auth.users WHERE id = auth.uid()) = 'true'
);
CREATE POLICY "categories_delete_admin" ON public.categories FOR DELETE USING (
  (SELECT raw_user_meta_data->>'is_admin' FROM auth.users WHERE id = auth.uid()) = 'true'
);

-- Products: public read, admin write
CREATE POLICY "products_select_all" ON public.products FOR SELECT USING (true);
CREATE POLICY "products_insert_admin" ON public.products FOR INSERT WITH CHECK (
  (SELECT raw_user_meta_data->>'is_admin' FROM auth.users WHERE id = auth.uid()) = 'true'
);
CREATE POLICY "products_update_admin" ON public.products FOR UPDATE USING (
  (SELECT raw_user_meta_data->>'is_admin' FROM auth.users WHERE id = auth.uid()) = 'true'
);
CREATE POLICY "products_delete_admin" ON public.products FOR DELETE USING (
  (SELECT raw_user_meta_data->>'is_admin' FROM auth.users WHERE id = auth.uid()) = 'true'
);

-- Orders: users see their own, admins see all
CREATE POLICY "orders_select_own_or_admin" ON public.orders FOR SELECT USING (
  auth.uid() = user_id OR 
  (SELECT raw_user_meta_data->>'is_admin' FROM auth.users WHERE id = auth.uid()) = 'true'
);
CREATE POLICY "orders_insert_own" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "orders_update_admin" ON public.orders FOR UPDATE USING (
  (SELECT raw_user_meta_data->>'is_admin' FROM auth.users WHERE id = auth.uid()) = 'true'
);
CREATE POLICY "orders_delete_own" ON public.orders FOR DELETE USING (auth.uid() = user_id);

-- Order Items: users see items from their orders, admins see all
CREATE POLICY "order_items_select_own_or_admin" ON public.order_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id 
    AND (orders.user_id = auth.uid() OR 
         (SELECT raw_user_meta_data->>'is_admin' FROM auth.users WHERE id = auth.uid()) = 'true')
  )
);
CREATE POLICY "order_items_insert_own" ON public.order_items FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()
  )
);

-- Support Tickets: users see their own, admins see all
CREATE POLICY "support_tickets_select_own_or_admin" ON public.support_tickets FOR SELECT USING (
  auth.uid() = user_id OR 
  (SELECT raw_user_meta_data->>'is_admin' FROM auth.users WHERE id = auth.uid()) = 'true'
);
CREATE POLICY "support_tickets_insert_own" ON public.support_tickets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "support_tickets_update_admin" ON public.support_tickets FOR UPDATE USING (
  (SELECT raw_user_meta_data->>'is_admin' FROM auth.users WHERE id = auth.uid()) = 'true'
);

-- Email Templates: admin only
CREATE POLICY "email_templates_select_admin" ON public.email_templates FOR SELECT USING (
  (SELECT raw_user_meta_data->>'is_admin' FROM auth.users WHERE id = auth.uid()) = 'true'
);
CREATE POLICY "email_templates_insert_admin" ON public.email_templates FOR INSERT WITH CHECK (
  (SELECT raw_user_meta_data->>'is_admin' FROM auth.users WHERE id = auth.uid()) = 'true'
);
CREATE POLICY "email_templates_update_admin" ON public.email_templates FOR UPDATE USING (
  (SELECT raw_user_meta_data->>'is_admin' FROM auth.users WHERE id = auth.uid()) = 'true'
);
CREATE POLICY "email_templates_delete_admin" ON public.email_templates FOR DELETE USING (
  (SELECT raw_user_meta_data->>'is_admin' FROM auth.users WHERE id = auth.uid()) = 'true'
);

-- Email Logs: admin only
CREATE POLICY "email_logs_select_admin" ON public.email_logs FOR SELECT USING (
  (SELECT raw_user_meta_data->>'is_admin' FROM auth.users WHERE id = auth.uid()) = 'true'
);
CREATE POLICY "email_logs_insert_admin" ON public.email_logs FOR INSERT WITH CHECK (
  (SELECT raw_user_meta_data->>'is_admin' FROM auth.users WHERE id = auth.uid()) = 'true'
);

-- Customer Metrics: users see their own, admins see all
CREATE POLICY "customer_metrics_select_own_or_admin" ON public.customer_metrics FOR SELECT USING (
  auth.uid() = user_id OR 
  (SELECT raw_user_meta_data->>'is_admin' FROM auth.users WHERE id = auth.uid()) = 'true'
);
CREATE POLICY "customer_metrics_update_admin" ON public.customer_metrics FOR UPDATE USING (
  (SELECT raw_user_meta_data->>'is_admin' FROM auth.users WHERE id = auth.uid()) = 'true'
);
