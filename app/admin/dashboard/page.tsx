'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, TrendingUp, TrendingDown, Users, Package, ShoppingCart, ArrowRight, DollarSign, Activity, Clock } from 'lucide-react';

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    activeCustomers: 0,
    pendingOrders: 0,
    outOfStockItems: 0,
    monthlyRevenue: 0,
    monthlyOrders: 0,
    averageOrderValue: 0,
    conversionRate: 0,
    topProducts: [],
    recentActivity: [],
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [lastMonthMetrics, setLastMonthMetrics] = useState({
    revenue: 0,
    orders: 0,
    customers: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const supabase = createClient();

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const now = new Date();
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

        // Get all orders
        const { data: orders, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .neq('status', 'cancelled');

        if (ordersError) throw new Error(ordersError.message);

        // Calculate metrics
        const totalRevenue = orders.reduce((sum: number, order: any) => sum + (order.total_amount || 0), 0);
        const totalOrders = orders.length;
        const pendingOrders = orders.filter((o: any) => o.status === 'pending').length;
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // Monthly calculations
        const monthlyOrders = orders.filter((o: any) => 
          new Date(o.created_at) >= currentMonthStart
        ).length;
        
        const monthlyRevenue = orders
          .filter((o: any) => new Date(o.created_at) >= currentMonthStart)
          .reduce((sum: number, order: any) => sum + (order.total_amount || 0), 0);

        // Last month calculations for comparison
        const lastMonthOrders = orders.filter((o: any) => {
          const orderDate = new Date(o.created_at);
          return orderDate >= lastMonthStart && orderDate <= lastMonthEnd;
        }).length;
        
        const lastMonthRevenue = orders
          .filter((o: any) => {
            const orderDate = new Date(o.created_at);
            return orderDate >= lastMonthStart && orderDate <= lastMonthEnd;
          })
          .reduce((sum: number, order: any) => sum + (order.total_amount || 0), 0);

        // Get products and stock info
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select('*');

        if (productsError) throw new Error(productsError.message);
        const outOfStockItems = products.filter((p: any) => p.stock_quantity === 0).length;
        const lowStockItems = products.filter((p: any) => p.stock_quantity > 0 && p.stock_quantity <= 10).length;

        // Get top products
        const { data: orderItems, error: orderItemsError } = await supabase
          .from('order_items')
          .select('*, products(name)');

        let topProducts = [];
        if (!orderItemsError && orderItems) {
          const productSales = orderItems.reduce((acc: any, item: any) => {
            const productId = item.product_id;
            const productName = item.products?.name || 'Unknown Product';
            acc[productId] = acc[productId] || { name: productName, quantity: 0, revenue: 0 };
            acc[productId].quantity += item.quantity || 0;
            acc[productId].revenue += (item.quantity || 0) * (item.unit_price || 0);
            return acc;
          }, {});
          
          topProducts = Object.values(productSales)
            .sort((a: any, b: any) => b.quantity - a.quantity)
            .slice(0, 5);
        }

        // Get unique customers
        const uniqueCustomers = new Set(orders.map((o: any) => o.user_id)).size;
        const lastMonthCustomers = new Set(
          orders
            .filter((o: any) => {
              const orderDate = new Date(o.created_at);
              return orderDate >= lastMonthStart && orderDate <= lastMonthEnd;
            })
            .map((o: any) => o.user_id)
        ).size;

        setMetrics({
          totalRevenue,
          totalOrders,
          activeCustomers: uniqueCustomers,
          pendingOrders,
          outOfStockItems,
          monthlyRevenue,
          monthlyOrders,
          averageOrderValue,
          conversionRate: 0, // Would need more data for accurate calculation
          topProducts,
          recentActivity: [], // Would need activity logs
        });

        setLastMonthMetrics({
          revenue: lastMonthRevenue,
          orders: lastMonthOrders,
          customers: lastMonthCustomers,
        });

        // Get recent orders
        const { data: recent } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        setRecentOrders(recent || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load metrics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-8">Dashboard</h1>

        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-destructive">{error}</p>
          </div>
        )}

        {/* Enhanced Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex items-center gap-1">
                {calculatePercentageChange(metrics.monthlyRevenue, lastMonthMetrics.revenue) > 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-600" />
                )}
                <span className={`text-sm font-medium ${
                  calculatePercentageChange(metrics.monthlyRevenue, lastMonthMetrics.revenue) > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {Math.abs(calculatePercentageChange(metrics.monthlyRevenue, lastMonthMetrics.revenue)).toFixed(1)}%
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Monthly Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.monthlyRevenue)}</p>
              <p className="text-xs text-gray-500 mt-1">{formatCurrency(lastMonthMetrics.revenue)} last month</p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex items-center gap-1">
                {calculatePercentageChange(metrics.monthlyOrders, lastMonthMetrics.orders) > 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-600" />
                )}
                <span className={`text-sm font-medium ${
                  calculatePercentageChange(metrics.monthlyOrders, lastMonthMetrics.orders) > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {Math.abs(calculatePercentageChange(metrics.monthlyOrders, lastMonthMetrics.orders)).toFixed(1)}%
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Monthly Orders</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.monthlyOrders}</p>
              <p className="text-xs text-gray-500 mt-1">{lastMonthMetrics.orders} last month</p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex items-center gap-1">
                {calculatePercentageChange(metrics.activeCustomers, lastMonthMetrics.customers) > 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-600" />
                )}
                <span className={`text-sm font-medium ${
                  calculatePercentageChange(metrics.activeCustomers, lastMonthMetrics.customers) > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {Math.abs(calculatePercentageChange(metrics.activeCustomers, lastMonthMetrics.customers)).toFixed(1)}%
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Active Customers</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.activeCustomers}</p>
              <p className="text-xs text-gray-500 mt-1">{lastMonthMetrics.customers} last month</p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Activity className="w-6 h-6 text-orange-600" />
              </div>
              <Badge variant={metrics.averageOrderValue > 100 ? 'default' : 'secondary'}>
                {metrics.averageOrderValue > 100 ? 'Good' : 'Normal'}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Avg Order Value</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.averageOrderValue)}</p>
              <p className="text-xs text-gray-500 mt-1">Per order</p>
            </div>
          </Card>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 border-yellow-200 bg-yellow-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-800 mb-1">Pending Orders</p>
                <p className="text-2xl font-bold text-yellow-900">{metrics.pendingOrders}</p>
                <p className="text-xs text-yellow-700 mt-1">Require attention</p>
              </div>
              <div className="p-3 bg-yellow-200 rounded-full">
                <Clock className="w-6 h-6 text-yellow-800" />
              </div>
            </div>
            {metrics.pendingOrders > 0 && (
              <div className="mt-4">
                <Link href="/admin/orders?filter=pending">
                  <Button size="sm" className="w-full bg-yellow-600 hover:bg-yellow-700">
                    Review Orders
                  </Button>
                </Link>
              </div>
            )}
          </Card>

          <Card className="p-6 border-red-200 bg-red-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-800 mb-1">Out of Stock</p>
                <p className="text-2xl font-bold text-red-900">{metrics.outOfStockItems}</p>
                <p className="text-xs text-red-700 mt-1">Items unavailable</p>
              </div>
              <div className="p-3 bg-red-200 rounded-full">
                <Package className="w-6 h-6 text-red-800" />
              </div>
            </div>
            {metrics.outOfStockItems > 0 && (
              <div className="mt-4">
                <Link href="/admin/products?filter=out-of-stock">
                  <Button size="sm" className="w-full bg-red-600 hover:bg-red-700">
                    Update Inventory
                  </Button>
                </Link>
              </div>
            )}
          </Card>

          <Card className="p-6 border-green-200 bg-green-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-800 mb-1">Total Revenue</p>
                <p className="text-2xl font-bold text-green-900">{formatCurrency(metrics.totalRevenue)}</p>
                <p className="text-xs text-green-700 mt-1">All time</p>
              </div>
              <div className="p-3 bg-green-200 rounded-full">
                <TrendingUp className="w-6 h-6 text-green-800" />
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Link href="/admin/products">
            <Card className="p-6 hover:shadow-lg transition cursor-pointer h-full">
              <Package className="w-6 h-6 text-primary mb-2" />
              <h3 className="font-semibold text-foreground mb-1">Manage Products</h3>
              <p className="text-sm text-muted-foreground">Add, edit products & categories</p>
            </Card>
          </Link>

          <Link href="/admin/orders">
            <Card className="p-6 hover:shadow-lg transition cursor-pointer h-full">
              <ShoppingCart className="w-6 h-6 text-primary mb-2" />
              <h3 className="font-semibold text-foreground mb-1">Process Orders</h3>
              <p className="text-sm text-muted-foreground">View and manage all orders</p>
            </Card>
          </Link>

          <Link href="/admin/emails">
            <Card className="p-6 hover:shadow-lg transition cursor-pointer h-full">
              <TrendingUp className="w-6 h-6 text-primary mb-2" />
              <h3 className="font-semibold text-foreground mb-1">Email Campaigns</h3>
              <p className="text-sm text-muted-foreground">Send transactional emails</p>
            </Card>
          </Link>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Top Products
              </CardTitle>
              <CardDescription>
                Best selling products this month
              </CardDescription>
            </CardHeader>
            <CardContent>
              {metrics.topProducts.length > 0 ? (
                <div className="space-y-4">
                  {metrics.topProducts.map((product: any, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-500">{product.quantity} units sold</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{formatCurrency(product.revenue)}</p>
                        <p className="text-sm text-gray-500">Revenue</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No sales data available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card>
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">Recent Orders</h2>
              <Link href="/admin/orders">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

            {recentOrders.length > 0 ? (
              <div className="p-6 space-y-4">
                {recentOrders.map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div>
                        <p className="font-medium text-gray-900">Order #{order.id.slice(0, 8)}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{formatCurrency(order.total_amount || 0)}</p>
                      <Badge variant={
                        order.status === 'pending' ? 'secondary' :
                        order.status === 'delivered' ? 'default' :
                        'outline'
                      }>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-muted-foreground">
                <ShoppingCart className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No orders yet</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
