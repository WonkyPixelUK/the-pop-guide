import { useMemo } from 'react';
import { useScrapingJobs } from '@/hooks/usePriceScraping';
import { RefreshCw, Clock, CheckCircle, Zap } from 'lucide-react';

const ScraperStatusWidget = () => {
  const { data: jobs = [], isLoading } = useScrapingJobs();

  // Last run: most recent completed job
  const lastRun = useMemo(() => {
    const completed = jobs.filter(j => j.status === 'completed' && j.last_scraped);
    if (!completed.length) return null;
    return completed.sort((a, b) => new Date(b.last_scraped).getTime() - new Date(a.last_scraped).getTime())[0].last_scraped;
  }, [jobs]);

  // Next run: earliest pending job
  const nextRun = useMemo(() => {
    const pending = jobs.filter(j => j.status === 'pending' && j.next_scrape_due);
    if (!pending.length) return null;
    return pending.sort((a, b) => new Date(a.next_scrape_due).getTime() - new Date(b.next_scrape_due).getTime())[0].next_scrape_due;
  }, [jobs]);

  // Summary: new items, prices updated, coming soon
  const now = Date.now();
  const last24h = jobs.filter(j => j.status === 'completed' && j.last_scraped && (now - new Date(j.last_scraped).getTime() < 24*60*60*1000));
  const newFromEbay = last24h.filter(j => j.source === 'ebay').length;
  const comingSoonFunko = jobs.filter(j => j.status === 'pending' && j.source === 'funko_store').length;
  const pricesUpdated = last24h.length;

  return (
    <div className="ml-4 flex flex-col items-start text-xs text-gray-300 bg-gray-800/70 rounded px-3 py-2 border border-gray-700 min-w-[180px]">
      <div className="flex items-center gap-2 mb-1">
        <RefreshCw className="w-4 h-4 text-orange-400" />
        <span className="font-semibold">Scraper Status</span>
        {isLoading && <span className="ml-2 animate-spin"><RefreshCw className="w-3 h-3" /></span>}
      </div>
      <div className="flex items-center gap-2">
        <CheckCircle className="w-3 h-3 text-green-400" />
        <span>Last run:</span>
        <span>{lastRun ? new Date(lastRun).toLocaleString() : 'N/A'}</span>
      </div>
      <div className="flex items-center gap-2">
        <Clock className="w-3 h-3 text-blue-400" />
        <span>Next run:</span>
        <span>{nextRun ? new Date(nextRun).toLocaleString() : 'N/A'}</span>
      </div>
      <div className="flex items-center gap-2 mt-1">
        <Zap className="w-3 h-3 text-orange-400" />
        <span className="mr-1">+{newFromEbay} new from eBay</span>
        <span className="mr-1">| {comingSoonFunko} coming soon from Funko</span>
        <span className="mr-1">| {pricesUpdated} prices updated</span>
      </div>
    </div>
  );
};

export default ScraperStatusWidget; 