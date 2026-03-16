'use client';

import { useState } from 'react';
import { Bell, Mail, Shield, Smartphone, Volume2, CheckCircle, AlertCircle, Settings, Zap, Package } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Notification {
  id: string;
  type: 'order' | 'security' | 'marketing' | 'product' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  action?: {
    label: string;
    onClick?: () => void;
    variant?: 'default' | 'destructive' | 'outline';
  };
}

interface NotificationPreference {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
  category: 'email' | 'push' | 'sms' | 'in_app';
}

export function EnhancedNotifications() {
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const [showSettings, setShowSettings] = useState(false);

  const notifications: Notification[] = [
    {
      id: '1',
      type: 'order',
      title: 'Order Shipped',
      message: 'Your order #ORD-2024-001 has been shipped and will arrive in 2-3 business days.',
      timestamp: '2024-03-15T10:30:00Z',
      read: false,
      priority: 'high',
      action: {
        label: 'Track Package',
        onClick: () => console.log('Track order ORD-2024-001')
      }
    },
    {
      id: '2',
      type: 'security',
      title: 'Security Alert',
      message: 'New sign-in detected from a different device.',
      timestamp: '2024-03-15T09:15:00Z',
      read: true,
      priority: 'urgent',
      action: {
        label: 'Review Activity',
        variant: 'destructive',
        onClick: () => console.log('Review security activity')
      }
    },
    {
      id: '3',
      type: 'marketing',
      title: 'Special Offer',
      message: 'Get 20% off on your next order! Use code: SAVE20',
      timestamp: '2024-03-14T14:20:00Z',
      read: false,
      priority: 'medium',
      action: {
        label: 'View Offer',
        onClick: () => console.log('View marketing offer')
      }
    },
    {
      id: '4',
      type: 'product',
      title: 'Product Restock',
      message: 'Amoxicillin 500mg is back in stock!',
      timestamp: '2024-03-13T16:45:00Z',
      read: false,
      priority: 'low',
      action: {
        label: 'Order Now',
        onClick: () => console.log('Order Amoxicillin')
      }
    }
  ];

  const notificationPreferences: NotificationPreference[] = [
    {
      id: 'email_orders',
      label: 'Order Updates',
      description: 'Get notified about order status changes, shipping updates, and delivery confirmations',
      icon: <Package className="w-4 h-4" />,
      enabled: true,
      category: 'email'
    },
    {
      id: 'email_marketing',
      label: 'Promotional Emails',
      description: 'Receive special offers, discounts, and new product announcements',
      icon: <Mail className="w-4 h-4" />,
      enabled: false,
      category: 'email'
    },
    {
      id: 'email_security',
      label: 'Security Alerts',
      description: 'Important notifications about account security, password changes, and login attempts',
      icon: <Shield className="w-4 h-4" />,
      enabled: true,
      category: 'email'
    },
    {
      id: 'push_orders',
      label: 'Push Notifications',
      description: 'Instant mobile alerts for order updates and delivery status',
      icon: <Smartphone className="w-4 h-4" />,
      enabled: false,
      category: 'push'
    },
    {
      id: 'sms_alerts',
      label: 'SMS Alerts',
      description: 'Critical security alerts via text message',
      icon: <Volume2 className="w-4 h-4" />,
      enabled: false,
      category: 'sms'
    },
    {
      id: 'in_app_orders',
      label: 'In-App Orders',
      description: 'Real-time order updates within the application',
      icon: <Package className="w-4 h-4" />,
      enabled: true,
      category: 'in_app'
    },
    {
      id: 'in_app_marketing',
      label: 'In-App Marketing',
      description: 'Special offers and promotions displayed in the app',
      icon: <Zap className="w-4 h-4" />,
      enabled: true,
      category: 'in_app'
    }
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order': return <Package className="w-4 h-4 text-blue-500" />;
      case 'security': return <Shield className="w-4 h-4 text-red-500" />;
      case 'marketing': return <Mail className="w-4 h-4 text-green-500" />;
      case 'product': return <CheckCircle className="w-4 h-4 text-orange-500" />;
      default: return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Enhanced Notifications
            <Badge variant="secondary" className="ml-2">
              {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant={activeTab === 'all' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('all')}
            >
              All
            </Button>
            <Button
              variant={activeTab === 'unread' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('unread')}
            >
              Unread
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-1">
                  {unreadCount}
                </Badge>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {showSettings ? (
          // Settings View
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Notification Preferences</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(false)}
              >
                Back to Notifications
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {notificationPreferences.map((pref) => (
                <div key={pref.id} className="space-y-4 p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {pref.icon}
                      <div>
                        <Label htmlFor={pref.id} className="font-medium">{pref.label}</Label>
                        <p className="text-sm text-gray-600">{pref.description}</p>
                      </div>
                    </div>
                    <Switch
                      id={pref.id}
                      checked={pref.enabled}
                      onCheckedChange={(checked) => {
                        console.log(`Toggle ${pref.label}:`, checked);
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-end mt-6">
              <Button>Save Preferences</Button>
            </div>
          </div>
        ) : (
          // Notifications View
          <div className="space-y-4">
            {/* Notification Filters */}
            <div className="flex flex-wrap gap-2 mb-6">
              {['all', 'unread'].map((tab) => (
                <Button
                  key={tab}
                  variant={activeTab === tab ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab(tab)}
                  className="flex items-center gap-2"
                >
                  {tab === 'unread' && unreadCount > 0 && (
                    <Badge variant="destructive" className="scale-75">
                      {unreadCount}
                    </Badge>
                  )}
                  {tab === 'all' ? 'All' : 'Unread'}
                </Button>
              ))}
            </div>

            {/* Notifications List */}
            <div className="space-y-3">
              {notifications
                .filter(notification => activeTab === 'all' || (activeTab === 'unread' && !notification.read))
                .map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border transition-all hover:shadow-md ${getPriorityColor(notification.priority)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`p-2 rounded-full ${getPriorityColor(notification.priority)}`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-sm">{notification.title}</h4>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">
                                {new Date(notification.timestamp).toLocaleDateString()}
                              </span>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        </div>
                      </div>
                      {notification.action && (
                        <div className="ml-4">
                          <Button
                            size="sm"
                            variant={notification.action.variant || 'outline'}
                            onClick={notification.action.onClick}
                          >
                            {notification.action.label}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
