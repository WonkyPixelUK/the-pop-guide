import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
};

interface OcioStockCredentials {
  username: string;
  password: string;
}

interface ScrapeRequest {
  action: 'scrape' | 'status';
  credentials?: OcioStockCredentials;
  maxItems?: number;
}

interface ProductData {
  name: string;
  series?: string;
  number?: string;
  category: string;
  imageUrl?: string;
  description?: string;
  barcode?: string;
  wholesalePrice?: number;
  retailPrice?: number;
  expectedReleaseDate?: string;
  sourceProductId: string;
  sourceUrl: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body: ScrapeRequest = await req.json();
    console.log('🎯 OcioStock Scraper v2 - Request received:', body.action);

    if (body.action === 'scrape') {
      if (!body.credentials) {
        throw new Error('Login credentials required for OcioStock scraping');
      }

      console.log('🔑 Starting authenticated OcioStock scrape...');
      
      // Start scraping process
      const scrapedData = await scrapeOcioStock(body.credentials, body.maxItems || 50);
      
      if (scrapedData.length > 0) {
        console.log(`📦 Scraped ${scrapedData.length} products, saving to database...`);
        
        // Save to database
        const { data: insertData, error: insertError } = await supabaseClient
          .from('coming_soon_releases')
          .upsert(
            scrapedData.map(product => ({
              source_name: 'OcioStock',
              product_name: product.name,
              product_series: product.series,
              product_number: product.number,
              product_category: product.category,
              product_image_url: product.imageUrl,
              product_description: product.description,
              barcode: product.barcode,
              wholesale_price: product.wholesalePrice,
              suggested_retail_price: product.retailPrice,
              currency: 'EUR',
              expected_release_date: product.expectedReleaseDate,
              release_status: 'announced',
              source_url: product.sourceUrl,
              source_product_id: product.sourceProductId,
              distributor_info: {
                country: 'Spain',
                type: 'B2B_Wholesale',
                lastScraped: new Date().toISOString()
              },
              last_updated: new Date().toISOString()
            })),
            { 
              onConflict: 'source_name,source_product_id',
              ignoreDuplicates: false 
            }
          );

        if (insertError) {
          console.error('❌ Database insert error:', insertError);
          throw insertError;
        }

        console.log('✅ Successfully saved scraped data to database');
        
        // Send notification email
        await sendNotificationEmail(supabaseClient, {
          type: 'ociostock_success',
          itemsScraped: scrapedData.length,
          timestamp: new Date().toISOString()
        });

        return new Response(
          JSON.stringify({
            success: true,
            message: `Successfully scraped ${scrapedData.length} upcoming releases from OcioStock`,
            itemsScraped: scrapedData.length,
            data: scrapedData
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
          }
        );

      } else {
        console.log('⚠️ No new products found');
        return new Response(
          JSON.stringify({
            success: true,
            message: 'No new upcoming releases found on OcioStock',
            itemsScraped: 0
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
          }
        );
      }

    } else if (body.action === 'status') {
      // Get recent scrapes from database
      const { data: recentScrapes, error } = await supabaseClient
        .from('coming_soon_releases')
        .select('*')
        .eq('source_name', 'OcioStock')
        .order('last_updated', { ascending: false })
        .limit(10);

      if (error) {
        throw error;
      }

      return new Response(
        JSON.stringify({
          success: true,
          recentScrapes: recentScrapes?.length || 0,
          lastUpdate: recentScrapes?.[0]?.last_updated || null,
          data: recentScrapes
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }

    throw new Error('Invalid action specified');

  } catch (error) {
    console.error('❌ OcioStock Scraper Error:', error);
    
    // Send failure notification email
    try {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );
      
      await sendNotificationEmail(supabaseClient, {
        type: 'ociostock_failure',
        error_message: error.message,
        timestamp: new Date().toISOString()
      });
    } catch (emailError) {
      console.error('❌ Failed to send failure notification:', emailError);
    }
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        details: error.stack || 'No stack trace available'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});

async function scrapeOcioStock(credentials: OcioStockCredentials, maxItems: number): Promise<ProductData[]> {
  const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');
  
  if (!FIRECRAWL_API_KEY) {
    throw new Error('Firecrawl API key not configured. Please set FIRECRAWL_API_KEY environment variable.');
  }

  console.log('🔥 Using Firecrawl to authenticate and scrape OcioStock...');
  console.log('🔑 API Key present:', FIRECRAWL_API_KEY ? 'Yes' : 'No');
  console.log('👤 Username provided:', credentials.username ? 'Yes' : 'No');

  // First, let's test basic Firecrawl connectivity
  try {
    console.log('🧪 Testing Firecrawl API connectivity...');
    const testResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: 'https://httpbin.org/get',
        formats: ['markdown']
      })
    });

    console.log('🔍 Firecrawl test response status:', testResponse.status);
    
    if (!testResponse.ok) {
      const errorText = await testResponse.text();
      console.error('❌ Firecrawl API test failed:', errorText);
      throw new Error(`Firecrawl API test failed: ${testResponse.status} - ${errorText}`);
    }

    const testData = await testResponse.json();
    console.log('✅ Firecrawl API is working. Credits remaining:', testData.metadata?.credits_remaining || 'Unknown');
    
  } catch (error) {
    console.error('❌ Firecrawl connectivity test failed:', error);
    throw new Error(`Firecrawl API connectivity issue: ${error.message}`);
  }

  // Now try the actual OcioStock scraping
  const loginUrl = 'https://www.ociostock.com/login/';
  
  try {
    // Step 1: Try to scrape the login page first to understand the form structure
    console.log('🔍 Analyzing OcioStock login page structure...');
    const loginPageResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: loginUrl,
        formats: ['extract'],
        extract: {
          schema: {
            formData: {
              type: 'object',
              properties: {
                formAction: { type: 'string', description: 'The form action URL' },
                formMethod: { type: 'string', description: 'The form method' },
                usernameField: { type: 'string', description: 'Username input field name' },
                passwordField: { type: 'string', description: 'Password input field name' },
                submitButton: { type: 'string', description: 'Submit button selector' },
                csrfToken: { type: 'string', description: 'CSRF token if present' }
              }
            }
          }
        }
      })
    });

    console.log('📊 Login page response status:', loginPageResponse.status);
    
    if (!loginPageResponse.ok) {
      const errorText = await loginPageResponse.text();
      console.error('❌ Login page analysis failed:', errorText);
      throw new Error(`Failed to analyze login page: ${loginPageResponse.status} ${loginPageResponse.statusText} - ${errorText}`);
    }

    const loginPageData = await loginPageResponse.json();
    console.log('🔍 Login page analysis:', JSON.stringify(loginPageData, null, 2));

    // Check if the page was successfully scraped
    if (!loginPageData.success) {
      console.error('❌ Login page scraping unsuccessful:', loginPageData);
      throw new Error(`Login page scraping failed: ${loginPageData.error || 'Unknown error'}`);
    }

    // Step 2: Attempt login with authentication
    console.log('🔐 Attempting login with provided credentials...');
    const loginAttemptResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: loginUrl,
        formats: ['extract'],
        extract: {
          schema: {
            loginResult: {
              type: 'object',
              properties: {
                isLoggedIn: { type: 'boolean', description: 'Whether login was successful' },
                userInfo: { type: 'string', description: 'Any user information displayed after login' },
                errorMessage: { type: 'string', description: 'Any error messages displayed' },
                redirectUrl: { type: 'string', description: 'URL after login attempt' }
              }
            }
          }
        },
        actions: [
          {
            type: 'fill_form',
            selector: 'form',
            inputs: [
              { name: 'username', value: credentials.username },
              { name: 'password', value: credentials.password },
              { name: 'email', value: credentials.username }, // Sometimes email is used instead
              { name: 'user', value: credentials.username }   // Alternative field name
            ]
          },
          {
            type: 'click',
            selector: 'input[type="submit"], button[type="submit"], .btn-login, .login-btn'
          },
          {
            type: 'wait',
            milliseconds: 5000
          }
        ]
      })
    });

    console.log('📊 Login attempt response status:', loginAttemptResponse.status);

    if (!loginAttemptResponse.ok) {
      const errorText = await loginAttemptResponse.text();
      console.error('❌ Login attempt request failed:', errorText);
      throw new Error(`Login attempt failed: ${loginAttemptResponse.status} ${loginAttemptResponse.statusText} - ${errorText}`);
    }

    const loginResult = await loginAttemptResponse.json();
    console.log('🔐 Login attempt result:', JSON.stringify(loginResult, null, 2));

    // Check if login was successful (this is heuristic-based)
    const isLoginSuccessful = loginResult.extract?.loginResult?.isLoggedIn || 
                             !loginResult.extract?.loginResult?.errorMessage ||
                             loginResult.success;

    if (!isLoginSuccessful) {
      const errorMsg = loginResult.extract?.loginResult?.errorMessage || 'Authentication unsuccessful';
      console.error('❌ Login failed:', errorMsg);
      throw new Error(`Login failed: ${errorMsg}`);
    }

    console.log('✅ Login appears successful, proceeding to scrape products...');

    // Step 3: Scrape the Funko products page
    const productsUrl = 'https://www.ociostock.com/lp/?idsite=1&idioma=51&criterio=marca&criterio_id=11&filtros=fam_id%3D456&desc=funko';
    
    console.log('📦 Scraping products from:', productsUrl);
    
    const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: productsUrl,
        formats: ['extract'],
        extract: {
          schema: {
            products: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string', description: 'Product name' },
                  series: { type: 'string', description: 'Product series or collection' },
                  number: { type: 'string', description: 'Product number if available' },
                  category: { type: 'string', description: 'Category like Pop!, Bitty Pop!, etc.' },
                  imageUrl: { type: 'string', description: 'Product image URL' },
                  description: { type: 'string', description: 'Product description' },
                  barcode: { type: 'string', description: 'Product barcode/EAN' },
                  price: { type: 'number', description: 'Price in EUR' },
                  availability: { type: 'string', description: 'Availability status' },
                  releaseDate: { type: 'string', description: 'Expected release date' },
                  productId: { type: 'string', description: 'Internal product ID' },
                  productUrl: { type: 'string', description: 'Product detail page URL' },
                  isPreOrder: { type: 'boolean', description: 'Whether this is a pre-order item' },
                  isComingSoon: { type: 'boolean', description: 'Whether this is marked as coming soon' }
                }
              }
            },
            pageInfo: {
              type: 'object',
              properties: {
                totalProducts: { type: 'number', description: 'Total number of products found' },
                currentPage: { type: 'number', description: 'Current page number' },
                isLoggedIn: { type: 'boolean', description: 'Whether user appears to be logged in' }
              }
            }
          }
        }
      })
    });

    console.log('📊 Products scrape response status:', scrapeResponse.status);

    if (!scrapeResponse.ok) {
      const errorText = await scrapeResponse.text();
      console.error('❌ Products scraping request failed:', errorText);
      throw new Error(`Product scraping failed: ${scrapeResponse.status} ${scrapeResponse.statusText} - ${errorText}`);
    }

    const scrapeData = await scrapeResponse.json();
    console.log('🔥 Firecrawl scrape response:', JSON.stringify(scrapeData, null, 2));

    if (!scrapeData.success) {
      console.error('❌ Products scraping unsuccessful:', scrapeData);
      throw new Error(`Scraping unsuccessful: ${scrapeData.error || 'Unknown error'}`);
    }

    const products = scrapeData.extract?.products || [];
    const pageInfo = scrapeData.extract?.pageInfo || {};

    console.log(`📦 Found ${products.length} products on page (total: ${pageInfo.totalProducts || 'unknown'})`);

    if (products.length === 0) {
      console.log('⚠️ No products found - this might indicate login issues or page structure changes');
      
      // Try a simpler extraction approach as fallback
      console.log('🔄 Attempting fallback extraction...');
      const fallbackResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: productsUrl,
          formats: ['markdown', 'html']
        })
      });

      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json();
        console.log('📄 Fallback page content preview:', fallbackData.markdown?.substring(0, 500) || 'No content');
      }
    }

    const processedProducts = products.slice(0, maxItems).map((product: any): ProductData => ({
      name: product.name || 'Unknown Product',
      series: product.series,
      number: product.number,
      category: mapCategoryName(product.category) || 'Pop!',
      imageUrl: product.imageUrl,
      description: product.description,
      barcode: product.barcode,
      wholesalePrice: product.price,
      retailPrice: product.price ? product.price * 1.3 : undefined, // Estimate retail markup
      expectedReleaseDate: product.releaseDate ? parseReleaseDate(product.releaseDate) : undefined,
      sourceProductId: product.productId || `ocio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sourceUrl: product.productUrl || productsUrl
    }));

    console.log(`✅ Successfully processed ${processedProducts.length} products`);
    return processedProducts;

  } catch (error) {
    console.error('❌ OcioStock scraping error:', error);
    console.error('❌ Error stack:', error.stack);
    throw new Error(`OcioStock scraping failed: ${error.message}`);
  }
}

function mapCategoryName(category: string): string {
  if (!category) return 'Pop!';
  
  const categoryLower = category.toLowerCase();
  
  if (categoryLower.includes('bitty')) return 'Bitty Pop!';
  if (categoryLower.includes('soda') || categoryLower.includes('vinyl')) return 'Vinyl Soda';
  if (categoryLower.includes('loungefly')) return 'Loungefly';
  if (categoryLower.includes('mystery') || categoryLower.includes('mini')) return 'Mystery Mini';
  if (categoryLower.includes('pop')) return 'Pop!';
  
  return 'Other';
}

function parseReleaseDate(dateString: string): string | undefined {
  if (!dateString) return undefined;
  
  try {
    // Try to parse various date formats that might appear on the site
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      // Try parsing Spanish month names or other formats
      return undefined;
    }
    return date.toISOString().split('T')[0]; // Return YYYY-MM-DD format
  } catch {
    return undefined;
  }
}

async function sendNotificationEmail(supabaseClient: any, details: any) {
  try {
    await supabaseClient.functions.invoke('send-email', {
      body: {
        to: 'brains@popguide.co.uk',
        template: details.type,
        templateData: details
      }
    });
    console.log('📧 Notification email sent successfully');
  } catch (error) {
    console.error('❌ Failed to send notification email:', error);
  }
} 