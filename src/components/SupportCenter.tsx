import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Bug, 
  Lightbulb, 
  MessageCircle, 
  Search, 
  Plus, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  HelpCircle,
  Mail,
  Phone,
  MessageSquare,
  ExternalLink,
  Filter,
  ArrowRight,
  User,
  Calendar,
  Eye
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from 'react-router-dom';

interface SupportTicket {
  id: string;
  ticket_number: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
  responses?: any[];
}

const SupportCenter = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(false);
  const [newTicketOpen, setNewTicketOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [supportSystemAvailable, setSupportSystemAvailable] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // New ticket form state
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium'
  });

  useEffect(() => {
    if (user) {
      fetchTickets();
    }
  }, [user]);

  const fetchTickets = async () => {
    if (!user) return;
    setLoading(true);
    try {
      console.log('Fetching tickets for user:', user.id);
      
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tickets:', error);
        throw error;
      }
      
      console.log('Tickets fetched successfully:', data);
      setTickets(data || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      
      // Check if it's a table not found error
      if (error.message && error.message.includes('relation "support_tickets" does not exist')) {
        // Set a flag to show alternative support options
        setTickets([]);
        setSupportSystemAvailable(false);
        return; // Don't show error toast, we'll handle this gracefully
      } else if (error.message && error.message.includes('permission denied')) {
        toast({
          title: "Permission Error", 
          description: "Unable to access support tickets. Please check your permissions.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: `Failed to load support tickets: ${error.message}`,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const submitTicket = async () => {
    if (!user || !newTicket.title || !newTicket.description || !newTicket.category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!supportSystemAvailable) {
      toast({
        title: "Support System Unavailable",
        description: "Please contact us directly at support@popguide.co.uk",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const ticketNumber = `PG-${Date.now().toString().slice(-6)}`;
      
      console.log('Creating ticket with data:', {
        ticket_number: ticketNumber,
        user_id: user.id,
        title: newTicket.title,
        description: newTicket.description,
        category: newTicket.category,
        priority: newTicket.priority,
        status: 'new',
        source: 'web_form'
      });

      const { data, error } = await supabase
        .from('support_tickets')
        .insert({
          ticket_number: ticketNumber,
          user_id: user.id,
          title: newTicket.title,
          description: newTicket.description,
          category: newTicket.category,
          priority: newTicket.priority,
          status: 'new',
          source: 'web_form'
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error creating ticket:', error);
        
        // Check if it's a table not found error
        if (error.message && error.message.includes('relation "support_tickets" does not exist')) {
          setSupportSystemAvailable(false);
          toast({
            title: "Support System Unavailable",
            description: "Please contact us directly at support@popguide.co.uk",
            variant: "destructive",
          });
          return;
        }
        
        throw error;
      }

      console.log('Ticket created successfully:', data);

      // Send notification email
      try {
        await supabase.functions.invoke('send-email', {
          body: {
            type: 'support_ticket_created',
            to: user.email,
            data: {
              ticketNumber,
              title: newTicket.title,
              category: newTicket.category,
              fullName: user.user_metadata?.full_name || user.email
            }
          }
        });
        console.log('Email notification sent successfully');
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError);
        // Don't fail the whole operation if email fails
      }

      toast({
        title: "Success",
        description: `Ticket ${ticketNumber} created successfully!`,
      });

      setNewTicket({ title: '', description: '', category: '', priority: 'medium' });
      setNewTicketOpen(false);
      fetchTickets();
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast({
        title: "Error",
        description: `Failed to create support ticket: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'open': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'resolved': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'closed': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <Clock className="w-4 h-4" />;
      case 'open': return <MessageCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      case 'closed': return <CheckCircle className="w-4 h-4" />;
      default: return <HelpCircle className="w-4 h-4" />;
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.ticket_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const quickActions = [
    {
      title: 'Report a Bug',
      description: 'Found something broken? Let us know!',
      icon: Bug,
      action: () => {
        setNewTicket(prev => ({ ...prev, category: 'bug_report' }));
        setNewTicketOpen(true);
      },
      color: 'text-red-400 bg-red-900/20'
    },
    {
      title: 'Request Feature',
      description: 'Have an idea to improve PopGuide?',
      icon: Lightbulb,
      action: () => {
        setNewTicket(prev => ({ ...prev, category: 'feature_request' }));
        setNewTicketOpen(true);
      },
      color: 'text-yellow-400 bg-yellow-900/20'
    },
    {
      title: 'Account Help',
      description: 'Issues with login, billing, or settings',
      icon: User,
      action: () => {
        setNewTicket(prev => ({ ...prev, category: 'account_issue' }));
        setNewTicketOpen(true);
      },
      color: 'text-blue-400 bg-blue-900/20'
    },
    {
      title: 'Contact Support',
      description: 'Speak directly with our team',
      icon: MessageSquare,
      action: () => setActiveTab('contact'),
      color: 'text-green-400 bg-green-900/20'
    }
  ];

  const supportStats = {
    totalTickets: tickets.length,
    openTickets: tickets.filter(t => ['new', 'open', 'pending'].includes(t.status)).length,
    resolvedTickets: tickets.filter(t => ['resolved', 'closed'].includes(t.status)).length,
    avgResponseTime: '< 24 hours'
  };

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-700 pb-4">
        <Button
          variant={activeTab === 'overview' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 ${activeTab === 'overview' ? 'bg-orange-500 text-white' : 'text-white hover:text-white hover:bg-gray-700'}`}
        >
          <MessageCircle className="w-4 h-4" />
          Overview
        </Button>
        <Button
          variant={activeTab === 'tickets' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('tickets')}
          className={`flex items-center gap-2 ${activeTab === 'tickets' ? 'bg-orange-500 text-white' : 'text-white hover:text-white hover:bg-gray-700'}`}
        >
          <Bug className="w-4 h-4" />
          My Tickets ({supportStats.openTickets})
        </Button>
        <Button
          variant={activeTab === 'contact' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('contact')}
          className={`flex items-center gap-2 ${activeTab === 'contact' ? 'bg-orange-500 text-white' : 'text-white hover:text-white hover:bg-gray-700'}`}
        >
          <Mail className="w-4 h-4" />
          Contact
        </Button>
        <Button
          variant={activeTab === 'knowledge' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('knowledge')}
          className={`flex items-center gap-2 ${activeTab === 'knowledge' ? 'bg-orange-500 text-white' : 'text-white hover:text-white hover:bg-gray-700'}`}
        >
          <HelpCircle className="w-4 h-4" />
          Help Center
        </Button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {!supportSystemAvailable && (
            <Card className="bg-orange-900/20 border-orange-500/30">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <AlertTriangle className="w-8 h-8 text-orange-500" />
                  <div>
                    <h3 className="text-xl font-bold text-white">Support System Temporarily Unavailable</h3>
                    <p className="text-orange-200">Our ticketing system is currently being set up. Please contact us directly.</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-4 text-center">
                      <Mail className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                      <h4 className="font-semibold text-white mb-1">Email Support</h4>
                      <a href="mailto:support@popguide.co.uk" className="text-orange-400 hover:text-orange-300">
                        support@popguide.co.uk
                      </a>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-4 text-center">
                      <MessageSquare className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                      <h4 className="font-semibold text-white mb-1">Discord Community</h4>
                      <a href="https://discord.gg/popguide" className="text-orange-400 hover:text-orange-300">
                        Join Discord
                      </a>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-4 text-center">
                      <Phone className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                      <h4 className="font-semibold text-white mb-1">Response Time</h4>
                      <p className="text-orange-400">Within 24 hours</p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Support Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4 text-center">
                <MessageCircle className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{supportStats.totalTickets}</div>
                <div className="text-gray-400 text-sm">Total Tickets</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4 text-center">
                <Clock className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{supportStats.openTickets}</div>
                <div className="text-gray-400 text-sm">Open Tickets</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4 text-center">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{supportStats.resolvedTickets}</div>
                <div className="text-gray-400 text-sm">Resolved</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4 text-center">
                <Clock className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <div className="text-lg font-bold text-white">{supportStats.avgResponseTime}</div>
                <div className="text-gray-400 text-sm">Avg Response</div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
            {!supportSystemAvailable ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors">
                  <CardContent className="p-6">
                    <a href="mailto:support@popguide.co.uk?subject=Bug Report" className="flex items-start gap-4">
                      <div className="p-3 rounded-lg text-red-400 bg-red-900/20">
                        <Bug className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-white mb-1">Report a Bug</h4>
                        <p className="text-gray-400 text-sm">Email us directly about bugs</p>
                      </div>
                      <ExternalLink className="w-5 h-5 text-gray-400" />
                    </a>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors">
                  <CardContent className="p-6">
                    <a href="mailto:support@popguide.co.uk?subject=Feature Request" className="flex items-start gap-4">
                      <div className="p-3 rounded-lg text-yellow-400 bg-yellow-900/20">
                        <Lightbulb className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-white mb-1">Request Feature</h4>
                        <p className="text-gray-400 text-sm">Send us your ideas via email</p>
                      </div>
                      <ExternalLink className="w-5 h-5 text-gray-400" />
                    </a>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors">
                  <CardContent className="p-6">
                    <a href="mailto:support@popguide.co.uk?subject=Account Help" className="flex items-start gap-4">
                      <div className="p-3 rounded-lg text-blue-400 bg-blue-900/20">
                        <User className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-white mb-1">Account Help</h4>
                        <p className="text-gray-400 text-sm">Get help with your account</p>
                      </div>
                      <ExternalLink className="w-5 h-5 text-gray-400" />
                    </a>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 cursor-pointer" onClick={() => setActiveTab('contact')}>
                      <div className="p-3 rounded-lg text-green-400 bg-green-900/20">
                        <MessageSquare className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-white mb-1">Contact Support</h4>
                        <p className="text-gray-400 text-sm">View all contact options</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickActions.map((action, index) => (
                  <Card key={index} className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors cursor-pointer" onClick={action.action}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${action.color}`}>
                          <action.icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-white mb-1">{action.title}</h4>
                          <p className="text-gray-400 text-sm">{action.description}</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Recent Tickets */}
          {tickets.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-white mb-4">Recent Tickets</h3>
              <div className="space-y-3">
                {tickets.slice(0, 3).map((ticket) => (
                  <Card key={ticket.id} className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(ticket.status)}
                          <div>
                            <div className="font-medium text-white">{ticket.title}</div>
                            <div className="text-sm text-gray-400">#{ticket.ticket_number}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getPriorityColor(ticket.priority)}>{ticket.priority}</Badge>
                          <Badge className={getStatusColor(ticket.status)}>{ticket.status}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Button 
                variant="outline" 
                className="w-full mt-4" 
                onClick={() => setActiveTab('tickets')}
              >
                View All Tickets
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Tickets Tab */}
      {activeTab === 'tickets' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <h3 className="text-xl font-bold text-white">My Support Tickets</h3>
            <Button onClick={() => setNewTicketOpen(true)} className="bg-orange-500 hover:bg-orange-600">
              <Plus className="w-4 h-4 mr-2" />
              New Ticket
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48 bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tickets List */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                <p className="text-gray-400 mt-2">Loading tickets...</p>
              </div>
            ) : filteredTickets.length === 0 ? (
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-8 text-center">
                  <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-white mb-2">No tickets found</h4>
                  <p className="text-gray-400 mb-4">
                    {searchQuery || statusFilter !== 'all' 
                      ? "Try adjusting your search or filters"
                      : "You haven't created any support tickets yet"
                    }
                  </p>
                  <Button onClick={() => setNewTicketOpen(true)} className="bg-orange-500 hover:bg-orange-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Ticket
                  </Button>
                </CardContent>
              </Card>
            ) : (
              filteredTickets.map((ticket) => (
                <Card key={ticket.id} className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getStatusIcon(ticket.status)}
                          <h4 className="font-semibold text-white text-lg">{ticket.title}</h4>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                          <span>#{ticket.ticket_number}</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(ticket.created_at).toLocaleDateString()}
                          </span>
                          <span className="capitalize">{ticket.category.replace('_', ' ')}</span>
                        </div>
                        <p className="text-gray-300 text-sm line-clamp-2">{ticket.description}</p>
                      </div>
                      <div className="flex flex-col md:items-end gap-2">
                        <div className="flex items-center gap-2">
                          <Badge className={getPriorityColor(ticket.priority)}>{ticket.priority}</Badge>
                          <Badge className={getStatusColor(ticket.status)}>{ticket.status}</Badge>
                        </div>
                        <Button variant="outline" size="sm" className="self-start md:self-end">
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {/* Contact Tab */}
      {activeTab === 'contact' && (
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-white">Contact Support</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Contact Methods */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6 text-center">
                <Mail className="w-8 h-8 text-orange-500 mx-auto mb-4" />
                <h4 className="font-semibold text-white mb-2">Email Support</h4>
                <p className="text-gray-400 text-sm mb-4">Get help via email</p>
                <p className="text-orange-400 font-medium">support@popguide.co.uk</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6 text-center">
                <MessageSquare className="w-8 h-8 text-orange-500 mx-auto mb-4" />
                <h4 className="font-semibold text-white mb-2">Live Chat</h4>
                <p className="text-gray-400 text-sm mb-4">Chat with our team</p>
                <p className="text-orange-400 font-medium">Available 9 AM - 5 PM BST</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6 text-center">
                <ExternalLink className="w-8 h-8 text-orange-500 mx-auto mb-4" />
                <h4 className="font-semibold text-white mb-2">Community</h4>
                <p className="text-gray-400 text-sm mb-4">Join our Discord</p>
                <p className="text-orange-400 font-medium">discord.gg/popguide</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link to="/faq">
              <Card className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors cursor-pointer">
                <CardContent className="p-4 flex items-center gap-3">
                  <HelpCircle className="w-6 h-6 text-orange-500" />
                  <div>
                    <h4 className="font-medium text-white">FAQ</h4>
                    <p className="text-gray-400 text-sm">Frequently asked questions</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/bug-tracker">
              <Card className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors cursor-pointer">
                <CardContent className="p-4 flex items-center gap-3">
                  <Bug className="w-6 h-6 text-orange-500" />
                  <div>
                    <h4 className="font-medium text-white">Bug Tracker</h4>
                    <p className="text-gray-400 text-sm">Report and track issues</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      )}

      {/* Knowledge Base Tab */}
      {activeTab === 'knowledge' && (
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-white">Help Center</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link to="/howitworks">
              <Card className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors cursor-pointer">
                <CardContent className="p-6">
                  <HelpCircle className="w-8 h-8 text-orange-500 mb-4" />
                  <h4 className="font-semibold text-white mb-2">How It Works</h4>
                  <p className="text-gray-400 text-sm">Learn how to use PopGuide</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/api">
              <Card className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors cursor-pointer">
                <CardContent className="p-6">
                  <MessageSquare className="w-8 h-8 text-orange-500 mb-4" />
                  <h4 className="font-semibold text-white mb-2">API Documentation</h4>
                  <p className="text-gray-400 text-sm">Integrate with PopGuide API</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/system-status">
              <Card className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors cursor-pointer">
                <CardContent className="p-6">
                  <AlertTriangle className="w-8 h-8 text-orange-500 mb-4" />
                  <h4 className="font-semibold text-white mb-2">System Status</h4>
                  <p className="text-gray-400 text-sm">Check service availability</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      )}

      {/* New Ticket Dialog */}
      <Dialog open={newTicketOpen} onOpenChange={setNewTicketOpen}>
        <DialogContent className="max-w-2xl bg-gray-900 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Create Support Ticket</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Title *</label>
              <Input
                placeholder="Brief description of your issue..."
                value={newTicket.title}
                onChange={(e) => setNewTicket(prev => ({ ...prev, title: e.target.value }))}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Category *</label>
                <Select value={newTicket.category} onValueChange={(value) => setNewTicket(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bug_report">Bug Report</SelectItem>
                    <SelectItem value="feature_request">Feature Request</SelectItem>
                    <SelectItem value="account_issue">Account Issue</SelectItem>
                    <SelectItem value="payment_billing">Payment/Billing</SelectItem>
                    <SelectItem value="technical_support">Technical Support</SelectItem>
                    <SelectItem value="data_issue">Data Issue</SelectItem>
                    <SelectItem value="general_inquiry">General Inquiry</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
                <Select value={newTicket.priority} onValueChange={(value) => setNewTicket(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
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
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Description *</label>
              <Textarea
                placeholder="Please provide detailed information about your issue..."
                value={newTicket.description}
                onChange={(e) => setNewTicket(prev => ({ ...prev, description: e.target.value }))}
                className="bg-gray-800 border-gray-700 text-white min-h-32"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setNewTicketOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={submitTicket} disabled={loading} className="bg-orange-500 hover:bg-orange-600">
              {loading ? 'Creating...' : 'Create Ticket'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SupportCenter; 