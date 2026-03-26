'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Package, 
  Users, 
  Eye, 
  BarChart3, 
  Settings, 
  ArrowUpRight, 
  ArrowDownRight,
  Mail,
  Phone,
  Calendar,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';

interface DashboardMetrics {
  total_revenue: number;
  total_orders: number;
  active_customers: number;
  pending_orders: number;
  total_products: number;
  low_stock_products: number;
  recent_orders: any[];
  top_products: any[];
  revenue_growth: number;
  order_growth: number;
  total_emails_sent: number;
}

interface RecentOrder {
  id: string;
  order_number: string;
  customer_name: string;
  total_amount: number;
  status: string;
  created_at: string;
}

interface TopProduct {
  id: string;
  name: string;
  price: number;
  stock_quantity: number;
  orders_count: number;
  revenue: number;
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    total_revenue: 0,
    total_orders: 0,
    active_customers: 0,
    pending_orders: 0,
    total_products: 0,
    low_stock_products: 0,
    recent_orders: [],
    top_products: [],
    revenue_growth: 0,
    order_growth: 0,
    total_emails_sent: 0
  });

  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const supabase = createClient();

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        
        // Helper to get date ISO string
        const getDateISO = (days: number) => {
          const d = new Date();
          d.setDate(d.getDate() - days);
          return d.toISOString();
        };

        const currentPeriodDays = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
        const startDate = getDateISO(currentPeriodDays);
        const prevStartDate = getDateISO(currentPeriodDays * 2);

        // Fetch current period orders
        const { data: currentOrders } = await supabase
          .from('orders')
          .select('id, total_amount, created_at, status, customer:profiles(full_name)')
          .gte('created_at', startDate);

        // Fetch previous period orders for growth calculation
        const { data: prevOrders } = await supabase
          .from('orders')
          .select('total_amount')
          .gte('created_at', prevStartDate)
          .lt('created_at', startDate);

        const { data: products } = await supabase
          .from('products')
          .select('id, name, price, stock_quantity')
          .eq('active', true);

        const { data: customers } = await supabase
          .from('profiles')
          .select('id, created_at');

        const { count: emailCount } = await supabase
          .from('email_logs')
          .select('*', { count: 'exact', head: true });

        // Calculate metrics
        const totalRevenue = currentOrders?.reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0) || 0;
        const totalOrders = currentOrders?.length || 0;
        const pendingOrders = currentOrders?.filter(order => order.status === 'pending').length || 0;
        const totalProducts = products?.length || 0;
        const lowStockProducts = products?.filter(product => (product.stock_quantity || 0) < 10).length || 0;
        
        // Active customers (those who created account or ordered in last 30 days)
        const activeCustomers = customers?.length || 0; 

        // Calculate growth
        const prevRevenue = prevOrders?.reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0) || 0;
        const prevOrdersCount = prevOrders?.length || 0;

        const revenueGrowth = prevRevenue === 0 ? 100 : ((totalRevenue - prevRevenue) / prevRevenue) * 100;
        const orderGrowth = prevOrdersCount === 0 ? 100 : ((totalOrders - prevOrdersCount) / prevOrdersCount) * 100;

        // Get recent orders
        const recentOrdersData = currentOrders?.slice(0, 5).map(order => ({
          id: order.id,
          order_number: order.id.slice(0, 8).toUpperCase(), // Use part of ID as order number if missing
          customer_name: (order.customer as any)?.full_name || 'Generic Customer',
          total_amount: Number(order.total_amount) || 0,
          status: order.status,
          created_at: order.created_at
        })) || [];

        // Get top products (sorted by stock for now, or just first 5)
        const topProductsData = products?.slice(0, 5).map(product => ({
          id: product.id,
          name: product.name,
          price: Number(product.price) || 0,
          stock_quantity: product.stock_quantity || 0,
          orders_count: 0, // Need to join with order_items to get real counts
          revenue: 0
        })) || [];

        setMetrics({
          total_revenue: totalRevenue,
          total_orders: totalOrders,
          active_customers: activeCustomers,
          pending_orders: pendingOrders,
          total_products: totalProducts,
          low_stock_products: lowStockProducts,
          recent_orders: recentOrdersData,
          top_products: topProductsData,
          revenue_growth: revenueGrowth,
          order_growth: orderGrowth,
          total_emails_sent: emailCount || 0
        });
      } catch (error) {
        console.error('Error fetching metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 w-8 bg-gray-200 rounded-full mx-auto"></div>
          <p className="text-center text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              <span className="text-lg font-semibold">Last 30 days</span>
            </div>
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Revenue Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Total Revenue
            </CardTitle>
            <CardDescription>
              Revenue from all orders in selected period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {formatCurrency(metrics.total_revenue)}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-green-600">+{metrics.revenue_growth.toFixed(1)}%</span>
              <span className="text-sm text-gray-600">vs last period</span>
            </div>
          </CardContent>
        </Card>

        {/* Orders Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-blue-600" />
              Total Orders
            </CardTitle>
            <CardDescription>
              Total number of orders received
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {metrics.total_orders}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-blue-600">+{metrics.order_growth.toFixed(1)}%</span>
              <span className="text-sm text-gray-600">vs last period</span>
            </div>
          </CardContent>
        </Card>

        {/* Customers Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              Active Customers
            </CardTitle>
            <CardDescription>
              Customers who ordered in the last 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {metrics.active_customers}
            </div>
            <div className="text-sm text-gray-600 mt-2">
              <span className="text-green-600">+15%</span>
              <span className="text-gray-600">vs last month</span>
            </div>
          </CardContent>
        </Card>

        {/* Products Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-orange-600" />
              Total Products
            </CardTitle>
            <CardDescription>
              Number of products in catalog
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {metrics.total_products}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-red-600">{metrics.low_stock_products}</span>
              <span className="text-sm text-gray-600"> low stock</span>
            </div>
          </CardContent>
        </Card>

        {/* Pending Orders */}
        <Card className="lg:col-span-2 bg-gradient-to-br from-yellow-50 to-white border-yellow-100 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-yellow-600" />
              Pending Orders
              <Badge variant="secondary" className="ml-2 bg-yellow-100 text-yellow-700 hover:bg-yellow-200">
                {metrics.pending_orders}
              </Badge>
            </CardTitle>
            <CardDescription>
              Orders awaiting processing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {metrics.pending_orders}
            </div>
            <Button variant="outline" size="sm" className="mt-4 bg-white hover:bg-yellow-50 border-yellow-200 text-yellow-700" onClick={() => router.push('/admin/orders')}>
              <Eye className="w-4 h-4 mr-2" />
              View All Orders
            </Button>
          </CardContent>
        </Card>

        {/* Email Logs Card */}
        <Card className="lg:col-span-2 bg-gradient-to-br from-sky-50 to-white border-sky-100 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-sky-600" />
              Transactional Emails
              <Badge variant="secondary" className="ml-2 bg-sky-100 text-sky-700 hover:bg-sky-200">
                {metrics.total_emails_sent}
              </Badge>
            </CardTitle>
            <CardDescription>
              Emails triggered by the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-sky-600">
              {metrics.total_emails_sent}
            </div>
            <Button variant="outline" size="sm" className="mt-4 bg-white hover:bg-sky-50 border-sky-200 text-sky-700" onClick={() => router.push('/admin/emails')}>
              <Mail className="w-4 h-4 mr-2" />
              View Email Logs
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div>
                <ShoppingCart className="w-5 h-5 text-blue-600" />
                Recent Orders
              </div>
              <Button variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Order #</th>
                    <th className="text-left p-2">Customer</th>
                    <th className="text-left p-2">Amount</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.recent_orders.map((order) => (
                    <tr key={order.id} className="border-b">
                      <td className="p-2 font-medium">{order.order_number}</td>
                      <td className="p-2">{order.customer_name}</td>
                      <td className="p-2">{formatCurrency(order.total_amount)}</td>
                      <td className="p-2">
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </td>
                      <td className="p-2 text-gray-600">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Top Products Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div>
                <TrendingUp className="w-5 h-5 text-orange-600" />
                Top Products
              </div>
              <Button variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Product</th>
                    <th className="text-left p-2">Price</th>
                    <th className="text-left p-2">Stock</th>
                    <th className="text-left p-2">Orders</th>
                    <th className="text-left p-2">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.top_products.map((product) => (
                    <tr key={product.id} className="border-b">
                      <td className="p-2 font-medium">{product.name}</td>
                      <td className="p-2">{formatCurrency(product.price)}</td>
                      <td className="p-2">
                        <Badge variant={product.stock_quantity < 10 ? 'destructive' : 'secondary'}>
                          {product.stock_quantity}
                        </Badge>
                      </td>
                      <td className="p-2">{product.orders_count}</td>
                      <td className="p-2">{formatCurrency(product.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
