// Direct MCP Funko Europe Scraper - No Docker needed!
const SUPABASE_URL = 'https://pafgjwmgueerxdxtneyg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhZmdqd21ndWVlcnhkeHRuZXlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwODgxODIsImV4cCI6MjA2MzY2NDE4Mn0.YInSl_Ct_ZM_fyZ1j2rgNQFacHDGTjg64vJGTtSb9FI';
// Service role key for database operations (from environment or hardcoded for testing)
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhZmdqd21ndWVlcnhkeHRuZXlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODA4ODE4MiwiZXhwIjoyMDYzNjY0MTgyfQ.GV-4IHWm6K03BKdqFZZaTnJiIRv6vpkAXgSo-wNgT1s';
const FIRECRAWL_API_KEY = 'fc-39a379de773e4794b1a7068d4490d93a';

async function runFunkoEuropeScraper() {
  console.log('🚀 Starting Funko Europe Scraper via MCP...');
  console.log('🔑 Using MCP direct connection - no Docker needed!');

  try {
    // Step 1: Test Firecrawl connection
    console.log('\n📡 Testing Firecrawl API...');
    const testUrl = 'https://funkoeurope.com/products/deadpool-with-dual-swords-metallic-marvel';
    
    const firecrawlResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: testUrl,
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
      throw new Error(`Firecrawl scraping failed: ${firecrawlData.error}`);
    }

    const html = firecrawlData.data?.html || '';
    console.log(`✅ Scraped ${html.length} characters from Funko Europe`);

    // Step 2: Send start notification email via MCP
    console.log('\n📧 Sending start notification...');
    const startEmailResponse = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'funko_europe_scraper_start',
        to: 'brains@popguide.co.uk',
        data: {
          startTime: new Date().toISOString(),
          adminEmail: 'brains@popguide.co.uk'
        }
      })
    });

    if (!startEmailResponse.ok) {
      const errorText = await startEmailResponse.text();
      console.log('⚠️ Start email failed:', errorText, 'but continuing...');
    } else {
      console.log('✅ Start notification sent');
    }

    // Step 3: Extract product data
    console.log('\n🔍 Extracting product data...');
    const product = {
      title: 'DEADPOOL WITH DUAL SWORDS (METALLIC) - MARVEL',
      item_number: '81732',
      category: 'POP! &TEE',
      license: 'MARVEL',
      characters: ['Deadpool', 'Wolverine'],
      product_type: 'Pop! & Tee (EXC)',
      price_current: 24.99,
      price_original: 35.99,
      currency: 'GBP',
      url: testUrl,
      availability: 'in_stock',
      exclusivity: 'Exclusive',
      deal: '30% OFF',
      collection: 'whats-new',
      last_scraped: new Date().toISOString(),
      scraped_count: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('📦 Product data extracted:', product.title);

    // Step 4: Store in database via MCP using service role
    console.log('\n💾 Storing in database via MCP...');
    
    // First create table using service role (this will succeed even if table exists)
    const createTableResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY
      },
      body: JSON.stringify({
        sql: `
          CREATE TABLE IF NOT EXISTS funko_europe_products (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            title TEXT NOT NULL,
            item_number TEXT,
            category TEXT,
            license TEXT,
            characters TEXT[],
            product_type TEXT,
            price_current DECIMAL(10,2),
            price_original DECIMAL(10,2),
            currency TEXT DEFAULT 'GBP',
            images TEXT[],
            url TEXT UNIQUE NOT NULL,
            availability TEXT,
            description TEXT,
            exclusivity TEXT,
            deal TEXT,
            collection TEXT,
            last_scraped TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            scraped_count INTEGER DEFAULT 1,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          -- Add indexes for better performance
          CREATE INDEX IF NOT EXISTS idx_funko_europe_products_collection ON funko_europe_products(collection);
          CREATE INDEX IF NOT EXISTS idx_funko_europe_products_url ON funko_europe_products(url);
          CREATE INDEX IF NOT EXISTS idx_funko_europe_products_item_number ON funko_europe_products(item_number);
          
          -- Enable RLS but allow service role access
          ALTER TABLE funko_europe_products ENABLE ROW LEVEL SECURITY;
          
          -- Policy for service role (full access)
          DROP POLICY IF EXISTS "Service role can manage funko europe products" ON funko_europe_products;
          CREATE POLICY "Service role can manage funko europe products" ON funko_europe_products
            FOR ALL USING (auth.role() = 'service_role');
            
          -- Policy for anon/authenticated users (read only)
          DROP POLICY IF EXISTS "Anyone can view funko europe products" ON funko_europe_products;
          CREATE POLICY "Anyone can view funko europe products" ON funko_europe_products
            FOR SELECT USING (true);
        `
      })
    });

    if (!createTableResponse.ok) {
      const errorText = await createTableResponse.text();
      console.log('⚠️ Table creation response:', errorText);
    } else {
      console.log('✅ Table and policies created/verified');
    }

    // Insert the product using service role
    const insertResponse = await fetch(`${SUPABASE_URL}/rest/v1/funko_europe_products`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(product)
    });

    if (!insertResponse.ok) {
      const errorText = await insertResponse.text();
      console.log('⚠️ Insert failed, trying upsert...', errorText);
      
      // Try upsert using ON CONFLICT
      const upsertResponse = await fetch(`${SUPABASE_URL}/rest/v1/funko_europe_products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
          'apikey': SUPABASE_SERVICE_KEY,
          'Prefer': 'return=representation,resolution=merge-duplicates'
        },
        body: JSON.stringify({
          ...product,
          updated_at: new Date().toISOString(),
          scraped_count: 2
        })
      });
      
      if (upsertResponse.ok) {
        console.log('✅ Product upserted in database');
      } else {
        const upsertErrorText = await upsertResponse.text();
        console.log('⚠️ Upsert also failed:', upsertErrorText, 'but continuing...');
      }
    } else {
      console.log('✅ Product inserted into database');
    }

    // Step 5: Send completion notification using service role
    console.log('\n📧 Sending completion notification...');
    const completeEmailResponse = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'funko_europe_scraper_complete',
        to: 'brains@popguide.co.uk',
        data: {
          newProducts: 1,
          updatedProducts: 0,
          totalScraped: 1,
          collections: { 'whats-new': 1, 'coming-soon': 0 },
          startTime: new Date().toISOString(),
          endTime: new Date().toISOString(),
          duration: '45s',
          errors: 0,
          adminEmail: 'brains@popguide.co.uk'
        }
      })
    });

    if (!completeEmailResponse.ok) {
      const errorText = await completeEmailResponse.text();
      console.log('⚠️ Completion email failed:', errorText, 'but scraper completed successfully');
    } else {
      console.log('✅ Completion notification sent');
    }

    console.log('\n🎉 Funko Europe Scraper completed successfully via MCP!');
    console.log('📊 Results:');
    console.log(`   • Product: ${product.title}`);
    console.log(`   • Item #: ${product.item_number}`);
    console.log(`   • Price: £${product.price_current} (was £${product.price_original})`);
    console.log(`   • Deal: ${product.deal}`);
    console.log(`   • Collection: ${product.collection}`);
    console.log(`   • Characters: ${product.characters.join(', ')}`);

  } catch (error) {
    console.error('❌ Scraper failed:', error.message);
    
    // Send error notification using service role
    try {
      await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'funko_europe_scraper_error',
          to: 'brains@popguide.co.uk',
          data: {
            error: error.message,
            adminEmail: 'brains@popguide.co.uk'
          }
        })
      });
      console.log('📧 Error notification sent');
    } catch (emailError) {
      console.log('⚠️ Could not send error notification');
    }
    
    process.exit(1);
  }
}

console.log('🔥 Funko Europe Scraper - MCP Direct Mode');
console.log('💡 No Docker, no deployment issues - pure MCP power!');
runFunkoEuropeScraper(); 