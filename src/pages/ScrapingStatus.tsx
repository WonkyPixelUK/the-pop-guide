import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useScrapingJobs, useStartScraping } from '@/hooks/usePriceScraping';
import { useForceScraping } from '@/hooks/useForceScraping';
import { 
  RefreshCw, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Play, 
  BarChart3,
  Calendar,
  Database,
  TrendingUp,
  Activity,
  Zap,
  BookOpen,
  Users
} from 'lucide-react';

import FunkoPopTable from '@/components/FunkoPopTable';
import StickerEducation from '@/components/StickerEducation';
import DataImportManager from '@/components/DataImportManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardHeader from '@/components/DashboardHeader';
import MobileBottomNav from '@/components/MobileBottomNav';
import Footer from '@/components/Footer';

const ScrapingStatus = () => {
  const { data: jobs, isLoading: jobsLoading } = useScrapingJobs();
  const startScraping = useStartScraping();
  const forceScraping = useForceScraping();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'running':
        return <RefreshCw className="w-4 h-4 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'failed':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'running':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const jobStats = jobs?.reduce((acc, job) => {
    acc[job.status] = (acc[job.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const totalJobs = jobs?.length || 0;
  const completedJobs = jobStats.completed || 0;
  const successRate = totalJobs > 0 ? Math.round((completedJobs / totalJobs) * 100) : 0;

  const sourceStats = jobs?.reduce((acc, job) => {
    if (!acc[job.source]) {
      acc[job.source] = { total: 0, completed: 0, failed: 0 };
    }
    acc[job.source].total += 1;
    if (job.status === 'completed') acc[job.source].completed += 1;
    if (job.status === 'failed') acc[job.source].failed += 1;
    return acc;
  }, {} as Record<string, { total: number; completed: number; failed: number }>) || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <DashboardHeader showSearch={false} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Scraping Status</h1>
          <p className="text-muted-foreground mt-2">
            Monitor price scraping operations with advanced sticker detection and valuation
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalJobs}</div>
              <p className="text-xs text-muted-foreground">All time scraping jobs</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{successRate}%</div>
              <Progress value={successRate} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Running Jobs</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{jobStats.running || 0}</div>
              <p className="text-xs text-muted-foreground">Currently processing</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Jobs</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{jobStats.pending || 0}</div>
              <p className="text-xs text-muted-foreground">Waiting to process</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="database" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="database">Database & Import</TabsTrigger>
            <TabsTrigger value="controls">Controls & Stats</TabsTrigger>
            <TabsTrigger value="education">Sticker Guide</TabsTrigger>
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="database" className="space-y-8">
            <DataImportManager />
            <Card>
              <CardHeader>
                <CardTitle>Database Contents & Manual Scraping</CardTitle>
              </CardHeader>
              <CardContent>
                <FunkoPopTable />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="controls" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Control Panel */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Scraping Controls
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="font-medium text-blue-900 mb-2">Next Scheduled Run</h3>
                    <div className="flex items-center gap-2 text-blue-700">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">Every 6 hours (automatic)</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <Button 
                      onClick={() => startScraping.mutate()}
                      disabled={startScraping.isPending}
                      className="w-full flex items-center gap-2"
                      size="lg"
                    >
                      <Play className="w-4 h-4" />
                      {startScraping.isPending ? 'Starting Bulk Scraping...' : 'Start Bulk Scraping Now'}
                    </Button>

                    <Button 
                      onClick={() => forceScraping.mutate()}
                      disabled={forceScraping.isPending}
                      variant="outline"
                      className="w-full flex items-center gap-2"
                      size="lg"
                    >
                      <Zap className="w-4 h-4" />
                      {forceScraping.isPending ? 'Force Starting...' : 'Force Scrape All Items'}
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">{jobStats.completed || 0}</div>
                      <div className="text-sm text-muted-foreground">Completed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-red-600">{jobStats.failed || 0}</div>
                      <div className="text-sm text-muted-foreground">Failed</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Source Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance by Source</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(sourceStats).map(([source, stats]) => {
                      const sourceSuccessRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
                      return (
                        <div key={source} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-medium capitalize">{source}</span>
                            <span className="text-sm text-muted-foreground">
                              {stats.completed}/{stats.total} ({sourceSuccessRate}%)
                            </span>
                          </div>
                          <Progress value={sourceSuccessRate} className="h-2" />
                        </div>
                      );
                    })}
                    {Object.keys(sourceStats).length === 0 && (
                      <p className="text-center text-muted-foreground py-4">
                        No scraping data available yet
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="education">
            <StickerEducation />
          </TabsContent>

          <TabsContent value="activity" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Recent Scraping Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {jobsLoading ? (
                  <div className="text-center py-8">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                    <p className="text-muted-foreground">Loading recent activity...</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {jobs?.slice(0, 20).map((job) => (
                      <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(job.status)}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">
                              {job.funko_pops?.name} - {job.funko_pops?.series}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm text-muted-foreground capitalize">
                                {job.source}
                              </span>
                              {job.error_message && (
                                <span className="text-xs text-red-600 truncate max-w-xs">
                                  {job.error_message}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge variant="outline" className={getStatusColor(job.status)}>
                            {job.status}
                          </Badge>
                          {job.last_scraped && (
                            <span className="text-xs text-muted-foreground">
                              {new Date(job.last_scraped).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                    {!jobs?.length && (
                      <div className="text-center py-12">
                        <Database className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="font-medium mb-2">No Scraping Jobs Yet</h3>
                        <p className="text-muted-foreground mb-4">
                          Start bulk scraping or use manual refresh on individual items to see activity here.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default ScrapingStatus;
