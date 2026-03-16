'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, TrendingUp, Users, Package, ShoppingCart, ArrowRight } from 'lucide-react';

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    activeCustomers: 0,
    pendingOrders: 0,
    outOfStockItems: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const supabase = createClient();

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        // Get all orders
        const { data: orders, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .neq('status', 'cancelled');

        if (ordersError) throw new Error(ordersError.message);

        const totalRevenue = orders.reduce((sum: number, order: any) => sum + (order.total_amount || 0), 0);
        const pendingOrders = orders.filter((o: any) => o.status === 'pending').length;

        // Get all products
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select('stock_quantity');

        if (productsError) throw new Error(productsError.message);
        const outOfStockItems = products.filter((p: any) => p.stock_quantity === 0).length;

        // Get unique customers
        const { data: customers, error: customersError } = await supabase
          .from('orders')
          .select('user_id')
          .neq('status', 'cancelled');

        if (customersError) throw new Error(customersError.message);
        const uniqueCustomers = new Set(customers.map((c: any) => c.user_id)).size;

        setMetrics({
          totalRevenue,
          totalOrders: orders.length,
          activeCustomers: uniqueCustomers,
          pendingOrders,
          outOfStockItems,
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

        {/* Metrics Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Total Revenue</p>
                <p className="text-2xl font-bold text-foreground">${metrics.totalRevenue.toFixed(0)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-primary/20" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Total Orders</p>
                <p className="text-2xl font-bold text-foreground">{metrics.totalOrders}</p>
              </div>
              <ShoppingCart className="w-8 h-8 text-primary/20" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Active Customers</p>
                <p className="text-2xl font-bold text-foreground">{metrics.activeCustomers}</p>
              </div>
              <Users className="w-8 h-8 text-primary/20" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Pending Orders</p>
                <p className="text-2xl font-bold text-foreground text-yellow-600">{metrics.pendingOrders}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-600/20" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Out of Stock</p>
                <p className="text-2xl font-bold text-foreground text-red-600">{metrics.outOfStockItems}</p>
              </div>
              <Package className="w-8 h-8 text-red-600/20" />
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
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted/50">
                  <tr>
                    <th className="px-6 py-4 text-left font-medium text-foreground">Order ID</th>
                    <th className="px-6 py-4 text-left font-medium text-foreground">Date</th>
                    <th className="px-6 py-4 text-left font-medium text-foreground">Amount</th>
                    <th className="px-6 py-4 text-left font-medium text-foreground">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentOrders.map((order: any) => (
                    <tr key={order.id} className="hover:bg-muted/50 transition">
                      <td className="px-6 py-4 font-mono text-xs text-primary">{order.id.slice(0, 8)}</td>
                      <td className="px-6 py-4 text-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-foreground font-semibold">
                        ${order.total_amount?.toFixed(2) || '0.00'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center text-muted-foreground">No orders yet</div>
          )}
        </Card>
      </div>
    </div>
  );
}
