import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
};

interface ScrapeRequest {
  url: string;
  action?: 'single' | 'bulk';
  collection?: 'whats-new' | 'coming-soon' | 'new-releases';
  limit?: number;
}

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

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { url, action = 'single', collection, limit = 50 }: ScrapeRequest = await req.json();
    
    if (!url) {
      throw new Error('URL is required');
    }

    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

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

    console.log(`🕷️ Starting Funko Europe scraping for: ${url}`);

    if (action === 'single') {
      // Scrape single product
      const product = await scrapeFunkoEuropeProduct(firecrawlApiKey, url);
      
      console.log(`✅ Successfully scraped product: ${product.title}`);
      
      return new Response(JSON.stringify({
        success: true,
        action: 'single',
        product: product,
        url: url
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } else if (action === 'bulk') {
      // Scrape collection page
      const products = await scrapeFunkoEuropeCollection(firecrawlApiKey, url, limit);
      
      console.log(`✅ Successfully scraped ${products.length} products from collection`);
      
      return new Response(JSON.stringify({
        success: true,
        action: 'bulk',
        products: products,
        count: products.length,
        url: url,
        collection: collection
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    throw new Error('Invalid action specified');

  } catch (error) {
    console.error('Funko Europe scraper error:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function scrapeFunkoEuropeProduct(firecrawlApiKey: string, url: string): Promise<FunkoEuropeProduct> {
  try {
    console.log(`🔍 Scraping Funko Europe product: ${url}`);

    // Use Firecrawl to scrape the product page
    const firecrawlResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: url,
        formats: ['markdown', 'html'],
        includeTags: ['img', 'meta', 'title', 'h1', 'div', 'span', 'p'],
        excludeTags: ['script', 'style', 'nav', 'footer'],
        waitFor: 2000,
        timeout: 30000
      })
    });

    if (!firecrawlResponse.ok) {
      const errorText = await firecrawlResponse.text();
      throw new Error(`Firecrawl API error: ${firecrawlResponse.status} - ${errorText}`);
    }

    const firecrawlData = await firecrawlResponse.json();
    
    if (!firecrawlData.success) {
      throw new Error(`Firecrawl scraping failed: ${firecrawlData.error || 'Unknown error'}`);
    }

    const html = firecrawlData.data?.html || '';
    const markdown = firecrawlData.data?.markdown || '';

    console.log(`📄 Scraped ${html.length} characters of HTML content`);

    // Extract product information using improved regex patterns
    const product: FunkoEuropeProduct = {
      title: '',
      url: url,
      images: []
    };

    // Extract title - look for the main product title
    const titlePatterns = [
      /<h1[^>]*class="[^"]*product[^"]*"[^>]*>([^<]+)<\/h1>/i,
      /<h1[^>]*>([^<]*(?:DEADPOOL|POP!|FUNKO)[^<]*)<\/h1>/i,
      /# ([^#\n]*(?:POP!|FUNKO)[^#\n]*)/i,
      /<title>([^|]*(?:POP!|FUNKO)[^|]*)/i
    ];
    
    for (const pattern of titlePatterns) {
      const match = html.match(pattern) || markdown.match(pattern);
      if (match) {
        product.title = match[1]
          .replace(/ - Funko Europe$/, '')
          .replace(/\s+/g, ' ')
          .trim();
        break;
      }
    }

    // If no title found, try to extract from URL
    if (!product.title) {
      const urlParts = url.split('/').pop()?.replace(/-/g, ' ');
      if (urlParts) {
        product.title = urlParts.toUpperCase();
      }
    }

    // Extract item number - look for SKU patterns
    const itemNumberPatterns = [
      /Item Number:\s*(\d+)/i,
      /"sku":\s*"(\d+)"/,
      /product_id['"]\s*:\s*['"]([\d]+)['"]/,
      /"product_id":\s*(\d+)/,
      /(\d{5})/g  // 5-digit product codes
    ];
    
    for (const pattern of itemNumberPatterns) {
      const match = html.match(pattern);
      if (match && match[1] && match[1].length >= 4) {
        product.itemNumber = match[1];
        break;
      }
    }

    // Extract category and product type from content
    if (html.includes('POP! &TEE') || html.includes('POP! & TEE')) {
      product.category = 'POP! &TEE';
      product.productType = 'Pop! & Tee (EXC)';
    } else if (html.includes('BITTY POP!')) {
      product.category = 'BITTY POP!';
      product.productType = 'Bitty Pop!';
    } else if (html.includes('VINYL SODA')) {
      product.category = 'VINYL SODA';
      product.productType = 'Vinyl Soda';
    } else if (html.includes('MYSTERY MINI')) {
      product.category = 'MYSTERY MINIS';
      product.productType = 'Mystery Mini';
    } else if (html.includes('POP!')) {
      product.category = 'POP!';
      product.productType = 'Pop!';
    }

    // Extract license - look for brand information
    const licensePatterns = [
      /License:\s*(MARVEL|DC|DISNEY|STAR WARS|POKEMON|HARRY POTTER)/i,
      /"brand":\s*"(MARVEL|DC|DISNEY)"/i,
      /(MARVEL|DC|DISNEY|STAR WARS|POKEMON|HARRY POTTER)/i
    ];
    
    for (const pattern of licensePatterns) {
      const match = html.match(pattern);
      if (match) {
        product.license = match[1].toUpperCase();
        break;
      }
    }

    // Extract characters with better detection
    const characters: string[] = [];
    const text = html.toLowerCase();
    
    // Common character names to look for
    const characterList = [
      'deadpool', 'wolverine', 'spider-man', 'spiderman', 'iron man', 'ironman',
      'captain america', 'thor', 'hulk', 'black widow', 'batman', 'superman',
      'wonder woman', 'flash', 'mickey mouse', 'minnie mouse', 'donald duck',
      'pikachu', 'charizard', 'harry potter', 'hermione', 'ron weasley'
    ];
    
    characterList.forEach(char => {
      if (text.includes(char) && !characters.some(c => c.toLowerCase() === char)) {
        characters.push(char.split(' ').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' '));
      }
    });

    if (characters.length > 0) {
      product.characters = [...new Set(characters)]; // Remove duplicates
    }

    // Extract pricing with better patterns
    const pricePatterns = [
      /£(\d+(?:\.\d{2})?)\s*£(\d+(?:\.\d{2})?)/,  // Current and original price
      /"price":\s*(\d+(?:\.\d{2})?)/,
      /Price[^£]*£(\d+(?:\.\d{2})?)/i,
      /£(\d+(?:\.\d{2})?)/g  // Any price
    ];
    
    for (const pattern of pricePatterns) {
      const matches = Array.from(html.matchAll(pattern));
      if (matches.length > 0) {
        const match = matches[0];
        if (match[2]) {
          // Found both current and original price
          product.price = {
            current: parseFloat(match[1]),
            original: parseFloat(match[2]),
            currency: 'GBP'
          };
        } else if (match[1]) {
          // Found single price
          product.price = {
            current: parseFloat(match[1]),
            currency: 'GBP'
          };
        }
        break;
      }
    }

    // Extract product images - look for high-quality product images
    const imagePatterns = [
      /src="([^"]*(?:81729|DEADPOOL)[^"]*\.(?:jpg|jpeg|png|webp)[^"]*)"/gi,
      /src="([^"]*funkoeurope[^"]*\.(?:jpg|jpeg|png|webp)[^"]*)"/gi
    ];
    
    const images: string[] = [];
    
    for (const pattern of imagePatterns) {
      const matches = html.matchAll(pattern);
      for (const match of matches) {
        let imageUrl = match[1];
        
        // Normalize URL
        if (imageUrl.startsWith('//')) {
          imageUrl = 'https:' + imageUrl;
        } else if (imageUrl.startsWith('/')) {
          imageUrl = 'https://funkoeurope.com' + imageUrl;
        }
        
        // Filter for product images
        if (!images.includes(imageUrl) && 
            !imageUrl.includes('130x') && 
            !imageUrl.includes('_small') && 
            !imageUrl.includes('icon') &&
            !imageUrl.includes('logo') &&
            !imageUrl.includes('footer') &&
            (imageUrl.includes('1200x') || imageUrl.includes('GROUP') || imageUrl.includes('BOX'))) {
          images.push(imageUrl);
        }
      }
      
      if (images.length > 0) break; // Stop if we found product images
    }
    
    if (images.length > 0) {
      product.images = images;
    }

    // Extract availability
    if (html.includes('InStock') || html.includes('Add to cart')) {
      product.availability = 'in_stock';
    } else if (html.includes('OutOfStock') || html.includes('SOLD OUT')) {
      product.availability = 'out_of_stock';
    }

    // Extract deal information
    const dealMatch = html.match(/DEAL (\d+% OFF)/i) || html.match(/(\d+% OFF)/i);
    if (dealMatch) {
      product.deal = dealMatch[1];
    }

    // Extract exclusivity
    if (html.includes('EXCLUSIVE')) {
      product.exclusivity = 'Exclusive';
    }

    // Extract description - look for product description
    const descPatterns = [
      /Grab your best bub[^.]+\./i,
      /This black, short-sleeved tee[^.]+\./i,
      /<p[^>]*class="[^"]*description[^"]*"[^>]*>([^<]{50,300})<\/p>/i,
      /Vinyl bobblehead is approximately[^.]+\./i
    ];
    
    for (const pattern of descPatterns) {
      const match = html.match(pattern);
      if (match) {
        product.description = match[1] ? match[1].replace(/<[^>]+>/g, '').trim() : match[0];
        break;
      }
    }

    console.log(`✅ Extracted product data:`, {
      title: product.title,
      itemNumber: product.itemNumber,
      category: product.category,
      license: product.license,
      characters: product.characters,
      price: product.price,
      images: product.images?.length || 0
    });

    return product;

  } catch (error) {
    console.error('Error scraping Funko Europe product:', error);
    throw error;
  }
}

async function scrapeFunkoEuropeCollection(firecrawlApiKey: string, url: string, limit: number): Promise<FunkoEuropeProduct[]> {
  try {
    console.log(`🔍 Scraping Funko Europe collection: ${url}`);

    // Use Firecrawl to scrape the collection page
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
      const errorText = await firecrawlResponse.text();
      throw new Error(`Firecrawl API error: ${firecrawlResponse.status} - ${errorText}`);
    }

    const firecrawlData = await firecrawlResponse.json();
    
    if (!firecrawlData.success) {
      throw new Error(`Firecrawl scraping failed: ${firecrawlData.error || 'Unknown error'}`);
    }

    const html = firecrawlData.data?.html || '';
    console.log(`📄 Scraped ${html.length} characters of HTML content from collection`);

    // Extract product URLs using the correct pattern for full URLs
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
        console.log(`📦 Scraping product ${i + 1}/${Math.min(productUrls.length, limit)}: ${productUrls[i]}`);
        
        const product = await scrapeFunkoEuropeProduct(firecrawlApiKey, productUrls[i]);
        products.push(product);
        
        // Rate limiting: wait 2-3 seconds between requests
        if (i < productUrls.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000));
        }
        
      } catch (error) {
        console.error(`❌ Failed to scrape product ${productUrls[i]}:`, error);
        // Continue with next product instead of failing entirely
        continue;
      }
    }

    return products;

  } catch (error) {
    console.error('Error scraping Funko Europe collection:', error);
    throw error;
  }
} 