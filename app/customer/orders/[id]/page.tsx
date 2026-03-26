'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import { Pilly } from '@/components/pilly';
import {
  CheckCircle,
  Package,
  Truck,
  Clock,
  ArrowLeft,
  Home,
  ShoppingBag,
  FileText,
  AlertCircle,
  XCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  price: number;
  products: {
    name: string;
    product_images: {
      image_url: string;
    }[];
  };
}

interface Order {
  id: string;
  order_number?: string;
  total_amount: number;
  shipping_amount?: number;
  tax_amount?: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
  shipping_address: any; 
  order_items: OrderItem[];
  profiles?: {
    full_name: string;
    email: string;
    company_name?: string;
  };
}

export default function OrderConfirmationPage() {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/auth/login');
          return;
        }

        // Get order ID from URL
        const pathSegments = window.location.pathname.split('/');
        const orderId = pathSegments[pathSegments.length - 1];

        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            profiles (full_name, email, company_name),
            order_items (
              *,
              products (
                name,
                product_images (image_url)
              )
            )
          `)
          .eq('id', orderId)
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        setOrder(data);
      } catch (error) {
        console.error('Order fetch error:', error);
        router.push('/customer/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [router]);

  useEffect(() => {
    if (order && !loading) {
      // Immediate blast
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0ea5e9', '#10b981', '#ffffff']
      });

      // Festive celebration duration
      const duration = 7 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({ 
          ...defaults, 
          particleCount, 
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors: ['#0ea5e9', '#10b981']
        });
        confetti({ 
          ...defaults, 
          particleCount, 
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: ['#0ea5e9', '#10b981']
        });
      }, 250);
      
      return () => clearInterval(interval);
    }
  }, [order, loading]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'processing':
        return <Package className="w-5 h-5 text-blue-600" />;
      case 'shipped':
        return <Truck className="w-5 h-5 text-purple-600" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'cancelled':
        return <Package className="w-5 h-5 text-red-600" />;
      default:
        return <Package className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Order Pending';
      case 'processing':
        return 'Processing';
      case 'shipped':
        return 'Shipped';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  };
  const handleCancel = async () => {
    if (!order) return;
    if (!confirm('Are you sure you want to cancel this order?')) return;
    
    setLoading(true);
    try {
      const resp = await fetch(`/api/customer/orders/\${order.id}/cancel`, {
        method: 'POST'
      });
      const data = await resp.json();
      
      if (data.success) {
        setOrder(prev => prev ? { ...prev, status: 'cancelled' } : null);
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Pilly expression="running" size={120} className="mb-4" />
          <p className="mt-4 text-muted-foreground animate-pulse font-medium tracking-wide">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Order not found</h2>
          <p className="text-muted-foreground mb-6">The order you're looking for doesn't exist.</p>
          <Link href="/customer/dashboard">
            <Button>
              <Home className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/customer/dashboard" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-in zoom-in duration-500">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                <div>
                  <h1 className="text-4xl font-extrabold text-foreground tracking-tight">Order Confirmed!</h1>
                  <p className="text-xl text-muted-foreground mt-1">
                    Thank you for your order, ${order.profiles?.full_name?.split(' ')[0] || 'valued customer'}.
                  </p>
                </div>
              </div>
              <div className="bg-sky-50 border border-sky-100 p-4 rounded-xl inline-block">
                <p className="text-sky-800 font-medium">
                  Order Reference: <span className="font-bold text-sky-600">#${order.order_number || order.id.slice(0, 8).toUpperCase()}</span>
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100"
              onClick={() => window.open(`/api/invoice/${order.id}`, '_blank')}
            >
              <FileText className="w-4 h-4 mr-2" />
              Download Invoice
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Order Status</h2>
              <div className="flex items-center gap-3">
                {getStatusIcon(order.status)}
                <div>
                  <p className="font-medium text-foreground">{getStatusText(order.status)}</p>
                  <p className="text-sm text-muted-foreground">
                    Placed on {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Card>

            {/* Order Items */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Order Items</h2>
              <div className="space-y-4">
                {order.order_items.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b last:border-0">
                    {/* Product Image */}
                    <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                      {item.products.product_images?.[0]?.image_url ? (
                        <img
                          src={item.products.product_images[0].image_url}
                          alt={item.products.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                          <Package className="w-6 h-6 text-primary" />
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground">{item.products.name}</h3>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <p className="font-medium text-foreground">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground">${item.price.toFixed(2)} each</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Shipping Address */}
              <h2 className="text-lg font-semibold text-foreground mb-4">Shipping Address</h2>
              <div className="text-muted-foreground bg-slate-50 p-4 rounded-xl border border-slate-100">
                {typeof order.shipping_address === 'object' ? (
                  <div className="space-y-1">
                    <p className="font-bold text-slate-900">{order.shipping_address.full_name}</p>
                    <p>{order.shipping_address.address}</p>
                    <p>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zip_code}</p>
                    <p className="text-sky-600 font-medium">{order.shipping_address.country}</p>
                  </div>
                ) : (
                  <p>{order.shipping_address}</p>
                )}
              </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-foreground mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">${(order.total_amount - ((order.shipping_amount || 0) + (order.tax_amount || 0))).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-foreground">${(order.shipping_amount || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="text-foreground">${(order.tax_amount || 0).toFixed(2)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>${order.total_amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Link href="/products">
                  <Button variant="outline" className="w-full">
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Continue Shopping
                  </Button>
                </Link>
                
                <Link href="/customer/dashboard">
                  <Button className="w-full">
                    <Home className="w-4 h-4 mr-2" />
                    Back to Dashboard
                  </Button>
                </Link>

                {['pending', 'processing'].includes(order.status) && (
                  <Button 
                    variant="destructive" 
                    className="w-full"
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Cancel Order
                  </Button>
                )}
              </div>

              {/* Estimated Delivery */}
              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <h3 className="font-medium text-foreground mb-2">Estimated Delivery</h3>
                <p className="text-sm text-muted-foreground">
                  {new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString()} - {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Standard shipping (5-7 business days)
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
