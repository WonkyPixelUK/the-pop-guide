// Test script for the scheduled Funko Europe scraper
const SUPABASE_URL = 'https://db.popguide.co.uk';
const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/scheduled-funko-europe-scraper`;

async function testScheduledScraper() {
  console.log('🧪 Testing Scheduled Funko Europe Scraper...');
  console.log(`📡 Calling: ${FUNCTION_URL}`);

  const startTime = Date.now();

  try {
    const response = await fetch(FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhZmdqd21ndWVlcnhkeHRuZXlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwODgxODIsImV4cCI6MjA2MzY2NDE4Mn0.YInSl_Ct_ZM_fyZ1j2rgNQFacHDGTjg64vJGTtSb9FI'}`
      },
      body: JSON.stringify({
        // Empty body as this is triggered by schedule, not request data
      })
    });

    const duration = Date.now() - startTime;
    console.log(`⏱️ Request completed in ${Math.round(duration / 1000)}s`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Scheduled scraper completed successfully!');
      console.log('📊 Results:', {
        totalScraped: result.results.totalScraped,
        newProducts: result.results.newProducts,
        updatedProducts: result.results.updatedProducts,
        errors: result.results.errors,
        duration: result.results.duration,
        collections: result.results.collections
      });
      
      console.log('\n🎯 Collection Breakdown:');
      console.log(`   📦 What's New: ${result.results.collections['whats-new']} products`);
      console.log(`   🔮 Coming Soon: ${result.results.collections['coming-soon']} products`);
      
      if (result.results.errors > 0) {
        console.log(`\n⚠️ Note: ${result.results.errors} error(s) occurred during processing`);
      }
      
    } else {
      throw new Error(result.error || 'Unknown error');
    }

  } catch (error) {
    console.error('❌ Scheduled scraper test failed:', error.message);
    
    if (error.message.includes('fetch')) {
      console.log('\n💡 Troubleshooting:');
      console.log('   - Check if the Supabase edge function is deployed');
      console.log('   - Verify the function URL is correct');
      console.log('   - Ensure you have internet connectivity');
    }
    
    process.exit(1);
  }
}

console.log('🚀 Starting Scheduled Funko Europe Scraper Test\n');
testScheduledScraper(); 