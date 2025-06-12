import { useParams, Link } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { useFunkoPops } from '@/hooks/useFunkoPops';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import PriceHistory from '@/components/PriceHistory';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { ChevronRight } from 'lucide-react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { formatCurrency } from '@/utils/formatCurrency';

const TIME_FILTERS = [
  { label: '30 Days', value: '30d', days: 30 },
  { label: '3 Months', value: '90d', days: 90 },
  { label: '1 Year', value: '1y', days: 365 },
];

const genreDescriptions = {
  '8-bit': 'The 8-Bit Funko Pop line features pixelated versions of classic characters, inspired by retro video game graphics. These Pops are a nostalgic tribute to the golden age of gaming.',
  // Add more genre descriptions as needed
};

// Helper to get price change over period
function getPriceChange(pops, days) {
  let totalNow = 0;
  let totalThen = 0;
  let count = 0;
  for (const pop of pops) {
    if (!pop.price_history || pop.price_history.length === 0) continue;
    const sorted = [...pop.price_history].sort((a, b) => new Date(a.date_scraped) - new Date(b.date_scraped));
    const now = sorted[sorted.length - 1]?.price;
    const then = sorted.find(ph => {
      const d = new Date(ph.date_scraped);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      return d >= cutoff;
    })?.price || sorted[0]?.price;
    if (now && then) {
      totalNow += now;
      totalThen += then;
      count++;
    }
  }
  if (count === 0 || totalThen === 0) return 0;
  return ((totalNow - totalThen) / totalThen) * 100;
}

const GenrePage = () => {
  const { genre } = useParams();
  const { data: allPops = [], isLoading } = useFunkoPops();
  const [timeRange, setTimeRange] = useState('30d');
  const timeFilter = TIME_FILTERS.find(f => f.value === timeRange) || TIME_FILTERS[0];
  const { currency } = useCurrency();

  // Filter pops by exact genre (case-insensitive, trimmed)
  const genrePops = useMemo(() =>
    allPops.filter(pop => pop.genre && pop.genre.trim().toLowerCase() === String(genre).trim().toLowerCase()),
    [allPops, genre]
  );

  // Aggregate valuation stats
  const totalValue = useMemo(() =>
    genrePops.reduce((sum, pop) => sum + (typeof pop.estimated_value === 'number' ? pop.estimated_value : 0), 0),
    [genrePops]
  );
  const averageValue = genrePops.length > 0 ? totalValue / genrePops.length : 0;

  // Price change over selected period (mocked, as price_history is not in useFunkoPops by default)
  // In real use, would fetch price_history for each pop and aggregate
  const priceChange = 0; // Placeholder, see helper above for real logic if price_history is available

  // FAQ logic
  const cheapestPop = useMemo(() =>
    genrePops.reduce((min, pop) =>
      (typeof pop.estimated_value === 'number' && (min === null || pop.estimated_value < min.estimated_value)) ? pop : min, null),
    null
  );
  const mostExpensivePop = useMemo(() =>
    genrePops.reduce((max, pop) =>
      (typeof pop.estimated_value === 'number' && (max === null || pop.estimated_value > max.estimated_value)) ? pop : max, null),
    null
  );
  const rarestPop = useMemo(() =>
    genrePops.find(pop => pop.is_chase || pop.is_exclusive) || mostExpensivePop,
    [genrePops, mostExpensivePop]
  );

  // Genre description (fallback if not found)
  const genreDesc = genreDescriptions[String(genre).toLowerCase()] || 'No description available for this genre.';

  // Aggregate price history for the genre (mock if not available)
  // For now, use the first pop's price history if available, else pass genrePops[0]
  const priceHistoryPop = genrePops[0];

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex flex-col">
        <div className="container mx-auto px-4 pt-8 pb-4">
          {/* Breadcrumb */}
          <nav className="flex items-center text-sm mb-6 px-4 py-2 rounded-lg bg-gray-900/80 border-l-4 border-orange-500 shadow-md" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-orange-400 font-semibold transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4 mx-1 text-orange-400" />
            <Link to="/database/genres" className="hover:text-orange-400 font-semibold transition-colors">Genres</Link>
            <ChevronRight className="w-4 h-4 mx-1 text-orange-400" />
            <span className="text-orange-400 font-bold tracking-wide uppercase">{genre}</span>
          </nav>

          {/* Genre Title & Description */}
          <h1 className="text-4xl font-extrabold mb-2 text-white">{genre} Funko Pops</h1>
          <div className="mb-6 text-lg text-gray-200 max-w-2xl">{genreDesc}</div>

          {/* Product List FIRST */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {genrePops.map(pop => (
              <Link key={pop.id} to={`/pop/${pop.id}`} className="hover:shadow-lg transition-shadow">
                <Card className="bg-gray-900 border border-gray-700 shadow-md flex flex-row items-center p-4 gap-4 cursor-pointer hover:border-orange-500">
                  {pop.image_url && (
                    <img src={pop.image_url} alt={pop.name} className="w-28 h-28 object-contain bg-gray-800 rounded-lg border border-gray-700 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-lg text-white mb-1">{pop.name}</div>
                    <div className="text-gray-400 text-sm mb-1">{pop.series} {pop.number ? `#${pop.number}` : ''}</div>
                    <div className="text-gray-400 text-sm mb-1">{pop.edition}</div>
                    <div className="text-xs text-orange-400 font-bold mb-2">
                      {typeof pop.estimated_value === 'number' ? formatCurrency(pop.estimated_value, currency) : 'Pending'}
                    </div>
                    {pop.description && <div className="text-xs text-gray-300 mb-2 line-clamp-3">{pop.description}</div>}
                    <div className="flex gap-2 mt-2">
                      {pop.is_chase && <Badge className="bg-yellow-500 text-black">Chase</Badge>}
                      {pop.is_exclusive && <Badge className="bg-blue-500 text-white">Exclusive</Badge>}
                      {pop.is_vaulted && <Badge className="bg-gray-500 text-white">Vaulted</Badge>}
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          {/* Stats Card & Price Graph SECOND */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <Card className="bg-gray-800 border border-gray-700 shadow-lg">
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="text-gray-400 text-xs">Total Value</div>
                    <div className="text-2xl font-bold text-orange-400">{formatCurrency(totalValue, currency)}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-xs">Average Value</div>
                    <div className="text-2xl font-bold text-blue-400">{formatCurrency(averageValue, currency)}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-xs">% Change ({timeFilter.label})</div>
                    <div className="text-2xl font-bold text-green-400">{priceChange ? priceChange.toFixed(1) + '%' : '—'}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-xs">Total Pops</div>
                    <div className="text-2xl font-bold text-purple-400">{genrePops.length}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border border-gray-700 shadow-lg flex items-center justify-center">
              <CardContent className="p-6 w-full">
                {priceHistoryPop ? (
                  <PriceHistory funkoPop={priceHistoryPop} className="w-full" />
                ) : (
                  <div className="h-40 flex items-center justify-center">
                    <span className="text-gray-400 text-lg">No price data available</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Dynamic FAQ LAST */}
          <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="faq-accordion mb-12">
            <AccordionItem value="faq1">
              <AccordionTrigger className="bg-gray-800 text-white hover:bg-orange-500 hover:text-white rounded-t-lg px-4 py-2 font-semibold">How many {genre} Funko Pops exist?</AccordionTrigger>
              <AccordionContent className="bg-gray-900 text-gray-200 px-4 py-2 rounded-b-lg border-t border-gray-700">
                {genrePops.length}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="faq2">
              <AccordionTrigger className="bg-gray-800 text-white hover:bg-orange-500 hover:text-white rounded-t-lg px-4 py-2 font-semibold">What is the cheapest {genre} Funko Pop?</AccordionTrigger>
              <AccordionContent className="bg-gray-900 text-gray-200 px-4 py-2 rounded-b-lg border-t border-gray-700">
                {cheapestPop ? `${cheapestPop.name} (${formatCurrency(cheapestPop.estimated_value, currency)})` : '—'}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="faq3">
              <AccordionTrigger className="bg-gray-800 text-white hover:bg-orange-500 hover:text-white rounded-t-lg px-4 py-2 font-semibold">What is the most expensive {genre} Funko Pop?</AccordionTrigger>
              <AccordionContent className="bg-gray-900 text-gray-200 px-4 py-2 rounded-b-lg border-t border-gray-700">
                {mostExpensivePop ? `${mostExpensivePop.name} (${formatCurrency(mostExpensivePop.estimated_value, currency)})` : '—'}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="faq4">
              <AccordionTrigger className="bg-gray-800 text-white hover:bg-orange-500 hover:text-white rounded-t-lg px-4 py-2 font-semibold">What is the rarest {genre} Funko Pop?</AccordionTrigger>
              <AccordionContent className="bg-gray-900 text-gray-200 px-4 py-2 rounded-b-lg border-t border-gray-700">
                {rarestPop ? `${rarestPop.name}${rarestPop.is_chase ? ' (Chase)' : rarestPop.is_exclusive ? ' (Exclusive)' : ''}` : '—'}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="faq5">
              <AccordionTrigger className="bg-gray-800 text-white hover:bg-orange-500 hover:text-white rounded-t-lg px-4 py-2 font-semibold">What is the total value of all {genre} Funko Pops?</AccordionTrigger>
              <AccordionContent className="bg-gray-900 text-gray-200 px-4 py-2 rounded-b-lg border-t border-gray-700">
                {formatCurrency(totalValue, currency)}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default GenrePage; 