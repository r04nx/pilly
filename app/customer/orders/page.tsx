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
  DollarSign
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
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  total_amount: number;
  shipping_address: {
    street: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
  };
  billing_address: {
    street: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
  };
  tracking_number?: string;
  estimated_delivery?: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
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

  const supabase = createClient();

  const statusConfig = {
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    processing: { label: 'Processing', color: 'bg-blue-100 text-blue-800', icon: Package },
    shipped: { label: 'Shipped', color: 'bg-purple-100 text-purple-800', icon: Truck },
    delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: XCircle },
    refunded: { label: 'Refunded', color: 'bg-gray-100 text-gray-800', icon: DollarSign }
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
              products (*)
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Transform data to match our interface
        const transformedOrders: Order[] = (data || []).map(order => ({
          id: order.id,
          order_number: order.order_number,
          status: order.status,
          total_amount: order.total_amount,
          shipping_address: order.shipping_address,
          billing_address: order.billing_address,
          tracking_number: order.tracking_number,
          estimated_delivery: order.estimated_delivery,
          created_at: order.created_at,
          updated_at: order.updated_at,
          items: order.order_items.map((item: any) => ({
            id: item.id,
            product_id: item.product_id,
            product_name: item.products?.name || 'Product',
            product_image: item.products?.image_url || 'https://picsum.photos/seed/product/100/100',
            quantity: item.quantity,
            price: item.price,
            variant: item.variant
          }))
        }));

        setOrders(transformedOrders);
        setFilteredOrders(transformedOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
        // Mock data for demo
        const mockOrders: Order[] = [
          {
            id: '1',
            order_number: 'ORD-2024-001',
            status: 'delivered',
            total_amount: 329.98,
            shipping_address: {
              street: '123 Main St',
              city: 'New York',
              state: 'NY',
              zip_code: '10001',
              country: 'USA'
            },
            billing_address: {
              street: '123 Main St',
              city: 'New York',
              state: 'NY',
              zip_code: '10001',
              country: 'USA'
            },
            tracking_number: '1Z999AA10123456784',
            estimated_delivery: '2024-03-15',
            created_at: '2024-03-10T10:00:00Z',
            updated_at: '2024-03-15T14:30:00Z',
            items: [
              {
                id: '1',
                product_id: '1',
                product_name: 'Wireless Headphones',
                product_image: 'https://picsum.photos/seed/headphones/100/100',
                quantity: 1,
                price: 299.99
              },
              {
                id: '2',
                product_id: '2',
                product_name: 'Phone Case',
                product_image: 'https://picsum.photos/seed/phonecase/100/100',
                quantity: 1,
                price: 29.99
              }
            ]
          },
          {
            id: '2',
            order_number: 'ORD-2024-002',
            status: 'shipped',
            total_amount: 199.99,
            shipping_address: {
              street: '456 Oak Ave',
              city: 'Los Angeles',
              state: 'CA',
              zip_code: '90001',
              country: 'USA'
            },
            billing_address: {
              street: '456 Oak Ave',
              city: 'Los Angeles',
              state: 'CA',
              zip_code: '90001',
              country: 'USA'
            },
            tracking_number: '1Z999AA10123456785',
            estimated_delivery: '2024-03-20',
            created_at: '2024-03-12T15:30:00Z',
            updated_at: '2024-03-14T09:15:00Z',
            items: [
              {
                id: '3',
                product_id: '3',
                product_name: 'Smart Watch',
                product_image: 'https://picsum.photos/seed/smartwatch/100/100',
                quantity: 1,
                price: 199.99
              }
            ]
          },
          {
            id: '3',
            order_number: 'ORD-2024-003',
            status: 'processing',
            total_amount: 89.97,
            shipping_address: {
              street: '789 Pine Rd',
              city: 'Chicago',
              state: 'IL',
              zip_code: '60007',
              country: 'USA'
            },
            billing_address: {
              street: '789 Pine Rd',
              city: 'Chicago',
              state: 'IL',
              zip_code: '60007',
              country: 'USA'
            },
            created_at: '2024-03-14T11:20:00Z',
            updated_at: '2024-03-14T11:20:00Z',
            items: [
              {
                id: '4',
                product_id: '4',
                product_name: 'Yoga Mat',
                product_image: 'https://picsum.photos/seed/yogamat/100/100',
                quantity: 2,
                price: 39.99
              },
              {
                id: '5',
                product_id: '5',
                product_name: 'Water Bottle',
                product_image: 'https://picsum.photos/seed/bottle/100/100',
                quantity: 1,
                price: 9.99
              }
            ]
          }
        ];
        setOrders(mockOrders);
        setFilteredOrders(mockOrders);
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
        order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items.some(item => item.product_name.toLowerCase().includes(searchTerm.toLowerCase()))
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
      { key: 'processing', label: 'Processing', completed: ['processing', 'shipped', 'delivered'].includes(status) },
      { key: 'shipped', label: 'Shipped', completed: ['shipped', 'delivered'].includes(status) },
      { key: 'delivered', label: 'Delivered', completed: status === 'delivered' }
    ];
    
    if (status === 'cancelled') {
      return steps.slice(0, 1).concat([{ key: 'cancelled', label: 'Cancelled', completed: true }]);
    }
    
    if (status === 'refunded') {
      return steps.slice(0, 1).concat([{ key: 'refunded', label: 'Refunded', completed: true }]);
    }
    
    return steps;
  };

  const viewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
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
                        <h3 className="font-semibold text-lg">{order.order_number}</h3>
                        <Badge className={statusConfig[order.status].color}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusConfig[order.status].label}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Placed on {new Date(order.created_at).toLocaleDateString()}
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <span>{order.items.length} items</span>
                        <span>•</span>
                        <span className="font-semibold">${order.total_amount.toFixed(2)}</span>
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
                      {order.status === 'delivered' && (
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-1" />
                          Invoice
                        </Button>
                      )}
                      {['pending', 'processing'].includes(order.status) && (
                        <Button variant="destructive" size="sm">
                          Cancel Order
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="mt-4 flex gap-4">
                    {order.items.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex items-center gap-2">
                        <img
                          src={item.product_image}
                          alt={item.product_name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="text-sm">
                          <p className="font-medium line-clamp-1">{item.product_name}</p>
                          <p className="text-gray-600">Qty: {item.quantity} × ${item.price}</p>
                        </div>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div className="flex items-center text-sm text-gray-600">
                        +{order.items.length - 3} more items
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
                <h3 className="font-semibold mb-4">Items ({selectedOrder.items.length})</h3>
                <div className="space-y-4">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <img
                        src={item.product_image}
                        alt={item.product_name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium">{item.product_name}</h4>
                        {item.variant && <p className="text-sm text-gray-600">{item.variant}</p>}
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                        <p className="text-sm text-gray-600">${item.price} each</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping & Billing */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-4">Shipping Address</h3>
                  <div className="text-sm space-y-1">
                    <p>{selectedOrder.shipping_address.street}</p>
                    <p>
                      {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} {selectedOrder.shipping_address.zip_code}
                    </p>
                    <p>{selectedOrder.shipping_address.country}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-4">Billing Address</h3>
                  <div className="text-sm space-y-1">
                    <p>{selectedOrder.billing_address.street}</p>
                    <p>
                      {selectedOrder.billing_address.city}, {selectedOrder.billing_address.state} {selectedOrder.billing_address.zip_code}
                    </p>
                    <p>{selectedOrder.billing_address.country}</p>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div>
                <h3 className="font-semibold mb-4">Order Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${selectedOrder.total_amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>$0.00</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                    <span>Total</span>
                    <span>${selectedOrder.total_amount.toFixed(2)}</span>
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
