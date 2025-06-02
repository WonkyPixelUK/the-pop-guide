import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
};

interface FunkoEuropeProduct {
  itemNumber?: string;
  title: string;
  category?: string;
  license?: string;
  characters?: string[];
  productType?: string;
  price?: {
    current: number;
    original?: number;
    currency: string;
  };
  images?: string[];
  url: string;
  availability?: string;
  description?: string;
  exclusivity?: string;
  deal?: string;
}

interface ScrapingResults {
  totalScraped: number;
  newProducts: number;
  updatedProducts: number;
  errors: number;
  collections: {
    'whats-new': number;
    'coming-soon': number;
  };
  startTime: string;
  endTime: string;
  duration: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY')!;
    
    if (!firecrawlApiKey) {
      throw new Error('FIRECRAWL_API_KEY environment variable not set');
    }

    // Create Supabase client
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const startTime = new Date();
    console.log(`🚀 Starting scheduled Funko Europe scraping at ${startTime.toISOString()}`);

    // Send start notification emails
    await sendScrapingNotification(supabase, {
      type: 'start',
      message: 'Daily Funko Europe scraping has started'
    });

    const results: ScrapingResults = {
      totalScraped: 0,
      newProducts: 0,
      updatedProducts: 0,
      errors: 0,
      collections: {
        'whats-new': 0,
        'coming-soon': 0
      },
      startTime: startTime.toISOString(),
      endTime: '',
      duration: ''
    };

    try {
      // Scrape What's New collection
      console.log('📦 Scraping What\'s New collection...');
      const whatsNewProducts = await scrapeFunkoEuropeCollection(
        firecrawlApiKey, 
        'https://funkoeurope.com/collections/whats-new',
        100 // Limit to 100 items per collection
      );
      
      const whatsNewResults = await processProducts(supabase, whatsNewProducts, 'whats-new');
      results.collections['whats-new'] = whatsNewProducts.length;
      results.newProducts += whatsNewResults.newProducts;
      results.updatedProducts += whatsNewResults.updatedProducts;
      results.errors += whatsNewResults.errors;

      // Wait 10 seconds between collections
      await new Promise(resolve => setTimeout(resolve, 10000));

      // Scrape Coming Soon collection (if it exists)
      console.log('📦 Scraping Coming Soon collection...');
      try {
        const comingSoonProducts = await scrapeFunkoEuropeCollection(
          firecrawlApiKey,
          'https://funkoeurope.com/collections/coming-soon',
          50 // Smaller limit for coming soon
        );
        
        const comingSoonResults = await processProducts(supabase, comingSoonProducts, 'coming-soon');
        results.collections['coming-soon'] = comingSoonProducts.length;
        results.newProducts += comingSoonResults.newProducts;
        results.updatedProducts += comingSoonResults.updatedProducts;
        results.errors += comingSoonResults.errors;
      } catch (error) {
        console.log('⚠️ Coming Soon collection may not exist, skipping...');
        results.errors += 1;
      }

      results.totalScraped = results.newProducts + results.updatedProducts;

    } catch (error) {
      console.error('❌ Scraping error:', error);
      results.errors += 1;
      
      // Send error notification
      await sendScrapingNotification(supabase, {
        type: 'error',
        message: 'Scraping failed with error',
        error: error.message,
        results
      });
      
      throw error;
    }

    const endTime = new Date();
    results.endTime = endTime.toISOString();
    results.duration = formatDuration(endTime.getTime() - startTime.getTime());

    console.log(`✅ Scraping completed successfully:`, results);

    // Send completion notification emails
    await sendScrapingNotification(supabase, {
      type: 'complete',
      message: 'Daily Funko Europe scraping completed successfully',
      results
    });

    return new Response(JSON.stringify({
      success: true,
      results,
      message: 'Scheduled scraping completed successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Scheduled scraper error:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function scrapeFunkoEuropeCollection(firecrawlApiKey: string, url: string, limit: number): Promise<FunkoEuropeProduct[]> {
  console.log(`🔍 Scraping collection: ${url}`);

  const firecrawlResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${firecrawlApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url: url,
      formats: ['html'],
      includeTags: ['a', 'img', 'div', 'span'],
      excludeTags: ['script', 'style', 'nav', 'footer'],
      waitFor: 3000,
      timeout: 45000
    })
  });

  if (!firecrawlResponse.ok) {
    throw new Error(`Firecrawl API error: ${firecrawlResponse.status}`);
  }

  const firecrawlData = await firecrawlResponse.json();
  
  if (!firecrawlData.success) {
    throw new Error(`Firecrawl scraping failed: ${firecrawlData.error || 'Unknown error'}`);
  }

  const html = firecrawlData.data?.html || '';
  console.log(`📄 Scraped ${html.length} characters from collection page`);

  // Extract product URLs
  const productUrls: string[] = [];
  const urlPattern = /href="(https:\/\/funkoeurope\.com\/products\/[^"]+)"/g;
  const urlMatches = html.matchAll(urlPattern);
  
  for (const match of urlMatches) {
    const fullUrl = match[1];
    
    if (!productUrls.includes(fullUrl) && productUrls.length < limit) {
      productUrls.push(fullUrl);
    }
  }

  console.log(`🔗 Found ${productUrls.length} product URLs`);

  // Scrape each product with rate limiting
  const products: FunkoEuropeProduct[] = [];
  
  for (let i = 0; i < Math.min(productUrls.length, limit); i++) {
    try {
      console.log(`📦 Scraping product ${i + 1}/${Math.min(productUrls.length, limit)}`);
      
      const product = await scrapeFunkoEuropeProduct(firecrawlApiKey, productUrls[i]);
      if (product) {
        products.push(product);
      }
      
      // Rate limiting: wait 2-3 seconds between requests
      if (i < productUrls.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000));
      }
      
    } catch (error) {
      console.error(`❌ Failed to scrape product ${productUrls[i]}:`, error);
      continue; // Continue with next product
    }
  }

  return products;
}

async function scrapeFunkoEuropeProduct(firecrawlApiKey: string, url: string): Promise<FunkoEuropeProduct | null> {
  try {
    const firecrawlResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: url,
        formats: ['html'],
        includeTags: ['img', 'meta', 'title', 'h1', 'div', 'span', 'p'],
        excludeTags: ['script', 'style', 'nav', 'footer'],
        waitFor: 1500,
        timeout: 20000
      })
    });

    if (!firecrawlResponse.ok) {
      throw new Error(`Firecrawl API error: ${firecrawlResponse.status}`);
    }

    const firecrawlData = await firecrawlResponse.json();
    
    if (!firecrawlData.success) {
      throw new Error(`Firecrawl scraping failed`);
    }

    const html = firecrawlData.data?.html || '';
    const product: FunkoEuropeProduct = {
      title: '',
      url: url,
      images: []
    };

    // Extract title from URL
    const urlParts = url.split('/').pop()?.replace(/-/g, ' ');
    if (urlParts) {
      product.title = urlParts.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    }

    // Extract item number
    const itemNumberPatterns = [
      /Item Number:\s*(\d+)/i,
      /"sku":\s*"(\d+)"/,
      /(\d{5})/
    ];
    
    for (const pattern of itemNumberPatterns) {
      const match = html.match(pattern);
      if (match && match[1] && match[1].length >= 4) {
        product.itemNumber = match[1];
        break;
      }
    }

    // Extract category and product type
    if (html.includes('POP! &TEE') || html.includes('POP! & TEE')) {
      product.category = 'POP! &TEE';
      product.productType = 'Pop! & Tee (EXC)';
    } else if (html.includes('BITTY POP!')) {
      product.category = 'BITTY POP!';
      product.productType = 'Bitty Pop!';
    } else if (html.includes('MYSTERY MINI')) {
      product.category = 'MYSTERY MINIS';
      product.productType = 'Mystery Mini';
    } else if (html.includes('POP!')) {
      product.category = 'POP!';
      product.productType = 'Pop!';
    }

    // Extract license
    const licensePatterns = [
      /(MARVEL|DC|DISNEY|STAR WARS|POKEMON|HARRY POTTER)/i
    ];
    
    for (const pattern of licensePatterns) {
      const match = html.match(pattern);
      if (match) {
        product.license = match[1].toUpperCase();
        break;
      }
    }

    // Extract characters
    const characters: string[] = [];
    const text = html.toLowerCase();
    const characterList = [
      'deadpool', 'wolverine', 'spider-man', 'spiderman', 'iron man',
      'captain america', 'thor', 'hulk', 'batman', 'superman',
      'mickey mouse', 'pikachu', 'harry potter'
    ];
    
    characterList.forEach(char => {
      if (text.includes(char) && !characters.some(c => c.toLowerCase() === char)) {
        characters.push(char.split(' ').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' '));
      }
    });

    if (characters.length > 0) {
      product.characters = [...new Set(characters)];
    }

    // Extract pricing
    const pricePattern = /£(\d+(?:\.\d{2})?)/g;
    const priceMatches = Array.from(html.matchAll(pricePattern));
    
    if (priceMatches.length >= 2) {
      product.price = {
        current: parseFloat(priceMatches[0][1]),
        original: parseFloat(priceMatches[1][1]),
        currency: 'GBP'
      };
    } else if (priceMatches.length === 1) {
      product.price = {
        current: parseFloat(priceMatches[0][1]),
        currency: 'GBP'
      };
    }

    // Extract availability
    if (html.includes('InStock') || html.includes('Add to cart')) {
      product.availability = 'in_stock';
    } else if (html.includes('OutOfStock') || html.includes('SOLD OUT')) {
      product.availability = 'out_of_stock';
    }

    // Extract deal
    const dealMatch = html.match(/DEAL (\d+% OFF)/i) || html.match(/(\d+% OFF)/i);
    if (dealMatch) {
      product.deal = dealMatch[1];
    }

    // Extract exclusivity
    if (html.includes('EXCLUSIVE')) {
      product.exclusivity = 'Exclusive';
    }

    return product;

  } catch (error) {
    console.error(`Error scraping product ${url}:`, error.message);
    return null;
  }
}

async function processProducts(supabase: any, products: FunkoEuropeProduct[], collection: string) {
  let newProducts = 0;
  let updatedProducts = 0;
  let errors = 0;

  for (const product of products) {
    try {
      // Check if product already exists (by URL or item number)
      const { data: existingProduct } = await supabase
        .from('funko_europe_products')
        .select('*')
        .or(`url.eq.${product.url},item_number.eq.${product.itemNumber}`)
        .maybeSingle();

      const productData = {
        title: product.title,
        item_number: product.itemNumber,
        category: product.category,
        license: product.license,
        characters: product.characters,
        product_type: product.productType,
        price_current: product.price?.current,
        price_original: product.price?.original,
        currency: product.price?.currency || 'GBP',
        images: product.images,
        url: product.url,
        availability: product.availability,
        description: product.description,
        exclusivity: product.exclusivity,
        deal: product.deal,
        collection: collection,
        last_scraped: new Date().toISOString(),
        scraped_count: 1
      };

      if (existingProduct) {
        // Update existing product
        productData.scraped_count = (existingProduct.scraped_count || 0) + 1;
        
        const { error } = await supabase
          .from('funko_europe_products')
          .update(productData)
          .eq('id', existingProduct.id);

        if (error) throw error;
        updatedProducts++;
      } else {
        // Insert new product
        const { error } = await supabase
          .from('funko_europe_products')
          .insert(productData);

        if (error) throw error;
        newProducts++;
      }

    } catch (error) {
      console.error('Error processing product:', error);
      errors++;
    }
  }

  return { newProducts, updatedProducts, errors };
}

async function sendScrapingNotification(supabase: any, notification: {
  type: 'start' | 'complete' | 'error';
  message: string;
  results?: ScrapingResults;
  error?: string;
}) {
  try {
    // Get all user emails from auth.users
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.error('Error fetching users:', usersError);
      return;
    }

    const adminEmail = 'brains@popguide.co.uk';
    
    if (notification.type === 'start') {
      // Send start notification only to admin
      await supabase.functions.invoke('send-email', {
        body: {
          type: 'funko_europe_scraper_start',
          to: adminEmail,
          data: {
            startTime: new Date().toISOString(),
            adminEmail: adminEmail
          }
        }
      });
      
      console.log('📧 Start notification sent to admin');
      
    } else if (notification.type === 'complete') {
      // Send completion summary to admin
      await supabase.functions.invoke('send-email', {
        body: {
          type: 'funko_europe_scraper_complete',
          to: adminEmail,
          data: {
            ...notification.results,
            adminEmail: adminEmail
          }
        }
      });

      // Send summary to all users (if there are new/updated products)
      const hasUpdates = notification.results && (notification.results.newProducts > 0 || notification.results.updatedProducts > 0);
      
      if (hasUpdates && users.users && users.users.length > 0) {
        const userEmails = users.users
          .filter(user => user.email && user.email_confirmed_at) // Only confirmed emails
          .map(user => user.email);

        console.log(`📧 Sending completion notifications to ${userEmails.length} users`);
        
        // Send to users in batches to avoid overwhelming the email service
        const batchSize = 50;
        for (let i = 0; i < userEmails.length; i += batchSize) {
          const batch = userEmails.slice(i, i + batchSize);
          
          for (const email of batch) {
            try {
              await supabase.functions.invoke('send-email', {
                body: {
                  type: 'funko_europe_scraper_user_summary',
                  to: email,
                  data: {
                    ...notification.results,
                    userEmail: email
                  }
                }
              });
              
              // Small delay between emails
              await new Promise(resolve => setTimeout(resolve, 100));
              
            } catch (emailError) {
              console.error(`Failed to send email to ${email}:`, emailError);
            }
          }
          
          // Longer delay between batches
          if (i + batchSize < userEmails.length) {
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
      }
      
    } else if (notification.type === 'error') {
      // Send error notification to admin only
      await supabase.functions.invoke('send-email', {
        body: {
          type: 'funko_europe_scraper_error',
          to: adminEmail,
          data: {
            error: notification.error,
            results: notification.results,
            adminEmail: adminEmail
          }
        }
      });
      
      console.log('📧 Error notification sent to admin');
    }

  } catch (error) {
    console.error('Error sending notifications:', error);
  }
}

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
} 