
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Calendar } from 'lucide-react';
import { useFunkoPops } from '@/hooks/useFunkoPops';
import { useManualScraping } from '@/hooks/useManualScraping';
import { formatDistanceToNow } from 'date-fns';

const FunkoPopTable = () => {
  const { data: funkoPops, isLoading } = useFunkoPops();
  const manualScraping = useManualScraping();

  const handleManualScrape = (funkoPopId: string) => {
    manualScraping.mutate({ funkoPopId });
  };

  const getUpdateStatus = (lastUpdate: string | null) => {
    if (!lastUpdate) return { status: 'never', color: 'bg-red-100 text-red-800' };
    
    const updateDate = new Date(lastUpdate);
    const hoursAgo = (Date.now() - updateDate.getTime()) / (1000 * 60 * 60);
    
    if (hoursAgo < 1) return { status: 'recent', color: 'bg-green-100 text-green-800' };
    if (hoursAgo < 24) return { status: `${Math.floor(hoursAgo)}h ago`, color: 'bg-yellow-100 text-yellow-800' };
    return { status: 'stale', color: 'bg-red-100 text-red-800' };
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading Funko Pops...</div>;
  }

  if (!funkoPops?.length) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">No Funko Pops found in the database.</p>
        <p className="text-sm text-muted-foreground">Add some Funko Pops to your collection first, then return here to scrape pricing data.</p>
      </div>
    );
  }

  const estimatedTimePerItem = 15; // seconds per item
  const totalEstimatedTime = funkoPops.length * 4 * estimatedTimePerItem; // 4 sources per item

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Funko Pops in Database ({funkoPops.length} items)</h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>Est. full scrape time: {Math.ceil(totalEstimatedTime / 60)} minutes</span>
        </div>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Series</TableHead>
            <TableHead>Number</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead>Current Value</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {funkoPops.map((pop) => {
            const updateStatus = getUpdateStatus(pop.last_price_update);
            return (
              <TableRow key={pop.id}>
                <TableCell className="font-medium">{pop.name}</TableCell>
                <TableCell>{pop.series}</TableCell>
                <TableCell>{pop.number || 'N/A'}</TableCell>
                <TableCell>
                  <Badge className={updateStatus.color}>
                    {updateStatus.status === 'never' ? 'Never' : 
                     updateStatus.status === 'recent' ? 'Just updated' :
                     updateStatus.status === 'stale' ? `${formatDistanceToNow(new Date(pop.last_price_update!))} ago` :
                     updateStatus.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {pop.estimated_value ? `£${pop.estimated_value}` : 'No data'}
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleManualScrape(pop.id)}
                    disabled={manualScraping.isPending}
                    className="flex items-center gap-1"
                  >
                    <RefreshCw className={`w-3 h-3 ${manualScraping.isPending ? 'animate-spin' : ''}`} />
                    Scrape Now
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default FunkoPopTable;
