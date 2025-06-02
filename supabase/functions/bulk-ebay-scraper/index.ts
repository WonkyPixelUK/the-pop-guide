import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
};

interface ScrapeRequest {
  action: 'start' | 'status' | 'stop';
  batchSize?: number;
  maxItems?: number;
  marketplace?: string;
  startFrom?: number;
}

interface ScrapeProgress {
  totalItems: number;
  processedItems: number;
  successfulItems: number;
  failedItems: number;
  currentBatch: number;
  totalBatches: number;
  status: 'idle' | 'running' | 'paused' | 'completed' | 'error';
  startedAt?: string;
  estimatedCompletion?: string;
  lastError?: string;
  currentItem?: string;
  pricesCollected: number;
  averageTimePerItem: number;
}

// Global state for tracking scraping progress
let scrapingProgress: ScrapeProgress = {
  totalItems: 0,
  processedItems: 0,
  successfulItems: 0,
  failedItems: 0,
  currentBatch: 0,
  totalBatches: 0,
  status: 'idle',
  pricesCollected: 0,
  averageTimePerItem: 0
};

// Email notification helper function
async function sendScraperNotification(supabase: any, notification: {
  type: 'success' | 'failure';
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
      scraper_type: 'Bulk eBay Scraper',
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

let abortController: AbortController | null = null;

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, batchSize = 50, maxItems = 2000, marketplace, startFrom = 0 }: ScrapeRequest = await req.json();
    
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

    // Handle different actions
    switch (action) {
      case 'status':
        return new Response(JSON.stringify(scrapingProgress), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      case 'stop':
        if (abortController) {
          abortController.abort();
          scrapingProgress.status = 'paused';
        }
        return new Response(JSON.stringify({ message: 'Scraping stopped', progress: scrapingProgress }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      case 'start':
        // Check if already running
        if (scrapingProgress.status === 'running') {
          return new Response(JSON.stringify({ 
            error: 'Scraping already in progress', 
            progress: scrapingProgress 
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Initialize scraping
        abortController = new AbortController();
        scrapingProgress = {
          totalItems: 0,
          processedItems: 0,
          successfulItems: 0,
          failedItems: 0,
          currentBatch: 0,
          totalBatches: 0,
          status: 'running',
          startedAt: new Date().toISOString(),
          pricesCollected: 0,
          averageTimePerItem: 0
        };

        // Start bulk scraping in background
        bulkScrapeEbay(supabase, firecrawlApiKey, batchSize, maxItems, abortController.signal, startFrom);

        return new Response(JSON.stringify({ 
          message: 'Bulk scraping started', 
          progress: scrapingProgress 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      default:
        throw new Error('Invalid action');
    }

  } catch (error) {
    console.error('Bulk scraper error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      progress: scrapingProgress 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function bulkScrapeEbay(
  supabase: any, 
  firecrawlApiKey: string, 
  batchSize: number, 
  maxItems: number,
  signal: AbortSignal,
  startFrom: number = 0
) {
  try {
    console.log(`Starting bulk eBay scraping: ${maxItems} items in batches of ${batchSize}, starting from ${startFrom}`);
    
    // Get Funko Pops that need pricing updates - prioritize those without recent eBay UK prices
    const { data: funkoPops, error: fetchError } = await supabase
      .from('funko_pops')
      .select('id, name, series, number, image_url, estimated_value, category')
      .not('name', 'is', null)
      .not('series', 'is', null)
      .order('last_price_update', { ascending: true, nullsFirst: true })
      .range(startFrom, startFrom + maxItems - 1);

    if (fetchError) {
      console.error('Database fetch error:', fetchError);
      throw new Error(`Failed to fetch Funko Pops: ${fetchError.message}`);
    }

    if (!funkoPops || funkoPops.length === 0) {
      scrapingProgress.status = 'completed';
      console.log('No Funko Pops found to scrape');
      return;
    }

    scrapingProgress.totalItems = funkoPops.length;
    scrapingProgress.totalBatches = Math.ceil(funkoPops.length / batchSize);
    
    console.log(`Found ${funkoPops.length} Funko Pops to process in ${scrapingProgress.totalBatches} batches`);
    console.log(`Sample items: ${funkoPops.slice(0, 3).map(p => `${p.name} (${p.series})`).join(', ')}`);

    const startTime = Date.now();

    // Process in batches
    for (let i = 0; i < funkoPops.length; i += batchSize) {
      if (signal.aborted) {
        scrapingProgress.status = 'paused';
        console.log('Scraping aborted by user');
        return;
      }

      const batch = funkoPops.slice(i, i + batchSize);
      scrapingProgress.currentBatch = Math.floor(i / batchSize) + 1;
      
      console.log(`Processing batch ${scrapingProgress.currentBatch}/${scrapingProgress.totalBatches} (${batch.length} items)`);

      // Process batch with proper error handling
      for (const pop of batch) {
        if (signal.aborted) break;
        
        try {
          console.log(`Processing: ${pop.name} - ${pop.series} (#${pop.number})`);
          const result = await scrapeEbayForPop(supabase, firecrawlApiKey, pop, signal);
          
          scrapingProgress.processedItems++;
          
          if (result && result.success) {
            scrapingProgress.successfulItems++;
            scrapingProgress.pricesCollected += result.pricesFound || 0;
            console.log(`✅ Success: ${pop.name} - Found ${result.pricesFound} prices`);
          } else {
            scrapingProgress.failedItems++;
            console.log(`❌ Failed: ${pop.name} - No prices found`);
          }
        } catch (error) {
          scrapingProgress.processedItems++;
          scrapingProgress.failedItems++;
          console.error(`❌ Error processing ${pop.name}:`, error.message);
          scrapingProgress.lastError = error.message;
        }
        
        // Rate limiting between items
        await new Promise(resolve => setTimeout(resolve, 3000)); // 3 second delay
      }

      // Calculate average time and ETA
      const elapsedTime = Date.now() - startTime;
      scrapingProgress.averageTimePerItem = elapsedTime / scrapingProgress.processedItems;
      const remainingItems = scrapingProgress.totalItems - scrapingProgress.processedItems;
      const estimatedRemainingTime = remainingItems * scrapingProgress.averageTimePerItem;
      scrapingProgress.estimatedCompletion = new Date(Date.now() + estimatedRemainingTime).toISOString();

      console.log(`Batch ${scrapingProgress.currentBatch} completed. Progress: ${scrapingProgress.processedItems}/${scrapingProgress.totalItems}`);
      console.log(`Prices collected so far: ${scrapingProgress.pricesCollected}`);
      
      // Pause between batches
      if (scrapingProgress.currentBatch < scrapingProgress.totalBatches) {
        await new Promise(resolve => setTimeout(resolve, 5000)); // 5 second pause between batches
      }
    }

    scrapingProgress.status = 'completed';
    console.log(`Bulk scraping completed! Processed: ${scrapingProgress.processedItems}, Successful: ${scrapingProgress.successfulItems}, Failed: ${scrapingProgress.failedItems}, Prices collected: ${scrapingProgress.pricesCollected}`);

    // Send success email notification
    try {
      await sendScraperNotification(supabase, {
        type: 'success',
        totalProcessed: scrapingProgress.processedItems,
        successful: scrapingProgress.successfulItems,
        failed: scrapingProgress.failedItems,
        pricesCollected: scrapingProgress.pricesCollected,
        duration: Date.now() - new Date(scrapingProgress.startedAt || Date.now()).getTime(),
        adminEmail: 'brains@popguide.co.uk'
      });
    } catch (emailError) {
      console.error('Failed to send success notification email:', emailError);
    }

  } catch (error) {
    console.error('Bulk scraping error:', error);
    scrapingProgress.status = 'error';
    scrapingProgress.lastError = error.message;
    
    // Send failure email notification
    try {
      await sendScraperNotification(supabase, {
        type: 'failure',
        totalProcessed: scrapingProgress.processedItems,
        successful: scrapingProgress.successfulItems,
        failed: scrapingProgress.failedItems,
        pricesCollected: scrapingProgress.pricesCollected,
        error: error.message,
        adminEmail: 'brains@popguide.co.uk'
      });
    } catch (emailError) {
      console.error('Failed to send failure notification email:', emailError);
    }
  }
}

async function scrapeEbayForPop(supabase: any, firecrawlApiKey: string, pop: any, signal: AbortSignal) {
  if (signal.aborted) return null;
  
  scrapingProgress.currentItem = `${pop.name} (#${pop.number})`;
  
  try {
    // Construct eBay UK search URL with category-appropriate search terms
    let searchQuery = '';
    
    if (pop.category === 'Bitty Pop!') {
      searchQuery = `${pop.name} bitty pop funko ${pop.number || ''}`.replace(/\s+/g, '+');
    } else if (pop.category === 'Vinyl Soda') {
      searchQuery = `${pop.name} vinyl soda funko ${pop.number || ''}`.replace(/\s+/g, '+');
    } else if (pop.category === 'Loungefly') {
      searchQuery = `${pop.name} loungefly backpack ${pop.series || ''} ${pop.number || ''}`.replace(/\s+/g, '+');
    } else {
      // Default search for regular Pops
      searchQuery = `${pop.name} ${pop.series} funko pop ${pop.number}`.replace(/\s+/g, '+');
    }
    
    const ebayUrl = `https://www.ebay.co.uk/sch/i.html?_nkw=${searchQuery}&_in_kw=1&_ex_kw=&_sacat=0&LH_Sold=1&_udlo=&_udhi=&_samilow=&_samihi=&_sadis=15&_stpos=&_sargn=-1%26saslc%3D1&_salic=3&_sop=12&_dmd=1&_ipg=60`;
    
    console.log(`🔍 Scraping eBay for: ${pop.name} - ${ebayUrl}`);

    // Use Firecrawl to scrape eBay
    console.log(`📡 Making Firecrawl request...`);
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
      }),
      signal
    });

    console.log(`📊 Firecrawl response status: ${firecrawlResponse.status}`);

    if (!firecrawlResponse.ok) {
      const errorText = await firecrawlResponse.text();
      console.error(`❌ Firecrawl API error: ${firecrawlResponse.status} ${firecrawlResponse.statusText} - ${errorText}`);
      throw new Error(`Firecrawl API error: ${firecrawlResponse.status} ${firecrawlResponse.statusText}`);
    }

    const firecrawlData = await firecrawlResponse.json();
    console.log(`🔍 Firecrawl response data:`, JSON.stringify(firecrawlData, null, 2));
    
    const listings = firecrawlData.extract?.listings || [];
    
    console.log(`📝 Found ${listings.length} listings for ${pop.name}`);

    if (listings.length === 0) {
      console.log(`⚠️ No listings found for ${pop.name}. This could be due to:`);
      console.log(`   - Search query too specific: "${searchQuery}"`);
      console.log(`   - No sold listings on eBay UK recently`);
      console.log(`   - Firecrawl extraction issues`);
      return { success: false, pricesFound: 0 };
    }

    let pricesStored = 0;
    const validPrices: number[] = [];

    // Get or create marketplace source for eBay UK
    let { data: source, error: sourceError } = await supabase
      .from('marketplace_sources')
      .select('id')
      .eq('name', 'eBay UK')
      .single();

    if (sourceError) {
      console.log(`📊 Creating eBay UK marketplace source...`);
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
        console.error(`❌ Failed to create marketplace source:`, createError);
        throw new Error(`Failed to create marketplace source: ${createError.message}`);
      }
      source = newSource;
    }

    // Process each listing
    for (const listing of listings.slice(0, 10)) { // Limit to 10 listings per pop
      if (signal.aborted) break;
      
      try {
        console.log(`🏷️ Processing listing: ${listing.title} - ${listing.price}`);
        
        // Parse price
        const priceMatch = listing.price?.match(/[\d,]+\.?\d*/);
        if (!priceMatch) {
          console.log(`⚠️ Could not parse price from: "${listing.price}"`);
          continue;
        }
        
        const price = parseFloat(priceMatch[0].replace(/,/g, ''));
        if (isNaN(price) || price <= 0) {
          console.log(`⚠️ Invalid price: ${price}`);
          continue;
        }
        
        validPrices.push(price);
        console.log(`💰 Valid price found: £${price}`);

        // Detect stickers and exclusives
        const title = listing.title?.toLowerCase() || '';
        const hasSDCC = /sdcc|san diego comic con/i.test(title);
        const hasNYCC = /nycc|new york comic con/i.test(title);
        const hasExclusive = /exclusive|limited|convention|chase/i.test(title);

        // Store marketplace price
        const { error: insertError } = await supabase
          .from('marketplace_prices')
          .insert({
            funko_pop_id: pop.id,
            marketplace_source_id: source.id,
            title: listing.title || `${pop.name} Funko Pop`,
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

        if (!insertError) {
          pricesStored++;
          console.log(`✅ Price stored successfully: £${price}`);
        } else {
          console.error(`❌ Error storing price:`, insertError);
        }
      } catch (error) {
        console.error(`❌ Error processing listing:`, error);
      }
    }

    // Update Funko Pop estimated value if we got valid prices
    if (validPrices.length > 0) {
      const averagePrice = validPrices.reduce((a, b) => a + b, 0) / validPrices.length;
      const medianPrice = validPrices.sort((a, b) => a - b)[Math.floor(validPrices.length / 2)];
      
      // Use median as more reliable estimate
      const { error: updateError } = await supabase
        .from('funko_pops')
        .update({
          estimated_value: Math.round(medianPrice * 100) / 100, // Round to 2 decimal places
          last_price_update: new Date().toISOString()
        })
        .eq('id', pop.id);

      if (updateError) {
        console.error(`❌ Error updating estimated value:`, updateError);
      } else {
        console.log(`📊 Updated estimated value to £${Math.round(medianPrice * 100) / 100}`);
      }
    }

    return { success: true, pricesFound: pricesStored };

  } catch (error) {
    console.error(`❌ Error scraping ${pop.name}:`, error);
    throw error;
  }
} 