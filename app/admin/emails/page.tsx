'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Mail, Search, RefreshCw, CheckCircle, XCircle, Clock, Eye, Filter, Trash2, ArrowRight, Table as TableIcon
} from 'lucide-react';

const TYPE_COLORS: Record<string, string> = {
  confirmation: 'bg-blue-100 text-blue-700 border-blue-200',
  shipped: 'bg-green-100 text-green-700 border-green-200',
  delivered: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  delayed: 'bg-amber-100 text-amber-700 border-amber-200',
  oos: 'bg-purple-100 text-purple-700 border-purple-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
  back_in_stock: 'bg-sky-100 text-sky-700 border-sky-200',
};

export default function AdminEmailsPage() {
  const supabase = createClient();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selected, setSelected] = useState<any>(null);

  useEffect(() => { fetchLogs(); }, []);

  const fetchLogs = async () => {
    setLoading(true);
    const { data } = await supabase.from('email_logs')
      .select('*, profiles(full_name, email)')
      .order('created_at', { ascending: false });
    setLogs(data || []);
    setLoading(false);
  };

  const filtered = logs.filter(log => {
    const matchType = typeFilter === 'all' || log.email_type === typeFilter;
    const q = search.toLowerCase();
    const matchSearch = !search || 
      log.recipient_email?.toLowerCase().includes(q) ||
      log.subject?.toLowerCase().includes(q) ||
      log.order_id?.toLowerCase().includes(q);
    return matchType && matchSearch;
  });

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><RefreshCw className="w-8 h-8 text-sky-500 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Logs</h1>
          <p className="text-sm text-gray-500">{logs.length} transactional emails logged</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchLogs}><RefreshCw className="w-4 h-4" /></Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Sent', value: logs.length, color: 'text-sky-600 bg-sky-50', icon: Mail },
          { label: 'Successful', value: logs.filter(l => l.status === 'sent').length, color: 'text-green-600 bg-green-50', icon: CheckCircle },
          { label: 'Failed', value: logs.filter(l => l.status === 'failed').length, color: 'text-red-600 bg-red-50', icon: XCircle },
          { label: 'Delivery Rate', value: logs.length ? `${Math.round((logs.filter(l => l.status === 'sent').length / logs.length) * 100)}%` : '0%', color: 'text-amber-600 bg-amber-50', icon: Clock },
        ].map(s => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
            <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.color}`}><s.icon className="w-5 h-5" /></span>
            <div>
              <p className="text-xs text-gray-500 font-medium">{s.label}</p>
              <p className="text-xl font-black text-gray-900">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by email, subject, order ID…" className="pl-9" />
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          className="w-full sm:w-44 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400">
          <option value="all">All Types</option>
          <option value="confirmation">Order Confirmation</option>
          <option value="shipped">Shipping Notice</option>
          <option value="delivered">Delivery Notice</option>
          <option value="oos">Out of Stock</option>
          <option value="cancelled">Cancellation</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Recipient</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Type</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase hidden md:table-cell">Subject</th>
              <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                <Mail className="w-10 h-10 mx-auto mb-2 text-gray-200" />No email logs found
              </td></tr>
            ) : filtered.map(log => (
              <tr key={log.id} onClick={() => setSelected(log)} className="hover:bg-sky-50/40 cursor-pointer transition-colors">
                <td className="px-4 py-3">
                  {log.status === 'sent' 
                    ? <CheckCircle className="w-5 h-5 text-green-500" />
                    : <XCircle className="w-5 h-5 text-red-500" />
                  }
                </td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-gray-900">{log.profiles?.full_name || 'Guest'}</p>
                  <p className="text-xs text-gray-400">{log.recipient_email}</p>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className={`text-[10px] font-bold uppercase ${TYPE_COLORS[log.email_type]}`}>
                    {log.email_type.replace('_',' ')}
                  </Badge>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <p className="text-gray-600 truncate max-w-xs">{log.subject}</p>
                  {log.order_id && <p className="text-[10px] text-sky-500 font-mono">Order: {log.order_id.slice(0,8)}</p>}
                </td>
                <td className="px-4 py-3 text-right text-xs text-gray-400">
                  {new Date(log.created_at).toLocaleString('en-CA', { dateStyle: 'short', timeStyle: 'short' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Log Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-sky-600 to-blue-600 p-6 rounded-t-2xl flex items-start justify-between">
              <div>
                <h2 className="text-white font-bold text-lg">Email Record</h2>
                <p className="text-sky-100 text-xs font-mono">{selected.id}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-white/70 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-gray-400 text-xs">Recipient</p><p className="font-semibold text-gray-900">{selected.recipient_email}</p></div>
                <div><p className="text-gray-400 text-xs">Status</p><Badge className={selected.status === 'sent' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>{selected.status}</Badge></div>
                <div><p className="text-gray-400 text-xs">Type</p><p className="font-semibold text-gray-900 capitalize">{selected.email_type.replace('_',' ')}</p></div>
                <div><p className="text-gray-400 text-xs">Sent At</p><p className="font-semibold text-gray-900">{new Date(selected.created_at).toLocaleString()}</p></div>
              </div>
              <hr className="border-gray-100" />
              <div>
                <p className="text-gray-400 text-xs mb-1">Subject Line</p>
                <p className="font-bold text-gray-900">{selected.subject}</p>
              </div>
              {selected.error_message && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                  <p className="text-xs font-bold text-red-700 mb-1">Error Details</p>
                  <p className="text-xs text-red-600 font-mono break-all">{selected.error_message}</p>
                </div>
              )}
              {selected.order_id && (
                <div className="flex items-center justify-between p-3 bg-sky-50 border border-sky-100 rounded-xl">
                  <div className="flex items-center gap-2">
                    <TableIcon className="w-4 h-4 text-sky-600" />
                    <span className="text-sm font-semibold text-sky-800">Related Order</span>
                  </div>
                  <span className="text-xs font-mono text-sky-600">{selected.order_id.slice(0,12)}…</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function X(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
