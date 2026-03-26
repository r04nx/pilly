'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  MessageSquare, Search, RefreshCw, X, Send, ChevronDown, CheckCircle, AlertTriangle
} from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-blue-100 text-blue-700 border-blue-200',
  in_progress: 'bg-amber-100 text-amber-700 border-amber-200',
  resolved: 'bg-green-100 text-green-700 border-green-200',
  closed: 'bg-gray-100 text-gray-600 border-gray-200',
};
const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-gray-100 text-gray-600', medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700', urgent: 'bg-red-100 text-red-700',
};

export default function AdminSupportPage() {
  const supabase = createClient();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<any>(null);
  const [replies, setReplies] = useState<any[]>([]);
  const [replyText, setReplyText] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [sending, setSending] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);
  const [alert, setAlert] = useState<{ msg: string; ok: boolean } | null>(null);

  useEffect(() => { fetchTickets(); }, []);
  useEffect(() => { if (selected) { fetchReplies(selected.id); setAdminNotes(selected.admin_notes || ''); } }, [selected]);

  const fetchTickets = async () => {
    setLoading(true);
    const { data } = await supabase.from('support_tickets')
      .select('*, profiles(full_name, email)')
      .order('created_at', { ascending: false });
    setTickets(data || []);
    setLoading(false);
  };

  const fetchReplies = async (id: string) => {
    const { data } = await supabase.from('ticket_replies').select('*, profiles(full_name, is_admin)')
      .eq('ticket_id', id).order('created_at', { ascending: true });
    setReplies(data || []);
  };

  const updateStatus = async (ticketId: string, status: string) => {
    await supabase.from('support_tickets').update({ status, updated_at: new Date().toISOString() }).eq('id', ticketId);
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status } : t));
    if (selected?.id === ticketId) setSelected((p: any) => ({ ...p, status }));
  };

  const saveNotes = async () => {
    setSavingNotes(true);
    const { error } = await supabase.from('support_tickets').update({ admin_notes: adminNotes, updated_at: new Date().toISOString() }).eq('id', selected.id);
    if (error) setAlert({ msg: error.message, ok: false });
    else { setAlert({ msg: 'Notes saved', ok: true }); setSelected((p: any) => ({ ...p, admin_notes: adminNotes })); }
    setSavingNotes(false);
    setTimeout(() => setAlert(null), 3000);
  };

  const sendReply = async () => {
    if (!replyText.trim()) return;
    setSending(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('ticket_replies').insert({
      ticket_id: selected.id, user_id: user!.id, message: replyText, is_admin_reply: true,
    });
    if (!error) { setReplyText(''); fetchReplies(selected.id); await updateStatus(selected.id, 'in_progress'); }
    setSending(false);
  };

  const filtered = tickets.filter(t => {
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch = !search || t.ticket_number?.toLowerCase().includes(q) ||
      t.subject?.toLowerCase().includes(q) ||
      t.profiles?.full_name?.toLowerCase().includes(q) ||
      t.profiles?.email?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><RefreshCw className="w-8 h-8 text-sky-500 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
          <p className="text-sm text-gray-500">{tickets.length} total tickets</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchTickets}><RefreshCw className="w-4 h-4" /></Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {['open','in_progress','resolved','closed'].map(s => (
          <button key={s} onClick={() => setStatusFilter(statusFilter === s ? 'all' : s)}
            className={`bg-white border rounded-xl p-4 text-left hover:shadow-md transition-all ${statusFilter === s ? 'border-sky-400 ring-2 ring-sky-100' : 'border-gray-200'}`}>
            <p className="text-xs font-bold text-gray-400 capitalize">{s.replace('_',' ')}</p>
            <p className="text-2xl font-black text-gray-900">{tickets.filter(t => t.status === s).length}</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tickets…" className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Ticket list */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Ticket</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase hidden md:table-cell">Customer</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase hidden sm:table-cell">Priority</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                <MessageSquare className="w-10 h-10 mx-auto mb-2 text-gray-200" />No tickets found
              </td></tr>
            ) : filtered.map(t => (
              <tr key={t.id} onClick={() => setSelected(t)}
                className="hover:bg-sky-50/40 cursor-pointer transition-colors">
                <td className="px-4 py-3">
                  <p className="text-xs font-mono text-sky-700 font-bold">{t.ticket_number}</p>
                  <p className="font-semibold text-gray-900 text-sm line-clamp-1">{t.subject}</p>
                  <p className="text-xs text-gray-400 capitalize">{t.category}</p>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <p className="font-semibold text-sm text-gray-800">{t.profiles?.full_name || '—'}</p>
                  <p className="text-xs text-gray-400">{t.profiles?.email}</p>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${PRIORITY_COLORS[t.priority]}`}>
                    {t.priority}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Select value={t.status} onValueChange={(v) => { updateStatus(t.id, v); }}>
                    <SelectTrigger className={`h-7 text-xs font-bold border rounded-full px-2 w-28 ${STATUS_COLORS[t.status]}`} onClick={e => e.stopPropagation()}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent onClick={e => e.stopPropagation()}>
                      {['open','in_progress','resolved','closed'].map(s => <SelectItem key={s} value={s}>{s.replace('_',' ')}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-4 py-3 text-right text-xs text-gray-400">
                  {new Date(t.created_at).toLocaleDateString('en-CA')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Ticket Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-sky-600 to-blue-600 p-6 rounded-t-2xl flex items-start justify-between">
              <div>
                <p className="text-sky-100 text-xs font-mono">{selected.ticket_number}</p>
                <h2 className="text-white font-bold text-lg">{selected.subject}</h2>
                <p className="text-sky-200 text-xs">{selected.profiles?.full_name} · {selected.profiles?.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <Select value={selected.status} onValueChange={(v) => updateStatus(selected.id, v)}>
                  <SelectTrigger className="h-7 bg-white/20 border-white/30 text-white text-xs rounded-full px-2 w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['open','in_progress','resolved','closed'].map(s => <SelectItem key={s} value={s}>{s.replace('_',' ')}</SelectItem>)}
                  </SelectContent>
                </Select>
                <button onClick={() => setSelected(null)} className="text-white/70 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {alert && (
                <div className={`flex gap-2 text-sm px-4 py-3 rounded-xl ${alert.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {alert.ok ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />} {alert.msg}
                </div>
              )}
              <div className="bg-sky-50 border border-sky-100 rounded-xl p-4">
                <p className="text-xs text-sky-500 font-semibold mb-1">Original Message</p>
                <p className="text-sm text-gray-700">{selected.description}</p>
                <p className="text-xs text-gray-400 mt-2">{new Date(selected.created_at).toLocaleString('en-CA')}</p>
              </div>

              {replies.map(r => (
                <div key={r.id} className={`flex ${r.is_admin_reply ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${r.is_admin_reply ? 'bg-white border border-gray-200 rounded-tl-none' : 'bg-sky-600 text-white rounded-tr-none'}`}>
                    {r.is_admin_reply && <p className="text-xs font-bold text-sky-600 mb-1">Support Team</p>}
                    <p>{r.message}</p>
                    <p className={`text-xs mt-1 ${r.is_admin_reply ? 'text-gray-400' : 'text-sky-200'}`}>
                      {new Date(r.created_at).toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}

              {/* Admin notes */}
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                <p className="text-xs font-bold text-amber-700 mb-2">📝 Internal Notes (not visible to customer)</p>
                <textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)} rows={2}
                  placeholder="Add internal notes…"
                  className="w-full px-3 py-2 border border-amber-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none bg-white" />
                <Button size="sm" onClick={saveNotes} disabled={savingNotes} className="mt-2 bg-amber-500 hover:bg-amber-600 text-white">
                  {savingNotes ? 'Saving…' : 'Save Notes'}
                </Button>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 flex gap-3">
              <textarea value={replyText} onChange={e => setReplyText(e.target.value)} rows={2}
                placeholder="Type your reply to the customer…"
                className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 resize-none" />
              <Button onClick={sendReply} disabled={sending || !replyText.trim()} className="bg-sky-600 hover:bg-sky-700 self-end">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
