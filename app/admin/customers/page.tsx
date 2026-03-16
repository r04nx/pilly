'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field';
import { AlertCircle, Search, Mail } from 'lucide-react';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
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

  const filteredCustomers = customers.filter(c =>
    c.user_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

        <FieldGroup className="mb-8">
          <Field>
            <FieldLabel htmlFor="search">Search Customers</FieldLabel>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search by ID or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </Field>
        </FieldGroup>

        <Card>
          {filteredCustomers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted/50">
                  <tr>
                    <th className="px-6 py-4 text-left font-medium text-foreground">Customer</th>
                    <th className="px-6 py-4 text-right font-medium text-foreground">Orders</th>
                    <th className="px-6 py-4 text-right font-medium text-foreground">Total Spent</th>
                    <th className="px-6 py-4 text-right font-medium text-foreground">Lifetime Value</th>
                    <th className="px-6 py-4 text-right font-medium text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.user_id} className="hover:bg-muted/50 transition">
                      <td className="px-6 py-4 font-mono text-xs text-primary">{customer.user_id.slice(0, 8)}</td>
                      <td className="px-6 py-4 text-right text-foreground">{customer.total_orders}</td>
                      <td className="px-6 py-4 text-right font-semibold text-foreground">
                        ${customer.total_spent?.toFixed(2) || '0.00'}
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-foreground">
                        ${customer.lifetime_value?.toFixed(2) || '0.00'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="sm">
                          <Mail className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center text-muted-foreground">No customers found</div>
          )}
        </Card>
      </div>
    </div>
  );
}
