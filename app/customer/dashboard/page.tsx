'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { MinimalPilly } from '@/components/MinimalPilly';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ShoppingCart, 
  TrendingUp, 
  Package, 
  AlertCircle, 
  ArrowRight,
  User,
  CreditCard,
  Truck,
  Star,
  Heart,
  Clock,
  CheckCircle,
  Eye,
  MessageCircle,
  Gift,
  Zap,
  Target,
  DollarSign,
  Activity,
  Calendar
} from 'lucide-react';

interface DashboardStats {
  totalOrders: number;
  totalSpent: number;
  savedItems: number;
  pendingReviews: number;
  loyaltyPoints: number;
  membershipTier: string;
}

interface RecentOrder {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  created_at: string;
  items_count: number;
}

interface Recommendation {
  id: string;
  name: string;
  price: number;
  image_url: string;
  rating: number;
  discount?: number;
}

interface Activity {
  id: string;
  type: 'order' | 'review' | 'wishlist' | 'profile';
  title: string;
  description: string;
  created_at: string;
}

export default function CustomerDashboard() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalSpent: 0,
    savedItems: 0,
    pendingReviews: 0,
    loyaltyPoints: 0,
    membershipTier: 'Bronze'
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  const membershipTiers = {
    Bronze: { color: 'bg-orange-100 text-orange-800', nextTier: 'Silver', nextThreshold: 500 },
    Silver: { color: 'bg-gray-100 text-gray-800', nextTier: 'Gold', nextThreshold: 1500 },
    Gold: { color: 'bg-yellow-100 text-yellow-800', nextTier: 'Platinum', nextThreshold: 5000 },
    Platinum: { color: 'bg-purple-100 text-purple-800', nextTier: null, nextThreshold: null }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setUser(user);

        // Fetch dashboard stats
        const { data: orders } = await supabase
          .from('orders')
          .select('total_amount, status')
          .eq('user_id', user.id);

        const totalOrders = orders?.length || 0;
        const totalSpent = orders?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
        const loyaltyPoints = Math.floor(totalSpent / 10); // 1 point per $10 spent

        // Determine membership tier
        let membershipTier = 'Bronze';
        if (loyaltyPoints >= 5000) membershipTier = 'Platinum';
        else if (loyaltyPoints >= 1500) membershipTier = 'Gold';
        else if (loyaltyPoints >= 500) membershipTier = 'Silver';

        setStats({
          totalOrders,
          totalSpent,
          savedItems: 12, // Mock data
          pendingReviews: 3, // Mock data
          loyaltyPoints,
          membershipTier
        });

        // Fetch recent orders
        const { data: recentOrdersData } = await supabase
          .from('orders')
          .select('id, order_number, status, total_amount, created_at, order_items(count)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        setRecentOrders((recentOrdersData || []).map(order => ({
          id: order.id,
          order_number: order.order_number,
          status: order.status,
          total_amount: order.total_amount,
          created_at: order.created_at,
          items_count: order.order_items?.[0]?.count || 0
        })));

        // Mock recommendations
        setRecommendations([
          {
            id: '1',
            name: 'Wireless Earbuds Pro',
            price: 149.99,
            image_url: '/api/placeholder/200/150',
            rating: 4.6,
            discount: 20
          },
          {
            id: '2',
            name: 'Smart Home Hub',
            price: 89.99,
            image_url: '/api/placeholder/200/150',
            rating: 4.4
          },
          {
            id: '3',
            name: 'Fitness Tracker',
            price: 79.99,
            image_url: '/api/placeholder/200/150',
            rating: 4.7,
            discount: 15
          },
          {
            id: '4',
            name: 'Portable Charger',
            price: 29.99,
            image_url: '/api/placeholder/200/150',
            rating: 4.3
          }
        ]);

        // Mock recent activity
        setRecentActivity([
          {
            id: '1',
            type: 'order',
            title: 'Order Delivered',
            description: 'Your order ORD-2024-001 has been delivered successfully',
            created_at: '2024-03-15T14:30:00Z'
          },
          {
            id: '2',
            type: 'review',
            title: 'Review Submitted',
            description: 'You reviewed "Wireless Headphones"',
            created_at: '2024-03-14T10:15:00Z'
          },
          {
            id: '3',
            type: 'wishlist',
            title: 'Item Added to Wishlist',
            description: 'You added "Smart Watch" to your wishlist',
            created_at: '2024-03-13T16:45:00Z'
          },
          {
            id: '4',
            type: 'profile',
            title: 'Profile Updated',
            description: 'You updated your profile information',
            created_at: '2024-03-12T09:20:00Z'
          }
        ]);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'order': return <Package className="w-4 h-4" />;
      case 'review': return <Star className="w-4 h-4" />;
      case 'wishlist': return <Heart className="w-4 h-4" />;
      case 'profile': return <User className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const currentTier = membershipTiers[stats.membershipTier as keyof typeof membershipTiers];
  const progressToNext = currentTier.nextThreshold 
    ? (stats.loyaltyPoints / currentTier.nextThreshold) * 100 
    : 100;

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="mb-8 flex flex-col md:flex-row items-center gap-6 bg-gradient-to-r from-sky-50 to-transparent p-6 rounded-2xl border border-sky-100/50">
        <MinimalPilly className="mb-4" />
        <div>
          <h1 className="text-3xl font-bold mb-2 text-sky-900 text-center md:text-left">Welcome back, {user?.user_metadata?.full_name || 'Customer'}!</h1>
          <p className="text-sky-700/70 text-center md:text-left">I've prepared your pharmacy dashboard summary for today.</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold">{stats.totalOrders}</p>
                <p className="text-xs text-green-600">+12% this month</p>
              </div>
              <ShoppingCart className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold">${stats.totalSpent.toFixed(2)}</p>
                <p className="text-xs text-green-600">+8% this month</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Saved Items</p>
                <p className="text-2xl font-bold">{stats.savedItems}</p>
                <p className="text-xs text-gray-500">In wishlist</p>
              </div>
              <Heart className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Reviews</p>
                <p className="text-2xl font-bold">{stats.pendingReviews}</p>
                <p className="text-xs text-orange-600">Pending</p>
              </div>
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Orders</CardTitle>
                  <CardDescription>Your latest order activity</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  View All
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recentOrders.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mb-4 opacity-50">
                    <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-4xl">📦</span>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-6 font-medium">You haven't placed any orders yet.</p>
                  <Button onClick={() => window.location.href = '/customer/products'}>
                    Start Shopping
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Package className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold">{order.order_number}</p>
                          <p className="text-sm text-gray-600">
                            {order.items_count} items • ${order.total_amount.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Personalized Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Recommended for You</CardTitle>
              <CardDescription>Based on your purchase history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendations.map((product) => (
                  <div key={product.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex gap-4">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-20 h-20 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold line-clamp-1">{product.name}</h4>
                        <div className="flex items-center gap-2 my-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">{product.rating}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            {product.discount && (
                              <span className="text-xs text-gray-500 line-through">
                                ${(product.price * 1.2).toFixed(2)}
                              </span>
                            )}
                            <p className="font-bold text-green-600">
                              ${product.price.toFixed(2)}
                            </p>
                          </div>
                          {product.discount && (
                            <Badge className="bg-red-100 text-red-800 text-xs">
                              -{product.discount}%
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Loyalty Program */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-sky-500" />
                Loyalty Program
              </CardTitle>
              <div className="flex justify-center -mb-4">
                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">⭐</span>
                  </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <Badge className={currentTier.color + ' text-lg px-3 py-1'}>
                  {stats.membershipTier}
                </Badge>
                <p className="text-2xl font-bold mt-2">{stats.loyaltyPoints} points</p>
                <p className="text-sm text-gray-600">
                  {currentTier.nextTier 
                    ? `${currentTier.nextThreshold - stats.loyaltyPoints} points to ${currentTier.nextTier}`
                    : 'Maximum tier reached!'
                  }
                </p>
              </div>
              {currentTier.nextThreshold && (
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progress</span>
                    <span>{Math.round(progressToNext)}%</span>
                  </div>
                  <Progress value={progressToNext} className="h-2" />
                </div>
              )}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    Points earned
                  </span>
                  <span className="font-semibold">+25 today</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    Rewards available
                  </span>
                  <span className="font-semibold">3</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <CreditCard className="w-4 h-4 mr-2" />
                Manage Payment Methods
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Truck className="w-4 h-4 mr-2" />
                Track Orders
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Heart className="w-4 h-4 mr-2" />
                View Wishlist
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <MessageCircle className="w-4 h-4 mr-2" />
                Contact Support
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{activity.title}</p>
                      <p className="text-xs text-gray-600">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(activity.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
