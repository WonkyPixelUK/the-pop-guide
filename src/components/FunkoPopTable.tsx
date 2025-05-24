
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Calendar, Star, Award } from 'lucide-react';
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

  const getStickerBadge = (pop: any) => {
    if (!pop.is_stickered || !pop.sticker_type) {
      return <Badge variant="outline" className="text-gray-600">Common</Badge>;
    }

    const getStickerColor = (type: string) => {
      switch (type.toUpperCase()) {
        case 'SDCC': return 'bg-red-100 text-red-800 border-red-200';
        case 'NYCC': return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'ECCC': return 'bg-green-100 text-green-800 border-green-200';
        case 'FUNKO SHOP': return 'bg-purple-100 text-purple-800 border-purple-200';
        case 'CHASE': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'HOT TOPIC': return 'bg-pink-100 text-pink-800 border-pink-200';
        default: return 'bg-gray-100 text-gray-800 border-gray-200';
      }
    };

    return (
      <div className="flex items-center gap-1">
        <Badge className={getStickerColor(pop.sticker_type)}>
          <Star className="w-3 h-3 mr-1" />
          {pop.sticker_type}
        </Badge>
        {pop.sticker_multiplier && pop.sticker_multiplier > 1.0 && (
          <Badge variant="outline" className="text-orange-600 border-orange-200">
            {pop.sticker_multiplier}x
          </Badge>
        )}
      </div>
    );
  };

  const getValueDisplay = (pop: any) => {
    if (!pop.estimated_value) return 'No data';
    
    const hasSticker = pop.is_stickered && pop.sticker_multiplier > 1.0;
    
    return (
      <div className="space-y-1">
        <div className="font-medium">£{pop.estimated_value}</div>
        {hasSticker && pop.base_estimated_value && (
          <div className="text-xs text-gray-500">
            Base: £{pop.base_estimated_value}
          </div>
        )}
      </div>
    );
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

      <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center gap-2 mb-2">
          <Award className="w-5 h-5 text-blue-600" />
          <span className="font-medium text-blue-800">Sticker-Aware Pricing</span>
        </div>
        <p className="text-sm text-blue-700">
          Our pricing algorithm now detects and accounts for exclusive stickers (SDCC, NYCC, etc.), 
          applying appropriate multipliers to reflect true market value. Stickered variants can be worth 2-5x more than common versions.
        </p>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Series</TableHead>
            <TableHead>Number</TableHead>
            <TableHead>Sticker Type</TableHead>
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
                <TableCell>{getStickerBadge(pop)}</TableCell>
                <TableCell>
                  <Badge className={updateStatus.color}>
                    {updateStatus.status === 'never' ? 'Never' : 
                     updateStatus.status === 'recent' ? 'Just updated' :
                     updateStatus.status === 'stale' ? `${formatDistanceToNow(new Date(pop.last_price_update!))} ago` :
                     updateStatus.status}
                  </Badge>
                </TableCell>
                <TableCell>{getValueDisplay(pop)}</TableCell>
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
