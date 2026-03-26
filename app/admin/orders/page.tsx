'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AdminPagination } from '@/components/admin/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Mail, Search, Package, Truck, CheckCircle, Clock, XCircle, Filter,
  ChevronDown, Send, AlertTriangle, RefreshCw, Eye, Download, MapPin
} from 'lucide-react';

const EMAIL_TYPES = [
  { value: 'confirmed', label: 'Order Confirmation', icon: '✅', color: 'text-green-600 bg-green-50' },
  { value: 'processing', label: 'Processing', icon: '⚙️', color: 'text-indigo-600 bg-indigo-50' },
  { value: 'shipped', label: 'Order Shipped', icon: '🚚', color: 'text-blue-600 bg-blue-50' },
  { value: 'delivered', label: 'Delivered', icon: '🎉', color: 'text-emerald-600 bg-emerald-50' },
  { value: 'out_of_stock', label: 'Out of Stock', icon: '📦', color: 'text-red-600 bg-red-50' },
  { value: 'cancelled', label: 'Cancelled', icon: '❌', color: 'text-gray-600 bg-gray-50' },
];

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
  processing: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  shipped: 'bg-purple-100 text-purple-700 border-purple-200',
  delivered: 'bg-green-100 text-green-700 border-green-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
};

export default function AdminOrdersPage() {
  const supabase = createClient();
  const [orders, setOrders] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [emailPanel, setEmailPanel] = useState<string | null>(null);
  const [emailType, setEmailType] = useState('order_confirmation');
  const [emailMessage, setEmailMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => { fetchOrders(); }, []);

  useEffect(() => {
    let f = orders;
    if (statusFilter !== 'all') f = f.filter(o => o.status === statusFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      f = f.filter(o =>
        o.order_number?.toLowerCase().includes(q) ||
        o.profiles?.full_name?.toLowerCase().includes(q) ||
        o.profiles?.email?.toLowerCase().includes(q)
      );
    }
    setFiltered(f);
    setCurrentPage(1);
  }, [orders, statusFilter, searchQuery]);

  const paginatedOrders = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*, profiles(full_name, email, phone, company_name, city), order_items(*, product:products(name, sku, image_url))')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching admin orders:', error);
    }
    setOrders(data || []);
    setLoading(false);
  };

  const updateStatus = async (orderId: string, status: string) => {
    setUpdatingStatus(orderId);
    const updates: any = { status, updated_at: new Date().toISOString() };
    if (status === 'cancelled') updates.cancelled_at = new Date().toISOString();
    const { error } = await supabase.from('orders').update(updates).eq('id', orderId);
    if (!error) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updates } : o));
      if (selectedOrder?.id === orderId) setSelectedOrder((p: any) => ({ ...p, ...updates }));
    }
    setUpdatingStatus(null);
  };

  const sendEmail = async (order: any) => {
    setSending(true);
    setSendResult(null);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: emailType,
          customerEmail: order.profiles?.email,
          customMessage: emailMessage,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSendResult({ ok: true, msg: `Branded email sent to ${order.profiles?.email}` });
      setEmailMessage('');
      
      // Update local order status if it changed
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: emailType } : o));
    } catch (e: any) {
      setSendResult({ ok: false, msg: e.message || 'Failed to send' });
    } finally {
      setSending(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <RefreshCw className="w-8 h-8 text-sky-500 animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
          <p className="text-sm text-gray-500">{orders.length} total orders</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchOrders}>
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {['pending','confirmed','shipped','delivered'].map(s => (
          <button key={s} onClick={() => setStatusFilter(statusFilter === s ? 'all' : s)}
            className={`bg-white border rounded-xl p-4 text-left hover:shadow-md transition-all ${statusFilter === s ? 'border-sky-400 ring-2 ring-sky-100' : 'border-gray-200'}`}>
            <p className="text-xs font-bold uppercase text-gray-400 tracking-wider">{s}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {orders.filter(o => o.status === s).length}
            </p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by order #, customer name, email…" className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {['pending','confirmed','processing','shipped','delivered','cancelled'].map(s => (
              <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50/80 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Order</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Items</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                  <Package className="w-12 h-12 mx-auto mb-2 text-gray-200" />
                  <p>No orders found</p>
                </td></tr>
              ) : paginatedOrders.map(order => (
                <tr key={order.id} className="hover:bg-sky-50/30 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-bold text-sky-700 text-xs font-mono">{order.order_number || order.id.slice(0,8).toUpperCase()}</p>
                    <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString('en-CA')}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-900 text-sm">{order.profiles?.full_name || 'Unknown'}</p>
                    <p className="text-xs text-gray-400">{order.profiles?.email}</p>
                    {order.profiles?.company_name && <p className="text-xs text-sky-500">{order.profiles.company_name}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-500 font-medium">
                      {order.order_items?.length || 0} item{order.order_items?.length !== 1 ? 's' : ''}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-bold text-gray-900">${Number(order.total_amount).toFixed(2)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Select value={order.status} onValueChange={(val) => updateStatus(order.id, val)}>
                      <SelectTrigger className={`h-7 text-xs font-semibold border rounded-full px-2 w-32 ${STATUS_COLORS[order.status] || 'bg-gray-100'}`}>
                        <SelectValue />
                        {updatingStatus === order.id && <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin ml-1" />}
                      </SelectTrigger>
                      <SelectContent>
                        {['pending','confirmed','processing','shipped','delivered','cancelled'].map(s => (
                          <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button size="sm" variant="ghost"
                        className="h-7 px-2 text-gray-500 hover:text-sky-600 hover:bg-sky-50"
                        onClick={() => { setSelectedOrder(order); setEmailPanel(null); }}>
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost"
                        className="h-7 px-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                        onClick={() => { setSelectedOrder(order); setEmailPanel(order.id); setSendResult(null); }}>
                        <Mail className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AdminPagination
        currentPage={currentPage}
        totalItems={filtered.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />

      {/* Order Detail + Email Panel */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => { setSelectedOrder(null); setEmailPanel(null); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-sky-600 to-blue-600 p-6 rounded-t-2xl">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sky-100 text-xs font-medium">ORDER DETAILS</p>
                  <h2 className="text-white text-xl font-bold">{selectedOrder.order_number || selectedOrder.id.slice(0,8).toUpperCase()}</h2>
                  <p className="text-sky-200 text-sm">{new Date(selectedOrder.created_at).toLocaleString('en-CA')}</p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="bg-white/10 hover:bg-white/20 text-white border-none h-8"
                    onClick={() => window.open(`/api/invoice/${selectedOrder.id}`, '_blank')}
                  >
                    <Download className="w-4 h-4 mr-1" /> Invoice
                  </Button>
                  <button onClick={() => { setSelectedOrder(null); setEmailPanel(null); }}
                    className="text-white/70 hover:text-white text-xl font-bold ml-2">✕</button>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-5">
              {/* Customer Info */}
              <div className="bg-sky-50 border border-sky-100 rounded-xl p-4">
                <h3 className="font-bold text-gray-800 text-sm mb-3">Customer Information</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-gray-400 text-xs">Name</span><p className="font-semibold">{selectedOrder.profiles?.full_name || '—'}</p></div>
                  <div><span className="text-gray-400 text-xs">Company</span><p className="font-semibold">{selectedOrder.profiles?.company_name || '—'}</p></div>
                  <div><span className="text-gray-400 text-xs">Email</span><p className="font-semibold text-sky-600">{selectedOrder.profiles?.email || '—'}</p></div>
                  <div><span className="text-gray-400 text-xs">Phone</span><p className="font-semibold">{selectedOrder.profiles?.phone || '—'}</p></div>
                  <div><span className="text-gray-400 text-xs">City</span><p className="font-semibold">{selectedOrder.profiles?.city || '—'}</p></div>
                  <div><span className="text-gray-400 text-xs">Status</span>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold border ${STATUS_COLORS[selectedOrder.status]}`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-bold text-gray-800 text-sm mb-3">Order Items</h3>
                <div className="space-y-2">
                  {(selectedOrder.order_items || []).map((item: any) => (
                    <div key={item.id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                      {item.product?.image_url && (
                        <img src={item.product.image_url} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900 truncate">{item.product?.name || 'Product'}</p>
                        <p className="text-xs text-gray-400">{item.product?.sku || ''}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-gray-900">×{item.quantity}</p>
                        <p className="text-xs text-gray-500">${Number(item.unit_price).toFixed(2)} ea</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Subtotal</span>
                    <span>${(Number(selectedOrder.total_amount) - (Number(selectedOrder.tax_amount || 0) + Number(selectedOrder.shipping_amount || 0))).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Shipping</span>
                    <span>${Number(selectedOrder.shipping_amount || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500 pb-2 border-b border-gray-200">
                    <span>Tax</span>
                    <span>${Number(selectedOrder.tax_amount || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="font-bold text-gray-600">Total</span>
                    <span className="text-xl font-black text-sky-700">${Number(selectedOrder.total_amount).toFixed(2)} CAD</span>
                  </div>
                </div>
              </div>

              {/* Shipping Address (JSONB) */}
              <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-4">
                <h3 className="font-bold text-orange-800 text-sm mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Destination Address
                </h3>
                <div className="text-sm space-y-0.5 text-orange-900">
                  {typeof selectedOrder.shipping_address === 'object' ? (
                    <>
                      <p className="font-bold">{selectedOrder.shipping_address.full_name}</p>
                      <p>{selectedOrder.shipping_address.address}</p>
                      <p>{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} {selectedOrder.shipping_address.zip_code}</p>
                      <p className="font-medium text-orange-700">{selectedOrder.shipping_address.country}</p>
                      <p className="text-xs mt-1 border-t border-orange-100 pt-1">Phone: {selectedOrder.shipping_address.phone}</p>
                    </>
                  ) : (
                    <p>{selectedOrder.shipping_address || '—'}</p>
                  )}
                </div>
              </div>

              {/* Tracking */}
              {(selectedOrder.status === 'shipped' || selectedOrder.tracking_number) && (
                <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                  <h3 className="font-bold text-purple-800 text-sm mb-2">Shipping Info</h3>
                  <p className="text-sm text-purple-700">Tracking: <strong>{selectedOrder.tracking_number || 'Not set'}</strong></p>
                  {selectedOrder.estimated_delivery && (
                    <p className="text-sm text-purple-700">Est. Delivery: <strong>{new Date(selectedOrder.estimated_delivery).toLocaleDateString('en-CA')}</strong></p>
                  )}
                </div>
              )}

              {/* Email Panel */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                  className="w-full flex items-center justify-between p-4 text-sm font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors"
                  onClick={() => setEmailPanel(emailPanel === selectedOrder.id ? null : selectedOrder.id)}>
                  <span className="flex items-center gap-2"><Mail className="w-4 h-4 text-blue-500" /> Send Transactional Email</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${emailPanel === selectedOrder.id ? 'rotate-180' : ''}`} />
                </button>
                {emailPanel === selectedOrder.id && (
                  <div className="p-4 space-y-4 bg-white">
                    {/* Quick action buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      {EMAIL_TYPES.map(et => (
                        <button key={et.value}
                          onClick={() => { setEmailType(et.value); sendEmail(selectedOrder); }}
                          disabled={sending}
                          className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold border text-left hover:shadow-md transition-all disabled:opacity-60 ${et.color} border-current/20`}>
                          <span className="text-base">{et.icon}</span>
                          <span>{et.label}</span>
                          {sending && emailType === et.value && <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin ml-auto" />}
                        </button>
                      ))}
                    </div>

                    {/* Custom message */}
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5">Custom Message (optional)</label>
                      <textarea value={emailMessage} onChange={e => setEmailMessage(e.target.value)}
                        rows={3} placeholder="Add a personal note to include in the email…"
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 resize-none" />
                    </div>

                    {/* Send result */}
                    {sendResult && (
                      <div className={`text-sm px-4 py-3 rounded-xl flex items-center gap-2 ${sendResult.ok ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                        {sendResult.ok ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                        {sendResult.msg}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
