
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useScrapingJobs, usePriceHistory } from '@/hooks/usePriceScraping';
import { useStartScraping } from '@/hooks/usePriceScraping';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  TrendingUp, 
  Calendar,
  Activity,
  Database,
  AlertCircle
} from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';

const ScrapingStatus = () => {
  const { data: jobs, isLoading: jobsLoading } = useScrapingJobs();
  const startScraping = useStartScraping();

  // Calculate stats
  const totalJobs = jobs?.length || 0;
  const completedJobs = jobs?.filter(job => job.status === 'completed').length || 0;
  const failedJobs = jobs?.filter(job => job.status === 'failed').length || 0;
  const pendingJobs = jobs?.filter(job => job.status === 'pending').length || 0;
  const runningJobs = jobs?.filter(job => job.status === 'running').length || 0;

  const successRate = totalJobs > 0 ? ((completedJobs / totalJobs) * 100).toFixed(1) : '0';

  // Group jobs by source for better insights
  const jobsBySource = jobs?.reduce((acc, job) => {
    if (!acc[job.source]) {
      acc[job.source] = { total: 0, completed: 0, failed: 0, pending: 0, running: 0 };
    }
    acc[job.source].total++;
    acc[job.source][job.status]++;
    return acc;
  }, {} as Record<string, any>) || {};

  // Recent activity (last 24 hours)
  const recentJobs = jobs?.filter(job => {
    const jobDate = new Date(job.updated_at);
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return jobDate > dayAgo;
  }) || [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'running': return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'bg-yellow-100 text-yellow-800',
      running: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800'
    };
    return variants[status] || 'bg-gray-100 text-gray-800';
  };

  if (jobsLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-6 h-6 animate-spin mr-2" />
          Loading scraping status...
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Scraping Status</h1>
          <p className="text-muted-foreground mt-2">
            Monitor scraping operations, schedules, and performance metrics
          </p>
        </div>
        <Button 
          onClick={() => startScraping.mutate()}
          disabled={startScraping.isPending}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${startScraping.isPending ? 'animate-spin' : ''}`} />
          {startScraping.isPending ? 'Starting...' : 'Start Bulk Scraping'}
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center">
            <Database className="w-8 h-8 text-blue-500 mr-3" />
            <div>
              <div className="text-2xl font-bold">{totalJobs}</div>
              <div className="text-sm text-muted-foreground">Total Jobs</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center">
            <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
            <div>
              <div className="text-2xl font-bold text-green-600">{completedJobs}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center">
            <XCircle className="w-8 h-8 text-red-500 mr-3" />
            <div>
              <div className="text-2xl font-bold text-red-600">{failedJobs}</div>
              <div className="text-sm text-muted-foreground">Failed</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center">
            <Clock className="w-8 h-8 text-yellow-500 mr-3" />
            <div>
              <div className="text-2xl font-bold text-yellow-600">{pendingJobs}</div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center">
            <TrendingUp className="w-8 h-8 text-purple-500 mr-3" />
            <div>
              <div className="text-2xl font-bold text-purple-600">{successRate}%</div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="sources">By Source</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-blue-600" />
                    <span className="font-medium">Currently Running</span>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">{runningJobs} jobs</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="font-medium">Recent Success Rate (24h)</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    {recentJobs.length > 0 ? 
                      `${((recentJobs.filter(j => j.status === 'completed').length / recentJobs.length) * 100).toFixed(1)}%`
                      : 'No recent activity'
                    }
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-yellow-600" />
                    <span className="font-medium">Next Scheduled Run</span>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    {pendingJobs > 0 ? 'Jobs pending' : 'No jobs scheduled'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Scraping Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">eBay Scraping</h3>
                    <p className="text-sm text-muted-foreground mb-2">Real-time price data</p>
                    <div className="text-sm">
                      <div>Frequency: Every 6 hours</div>
                      <div>Priority: High (market data)</div>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Amazon Scraping</h3>
                    <p className="text-sm text-muted-foreground mb-2">Current retail prices</p>
                    <div className="text-sm">
                      <div>Frequency: Every 12 hours</div>
                      <div>Priority: Medium</div>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Funko Store</h3>
                    <p className="text-sm text-muted-foreground mb-2">Official MSRP prices</p>
                    <div className="text-sm">
                      <div>Frequency: Every 24 hours</div>
                      <div>Priority: Low (stable prices)</div>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">HobbyDB</h3>
                    <p className="text-sm text-muted-foreground mb-2">Community pricing</p>
                    <div className="text-sm">
                      <div>Frequency: Every 48 hours</div>
                      <div>Priority: Low</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity (Last 24 Hours)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {recentJobs.length > 0 ? (
                  recentJobs.slice(0, 50).map((job) => (
                    <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(job.status)}
                        <div>
                          <div className="font-medium">
                            {job.funko_pops?.name} - {job.funko_pops?.series}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Source: {job.source} • {new Date(job.updated_at).toLocaleString()}
                          </div>
                          {job.error_message && (
                            <div className="text-sm text-red-600 mt-1">{job.error_message}</div>
                          )}
                        </div>
                      </div>
                      <Badge className={getStatusBadge(job.status)}>
                        {job.status}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No recent activity in the last 24 hours
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance by Source</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Source</TableHead>
                    <TableHead>Total Jobs</TableHead>
                    <TableHead>Completed</TableHead>
                    <TableHead>Failed</TableHead>
                    <TableHead>Success Rate</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(jobsBySource).map(([source, stats]) => {
                    const successRate = stats.total > 0 ? 
                      ((stats.completed / stats.total) * 100).toFixed(1) : '0';
                    
                    return (
                      <TableRow key={source}>
                        <TableCell className="font-medium capitalize">
                          {source.replace('_', ' ')}
                        </TableCell>
                        <TableCell>{stats.total}</TableCell>
                        <TableCell className="text-green-600">{stats.completed}</TableCell>
                        <TableCell className="text-red-600">{stats.failed}</TableCell>
                        <TableCell>
                          <Badge variant={parseFloat(successRate) >= 80 ? "default" : "destructive"}>
                            {successRate}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {stats.running > 0 && (
                            <Badge className="bg-blue-100 text-blue-800 mr-1">
                              {stats.running} running
                            </Badge>
                          )}
                          {stats.pending > 0 && (
                            <Badge className="bg-yellow-100 text-yellow-800">
                              {stats.pending} pending
                            </Badge>
                          )}
                          {stats.running === 0 && stats.pending === 0 && (
                            <Badge className="bg-gray-100 text-gray-800">Idle</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ScrapingStatus;
