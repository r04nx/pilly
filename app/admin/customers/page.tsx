'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { apiClient } from '@/lib/api-client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users, Search, RefreshCw, ChevronRight, Mail, Package, DollarSign, X, TrendingUp, Plus, User
} from 'lucide-react';

const TIER_COLORS: Record<string, string> = {
  Bronze: 'bg-amber-100 text-amber-700 border-amber-200',
  Silver: 'bg-gray-100 text-gray-700 border-gray-200',
  Gold: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  Platinum: 'bg-sky-100 text-sky-700 border-sky-200',
};

export default function AdminCustomersPage() {
  const supabase = createClient();
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [customerOrders, setCustomerOrders] = useState<any[]>([]);
  const [customerTickets, setCustomerTickets] = useState<any[]>([]);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [isInviting, setIsInviting] = useState(false);

  useEffect(() => { fetchCustomers(); }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('is_admin', false)
      .order('created_at', { ascending: false });
    setCustomers(data || []);
    setLoading(false);
  };

  const handleInviteCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsInviting(true);
    try {
      const { success, error } = await apiClient.inviteUser(inviteEmail, inviteName);
      if (!success) throw new Error(error || 'Failed to send invitation');
      
      alert('Invitation sent successfully!');
      setIsInviteModalOpen(false);
      setInviteEmail('');
      setInviteName('');
      fetchCustomers();
    } catch (error: any) {
      console.error('Invite error:', error);
      alert(error.message || 'Failed to send invitation');
    } finally {
      setIsInviting(false);
    }
  };

  const openCustomer = async (c: any) => {
    setSelected(c);
    const [{ data: orders }, { data: tickets }] = await Promise.all([
      supabase.from('orders').select('*, order_items(id)').eq('user_id', c.id).order('created_at', { ascending: false }),
      supabase.from('support_tickets').select('*').eq('user_id', c.id).order('created_at', { ascending: false }),
    ]);
    setCustomerOrders(orders || []);
    setCustomerTickets(tickets || []);
  };

  const filtered = customers.filter(c =>
    !search || c.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.company_name?.toLowerCase().includes(search.toLowerCase())
  );

  const totalSpend = (orders: any[]) => orders.reduce((s, o) => s + Number(o.total_amount || 0), 0);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <RefreshCw className="w-8 h-8 text-sky-500 animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-500">{customers.length} registered customers</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setIsInviteModalOpen(true)}
            className="bg-sky-600 hover:bg-sky-700 text-white shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Invite New Customer
          </Button>
          <Button variant="outline" size="sm" onClick={fetchCustomers}><RefreshCw className="w-4 h-4" /></Button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: customers.length, icon: Users, color: 'text-sky-600 bg-sky-50' },
          { label: 'Bronze', value: customers.filter(c => !c.membership_tier || c.membership_tier === 'Bronze').length, icon: TrendingUp, color: 'text-amber-600 bg-amber-50' },
          { label: 'Silver', value: customers.filter(c => c.membership_tier === 'Silver').length, icon: TrendingUp, color: 'text-gray-600 bg-gray-50' },
          { label: 'Gold+', value: customers.filter(c => ['Gold', 'Platinum'].includes(c.membership_tier)).length, icon: TrendingUp, color: 'text-yellow-600 bg-yellow-50' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl p-4 flex items-center gap-3 border border-gray-200 bg-white`}>
            <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.color}`}>
              <s.icon className="w-5 h-5" />
            </span>
            <div>
              <p className="text-xs text-gray-500 font-medium">{s.label}</p>
              <p className="text-xl font-black text-gray-900">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, or company…" className="pl-9" />
        </div>
      </div>

      {/* Customer List */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Customer</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase hidden md:table-cell">Location</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase hidden sm:table-cell">Tier</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Joined</th>
              <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                <Users className="w-10 h-10 mx-auto mb-2 text-gray-200" />No customers found
              </td></tr>
            ) : filtered.map(c => (
              <tr key={c.id} className="hover:bg-sky-50/30 cursor-pointer transition-colors" onClick={() => openCustomer(c)}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-700 font-bold text-sm flex-shrink-0">
                      {(c.full_name?.[0] || c.email?.[0] || '?').toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{c.full_name || '—'}</p>
                      <p className="text-xs text-gray-400">{c.email}</p>
                      {c.company_name && <p className="text-xs text-sky-500">{c.company_name}</p>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <p className="text-sm text-gray-600">{[c.city, c.province].filter(Boolean).join(', ') || '—'}</p>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${TIER_COLORS[c.membership_tier || 'Bronze']}`}>
                    {c.membership_tier || 'Bronze'}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">
                  {new Date(c.created_at).toLocaleDateString('en-CA')}
                </td>
                <td className="px-4 py-3 text-right">
                  <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Customer Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-sky-600 to-blue-600 p-6 rounded-t-2xl flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-white text-xl font-black">
                  {(selected.full_name?.[0] || selected.email?.[0] || '?').toUpperCase()}
                </div>
                <div>
                  <h2 className="text-white text-xl font-bold">{selected.full_name || 'Unknown'}</h2>
                  <p className="text-sky-200 text-sm">{selected.email}</p>
                  {selected.company_name && <p className="text-sky-100 text-xs">{selected.company_name}</p>}
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="text-white/70 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-6 space-y-5">
              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Total Orders', value: customerOrders.length, icon: Package, color: 'text-blue-600 bg-blue-50' },
                  { label: 'Total Spent', value: `$${totalSpend(customerOrders).toFixed(2)}`, icon: DollarSign, color: 'text-green-600 bg-green-50' },
                  { label: 'Tickets', value: customerTickets.length, icon: Mail, color: 'text-purple-600 bg-purple-50' },
                ].map(s => (
                  <div key={s.label} className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                    <span className={`inline-flex w-8 h-8 rounded-lg items-center justify-center ${s.color} mb-2`}>
                      <s.icon className="w-4 h-4" />
                    </span>
                    <p className="text-sm font-black text-gray-900">{s.value}</p>
                    <p className="text-xs text-gray-400">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Contact info */}
              <div className="bg-sky-50 rounded-xl p-4 border border-sky-100">
                <h3 className="font-bold text-gray-800 text-sm mb-3">Contact Information</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {[
                    ['Phone', selected.phone || '—'],
                    ['City', selected.city || '—'],
                    ['Province', selected.province || '—'],
                    ['Postal Code', selected.postal_code || '—'],
                    ['Member Since', new Date(selected.created_at).toLocaleDateString('en-CA')],
                    ['Tier', selected.membership_tier || 'Bronze'],
                  ].map(([k, v]) => (
                    <div key={k}><span className="text-gray-400 text-xs">{k}</span><p className="font-semibold text-gray-800">{v}</p></div>
                  ))}
                </div>
              </div>

              {/* Recent Orders */}
              <div>
                <h3 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2"><Package className="w-4 h-4 text-sky-500" />Recent Orders</h3>
                {customerOrders.length === 0 ? <p className="text-sm text-gray-400">No orders yet</p> : (
                  <div className="space-y-2">
                    {customerOrders.slice(0, 5).map(o => (
                      <div key={o.id} className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
                        <div>
                          <p className="text-xs font-mono font-bold text-sky-700">{o.order_number || o.id.slice(0,8)}</p>
                          <p className="text-xs text-gray-400">{new Date(o.created_at).toLocaleDateString('en-CA')}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-gray-800">${Number(o.total_amount).toFixed(2)}</p>
                          <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                            o.status === 'delivered' ? 'bg-green-100 text-green-700' :
                            o.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>{o.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Support Tickets */}
              <div>
                <h3 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2"><Mail className="w-4 h-4 text-purple-500" />Support Tickets</h3>
                {customerTickets.length === 0 ? <p className="text-sm text-gray-400">No tickets</p> : (
                  <div className="space-y-2">
                    {customerTickets.slice(0, 3).map(t => (
                      <div key={t.id} className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-mono text-purple-600">{t.ticket_number}</p>
                          <p className="text-sm font-semibold text-gray-800 truncate">{t.subject}</p>
                        </div>
                        <span className={`ml-2 text-xs px-2 py-0.5 rounded-full font-semibold ${
                          t.status === 'resolved' ? 'bg-green-100 text-green-700' :
                          t.status === 'open' ? 'bg-blue-100 text-blue-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>{t.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invitation Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsInviteModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-sky-600 p-6 flex items-center justify-between text-white">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Invite New Customer
              </h2>
              <button onClick={() => setIsInviteModalOpen(false)} className="hover:text-sky-100"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="p-6">
              <form onSubmit={handleInviteCustomer} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Enter customer's name"
                      value={inviteName}
                      onChange={(e) => setInviteName(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="email"
                      placeholder="Enter customer's email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div className="pt-4 flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 rounded-xl"
                    onClick={() => setIsInviteModalOpen(false)}
                    disabled={isInviting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-sky-600 hover:bg-sky-700 text-white rounded-xl shadow-lg shadow-sky-200"
                    disabled={isInviting}
                  >
                    {isInviting ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4 mr-2" />
                        Send Invite
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
