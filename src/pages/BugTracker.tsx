import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import BugSubmissionForm from '@/components/BugSubmissionForm';
import { Bug, BugVote, BugSeverity, BugStatus, BugPlatform } from '@/types/supabase';
import { 
  Bug as BugIcon, 
  Search, 
  Filter, 
  ThumbsUp, 
  Plus,
  AlertTriangle,
  CheckCircle,
  Clock,
  Loader,
  Calendar,
  User,
  Tag,
  Monitor,
  Chrome,
  Smartphone,
  Tablet,
  RefreshCw
} from 'lucide-react';
import SEO from '@/components/SEO';

const BugTracker = () => {
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [bugVotes, setBugVotes] = useState<BugVote[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<BugStatus | 'all'>('all');
  const [severityFilter, setSeverityFilter] = useState<BugSeverity | 'all'>('all');
  const [platformFilter, setPlatformFilter] = useState<BugPlatform | 'all'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'votes' | 'severity'>('newest');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Get user session
      const { data: { session } } = await supabase.auth.getSession();
      setUserId(session?.user?.id || null);

      // Fetch bugs
      const { data: bugsData, error: bugsError } = await supabase
        .from('bugs')
        .select('*')
        .order('created_at', { ascending: false });

      if (bugsError) throw bugsError;
      setBugs(bugsData || []);

      // Fetch bug votes
      const { data: votesData, error: votesError } = await supabase
        .from('bug_votes')
        .select('*');

      if (votesError) throw votesError;
      setBugVotes(votesData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (bugId: string) => {
    if (!userId) return;

    try {
      // Check if user already voted
      const existingVote = bugVotes.find(v => v.bug_id === bugId && v.user_id === userId);
      
      if (existingVote) {
        // Remove vote
        const { error } = await supabase
          .from('bug_votes')
          .delete()
          .eq('id', existingVote.id);
        
        if (error) throw error;
        setBugVotes(prev => prev.filter(v => v.id !== existingVote.id));
      } else {
        // Add vote
        const { data, error } = await supabase
          .from('bug_votes')
          .insert({ bug_id: bugId, user_id: userId })
          .select()
          .single();
        
        if (error) throw error;
        setBugVotes(prev => [...prev, data]);
      }
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const getVoteCount = (bugId: string) => {
    return bugVotes.filter(v => v.bug_id === bugId).length;
  };

  const hasUserVoted = (bugId: string) => {
    return bugVotes.some(v => v.bug_id === bugId && v.user_id === userId);
  };

  const getSeverityColor = (severity: BugSeverity) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-900/20 border-red-500/30';
      case 'high': return 'text-orange-400 bg-orange-900/20 border-orange-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-900/20 border-yellow-500/30';
      case 'low': return 'text-green-400 bg-green-900/20 border-green-500/30';
      default: return 'text-gray-400 bg-gray-900/20 border-gray-500/30';
    }
  };

  const getStatusColor = (status: BugStatus) => {
    switch (status) {
      case 'new': return 'text-blue-400 bg-blue-900/20 border-blue-500/30';
      case 'triaged': return 'text-purple-400 bg-purple-900/20 border-purple-500/30';
      case 'in_progress': return 'text-orange-400 bg-orange-900/20 border-orange-500/30';
      case 'testing': return 'text-yellow-400 bg-yellow-900/20 border-yellow-500/30';
      case 'resolved': return 'text-green-400 bg-green-900/20 border-green-500/30';
      case 'closed': return 'text-gray-400 bg-gray-900/20 border-gray-500/30';
      case 'duplicate': return 'text-red-400 bg-red-900/20 border-red-500/30';
      default: return 'text-gray-400 bg-gray-900/20 border-gray-500/30';
    }
  };

  const getPlatformIcon = (platform: BugPlatform) => {
    switch (platform) {
      case 'web_app': return <Monitor className="w-4 h-4" />;
      case 'chrome_extension': return <Chrome className="w-4 h-4" />;
      case 'ios_app': return <Tablet className="w-4 h-4" />;
      case 'android_app': return <Smartphone className="w-4 h-4" />;
      default: return <BugIcon className="w-4 h-4" />;
    }
  };

  const filteredAndSortedBugs = bugs
    .filter(bug => {
      const matchesSearch = bug.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           bug.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           bug.reference_number.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || bug.status === statusFilter;
      const matchesSeverity = severityFilter === 'all' || bug.severity === severityFilter;
      const matchesPlatform = platformFilter === 'all' || bug.platform === platformFilter;
      
      return matchesSearch && matchesStatus && matchesSeverity && matchesPlatform;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'votes':
          return getVoteCount(b.id) - getVoteCount(a.id);
        case 'severity': {
          const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          return severityOrder[b.severity] - severityOrder[a.severity];
        }
        default:
          return 0;
      }
    });

  if (showSubmissionForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <Navigation />
        <div className="container mx-auto py-12 px-4">
          <BugSubmissionForm 
            onSubmissionSuccess={(ref) => {
              setShowSubmissionForm(false);
              fetchData();
            }}
            onClose={() => setShowSubmissionForm(false)}
          />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="Bug Tracker | The Pop Guide" 
        description="Report bugs and track issues for PopGuide. Help us improve the platform by reporting problems and voting on bug fixes." 
      />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <Navigation />
        
        <div className="container mx-auto py-12 px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 flex items-center justify-center gap-3">
              <BugIcon className="w-12 h-12 text-orange-400" />
              PopGuide Bug Tracker
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Help us improve PopGuide by reporting bugs and tracking issues. Your feedback makes our platform better for everyone.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => setShowSubmissionForm(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 text-lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Report a Bug
              </Button>
              <Button 
                variant="outline"
                onClick={fetchData}
                className="border-orange-400 text-orange-400 hover:bg-orange-500 hover:text-white font-semibold px-8 py-3 text-lg"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gray-900/60 border-gray-600/50">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-white mb-2">{bugs.length}</div>
                <div className="text-gray-300">Total Bugs</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-900/60 border-gray-600/50">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-orange-400 mb-2">
                  {bugs.filter(b => ['new', 'triaged', 'in_progress'].includes(b.status)).length}
                </div>
                <div className="text-gray-300">Open</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-900/60 border-gray-600/50">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">
                  {bugs.filter(b => ['resolved', 'closed'].includes(b.status)).length}
                </div>
                <div className="text-gray-300">Resolved</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-900/60 border-gray-600/50">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-red-400 mb-2">
                  {bugs.filter(b => b.severity === 'critical').length}
                </div>
                <div className="text-gray-300">Critical</div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card className="bg-gray-900/60 border-gray-600/50 mb-8">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                {/* Search */}
                <div className="lg:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search bugs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as BugStatus | 'all')}
                  className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:outline-none"
                >
                  <option value="all">All Status</option>
                  <option value="new">New</option>
                  <option value="triaged">Triaged</option>
                  <option value="in_progress">In Progress</option>
                  <option value="testing">Testing</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>

                {/* Severity Filter */}
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value as BugSeverity | 'all')}
                  className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:outline-none"
                >
                  <option value="all">All Severity</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>

                {/* Platform Filter */}
                <select
                  value={platformFilter}
                  onChange={(e) => setPlatformFilter(e.target.value as BugPlatform | 'all')}
                  className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:outline-none"
                >
                  <option value="all">All Platforms</option>
                  <option value="web_app">Web App</option>
                  <option value="chrome_extension">Chrome Extension</option>
                  <option value="ios_app">iOS App</option>
                  <option value="android_app">Android App</option>
                </select>

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'votes' | 'severity')}
                  className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:outline-none"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="votes">Most Voted</option>
                  <option value="severity">By Severity</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Bug List */}
          {loading ? (
            <div className="text-center py-12">
              <Loader className="w-8 h-8 animate-spin text-orange-400 mx-auto mb-4" />
              <p className="text-gray-300">Loading bugs...</p>
            </div>
          ) : filteredAndSortedBugs.length === 0 ? (
            <div className="text-center py-12">
              <BugIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-300 text-xl mb-2">No bugs found</p>
              <p className="text-gray-500">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAndSortedBugs.map((bug) => (
                <Card key={bug.id} className="bg-gray-900/60 border-gray-600/50 hover:bg-gray-900/80 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      {/* Bug Info */}
                      <div className="flex-1">
                        <div className="flex items-start gap-4 mb-3">
                          <div className="flex items-center gap-3">
                            {getPlatformIcon(bug.platform)}
                            <div>
                              <h3 className="text-lg font-semibold text-white mb-1">
                                {bug.title}
                              </h3>
                              <p className="text-sm text-orange-400 font-mono">
                                {bug.reference_number}
                              </p>
                            </div>
                          </div>
                        </div>

                        <p className="text-gray-300 mb-4 line-clamp-2">
                          {bug.description}
                        </p>

                        <div className="flex flex-wrap gap-3 mb-4">
                          {/* Status Badge */}
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(bug.status)}`}>
                            {bug.status.replace('_', ' ').toUpperCase()}
                          </span>

                          {/* Severity Badge */}
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(bug.severity)}`}>
                            {bug.severity.toUpperCase()}
                          </span>

                          {/* Platform Badge */}
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border bg-gray-700/50 border-gray-500/30 text-gray-300">
                            {bug.platform.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>

                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(bug.created_at).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            Reporter
                          </div>
                        </div>
                      </div>

                      {/* Vote Section */}
                      <div className="flex flex-col items-center gap-2 min-w-[80px]">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleVote(bug.id)}
                          disabled={!userId}
                          className={`${
                            hasUserVoted(bug.id)
                              ? 'bg-orange-500/20 border-orange-500 text-orange-400'
                              : 'border-gray-600 text-gray-300 hover:border-orange-500 hover:text-orange-400'
                          }`}
                        >
                          <ThumbsUp className="w-4 h-4 mr-1" />
                          {getVoteCount(bug.id)}
                        </Button>
                        <span className="text-xs text-gray-500">votes</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Submit Bug CTA */}
          <div className="text-center mt-12 p-8 bg-gradient-to-r from-orange-900/20 to-orange-800/20 border border-orange-500/30 rounded-2xl">
            <h2 className="text-2xl font-bold text-white mb-4">
              Found a Bug?
            </h2>
            <p className="text-gray-300 mb-6">
              Help us improve PopGuide by reporting any issues you encounter. Every bug report helps make the platform better!
            </p>
            <Button 
              onClick={() => setShowSubmissionForm(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 text-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Report a Bug
            </Button>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default BugTracker; 