'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  MessageCircle, 
  Send, 
  Search, 
  Plus, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  HelpCircle,
  Phone,
  Mail,
  FileText,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface SupportTicket {
  id: string;
  ticket_number: string;
  subject: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  created_at: string;
  updated_at: string;
  replies?: number;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  helpful: number;
}

export default function CustomerSupport() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tickets');
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  const [expandedFAQs, setExpandedFAQs] = useState<Set<string>>(new Set());
  
  // New ticket form state
  const [newTicket, setNewTicket] = useState({
    subject: '',
    description: '',
    category: 'general',
    priority: 'medium'
  });
  
  // Search states
  const [ticketSearch, setTicketSearch] = useState('');
  const [faqSearch, setFaqSearch] = useState('');
  const [faqCategory, setFaqCategory] = useState('all');

  const supabase = createClient();

  const ticketStatusConfig = {
    open: { label: 'Open', color: 'bg-blue-100 text-blue-800', icon: MessageCircle },
    in_progress: { label: 'In Progress', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    resolved: { label: 'Resolved', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    closed: { label: 'Closed', color: 'bg-gray-100 text-gray-800', icon: FileText }
  };

  const priorityConfig = {
    low: { label: 'Low', color: 'bg-gray-100 text-gray-800' },
    medium: { label: 'Medium', color: 'bg-blue-100 text-blue-800' },
    high: { label: 'High', color: 'bg-orange-100 text-orange-800' },
    urgent: { label: 'Urgent', color: 'bg-red-100 text-red-800' }
  };

  const categories = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'technical', label: 'Technical Support' },
    { value: 'billing', label: 'Billing & Payments' },
    { value: 'shipping', label: 'Shipping & Delivery' },
    { value: 'returns', label: 'Returns & Refunds' },
    { value: 'account', label: 'Account Issues' }
  ];

  const faqCategories = [
    { value: 'all', label: 'All Categories' },
    { value: 'orders', label: 'Orders & Shipping' },
    { value: 'returns', label: 'Returns & Refunds' },
    { value: 'account', label: 'Account & Security' },
    { value: 'payments', label: 'Payments & Billing' },
    { value: 'products', label: 'Products & Services' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch tickets
        const { data: ticketData, error: ticketError } = await supabase
          .from('support_tickets')
          .select(`
            *,
            ticket_replies(count)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (ticketError) throw ticketError;
        
        const transformedTickets = (ticketData || []).map((ticket: any) => ({
          ...ticket,
          replies: ticket.ticket_replies?.[0]?.count || 0
        }));
        
        setTickets(transformedTickets);

        // Fetch FAQs
        const { data: faqData, error: faqError } = await supabase
          .from('faqs')
          .select('*')
          .order('helpful', { ascending: false });

        if (faqError) throw faqError;
        setFaqs(faqData || []);
      } catch (error) {
        console.error('Error fetching support data:', error);
        // Mock data for demo
        const mockTickets: SupportTicket[] = [
          {
            id: '1',
            ticket_number: 'TKT-2024-001',
            subject: 'Order not received',
            description: 'I placed an order last week but haven\'t received it yet.',
            category: 'shipping',
            priority: 'high',
            status: 'in_progress',
            created_at: '2024-03-10T10:00:00Z',
            updated_at: '2024-03-12T15:30:00Z',
            replies: 2
          },
          {
            id: '2',
            ticket_number: 'TKT-2024-002',
            subject: 'Refund request',
            description: 'I would like to request a refund for my recent purchase.',
            category: 'returns',
            priority: 'medium',
            status: 'open',
            created_at: '2024-03-14T11:20:00Z',
            updated_at: '2024-03-14T11:20:00Z',
            replies: 0
          }
        ];

        const mockFAQs: FAQ[] = [
          {
            id: '1',
            question: 'How can I track my order?',
            answer: 'You can track your order by going to the Orders page and clicking on "View Details" for your specific order. You will find the tracking number and real-time updates there.',
            category: 'orders',
            helpful: 45
          },
          {
            id: '2',
            question: 'What is your return policy?',
            answer: 'We offer a 30-day return policy for most items. Products must be unused and in original packaging. Please visit our Returns page for detailed instructions.',
            category: 'returns',
            helpful: 38
          },
          {
            id: '3',
            question: 'How do I reset my password?',
            answer: 'Click on "Forgot Password" on the login page, enter your email address, and follow the instructions sent to your email to reset your password.',
            category: 'account',
            helpful: 52
          },
          {
            id: '4',
            question: 'What payment methods do you accept?',
            answer: 'We accept all major credit cards, debit cards, PayPal, Apple Pay, and Google Pay for your convenience.',
            category: 'payments',
            helpful: 29
          }
        ];

        setTickets(mockTickets);
        setFaqs(mockFAQs);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const ticketData = {
        user_id: user.id,
        ticket_number: `TKT-${new Date().getFullYear()}-${String(tickets.length + 1).padStart(3, '0')}`,
        subject: newTicket.subject,
        description: newTicket.description,
        category: newTicket.category,
        priority: newTicket.priority,
        status: 'open'
      };

      const { data, error } = await supabase
        .from('support_tickets')
        .insert(ticketData)
        .select()
        .single();

      if (error) throw error;

      setTickets([data, ...tickets]);
      setNewTicket({ subject: '', description: '', category: 'general', priority: 'medium' });
      setShowNewTicketForm(false);
    } catch (error) {
      console.error('Error creating ticket:', error);
    }
  };

  const toggleFAQ = (faqId: string) => {
    setExpandedFAQs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(faqId)) {
        newSet.delete(faqId);
      } else {
        newSet.add(faqId);
      }
      return newSet;
    });
  };

  const markFAQHelpful = async (faqId: string) => {
    try {
      const { error } = await supabase
        .from('faqs')
        .update({ helpful: faqs.find(f => f.id === faqId)!.helpful + 1 })
        .eq('id', faqId);

      if (error) throw error;

      setFaqs(prev => prev.map(faq => 
        faq.id === faqId ? { ...faq, helpful: faq.helpful + 1 } : faq
      ));
    } catch (error) {
      console.error('Error updating FAQ:', error);
    }
  };

  const filteredTickets = tickets.filter(ticket =>
    ticket.subject.toLowerCase().includes(ticketSearch.toLowerCase()) ||
    ticket.description.toLowerCase().includes(ticketSearch.toLowerCase())
  );

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(faqSearch.toLowerCase());
    const matchesCategory = faqCategory === 'all' || faq.category === faqCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Support Center</h1>
        <p className="text-gray-600">How can we help you today?</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tickets">My Tickets</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="contact">Contact Us</TabsTrigger>
          <TabsTrigger value="live">Live Chat</TabsTrigger>
        </TabsList>

        <TabsContent value="tickets">
          <div className="space-y-6">
            {/* Create New Ticket */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Plus className="w-5 h-5" />
                      Create New Ticket
                    </CardTitle>
                    <CardDescription>
                      Can't find what you're looking for? Create a support ticket.
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setShowNewTicketForm(!showNewTicketForm)}
                  >
                    {showNewTicketForm ? 'Cancel' : 'New Ticket'}
                  </Button>
                </div>
              </CardHeader>
              {showNewTicketForm && (
                <CardContent className="p-4">
                  <form onSubmit={handleCreateTicket} className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="subject">Subject</Label>
                        <Input
                          id="subject"
                          value={newTicket.subject}
                          onChange={(e) => setNewTicket(prev => ({ ...prev, subject: e.target.value }))}
                          placeholder="Brief description of your issue"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Select value={newTicket.category} onValueChange={(value) => setNewTicket(prev => ({ ...prev, category: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map(category => (
                              <SelectItem key={category.value} value={category.value}>
                                {category.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <Select value={newTicket.priority} onValueChange={(value: any) => setNewTicket(prev => ({ ...prev, priority: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newTicket.description}
                        onChange={(e) => setNewTicket(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Please provide detailed information about your issue"
                        rows={4}
                        required
                      />
                    </div>
                    <Button type="submit">
                      <Send className="w-4 h-4 mr-2" />
                      Submit Ticket
                    </Button>
                  </form>
                </CardContent>
              )}
            </Card>

            {/* Search Tickets */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search your tickets..."
                value={ticketSearch}
                onChange={(e) => setTicketSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Tickets List */}
            {filteredTickets.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No tickets found</h3>
                  <p className="text-gray-600 mb-4">You haven't created any support tickets yet.</p>
                  <Button onClick={() => setShowNewTicketForm(true)}>
                    Create Your First Ticket
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredTickets.map((ticket) => {
                  const StatusIcon = ticketStatusConfig[ticket.status].icon;
                  return (
                    <Card key={ticket.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-lg">{ticket.subject}</h3>
                              <Badge className={ticketStatusConfig[ticket.status].color}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {ticketStatusConfig[ticket.status].label}
                              </Badge>
                              <Badge className={priorityConfig[ticket.priority].color}>
                                {priorityConfig[ticket.priority].label}
                              </Badge>
                            </div>
                            <p className="text-gray-600 mb-3 line-clamp-2">{ticket.description}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>{ticket.ticket_number}</span>
                              <span>•</span>
                              <span>Created {new Date(ticket.created_at).toLocaleDateString()}</span>
                              {ticket.replies > 0 && (
                                <>
                                  <span>•</span>
                                  <span>{ticket.replies} replies</span>
                                </>
                              )}
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="faq">
          <div className="space-y-6">
            {/* FAQ Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search FAQs..."
                  value={faqSearch}
                  onChange={(e) => setFaqSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={faqCategory} onValueChange={setFaqCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {faqCategories.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* FAQ Categories */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {faqCategories.slice(1).map(category => (
                <Card key={category.value} className="text-center cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <HelpCircle className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                    <p className="text-sm font-medium">{category.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* FAQ List */}
            <div className="space-y-3">
              {filteredFAQs.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No FAQs found</h3>
                    <p className="text-gray-600">Try adjusting your search or browse all categories.</p>
                  </CardContent>
                </Card>
              ) : (
                filteredFAQs.map((faq) => (
                  <Card key={faq.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <button
                            onClick={() => toggleFAQ(faq.id)}
                            className="text-left w-full group"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-semibold text-lg group-hover:text-blue-600 transition-colors">
                                {faq.question}
                              </h3>
                              {expandedFAQs.has(faq.id) ? (
                                <ChevronUp className="w-5 h-5 text-gray-400" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-gray-400" />
                              )}
                            </div>
                          </button>
                          {expandedFAQs.has(faq.id) && (
                            <div className="mt-4 space-y-4">
                              <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-gray-500">Was this helpful?</span>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => markFAQHelpful(faq.id)}
                                  >
                                    👍 Yes ({faq.helpful})
                                  </Button>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {faqCategories.find(c => c.value === faq.category)?.label}
                                </Badge>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="contact">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Email Support
                </CardTitle>
                <CardDescription>
                  Send us an email and we'll respond within 24 hours.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="email-subject">Subject</Label>
                  <Input id="email-subject" placeholder="What can we help you with?" />
                </div>
                <div>
                  <Label htmlFor="email-message">Message</Label>
                  <Textarea
                    id="email-message"
                    placeholder="Describe your issue in detail..."
                    rows={4}
                  />
                </div>
                <Button className="w-full">
                  <Send className="w-4 h-4 mr-2" />
                  Send Email
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Phone Support
                </CardTitle>
                <CardDescription>
                  Call us for immediate assistance during business hours.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="font-semibold">Main Support Line</p>
                  <p className="text-2xl font-bold text-blue-600">1-800-SUPPORT</p>
                  <p className="text-sm text-gray-600">Mon-Fri: 9AM-6PM EST</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="font-semibold">Emergency Support</p>
                  <p className="text-2xl font-bold text-green-600">1-800-URGENT</p>
                  <p className="text-sm text-gray-600">24/7 Available</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Other Departments</h4>
                  <div className="space-y-1 text-sm">
                    <p>Sales: 1-800-SALES</p>
                    <p>Billing: 1-800-BILLING</p>
                    <p>Technical: 1-800-TECH</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Office Locations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Headquarters</h4>
                  <p className="text-sm text-gray-600">
                    123 Business Ave<br />
                    New York, NY 10001<br />
                    United States
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">West Coast Office</h4>
                  <p className="text-sm text-gray-600">
                    456 Tech Blvd<br />
                    San Francisco, CA 94105<br />
                    United States
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">European Office</h4>
                  <p className="text-sm text-gray-600">
                    789 Innovation St<br />
                    London, EC1A 1BB<br />
                    United Kingdom
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="live">
          <Card>
            <CardContent className="text-center py-12">
              <MessageCircle className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">Live Chat Support</h3>
              <p className="text-gray-600 mb-6">Get instant help from our support team</p>
              
              <div className="max-w-md mx-auto space-y-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-semibold text-green-800">Available Now</span>
                  </div>
                  <p className="text-sm text-green-700">Average wait time: Less than 2 minutes</p>
                </div>
                
                <Button size="lg" className="w-full">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Start Live Chat
                </Button>
                
                <div className="text-sm text-gray-500">
                  <p>Chat hours: Monday - Friday, 9AM - 8PM EST</p>
                  <p>Weekend: 10AM - 6PM EST</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
