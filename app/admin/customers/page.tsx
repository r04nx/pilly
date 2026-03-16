'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Search, Mail, Users, TrendingUp, DollarSign, Calendar, Filter } from 'lucide-react';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [segmentFilter, setSegmentFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const supabase = createClient();

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const { data: customersData, error: queryError } = await supabase
          .from('customer_metrics')
          .select('*')
          .order('updated_at', { ascending: false });

        if (queryError) throw new Error(queryError.message);
        setCustomers(customersData || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load customers');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = searchQuery === '' || 
      c.user_id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSegment = segmentFilter === 'all' ||
      (segmentFilter === 'vip' && c.lifetime_value > 1000) ||
      (segmentFilter === 'regular' && c.lifetime_value > 100 && c.lifetime_value <= 1000) ||
      (segmentFilter === 'new' && c.total_orders <= 2) ||
      (segmentFilter === 'inactive' && c.last_order_date && new Date(c.last_order_date) < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    
    return matchesSearch && matchesSegment;
  });

  const getCustomerSegment = (customer: any) => {
    if (customer.lifetime_value > 1000) return { label: 'VIP', color: 'default' };
    if (customer.lifetime_value > 100) return { label: 'Regular', color: 'secondary' };
    if (customer.total_orders <= 2) return { label: 'New', color: 'outline' };
    if (customer.last_order_date && new Date(customer.last_order_date) < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) {
      return { label: 'Inactive', color: 'destructive' };
    }
    return { label: 'Regular', color: 'secondary' };
  };

  const totalCustomers = customers.length;
  const totalRevenue = customers.reduce((sum, c) => sum + (c.lifetime_value || 0), 0);
  const averageOrderValue = customers.length > 0 
    ? customers.reduce((sum, c) => sum + (c.total_orders > 0 ? c.lifetime_value / c.total_orders : 0), 0) / customers.length 
    : 0;
  const vipCustomers = customers.filter(c => c.lifetime_value > 1000).length;

  if (isLoading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-8">Customers</h1>

        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-destructive">{error}</p>
          </div>
        )}

        {/* Customer Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900">{totalCustomers}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${totalRevenue.toFixed(0)}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Avg Order Value</p>
                <p className="text-2xl font-bold text-gray-900">${averageOrderValue.toFixed(0)}</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">VIP Customers</p>
                <p className="text-2xl font-bold text-gray-900">{vipCustomers}</p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Users className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search by customer ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <Select value={segmentFilter} onValueChange={setSegmentFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Customers</SelectItem>
                <SelectItem value="vip">VIP Customers</SelectItem>
                <SelectItem value="regular">Regular Customers</SelectItem>
                <SelectItem value="new">New Customers</SelectItem>
                <SelectItem value="inactive">Inactive Customers</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Customers Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Customers ({filteredCustomers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredCustomers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-border bg-muted/50">
                    <tr>
                      <th className="px-6 py-4 text-left font-medium text-foreground">Customer</th>
                      <th className="px-6 py-4 text-left font-medium text-foreground">Segment</th>
                      <th className="px-6 py-4 text-right font-medium text-foreground">Orders</th>
                      <th className="px-6 py-4 text-right font-medium text-foreground">Total Spent</th>
                      <th className="px-6 py-4 text-right font-medium text-foreground">Lifetime Value</th>
                      <th className="px-6 py-4 text-left font-medium text-foreground">Last Order</th>
                      <th className="px-6 py-4 text-right font-medium text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredCustomers.map((customer) => {
                      const segment = getCustomerSegment(customer);
                      return (
                        <tr key={customer.user_id} className="hover:bg-muted/50 transition">
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-foreground">Customer {customer.user_id.slice(0, 8)}</p>
                              <p className="text-sm text-muted-foreground">ID: {customer.user_id}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant={segment.color as any} className="text-xs">
                              {segment.label}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-right text-foreground">{customer.total_orders}</td>
                          <td className="px-6 py-4 text-right font-semibold text-foreground">
                            ${customer.total_spent?.toFixed(2) || '0.00'}
                          </td>
                          <td className="px-6 py-4 text-right font-semibold text-foreground">
                            ${customer.lifetime_value?.toFixed(2) || '0.00'}
                          </td>
                          <td className="px-6 py-4 text-foreground">
                            {customer.last_order_date ? (
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <span>{new Date(customer.last_order_date).toLocaleDateString()}</span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">No orders</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Button variant="ghost" size="sm">
                              <Mail className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center">
                <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">
                  {searchQuery || segmentFilter !== 'all' ? 'No customers found matching your criteria' : 'No customers yet'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
