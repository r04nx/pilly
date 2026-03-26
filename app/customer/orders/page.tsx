'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  ArrowRight,
  Eye,
  Download,
  Filter,
  Search,
  Calendar,
  DollarSign,
  ShoppingBag,
  ShoppingCart,
  MapPin,
  CreditCard,
  RefreshCw
} from 'lucide-react';

interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  product_image: string;
  quantity: number;
  price: number;
  variant?: string;
}

interface Order {
  id: string;
  order_number: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  shipping_amount: number;
  tax_amount: number;
  shipping_address: any;
  billing_address: any;
  payment_method: string;
  tracking_number?: string;
  estimated_delivery?: string;
  created_at: string;
  updated_at: string;
  order_items: any[];
}

export default function CustomerOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const supabase = createClient();

  const statusConfig = {
    pending: { label: 'Pending', color: 'bg-amber-100 text-amber-800', icon: Clock },
    confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
    processing: { label: 'Processing', color: 'bg-indigo-100 text-indigo-800', icon: Package },
    shipped: { label: 'Shipped', color: 'bg-purple-100 text-purple-800', icon: Truck },
    delivered: { label: 'Delivered', color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle },
    cancelled: { label: 'Cancelled', color: 'bg-rose-100 text-rose-800', icon: XCircle },
    refunded: { label: 'Refunded', color: 'bg-gray-100 text-gray-800', icon: RefreshCw },
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (
              *,
              products (
                name,
                image_url
              )
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setOrders(data || []);
        setFilteredOrders(data || []);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError('Failed to load orders. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  useEffect(() => {
    let filtered = orders;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(order =>
        (order.order_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.order_items.some(item => (item.products?.name || '').toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Filter by date
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case '7days':
          filterDate.setDate(now.getDate() - 7);
          break;
        case '30days':
          filterDate.setDate(now.getDate() - 30);
          break;
        case '90days':
          filterDate.setDate(now.getDate() - 90);
          break;
        case '1year':
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      filtered = filtered.filter(order => 
        new Date(order.created_at) >= filterDate
      );
    }

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter, dateFilter]);

  const getOrderStatusSteps = (status: string) => {
    const steps = [
      { key: 'pending', label: 'Order Placed', completed: true },
      { key: 'processing', label: 'Processing', completed: ['processing', 'shipped', 'delivered', 'refunded'].includes(status) },
      { key: 'shipped', label: 'Shipped', completed: ['shipped', 'delivered', 'refunded'].includes(status) },
      { key: 'delivered', label: 'Delivered', completed: status === 'delivered' || status === 'refunded' }
    ];
    
    if (status === 'cancelled') {
      return steps.slice(0, 1).concat([{ key: 'cancelled', label: 'Cancelled', completed: true }]);
    }
    
    if (status === 'refunded') {
      return steps.slice(0, 4).concat([{ key: 'refunded', label: 'Refunded', completed: true }]);
    }
    
    return steps;
  };

  const viewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    
    setLoading(true);
    try {
      const resp = await fetch(`/api/customer/orders/\${orderId}/cancel`, {
        method: 'POST'
      });
      const data = await resp.json();
      
      if (data.success) {
        // Refresh local state
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'cancelled' } : o));
        alert('Order cancelled successfully.');
      } else {
        alert(data.error || 'Failed to cancel order');
      }
    } catch (err) {
      console.error('Cancel error:', err);
      alert('An error occurred while cancelling your order.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Your Orders</h1>
        <p className="text-gray-600">Track and manage your orders</p>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by order number or product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Time Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="90days">Last 90 Days</SelectItem>
                <SelectItem value="1year">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Order Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold">{orders.length}</p>
              </div>
              <Package className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Delivered</p>
                <p className="text-2xl font-bold">{orders.filter(o => o.status === 'delivered').length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Transit</p>
                <p className="text-2xl font-bold">{orders.filter(o => ['processing', 'shipped'].includes(o.status)).length}</p>
              </div>
              <Truck className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold">${orders.reduce((sum, o) => sum + o.total_amount, 0).toFixed(2)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No orders found</h3>
            <p className="text-gray-600 mb-4">You haven't placed any orders yet.</p>
            <Button onClick={() => window.location.href = '/customer/products'}>
              Start Shopping
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const StatusIcon = statusConfig[order.status].icon;
            return (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="font-semibold text-lg">{order.order_number || order.id.slice(0, 8).toUpperCase()}</h3>
                        <Badge className={`${statusConfig[order.status]?.color || 'bg-gray-100 text-gray-800'}`}>
                          {StatusIcon && <StatusIcon className="w-3 h-3 mr-1" />}
                          {statusConfig[order.status]?.label || order.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Placed on {new Date(order.created_at).toLocaleDateString()}
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <span>{order.order_items.length} items</span>
                        <span>•</span>
                        <span className="font-semibold">${Number(order.total_amount).toFixed(2)}</span>
                        {order.tracking_number && (
                          <>
                            <span>•</span>
                            <span>Tracking: {order.tracking_number}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewOrderDetails(order)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(`/api/invoice/${order.id}`, '_blank')}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Invoice
                      </Button>
                      {['pending', 'processing'].includes(order.status) && (
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleCancelOrder(order.id)}
                          disabled={loading}
                        >
                          Cancel Order
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="mt-4 flex gap-4">
                    {order.order_items.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex items-center gap-2">
                        <img
                          src={item.products?.image_url || 'https://picsum.photos/seed/product/100/100'}
                          alt={item.products?.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="text-sm">
                          <p className="font-medium line-clamp-1">{item.products?.name}</p>
                          <p className="text-gray-600">Qty: {item.quantity} × ${Number(item.unit_price).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                    {order.order_items.length > 3 && (
                      <div className="flex items-center text-sm text-gray-600">
                        +{order.order_items.length - 3} more items
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Order Details</CardTitle>
                  <CardDescription>{selectedOrder.order_number}</CardDescription>
                </div>
                <Button variant="ghost" onClick={() => setShowOrderDetails(false)}>
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Order Status Timeline */}
              <div>
                <h3 className="font-semibold mb-4">Order Status</h3>
                <div className="flex items-center justify-between">
                  {getOrderStatusSteps(selectedOrder.status).map((step, index) => (
                    <div key={step.key} className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        step.completed ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
                      }`}>
                        {step.completed ? '✓' : index + 1}
                      </div>
                      <span className="ml-2 text-sm">{step.label}</span>
                      {index < getOrderStatusSteps(selectedOrder.status).length - 1 && (
                        <ArrowRight className="w-4 h-4 mx-4 text-gray-300" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="font-semibold mb-4 text-sky-900 border-b border-sky-100 pb-2">Purchased Items ({selectedOrder.order_items.length})</h3>
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {selectedOrder.order_items.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 border border-slate-100 rounded-2xl bg-white hover:border-sky-200 transition-colors">
                      <div className="w-16 h-16 bg-slate-50 shrink-0 border border-slate-100 rounded-xl overflow-hidden shadow-sm">
                        {item.products?.image_url && !imageErrors[item.id] ? (
                          <img
                            src={item.products.image_url}
                            alt={item.products.name}
                            className="w-full h-full object-cover"
                            onError={() => setImageErrors(prev => ({ ...prev, [item.id]: true }))}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-2">
                            <ShoppingBag className="w-6 h-6 text-slate-200" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-900 truncate">{item.products?.name}</h4>
                        {item.variant && <p className="text-xs text-slate-500 bg-slate-100 inline-block px-2 py-0.5 rounded-full mt-1 mb-1">{item.variant}</p>}
                        <p className="text-sm text-slate-600">Quantity: <span className="font-bold text-slate-900">{item.quantity}</span></p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-sky-600">${(Number(item.unit_price) * item.quantity).toFixed(2)}</p>
                        <p className="text-[10px] text-slate-400 font-medium">${Number(item.unit_price).toFixed(2)} each</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping & Billing */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-4 text-sky-900 border-b border-sky-100 pb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Shipping Address
                  </h3>
                  <div className="text-sm space-y-1 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    {typeof selectedOrder.shipping_address === 'object' ? (
                      <>
                        <p className="font-bold text-slate-900">{selectedOrder.shipping_address.full_name}</p>
                        <p>{selectedOrder.shipping_address.address}</p>
                        <p>{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} {selectedOrder.shipping_address.zip_code}</p>
                        <p className="text-sky-600 font-medium">{selectedOrder.shipping_address.country}</p>
                        <p className="text-slate-500 italic mt-2">{selectedOrder.shipping_address.phone}</p>
                      </>
                    ) : (
                      <p>{selectedOrder.shipping_address || 'Address not specified'}</p>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-4 text-sky-900 border-b border-sky-100 pb-2 flex items-center gap-2">
                    <CreditCard className="w-4 h-4" /> Payment Details
                  </h3>
                  <div className="text-sm p-4 rounded-xl bg-orange-50 border border-orange-100 text-orange-800 font-medium h-full flex flex-col justify-center">
                    <p className="uppercase tracking-wider text-[10px] text-orange-400 mb-1">Method</p>
                    <p className="text-lg font-bold">
                      {selectedOrder.payment_method === 'cod' ? 'Cash on Delivery (COD)' : 'Prepaid / Online'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div>
                <h3 className="font-semibold mb-4 text-sky-900 border-b border-sky-100 pb-2">Financial Summary</h3>
                <div className="space-y-3 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-medium text-slate-900">${(Number(selectedOrder.total_amount) - (Number(selectedOrder.tax_amount || 0) + Number(selectedOrder.shipping_amount || 0))).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Shipping</span>
                    <span className="font-medium text-slate-900">${Number(selectedOrder.shipping_amount || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 border-b border-slate-200 pb-3">
                    <span>Tax</span>
                    <span className="font-medium text-slate-900">${Number(selectedOrder.tax_amount || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-black text-2xl pt-2 text-sky-700">
                    <span>Total Paid</span>
                    <span>${Number(selectedOrder.total_amount).toFixed(2)} CAD</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
