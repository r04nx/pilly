'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  MessageSquare, Plus, X, AlertCircle, CheckCircle, Clock, Send, ChevronDown, RefreshCw
} from 'lucide-react';

const CATEGORIES = ['general', 'order', 'payment', 'returns', 'product', 'account', 'other'];
const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-blue-100 text-blue-700 border-blue-200',
  in_progress: 'bg-amber-100 text-amber-700 border-amber-200',
  resolved: 'bg-green-100 text-green-700 border-green-200',
  closed: 'bg-gray-100 text-gray-600 border-gray-200',
};

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};

export default function CustomerSupportPage() {
  const supabase = createClient();
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [replies, setReplies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [form, setForm] = useState({
    subject: '', description: '', category: 'general', priority: 'medium'
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { fetchTickets(); }, []);

  useEffect(() => {
    if (selectedTicket) fetchReplies(selectedTicket.id);
  }, [selectedTicket]);

  const fetchTickets = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setTickets(data || []);
    setLoading(false);
  };

  const fetchReplies = async (ticketId: string) => {
    const { data } = await supabase
      .from('ticket_replies')
      .select('*, profiles(full_name, is_admin)')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });
    setReplies(data || []);
  };

  const createTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.description.trim()) {
      setError('Subject and description are required.');
      return;
    }
    setCreating(true); setError('');
    const { data: { user } } = await supabase.auth.getUser();
    const { error: err } = await supabase.from('support_tickets').insert({
      user_id: user!.id,
      ...form,
    });
    if (err) { setError(err.message); }
    else {
      setSuccess('Ticket created! Our team will respond within 24 hours.');
      setForm({ subject: '', description: '', category: 'general', priority: 'medium' });
      setShowForm(false);
      fetchTickets();
      setTimeout(() => setSuccess(''), 5000);
    }
    setCreating(false);
  };

  const sendReply = async () => {
    if (!replyText.trim() || !selectedTicket) return;
    setSendingReply(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error: err } = await supabase.from('ticket_replies').insert({
      ticket_id: selectedTicket.id,
      user_id: user!.id,
      message: replyText,
      is_admin_reply: false,
    });
    if (!err) {
      setReplyText('');
      fetchReplies(selectedTicket.id);
    }
    setSendingReply(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
          <p className="text-sm text-gray-500">Get help from our team</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchTickets}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button onClick={() => setShowForm(true)} className="bg-sky-600 hover:bg-sky-700">
            <Plus className="w-4 h-4 mr-2" /> New Ticket
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {error && <div className="flex gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm"><AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />{error}</div>}
      {success && <div className="flex gap-2 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm"><CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />{success}</div>}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', count: tickets.length, color: 'bg-blue-50 text-blue-700' },
          { label: 'Open', count: tickets.filter(t => t.status === 'open').length, color: 'bg-amber-50 text-amber-700' },
          { label: 'In Progress', count: tickets.filter(t => t.status === 'in_progress').length, color: 'bg-purple-50 text-purple-700' },
          { label: 'Resolved', count: tickets.filter(t => t.status === 'resolved').length, color: 'bg-green-50 text-green-700' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl p-4 ${s.color}`}>
            <p className="text-xs font-bold uppercase opacity-70">{s.label}</p>
            <p className="text-2xl font-black mt-1">{s.count}</p>
          </div>
        ))}
      </div>

      {/* Ticket List */}
      {loading ? (
        <div className="flex items-center justify-center py-12"><RefreshCw className="w-6 h-6 text-sky-500 animate-spin" /></div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <MessageSquare className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <h3 className="font-bold text-gray-700">No support tickets yet</h3>
          <p className="text-gray-400 text-sm mt-1">Create your first ticket to get help</p>
          <Button onClick={() => setShowForm(true)} className="mt-4 bg-sky-600 hover:bg-sky-700">
            <Plus className="w-4 h-4 mr-2" /> Create Ticket
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map(ticket => (
            <button key={ticket.id} onClick={() => setSelectedTicket(ticket)}
              className="w-full bg-white border border-gray-200 hover:border-sky-300 rounded-xl p-4 text-left hover:shadow-md transition-all group">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs font-mono text-gray-400">{ticket.ticket_number}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${STATUS_COLORS[ticket.status]}`}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${PRIORITY_COLORS[ticket.priority]}`}>
                      {ticket.priority}
                    </span>
                  </div>
                  <p className="font-semibold text-gray-900 truncate">{ticket.subject}</p>
                  <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{ticket.description}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-gray-400">{new Date(ticket.created_at).toLocaleDateString('en-CA')}</p>
                  <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full mt-1 inline-block capitalize">{ticket.category}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Create Ticket Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-sky-600 to-blue-600 p-6 rounded-t-2xl flex items-center justify-between">
              <h2 className="text-white font-bold text-lg">New Support Ticket</h2>
              <button onClick={() => setShowForm(false)} className="text-white/70 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={createTicket} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Subject *</label>
                <Input value={form.subject} onChange={e => setForm({...form, subject: e.target.value})}
                  placeholder="Brief description of your issue" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category</label>
                  <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Priority</label>
                  <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400">
                    {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase()+p.slice(1)}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description *</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                  rows={4} required placeholder="Describe your issue in detail…"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 resize-none" />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" disabled={creating} className="bg-sky-600 hover:bg-sky-700">
                  {creating ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />Creating…</> : 'Create Ticket'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-sky-600 to-blue-600 p-6 rounded-t-2xl flex items-start justify-between">
              <div>
                <p className="text-sky-100 text-xs font-mono">{selectedTicket.ticket_number}</p>
                <h2 className="text-white font-bold text-lg">{selectedTicket.subject}</h2>
                <div className="flex gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold bg-white/20 text-white border border-white/30`}>
                    {selectedTicket.status.replace('_',' ')}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold bg-white/20 text-white`}>
                    {selectedTicket.priority}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelectedTicket(null)} className="text-white/70 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Original message */}
              <div className="bg-sky-50 border border-sky-100 rounded-xl p-4">
                <p className="text-xs text-sky-500 font-semibold mb-1">Original Message</p>
                <p className="text-sm text-gray-700">{selectedTicket.description}</p>
                <p className="text-xs text-gray-400 mt-2">{new Date(selectedTicket.created_at).toLocaleString('en-CA')}</p>
              </div>

              {/* Admin notes */}
              {selectedTicket.admin_notes && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-xs text-amber-600 font-bold mb-1">📝 Admin Notes</p>
                  <p className="text-sm text-amber-800">{selectedTicket.admin_notes}</p>
                </div>
              )}

              {/* Replies */}
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
            </div>

            {/* Reply input */}
            {selectedTicket.status !== 'closed' && (
              <div className="p-4 border-t border-gray-200 flex gap-3">
                <textarea value={replyText} onChange={e => setReplyText(e.target.value)}
                  rows={2} placeholder="Type your reply…"
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 resize-none" />
                <Button onClick={sendReply} disabled={sendingReply || !replyText.trim()} className="bg-sky-600 hover:bg-sky-700 self-end">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
