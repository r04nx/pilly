'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Save, Loader2, DollarSign, Percent, Truck, ShieldCheck } from 'lucide-react';

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<any>({
    shipping_cost: { amount: 0, label: 'Standard Shipping' },
    tax_rate: { percentage: 10, label: 'Sales Tax' },
    free_shipping_threshold: { amount: 500 }
  });

  const supabase = createClient();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('store_settings').select('*');
      if (error) throw error;
      
      const formatted = data.reduce((acc: any, item: any) => {
        acc[item.key] = item.value;
        return acc;
      }, {});
      
      setSettings((prev: any) => ({ ...prev, ...formatted }));
    } catch (err) {
      console.error('Error fetching settings:', err);
      toast.error('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updates = Object.entries(settings).map(([key, value]) => ({
        key,
        value,
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase.from('store_settings').upsert(updates);
      if (error) throw error;
      
      toast.success('Settings updated successfully');
    } catch (err) {
      console.error('Error saving settings:', err);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Store Settings</h1>
          <p className="text-slate-500 text-sm">Manage global shipping, taxes, and storefront parameters</p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="bg-sky-600 hover:bg-sky-700 shadow-lg shadow-sky-100 font-bold"
        >
          {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Shipping Settings */}
        <Card className="border-slate-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-sky-600" />
              <CardTitle className="text-base">Shipping & Delivery</CardTitle>
            </div>
            <CardDescription>Configure base shipping rates and thresholds</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="shipping_cost">Standard Shipping Cost ($)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  id="shipping_cost"
                  type="number"
                  value={settings.shipping_cost.amount}
                  onChange={e => setSettings({
                    ...settings,
                    shipping_cost: { ...settings.shipping_cost, amount: parseFloat(e.target.value) || 0 }
                  })}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="free_shipping">Free Shipping Threshold ($)</Label>
              <div className="relative">
                <Truck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  id="free_shipping"
                  type="number"
                  value={settings.free_shipping_threshold.amount}
                  onChange={e => setSettings({
                    ...settings,
                    free_shipping_threshold: { amount: parseFloat(e.target.value) || 0 }
                  })}
                  className="pl-9"
                />
              </div>
              <p className="text-[10px] text-slate-400 font-medium italic">Orders above this amount get free shipping</p>
            </div>
          </CardContent>
        </Card>

        {/* Tax Settings */}
        <Card className="border-slate-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Percent className="w-5 h-5 text-sky-600" />
              <CardTitle className="text-base">Taxes & Fees</CardTitle>
            </div>
            <CardDescription>Global tax calculation parameters</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tax_rate">Global Tax Rate (%)</Label>
              <div className="relative">
                <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  id="tax_rate"
                  type="number"
                  step="0.1"
                  value={settings.tax_rate.percentage}
                  onChange={e => setSettings({
                    ...settings,
                    tax_rate: { ...settings.tax_rate, percentage: parseFloat(e.target.value) || 0 }
                  })}
                  className="pr-9"
                />
              </div>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-3 mt-4">
              <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-[11px] text-blue-800 leading-relaxed">
                These settings will be applied to all checkouts system-wide. Ensure you comply with local tax regulations before updating.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
