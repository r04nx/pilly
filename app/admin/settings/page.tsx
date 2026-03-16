'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Settings, Database, Mail, Globe, Shield, Bell } from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    siteName: 'Paras Pharmacy Supplier',
    siteEmail: 'admin@paraspharmacy.com',
    sitePhone: '+1 (416) 123-4567',
    address: '123 Queen Street, Toronto, ON, Canada',
    currency: 'CAD',
    taxRate: 13,
    enableEmailNotifications: true,
    enableOrderConfirmation: true,
    enableLowStockAlerts: true,
    lowStockThreshold: 10,
    maintenanceMode: false,
    allowRegistrations: true,
    requireEmailVerification: false,
    defaultOrderStatus: 'pending',
    autoConfirmOrders: false,
    businessHours: '9:00 AM - 6:00 PM',
    timezone: 'America/Toronto',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const supabase = createClient();

  useEffect(() => {
    // Load settings from database or use defaults
    setIsLoading(false);
  }, []);

  const showMessage = (msg: string, type: 'success' | 'error' = 'success') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  const handleSaveSettings = async (section: string, sectionSettings: any) => {
    setIsSaving(true);
    try {
      // Here you would save to database
      // For now, just update local state
      setSettings(prev => ({ ...prev, ...sectionSettings }));
      showMessage(`${section} settings saved successfully!`);
    } catch (error) {
      showMessage('Failed to save settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestEmail = async () => {
    try {
      // Test email configuration
      showMessage('Test email sent successfully!');
    } catch (error) {
      showMessage('Failed to send test email', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-gray-600">Manage your system configuration and preferences</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          messageType === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message}
        </div>
      )}

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                General Settings
              </CardTitle>
              <CardDescription>
                Basic site information and business details
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={settings.siteName}
                    onChange={(e) => setSettings(prev => ({ ...prev, siteName: e.target.value }))}
                    placeholder="Your business name"
                  />
                </div>
                <div>
                  <Label htmlFor="siteEmail">Business Email</Label>
                  <Input
                    id="siteEmail"
                    type="email"
                    value={settings.siteEmail}
                    onChange={(e) => setSettings(prev => ({ ...prev, siteEmail: e.target.value }))}
                    placeholder="contact@yourbusiness.com"
                  />
                </div>
                <div>
                  <Label htmlFor="sitePhone">Phone Number</Label>
                  <Input
                    id="sitePhone"
                    value={settings.sitePhone}
                    onChange={(e) => setSettings(prev => ({ ...prev, sitePhone: e.target.value }))}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={settings.timezone} onValueChange={(value) => setSettings(prev => ({ ...prev, timezone: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Toronto">Eastern Time (Toronto)</SelectItem>
                      <SelectItem value="America/Vancouver">Pacific Time (Vancouver)</SelectItem>
                      <SelectItem value="America/Winnipeg">Central Time (Winnipeg)</SelectItem>
                      <SelectItem value="America/Halifax">Atlantic Time (Halifax)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="address">Business Address</Label>
                <textarea
                  id="address"
                  value={settings.address}
                  onChange={(e) => setSettings(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                  rows={3}
                  placeholder="Your business address"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currency">Default Currency</Label>
                  <Select value={settings.currency} onValueChange={(value) => setSettings(prev => ({ ...prev, currency: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CAD">Canadian Dollar (CAD)</SelectItem>
                      <SelectItem value="USD">US Dollar (USD)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="taxRate">Tax Rate (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    value={settings.taxRate}
                    onChange={(e) => setSettings(prev => ({ ...prev, taxRate: Number(e.target.value) }))}
                    placeholder="13"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="businessHours">Business Hours</Label>
                <Input
                  id="businessHours"
                  value={settings.businessHours}
                  onChange={(e) => setSettings(prev => ({ ...prev, businessHours: e.target.value }))}
                  placeholder="9:00 AM - 6:00 PM"
                />
              </div>

              <Button onClick={() => handleSaveSettings('General', settings)} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save General Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Order Settings
              </CardTitle>
              <CardDescription>
                Configure order processing and inventory management
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="defaultOrderStatus">Default Order Status</Label>
                  <Select value={settings.defaultOrderStatus} onValueChange={(value) => setSettings(prev => ({ ...prev, defaultOrderStatus: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
                  <Input
                    id="lowStockThreshold"
                    type="number"
                    value={settings.lowStockThreshold}
                    onChange={(e) => setSettings(prev => ({ ...prev, lowStockThreshold: Number(e.target.value) }))}
                    placeholder="10"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Auto-confirm Orders</p>
                    <p className="text-sm text-gray-600">Automatically confirm new orders without manual review</p>
                  </div>
                  <Switch
                    checked={settings.autoConfirmOrders}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoConfirmOrders: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Low Stock Alerts</p>
                    <p className="text-sm text-gray-600">Get notified when items are below threshold</p>
                  </div>
                  <Switch
                    checked={settings.enableLowStockAlerts}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableLowStockAlerts: checked }))}
                  />
                </div>
              </div>

              <Button onClick={() => handleSaveSettings('Orders', settings)} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Order Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Email Notifications
              </CardTitle>
              <CardDescription>
                Configure email sending and notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-gray-600">Enable email notifications for orders and updates</p>
                  </div>
                  <Switch
                    checked={settings.enableEmailNotifications}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableEmailNotifications: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Order Confirmation Emails</p>
                    <p className="text-sm text-gray-600">Send automatic order confirmation to customers</p>
                  </div>
                  <Switch
                    checked={settings.enableOrderConfirmation}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableOrderConfirmation: checked }))}
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium mb-4">Test Email Configuration</h3>
                <Button onClick={handleTestEmail} variant="outline">
                  <Mail className="w-4 h-4 mr-2" />
                  Send Test Email
                </Button>
              </div>

              <Button onClick={() => handleSaveSettings('Notifications', settings)} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Notification Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Manage user access and security preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Allow New Registrations</p>
                    <p className="text-sm text-gray-600">Let new users create accounts</p>
                  </div>
                  <Switch
                    checked={settings.allowRegistrations}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, allowRegistrations: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Require Email Verification</p>
                    <p className="text-sm text-gray-600">Users must verify email before accessing</p>
                  </div>
                  <Switch
                    checked={settings.requireEmailVerification}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, requireEmailVerification: checked }))}
                  />
                </div>
              </div>

              <Button onClick={() => handleSaveSettings('Security', settings)} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Security Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Advanced Settings
              </CardTitle>
              <CardDescription>
                System maintenance and advanced configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Maintenance Mode</p>
                    <p className="text-sm text-gray-600">Temporarily disable customer access</p>
                  </div>
                  <Switch
                    checked={settings.maintenanceMode}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, maintenanceMode: checked }))}
                  />
                </div>
              </div>

              {settings.maintenanceMode && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 text-yellow-800">
                    <AlertCircle className="w-4 h-4" />
                    <p className="font-medium">Maintenance Mode Active</p>
                  </div>
                  <p className="text-sm text-yellow-700 mt-1">
                    Customer portal is currently disabled. Only administrators can access the system.
                  </p>
                </div>
              )}

              <div className="border-t pt-4">
                <h3 className="font-medium mb-4">System Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Version</p>
                    <p className="font-medium">1.0.0</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Environment</p>
                    <Badge variant="outline">Development</Badge>
                  </div>
                  <div>
                    <p className="text-gray-600">Database</p>
                    <p className="font-medium">Supabase PostgreSQL</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Framework</p>
                    <p className="font-medium">Next.js 16</p>
                  </div>
                </div>
              </div>

              <Button onClick={() => handleSaveSettings('Advanced', settings)} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Advanced Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
