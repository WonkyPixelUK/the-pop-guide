import { useFunkoPops } from '@/hooks/useFunkoPops';
import { useScrapingJobs } from '@/hooks/usePriceScraping';
import { RefreshCw, CheckCircle, Clock, Zap } from 'lucide-react';
import { useMemo } from 'react';

const Footer = () => {
  const { data: funkoPops = [] } = useFunkoPops();
  const { data: jobs = [], isLoading } = useScrapingJobs();

  // Scraper status logic (same as ScraperStatusWidget)
  const lastRun = useMemo(() => {
    const completed = jobs.filter(j => j.status === 'completed' && j.last_scraped);
    if (!completed.length) return null;
    return completed.sort((a, b) => new Date(b.last_scraped).getTime() - new Date(a.last_scraped).getTime())[0].last_scraped;
  }, [jobs]);
  const nextRun = useMemo(() => {
    const pending = jobs.filter(j => j.status === 'pending' && j.next_scrape_due);
    if (!pending.length) return null;
    return pending.sort((a, b) => new Date(a.next_scrape_due).getTime() - new Date(b.next_scrape_due).getTime())[0].next_scrape_due;
  }, [jobs]);
  const now = Date.now();
  const last24h = jobs.filter(j => j.status === 'completed' && j.last_scraped && (now - new Date(j.last_scraped).getTime() < 24*60*60*1000));
  const newFromEbay = last24h.filter(j => j.source === 'ebay').length;
  const comingSoonFunko = jobs.filter(j => j.status === 'pending' && j.source === 'funko_store').length;
  const pricesUpdated = last24h.length;

  return (
    <footer className="bg-gray-900 border-t border-gray-700 py-6 px-4 mt-12">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between text-xs text-gray-400">
        <div className="flex items-center gap-3 mb-2 md:mb-0">
          <RefreshCw className="w-4 h-4 text-orange-400" />
          <span>Scraper:</span>
          <CheckCircle className="w-3 h-3 text-green-400" />
          <span>Last: {lastRun ? new Date(lastRun).toLocaleString() : 'N/A'}</span>
          <Clock className="w-3 h-3 text-blue-400" />
          <span>Next: {nextRun ? new Date(nextRun).toLocaleString() : 'N/A'}</span>
          <Zap className="w-3 h-3 text-orange-400" />
          <span>+{newFromEbay} new eBay | {comingSoonFunko} Funko soon | {pricesUpdated} prices updated</span>
        </div>
        <div>
          <span className="font-semibold text-white">{funkoPops.length}</span> Pops in database
        </div>
      </div>
    </footer>
  );
};

export default Footer; 