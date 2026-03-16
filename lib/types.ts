export type UserRole = 'customer' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  company_name?: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent_category_id?: string;
  icon_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  sku?: string;
  price: number;
  stock_quantity: number;
  category_id?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  product?: Product;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  notes?: string;
  scheduled_delivery_date?: string;
  order_items?: OrderItem[];
  created_at: string;
  updated_at: string;
  cancelled_at?: string;
  users?: {
    email: string;
  };
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  type: 'order_confirmation' | 'order_shipped' | 'stock_alert' | 'payment_received' | 'order_delayed' | 'custom';
  subject: string;
  html_content: string;
  variables: string[];
  created_at: string;
  updated_at: string;
}

export interface EmailLog {
  id: string;
  recipient_email: string;
  template_id?: string;
  order_id?: string;
  subject: string;
  status: 'sent' | 'failed' | 'bounced';
  sent_at: string;
}

export interface CustomerMetrics {
  user_id: string;
  total_orders: number;
  total_spent: number;
  last_order_date?: string;
  lifetime_value: number;
  created_at: string;
  updated_at: string;
}

export interface DashboardMetrics {
  total_revenue: number;
  total_orders: number;
  active_customers: number;
  pending_orders: number;
  out_of_stock_items: number;
  revenue_trend: Array<{ date: string; revenue: number }>;
  top_products: Product[];
  recent_orders: Order[];
}
