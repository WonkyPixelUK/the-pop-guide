
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useStartScraping, useScrapingJobs } from '@/hooks/usePriceScraping';
import { RefreshCw, Play, Clock, CheckCircle, XCircle, AlertCircle, Zap } from 'lucide-react';

const ScrapingManager = () => {
  const { data: jobs, isLoading: jobsLoading } = useScrapingJobs();
  const startScraping = useStartScraping();

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
        return 'bg-yellow-100 text-yellow-800';
      case 'running':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const jobStats = jobs?.reduce((acc, job) => {
    acc[job.status] = (acc[job.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Price Scraping Manager</span>
            <Button 
              onClick={() => startScraping.mutate()}
              disabled={startScraping.isPending}
              className="flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              {startScraping.isPending ? 'Starting...' : 'Start Bulk Scraping'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-800">Enhanced Features</span>
            </div>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>Manual Updates:</strong> Click the refresh button on any Funko Pop to update its pricing</li>
              <li>• <strong>Real Web Scraping:</strong> Uses Firecrawl API for live eBay pricing data</li>
              <li>• <strong>Instant Results:</strong> Manual scraping processes immediately</li>
            </ul>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{jobStats.pending || 0}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{jobStats.running || 0}</div>
              <div className="text-sm text-gray-600">Running</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{jobStats.completed || 0}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{jobStats.failed || 0}</div>
              <div className="text-sm text-gray-600">Failed</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Scraping Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          {jobsLoading ? (
            <div className="text-center py-4">Loading jobs...</div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {jobs?.slice(0, 20).map((job) => (
                <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(job.status)}
                    <div>
                      <div className="font-medium">
                        {job.funko_pops?.name} - {job.funko_pops?.series}
                      </div>
                      <div className="text-sm text-gray-600">
                        Source: {job.source}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(job.status)}>
                      {job.status}
                    </Badge>
                    {job.last_scraped && (
                      <div className="text-xs text-gray-500">
                        {new Date(job.last_scraped).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {!jobs?.length && (
                <div className="text-center py-8 text-gray-500">
                  No scraping jobs found. Click "Start Bulk Scraping" or use the refresh button on individual items.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ScrapingManager;
