import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { corsHeaders } from '../_shared/cors.ts';

interface ScrapeCategoryRequest {
  category: 'Bitty Pop!' | 'Vinyl Soda' | 'Loungefly';
  maxItems?: number;
}

// Email notification helper function
async function sendScraperNotification(supabase: any, notification: {
  type: 'success' | 'failure';
  category: string;
  totalProcessed: number;
  successful: number;
  failed: number;
  pricesCollected: number;
  duration?: number;
  error?: string;
  adminEmail: string;
}) {
  try {
    // Format duration for display
    const formatDuration = (ms: number) => {
      const minutes = Math.floor(ms / 60000);
      const seconds = Math.floor((ms % 60000) / 1000);
      return `${minutes}m ${seconds}s`;
    };

    const templateData = {
      admin_email: notification.adminEmail,
      scraper_type: `${notification.category} Category Scraper`,
      completion_time: new Date().toISOString(),
      total_processed: notification.totalProcessed,
      successful_items: notification.successful,
      failed_items: notification.failed,
      prices_collected: notification.pricesCollected,
      success_rate: notification.totalProcessed > 0 ? Math.round((notification.successful / notification.totalProcessed) * 100) : 0,
      duration: notification.duration ? formatDuration(notification.duration) : 'Unknown',
      error_message: notification.error || null,
      dashboard_url: 'https://popguide.co.uk/pricing-dashboard'
    };

    // Call the email service
    const { error: emailError } = await supabase.functions.invoke('send-email', {
      body: {
        type: notification.type === 'success' ? 'scraper_success' : 'scraper_failure',
        to: notification.adminEmail,
        data: templateData
      }
    });

    if (emailError) {
      throw new Error(`Email service error: ${emailError.message}`);
    }

    console.log(`✅ ${notification.type === 'success' ? 'Success' : 'Failure'} notification email sent to ${notification.adminEmail}`);

  } catch (error) {
    console.error('Error sending scraper notification:', error);
    throw error;
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { category, maxItems = 20 }: ScrapeCategoryRequest = await req.json();
    
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY')!;
    
    if (!firecrawlApiKey) {
      throw new Error('FIRECRAWL_API_KEY environment variable not set');
    }

    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log(`🚀 Starting ${category} scraping with real marketplace data...`);
    
    const startTime = Date.now();
    
    // Get search terms for the category
    const searchTerms = getSearchTerms(category);
    let totalFound = 0;
    let totalCreated = 0;
    let totalExisting = 0;
    let totalPricesCollected = 0;

    // Get or create marketplace source for eBay UK
    let { data: source, error: sourceError } = await supabase
      .from('marketplace_sources')
      .select('id')
      .eq('name', 'eBay UK')
      .single();

    if (sourceError) {
      // Create eBay UK source if it doesn't exist
      const { data: newSource, error: createError } = await supabase
        .from('marketplace_sources')
        .insert({
          name: 'eBay UK',
          base_url: 'https://www.ebay.co.uk',
          is_active: true
        })
        .select('id')
        .single();
        
      if (createError) {
        throw new Error(`Failed to create marketplace source: ${createError.message}`);
      }
      source = newSource;
    }

    // Process each search term
    for (const term of searchTerms.slice(0, 5)) { // Limit to 5 search terms
      console.log(`🔍 Searching eBay for: ${term}`);
      
      try {
        // Construct eBay UK search URL for sold listings
        const searchQuery = term.replace(/\s+/g, '+');
        const ebayUrl = `https://www.ebay.co.uk/sch/i.html?_nkw=${searchQuery}&_in_kw=1&_ex_kw=&_sacat=0&LH_Sold=1&_udlo=&_udhi=&_samilow=&_samihi=&_sadis=15&_stpos=&_sargn=-1%26saslc%3D1&_salic=3&_sop=12&_dmd=1&_ipg=60`;
        
        // Use Firecrawl to scrape eBay
        const firecrawlResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${firecrawlApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            url: ebayUrl,
            formats: ['extract'],
            extract: {
              schema: {
                listings: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      title: { type: 'string' },
                      price: { type: 'string' },
                      condition: { type: 'string' },
                      shipping: { type: 'string' },
                      sold_date: { type: 'string' },
                      listing_url: { type: 'string' },
                      image_url: { type: 'string' },
                      seller_info: { type: 'string' },
                      location: { type: 'string' }
                    }
                  }
                }
              }
            },
            timeout: 30000
          })
        });

        if (!firecrawlResponse.ok) {
          console.error(`Firecrawl API error for ${term}: ${firecrawlResponse.status}`);
          continue;
        }

        const firecrawlData = await firecrawlResponse.json();
        const listings = firecrawlData.extract?.listings || [];
        
        console.log(`📦 Found ${listings.length} listings for ${term}`);
        totalFound += listings.length;

        // Process listings and create Funko Pop entries
        for (const listing of listings.slice(0, Math.max(2, Math.floor(maxItems / searchTerms.length)))) {
          try {
            const popData = parseListingData(listing, category);
            if (!popData) continue;

            // Check if this Pop already exists
            const { data: existingPop, error: checkError } = await supabase
              .from('funko_pops')
              .select('id, name, estimated_value')
              .eq('name', popData.name)
              .eq('series', popData.series)
              .eq('category', category)
              .single();

            let popId: string;
            
            if (existingPop) {
              popId = existingPop.id;
              totalExisting++;
              console.log(`✅ Found existing ${category}: ${popData.name}`);
            } else {
              // Create new Funko Pop entry
              const { data: newPop, error: insertError } = await supabase
                .from('funko_pops')
                .insert({
                  name: popData.name,
                  series: popData.series,
                  number: popData.number,
                  category: category,
                  fandom: popData.fandom,
                  genre: popData.genre,
                  description: popData.description,
                  estimated_value: popData.price,
                  is_vaulted: false,
                  release_date: new Date().toISOString().split('T')[0],
                  created_at: new Date().toISOString()
                })
                .select('id')
                .single();

              if (insertError) {
                console.error(`❌ Error creating Pop ${popData.name}:`, insertError);
                continue;
              }

              popId = newPop.id;
              totalCreated++;
              console.log(`🆕 Created new ${category}: ${popData.name}`);
            }

            // Store marketplace price data
            try {
              // Parse price from listing
              const priceMatch = listing.price?.match(/[\d,]+\.?\d*/);
              if (priceMatch) {
                const price = parseFloat(priceMatch[0].replace(/,/g, ''));
                
                if (!isNaN(price) && price > 0) {
                  // Detect special variants
                  const title = listing.title?.toLowerCase() || '';
                  const hasSDCC = /sdcc|san diego comic con/i.test(title);
                  const hasNYCC = /nycc|new york comic con/i.test(title);
                  const hasExclusive = /exclusive|limited|convention|chase/i.test(title);

                  const { error: priceError } = await supabase
                    .from('marketplace_prices')
                    .insert({
                      funko_pop_id: popId,
                      marketplace_source_id: source.id,
                      title: listing.title || `${popData.name} ${category}`,
                      price: price,
                      condition: listing.condition || 'Used',
                      listing_url: listing.listing_url || ebayUrl,
                      images: listing.image_url ? [listing.image_url] : [],
                      location: listing.location || 'UK',
                      seller_info: { name: listing.seller_info || 'Unknown' },
                      is_auction: false,
                      is_buy_now: true,
                      shipping_cost: 0,
                      last_updated: new Date().toISOString(),
                      stickers: hasSDCC || hasNYCC || hasExclusive ? {
                        sdcc: hasSDCC,
                        nycc: hasNYCC,
                        exclusive: hasExclusive
                      } : null
                    });

                  if (!priceError) {
                    totalPricesCollected++;
                  }
                }
              }
            } catch (priceError) {
              console.error('Error storing price data:', priceError);
            }

          } catch (error) {
            console.error('Error processing listing:', error);
          }
        }

        // Rate limiting between searches
        await new Promise(resolve => setTimeout(resolve, 3000));

      } catch (error) {
        console.error(`Error searching for ${term}:`, error);
      }
    }

    const duration = Date.now() - startTime;
    const result = {
      success: true,
      category,
      totalFound,
      totalCreated,
      totalExisting,
      totalPricesCollected,
      duration,
      searchTerms: searchTerms.slice(0, 5)
    };

    console.log(`🎉 ${category} scraping completed:`, result);

    // Send success email notification
    try {
      await sendScraperNotification(supabase, {
        type: 'success',
        category: category,
        totalProcessed: totalCreated + totalExisting,
        successful: totalCreated,
        failed: 0,
        pricesCollected: totalPricesCollected,
        duration: duration,
        adminEmail: 'brains@popguide.co.uk'
      });
    } catch (emailError) {
      console.error('Failed to send success notification email:', emailError);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Category scraper error:', error);
    
    // Send failure email notification
    try {
      const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
      const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
      
      await sendScraperNotification(supabase, {
        type: 'failure',
        category: 'Category Scraper',
        totalProcessed: 0,
        successful: 0,
        failed: 1,
        pricesCollected: 0,
        error: error.message,
        adminEmail: 'brains@popguide.co.uk'
      });
    } catch (emailError) {
      console.error('Failed to send failure notification email:', emailError);
    }

    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function getSearchTerms(category: string): string[] {
  switch (category) {
    case 'Bitty Pop!':
      return [
        'Spider-Man Bitty Pop',
        'Batman Bitty Pop',
        'Harry Potter Bitty Pop',
        'Disney Bitty Pop 4-pack',
        'Marvel Bitty Pop',
        'DC Bitty Pop',
        'Star Wars Bitty Pop',
        'Pokemon Bitty Pop',
        'Stranger Things Bitty Pop',
        'The Office Bitty Pop',
        'Friends Bitty Pop',
        'Teenage Mutant Ninja Turtles Bitty Pop'
      ];
    
    case 'Vinyl Soda':
      return [
        'Darth Vader Vinyl Soda',
        'Batman Vinyl Soda',
        'Wonder Woman Vinyl Soda',
        'Spider-Man Vinyl Soda',
        'Deadpool Vinyl Soda',
        'Joker Vinyl Soda',
        'Superman Vinyl Soda',
        'Captain America Vinyl Soda',
        'Iron Man Vinyl Soda',
        'Thor Vinyl Soda',
        'Wolverine Vinyl Soda',
        'Flash Vinyl Soda'
      ];
    
    case 'Loungefly':
      return [
        'Disney Loungefly backpack',
        'Star Wars Loungefly',
        'Harry Potter Loungefly backpack',
        'Marvel Loungefly',
        'Stranger Things Loungefly',
        'Nightmare Before Christmas Loungefly',
        'Mickey Mouse Loungefly',
        'Batman Loungefly backpack',
        'Pokemon Loungefly',
        'The Office Loungefly',
        'Friends Loungefly backpack',
        'Mandalorian Loungefly'
      ];
    
    default:
      return [`${category} funko`];
  }
}

function parseListingData(listing: any, category: string) {
  const title = listing.title || '';
  
  // Parse price
  const priceMatch = listing.price?.match(/[\d,]+\.?\d*/);
  if (!priceMatch) return null;
  
  const price = parseFloat(priceMatch[0].replace(/,/g, ''));
  if (isNaN(price) || price <= 0) return null;

  // Extract character/pop name and series from title
  let name = '';
  let series = '';
  let number = '';
  let fandom = '';
  let genre = 'Movies & TV';

  const lowerTitle = title.toLowerCase();

  if (category === 'Bitty Pop!') {
    // Extract character name before "bitty pop"
    const bittyMatch = title.match(/(.+?)\s+bitty\s+pop/i);
    if (bittyMatch) {
      name = bittyMatch[1].trim();
    }
    
    // Determine series/fandom based on keywords
    if (lowerTitle.includes('marvel') || lowerTitle.includes('spider-man') || lowerTitle.includes('iron man') || lowerTitle.includes('captain america')) {
      series = 'Marvel Bitty Pops';
      fandom = 'Marvel';
    } else if (lowerTitle.includes('dc') || lowerTitle.includes('batman') || lowerTitle.includes('superman') || lowerTitle.includes('wonder woman')) {
      series = 'DC Bitty Pops';
      fandom = 'DC';
    } else if (lowerTitle.includes('disney') || lowerTitle.includes('mickey') || lowerTitle.includes('minnie')) {
      series = 'Disney Bitty Pops';
      fandom = 'Disney';
    } else if (lowerTitle.includes('star wars') || lowerTitle.includes('vader') || lowerTitle.includes('luke')) {
      series = 'Star Wars Bitty Pops';
      fandom = 'Star Wars';
    } else if (lowerTitle.includes('harry potter') || lowerTitle.includes('hogwarts')) {
      series = 'Harry Potter Bitty Pops';
      fandom = 'Harry Potter';
    } else if (lowerTitle.includes('pokemon') || lowerTitle.includes('pikachu')) {
      series = 'Pokemon Bitty Pops';
      fandom = 'Pokemon';
      genre = 'Animation';
    } else {
      series = 'Various Bitty Pops';
      fandom = 'Various';
    }
    
  } else if (category === 'Vinyl Soda') {
    // Extract character name before "vinyl soda"
    const sodaMatch = title.match(/(.+?)\s+vinyl\s+soda/i);
    if (sodaMatch) {
      name = sodaMatch[1].trim();
    }
    
    // Determine series/fandom
    if (lowerTitle.includes('star wars') || lowerTitle.includes('vader') || lowerTitle.includes('luke')) {
      series = 'Star Wars Vinyl Soda';
      fandom = 'Star Wars';
    } else if (lowerTitle.includes('dc') || lowerTitle.includes('batman') || lowerTitle.includes('superman') || lowerTitle.includes('wonder woman')) {
      series = 'DC Vinyl Soda';
      fandom = 'DC';
    } else if (lowerTitle.includes('marvel') || lowerTitle.includes('spider-man') || lowerTitle.includes('deadpool')) {
      series = 'Marvel Vinyl Soda';
      fandom = 'Marvel';
    } else {
      series = 'Various Vinyl Soda';
      fandom = 'Various';
    }
    
  } else if (category === 'Loungefly') {
    // Extract name from title (everything before "loungefly")
    const loungeflyMatch = title.match(/(.+?)\s+loungefly/i);
    if (loungeflyMatch) {
      name = loungeflyMatch[1].trim();
    }
    
    // Determine series/fandom for Loungefly
    if (lowerTitle.includes('disney') || lowerTitle.includes('mickey') || lowerTitle.includes('minnie')) {
      series = 'Disney Loungefly';
      fandom = 'Disney';
    } else if (lowerTitle.includes('star wars') || lowerTitle.includes('mandalorian') || lowerTitle.includes('vader')) {
      series = 'Star Wars Loungefly';
      fandom = 'Star Wars';
    } else if (lowerTitle.includes('harry potter') || lowerTitle.includes('hogwarts')) {
      series = 'Harry Potter Loungefly';
      fandom = 'Harry Potter';
    } else if (lowerTitle.includes('marvel') || lowerTitle.includes('spider-man') || lowerTitle.includes('avengers')) {
      series = 'Marvel Loungefly';
      fandom = 'Marvel';
    } else if (lowerTitle.includes('stranger things')) {
      series = 'Stranger Things Loungefly';
      fandom = 'Television';
    } else {
      series = 'Various Loungefly';
      fandom = 'Various';
    }
    
    genre = 'Fashion';
  }

  // Extract number if present
  const numberMatch = title.match(/#?(\d+)/);
  if (numberMatch) {
    number = numberMatch[1];
  }

  // Clean up name
  name = name.replace(/funko/gi, '').replace(/pop/gi, '').replace(/loungefly/gi, '').trim();
  
  if (!name) {
    name = `Unknown ${category}`;
  }

  return {
    name,
    series,
    number,
    fandom,
    genre,
    price,
    description: `${category} featuring ${name}${number ? ` #${number}` : ''}`
  };
} 