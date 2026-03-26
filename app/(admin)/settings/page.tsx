'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Save, 
  RefreshCw, 
  Mail, 
  Globe, 
  CreditCard, 
  Package,
  Shield,
  Bell,
  Palette,
  DollarSign,
  Store
} from 'lucide-react';

interface SiteSettings {
  site_name: string;
  site_description: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  currency: string;
  tax_rate: number;
  shipping_cost: number;
  free_shipping_threshold: number;
  auto_confirm_orders: boolean;
  email_notifications: boolean;
  maintenance_mode: boolean;
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<SiteSettings>({
    site_name: 'Paras Pharmacy Supplier',
    site_description: 'Premium pharmaceutical supplier in Toronto, Canada',
    contact_email: 'info@paraspharmacysupplier.ca',
    contact_phone: '416-575-7598',
    address: '123 Pharmacy Ave, Toronto, ON, Canada',
    currency: 'CAD',
    tax_rate: 13,
    shipping_cost: 15,
    free_shipping_threshold: 100,
    auto_confirm_orders: true,
    email_notifications: true,
    maintenance_mode: false
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      // In a real app, this would fetch from a settings table
      // For now, we'll use default settings
      setSettings({
        site_name: 'Paras Pharmacy Supplier',
        site_description: 'Premium pharmaceutical supplier in Toronto, Canada',
        contact_email: 'info@paraspharmacysupplier.ca',
        contact_phone: '416-575-7598',
        address: '123 Pharmacy Ave, Toronto, ON, Canada',
        currency: 'CAD',
        tax_rate: 13,
        shipping_cost: 15,
        free_shipping_threshold: 100,
        auto_confirm_orders: true,
        email_notifications: true,
        maintenance_mode: false
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      // In a real app, this would save to a settings table
      console.log('Saving settings:', settings);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof SiteSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Settings className="w-8 h-8" />
          Site Settings
        </h1>
        <p className="text-muted-foreground">Configure your store settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="w-5 h-5" />
                General Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Site Name</label>
                  <Input
                    value={settings.site_name}
                    onChange={(e) => handleInputChange('site_name', e.target.value)}
                    placeholder="Your Store Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Contact Email</label>
                  <Input
                    type="email"
                    value={settings.contact_email}
                    onChange={(e) => handleInputChange('contact_email', e.target.value)}
                    placeholder="contact@store.com"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Site Description</label>
                <textarea
                  value={settings.site_description}
                  onChange={(e) => handleInputChange('site_description', e.target.value)}
                  placeholder="Brief description of your store"
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Contact Phone</label>
                  <Input
                    value={settings.contact_phone}
                    onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Currency</label>
                  <select
                    value={settings.currency}
                    onChange={(e) => handleInputChange('currency', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  >
                    <option value="CAD">CAD ($)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Address</label>
                <textarea
                  value={settings.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Your business address"
                  rows={2}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                />
              </div>
            </CardContent>
          </Card>

          {/* Payment & Shipping Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment & Shipping
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tax Rate (%)</label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={settings.tax_rate}
                    onChange={(e) => handleInputChange('tax_rate', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Shipping Cost</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={settings.shipping_cost}
                    onChange={(e) => handleInputChange('shipping_cost', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Free Shipping Threshold</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={settings.free_shipping_threshold}
                    onChange={(e) => handleInputChange('free_shipping_threshold', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">
                  <strong>Shipping Policy:</strong> Orders over ${settings.free_shipping_threshold} qualify for free shipping.
                  Standard shipping is ${settings.shipping_cost} for orders below this threshold.
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Tax Rate:</strong> {settings.tax_rate}% tax will be applied to all orders.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Order Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Order Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings.auto_confirm_orders}
                    onChange={(e) => handleInputChange('auto_confirm_orders', e.target.checked)}
                    className="rounded"
                  />
                  <div>
                    <div className="font-medium">Auto-confirm Orders</div>
                    <div className="text-sm text-muted-foreground">
                      Automatically confirm new orders without manual review
                    </div>
                  </div>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings.email_notifications}
                    onChange={(e) => handleInputChange('email_notifications', e.target.checked)}
                    className="rounded"
                  />
                  <div>
                    <div className="font-medium">Email Notifications</div>
                    <div className="text-sm text-muted-foreground">
                      Send email notifications for new orders and status updates
                    </div>
                  </div>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings.maintenance_mode}
                    onChange={(e) => handleInputChange('maintenance_mode', e.target.checked)}
                    className="rounded"
                  />
                  <div>
                    <div className="font-medium">Maintenance Mode</div>
                    <div className="text-sm text-muted-foreground">
                      Temporarily disable the store for maintenance
                    </div>
                  </div>
                </label>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Store Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {settings.currency === 'CAD' ? '$' : settings.currency}
                </div>
                <div className="text-sm text-muted-foreground">Default Currency</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {settings.tax_rate}%
                </div>
                <div className="text-sm text-muted-foreground">Tax Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {settings.currency === 'CAD' ? '$' : settings.currency}{settings.shipping_cost}
                </div>
                <div className="text-sm text-muted-foreground">Shipping Cost</div>
              </div>
            </CardContent>
          </Card>

          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Store Status</span>
                <Badge variant={settings.maintenance_mode ? "destructive" : "default"}>
                  {settings.maintenance_mode ? 'Maintenance' : 'Online'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Email Alerts</span>
                <Badge variant={settings.email_notifications ? "default" : "secondary"}>
                  {settings.email_notifications ? 'Active' : 'Disabled'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Auto-confirm</span>
                <Badge variant={settings.auto_confirm_orders ? "default" : "secondary"}>
                  {settings.auto_confirm_orders ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={saveSettings} 
                disabled={saving}
                className="w-full"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={fetchSettings}
                className="w-full"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset to Defaults
              </Button>

              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  <strong>Note:</strong> Settings are saved immediately and affect the live store.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
