import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface FunkoData {
  name: string;
  series: string;
  number?: string;
  exclusive?: string;
  image?: string;
  vaulted?: boolean;
  [key: string]: any;
}

// Expanded sample data as fallback
const sampleFunkoData: FunkoData[] = [
  {
    name: "Spider-Man",
    series: "Marvel",
    number: "1",
    exclusive: "",
    image: "",
    vaulted: false
  },
  {
    name: "Batman",
    series: "DC Comics",
    number: "1",
    exclusive: "",
    image: "",
    vaulted: false
  },
  {
    name: "Deadpool",
    series: "Marvel",
    number: "20",
    exclusive: "Hot Topic",
    image: "",
    vaulted: false
  },
  {
    name: "Wonder Woman",
    series: "DC Comics",
    number: "3",
    exclusive: "SDCC",
    image: "",
    vaulted: false
  },
  {
    name: "Captain America",
    series: "Marvel",
    number: "6",
    exclusive: "",
    image: "",
    vaulted: true
  },
  {
    name: "Harley Quinn",
    series: "DC Comics",
    number: "12",
    exclusive: "Hot Topic",
    image: "",
    vaulted: false
  },
  {
    name: "Thor",
    series: "Marvel",
    number: "8",
    exclusive: "Funko Shop",
    image: "",
    vaulted: false
  },
  {
    name: "The Flash",
    series: "DC Comics",
    number: "10",
    exclusive: "",
    image: "",
    vaulted: false
  },
  {
    name: "Wolverine",
    series: "Marvel",
    number: "05",
    exclusive: "X-Men",
    image: "",
    vaulted: true
  },
  {
    name: "Aquaman",
    series: "DC Comics",
    number: "87",
    exclusive: "",
    image: "",
    vaulted: false
  }
];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Starting Funko Pop data import...');

    // Updated list with the working URL first
    const possibleUrls = [
      // WORKING URL - User provided this one!
      'https://raw.githubusercontent.com/kennymkchan/funko-pop-data/refs/heads/master/funko_pop.json',
      // Alternative branch references for the same repo
      'https://raw.githubusercontent.com/kennymkchan/funko-pop-data/master/funko_pop.json',
      'https://raw.githubusercontent.com/kennymkchan/funko-pop-data/main/funko_pop.json',
      // Original attempts with different file names
      'https://raw.githubusercontent.com/kennymkchan/funko-pop-data/master/data/funkos.json',
      'https://raw.githubusercontent.com/kennymkchan/funko-pop-data/main/data/funkos.json',
      'https://raw.githubusercontent.com/kennymkchan/funko-pop-data/master/funkos.json',
      'https://raw.githubusercontent.com/kennymkchan/funko-pop-data/main/funkos.json',
      'https://raw.githubusercontent.com/kennymkchan/funko-pop-data/master/data.json',
      'https://raw.githubusercontent.com/kennymkchan/funko-pop-data/main/data.json',
      // Alternative repos
      'https://raw.githubusercontent.com/funko-pops/database/main/data.json',
      'https://raw.githubusercontent.com/funko-collector/data/master/funkos.json'
    ];

    let rawData: FunkoData[] = [];
    let successfulUrl = '';
    let usedSampleData = false;

    // Try each URL until one works
    for (const url of possibleUrls) {
      try {
        console.log(`🔍 Attempting to fetch from: ${url}`);
        const response = await fetch(url);
        
        console.log(`📊 Response status: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
          const contentType = response.headers.get('content-type') || '';
          console.log(`📄 Content-Type: ${contentType}`);
          
          const responseText = await response.text();
          console.log(`📏 Response text length: ${responseText.length}`);
          
          if (responseText.length < 500) {
            console.log(`📝 Full response text: ${responseText}`);
          } else {
            console.log(`📝 First 500 chars: ${responseText.substring(0, 500)}`);
          }
          
          try {
            const data = JSON.parse(responseText);
            console.log(`🔧 Parsed data type: ${typeof data}`);
            console.log(`📋 Is array: ${Array.isArray(data)}`);
            
            if (Array.isArray(data) && data.length > 0) {
              console.log(`📊 Array length: ${data.length}`);
              console.log(`🔑 First item keys: ${Object.keys(data[0]).join(', ')}`);
              console.log(`📄 First item sample:`, JSON.stringify(data[0], null, 2));
              
              rawData = data;
              successfulUrl = url;
              console.log(`✅ Successfully fetched ${rawData.length} records from: ${url}`);
              break;
            } else if (data && typeof data === 'object') {
              // Check for common data wrapper patterns
              const possibleDataKeys = ['data', 'items', 'funkos', 'results', 'pops', 'funko_pops'];
              for (const key of possibleDataKeys) {
                if (data[key] && Array.isArray(data[key]) && data[key].length > 0) {
                  console.log(`📊 Found data array in '${key}' property, length: ${data[key].length}`);
                  console.log(`🔑 First item keys: ${Object.keys(data[key][0]).join(', ')}`);
                  rawData = data[key];
                  successfulUrl = url;
                  console.log(`✅ Successfully fetched ${rawData.length} records from ${key} property: ${url}`);
                  break;
                }
              }
              if (rawData.length > 0) break;
            }
            
            console.log(`⚠️ Data found but not in expected format for ${url}`);
          } catch (parseError) {
            console.log(`❌ JSON parse error for ${url}:`, parseError.message);
          }
        } else {
          console.log(`❌ HTTP ${response.status}: ${response.statusText} for ${url}`);
        }
      } catch (urlError) {
        console.log(`❌ Network error for ${url}:`, urlError.message);
        continue;
      }
    }

    // If no URLs worked, use expanded sample data
    if (rawData.length === 0) {
      console.log('⚠️ No external data source available, using expanded sample data');
      rawData = sampleFunkoData;
      usedSampleData = true;
      successfulUrl = 'Expanded Sample Data';
    }

    console.log(`🎯 Final dataset size: ${rawData.length} records`);

    // Check what's currently in the database for debugging
    const { data: existingPops, error: existingError } = await supabase
      .from('funko_pops')
      .select('name, series, number')
      .limit(10);

    if (existingError) {
      console.error('Error fetching existing pops:', existingError);
    } else {
      console.log(`📚 Current database has records (showing first 10 of existing data)`);
      if (existingPops && existingPops.length > 0) {
        existingPops.forEach((pop, index) => {
          console.log(`  ${index + 1}. ${pop.name} - ${pop.series} #${pop.number || 'N/A'}`);
        });
      }
    }

    // Transform and filter data
    const transformedData = rawData.map(item => {
      const stickerInfo = detectStickerType(item.name, item.exclusive);
      
      return {
        name: item.name?.trim() || 'Unknown',
        series: item.series?.trim() || 'Unknown Series',
        number: item.number?.toString() || null,
        description: null,
        image_url: item.image || null,
        release_date: null,
        is_exclusive: !!item.exclusive,
        exclusive_to: item.exclusive || null,
        is_vaulted: !!item.vaulted,
        is_chase: stickerInfo.isChase,
        is_stickered: stickerInfo.isStickered,
        sticker_type: stickerInfo.stickerType,
        sticker_multiplier: stickerInfo.multiplier,
        variant: null,
        estimated_value: null,
        average_price_30d: null,
        price_trend: null,
        data_sources: [],
        last_price_update: null,
      };
    });

    console.log(`🔄 Transformed ${transformedData.length} records`);

    // Check for existing records to avoid duplicates
    const { data: allExistingPops } = await supabase
      .from('funko_pops')
      .select('name, series, number');

    const existingKeys = new Set(
      allExistingPops?.map(pop => `${pop.name}-${pop.series}-${pop.number || 'null'}`) || []
    );

    console.log(`🔍 Found ${existingKeys.size} existing unique combinations in database`);

    // Filter out duplicates and log what we're checking
    const newRecords = transformedData.filter(record => {
      const key = `${record.name}-${record.series}-${record.number || 'null'}`;
      const isDuplicate = existingKeys.has(key);
      if (isDuplicate) {
        console.log(`⏭️ Skipping duplicate: ${key}`);
      } else {
        console.log(`✨ New record: ${key}`);
      }
      return !isDuplicate;
    });

    console.log(`📊 Found ${newRecords.length} new records to import out of ${transformedData.length} total`);

    let importedCount = 0;
    let errorCount = 0;
    const batchSize = 100;

    // Import in batches with progress logging
    for (let i = 0; i < newRecords.length; i += batchSize) {
      const batch = newRecords.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(newRecords.length / batchSize);
      
      console.log(`🚀 Processing batch ${batchNumber}/${totalBatches} (${batch.length} records)`);
      
      try {
        const { error } = await supabase
          .from('funko_pops')
          .insert(batch);

        if (error) {
          console.error(`❌ Batch ${batchNumber} error:`, error);
          errorCount += batch.length;
        } else {
          importedCount += batch.length;
          console.log(`✅ Batch ${batchNumber}/${totalBatches} completed, total imported: ${importedCount}`);
        }
      } catch (batchError) {
        console.error(`❌ Batch ${batchNumber} failed:`, batchError);
        errorCount += batch.length;
      }
    }

    // Create scraping jobs for newly imported records
    if (importedCount > 0) {
      console.log(`🎯 Creating scraping jobs for ${importedCount} newly imported records...`);
      
      const { data: newlyInsertedPops } = await supabase
        .from('funko_pops')
        .select('id')
        .gte('created_at', new Date(Date.now() - 60000).toISOString()); // Last minute

      if (newlyInsertedPops && newlyInsertedPops.length > 0) {
        const scrapingJobs = [];
        const sources = ['ebay', 'amazon', 'funko_store', 'hobbydb'];

        for (const pop of newlyInsertedPops) {
          for (const source of sources) {
            scrapingJobs.push({
              funko_pop_id: pop.id,
              source,
              status: 'pending',
              next_scrape_due: new Date(),
            });
          }
        }

        // Insert scraping jobs in batches
        for (let i = 0; i < scrapingJobs.length; i += batchSize) {
          const jobBatch = scrapingJobs.slice(i, i + batchSize);
          await supabase.from('scraping_jobs').insert(jobBatch);
        }

        console.log(`🎯 Created ${scrapingJobs.length} scraping jobs for price tracking`);
      }
    }

    const result = {
      success: true,
      totalFetched: rawData.length,
      newRecords: newRecords.length,
      imported: importedCount,
      errors: errorCount,
      duplicatesSkipped: transformedData.length - newRecords.length,
      message: usedSampleData 
        ? `Successfully imported ${importedCount} new Funko Pops using expanded sample data (external source unavailable)`
        : `🎉 BIG IMPORT SUCCESS! Imported ${importedCount} new Funko Pops from ${successfulUrl}`,
      dataSource: successfulUrl,
      usedSampleData,
      debugInfo: {
        existingDatabaseSize: allExistingPops?.length || 0,
        attempedUrls: possibleUrls.length,
        dataFormat: rawData.length > 0 ? Object.keys(rawData[0]) : [],
        workingUrl: successfulUrl,
        batchesProcessed: Math.ceil(newRecords.length / batchSize)
      }
    };

    console.log('📋 Import completed:', result);

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('💥 Import failed:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        message: 'Import failed - please check the logs for details',
        totalFetched: 0,
        newRecords: 0,
        imported: 0,
        errors: 0,
        duplicatesSkipped: 0
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

function detectStickerType(name: string, exclusive?: string): {
  isStickered: boolean;
  stickerType: string | null;
  multiplier: number;
  isChase: boolean;
} {
  const nameUpper = name.toUpperCase();
  const exclusiveUpper = exclusive?.toUpperCase() || '';
  
  // Check for Chase variants
  if (nameUpper.includes('CHASE') || nameUpper.includes('VARIANT')) {
    return {
      isStickered: true,
      stickerType: 'CHASE',
      multiplier: 4.0,
      isChase: true
    };
  }

  // Check for convention exclusives
  if (nameUpper.includes('SDCC') || exclusiveUpper.includes('SAN DIEGO COMIC CON')) {
    return {
      isStickered: true,
      stickerType: 'SDCC',
      multiplier: 3.5,
      isChase: false
    };
  }

  if (nameUpper.includes('NYCC') || exclusiveUpper.includes('NEW YORK COMIC CON')) {
    return {
      isStickered: true,
      stickerType: 'NYCC',
      multiplier: 3.0,
      isChase: false
    };
  }

  if (nameUpper.includes('ECCC') || exclusiveUpper.includes('EMERALD CITY COMIC CON')) {
    return {
      isStickered: true,
      stickerType: 'ECCC',
      multiplier: 2.8,
      isChase: false
    };
  }

  // Check for store exclusives
  if (exclusiveUpper.includes('FUNKO SHOP') || nameUpper.includes('FUNKO SHOP')) {
    return {
      isStickered: true,
      stickerType: 'FUNKO SHOP',
      multiplier: 2.5,
      isChase: false
    };
  }

  if (exclusiveUpper.includes('HOT TOPIC') || nameUpper.includes('HOT TOPIC')) {
    return {
      isStickered: true,
      stickerType: 'HOT TOPIC',
      multiplier: 1.8,
      isChase: false
    };
  }

  if (exclusiveUpper.includes('GAMESTOP') || nameUpper.includes('GAMESTOP')) {
    return {
      isStickered: true,
      stickerType: 'GAMESTOP',
      multiplier: 1.6,
      isChase: false
    };
  }

  if (exclusiveUpper.includes('TARGET') || nameUpper.includes('TARGET')) {
    return {
      isStickered: true,
      stickerType: 'TARGET',
      multiplier: 1.5,
      isChase: false
    };
  }

  if (exclusiveUpper.includes('WALMART') || nameUpper.includes('WALMART')) {
    return {
      isStickered: true,
      stickerType: 'WALMART',
      multiplier: 1.4,
      isChase: false
    };
  }

  if (exclusiveUpper.includes('BARNES') || nameUpper.includes('BARNES')) {
    return {
      isStickered: true,
      stickerType: 'BARNES & NOBLE',
      multiplier: 1.7,
      isChase: false
    };
  }

  // Check if it's any kind of exclusive but not specifically categorized
  if (exclusive && exclusive.trim() !== '') {
    return {
      isStickered: true,
      stickerType: 'EXCLUSIVE',
      multiplier: 1.5,
      isChase: false
    };
  }

  // No sticker detected
  return {
    isStickered: false,
    stickerType: null,
    multiplier: 1.0,
    isChase: false
  };
}
