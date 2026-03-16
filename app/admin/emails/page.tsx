'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Mail, Plus } from 'lucide-react';

export default function AdminEmailsPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'templates' | 'logs'>('templates');
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [templatesResponse, logsResponse] = await Promise.all([
          supabase.from('email_templates').select('*').order('created_at', { ascending: false }),
          supabase.from('email_logs').select('*').order('sent_at', { ascending: false }).limit(50),
        ]);

        if (templatesResponse.error) throw new Error(templatesResponse.error.message);
        if (logsResponse.error) throw new Error(logsResponse.error.message);

        setTemplates(templatesResponse.data || []);
        setLogs(logsResponse.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load email data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-foreground">Email Management</h1>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Template
          </Button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-destructive">{error}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-border">
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-4 py-3 font-medium transition border-b-2 ${
              activeTab === 'templates'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Templates
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-3 font-medium transition border-b-2 ${
              activeTab === 'logs'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Send Logs
          </button>
        </div>

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <Card>
            {templates.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-border bg-muted/50">
                    <tr>
                      <th className="px-6 py-4 text-left font-medium text-foreground">Name</th>
                      <th className="px-6 py-4 text-left font-medium text-foreground">Type</th>
                      <th className="px-6 py-4 text-left font-medium text-foreground">Subject</th>
                      <th className="px-6 py-4 text-right font-medium text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {templates.map((template) => (
                      <tr key={template.id} className="hover:bg-muted/50 transition">
                        <td className="px-6 py-4 text-foreground">{template.name}</td>
                        <td className="px-6 py-4 text-foreground text-xs">
                          <span className="px-3 py-1 bg-primary/10 text-primary rounded-full">
                            {template.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-foreground">{template.subject}</td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <Button variant="ghost" size="sm">Edit</Button>
                          <Button variant="ghost" size="sm">
                            <Mail className="w-4 h-4 mr-1" />
                            Send Test
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center">
                <p className="text-muted-foreground mb-4">No email templates yet</p>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Template
                </Button>
              </div>
            )}
          </Card>
        )}

        {/* Logs Tab */}
        {activeTab === 'logs' && (
          <Card>
            {logs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-border bg-muted/50">
                    <tr>
                      <th className="px-6 py-4 text-left font-medium text-foreground">Recipient</th>
                      <th className="px-6 py-4 text-left font-medium text-foreground">Subject</th>
                      <th className="px-6 py-4 text-left font-medium text-foreground">Sent</th>
                      <th className="px-6 py-4 text-left font-medium text-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-muted/50 transition">
                        <td className="px-6 py-4 text-foreground">{log.recipient_email}</td>
                        <td className="px-6 py-4 text-foreground">{log.subject}</td>
                        <td className="px-6 py-4 text-foreground text-xs">
                          {new Date(log.sent_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                            log.status === 'sent' ? 'bg-green-100 text-green-700' :
                            log.status === 'failed' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center text-muted-foreground">No email logs yet</div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
