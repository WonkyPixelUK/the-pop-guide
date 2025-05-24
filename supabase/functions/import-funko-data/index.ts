
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GitHubFunkoData {
  name: string;
  series: string;
  number?: string;
  exclusive?: string;
  image?: string;
  vaulted?: boolean;
  [key: string]: any;
}

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

    // Fetch data from the GitHub repository
    const githubUrl = 'https://raw.githubusercontent.com/kennymkchan/funko-pop-data/master/data/funkos.json';
    const response = await fetch(githubUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }

    const rawData: GitHubFunkoData[] = await response.json();
    console.log(`Fetched ${rawData.length} records from GitHub`);

    // Transform and filter data
    const transformedData = rawData.map(item => {
      const stickerInfo = detectStickerType(item.name, item.exclusive);
      
      return {
        name: item.name.trim(),
        series: item.series || 'Unknown Series',
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

    // Check for existing records to avoid duplicates
    const { data: existingPops } = await supabase
      .from('funko_pops')
      .select('name, series, number');

    const existingKeys = new Set(
      existingPops?.map(pop => `${pop.name}-${pop.series}-${pop.number || 'null'}`) || []
    );

    // Filter out duplicates
    const newRecords = transformedData.filter(record => {
      const key = `${record.name}-${record.series}-${record.number || 'null'}`;
      return !existingKeys.has(key);
    });

    console.log(`Found ${newRecords.length} new records to import`);

    let importedCount = 0;
    let errorCount = 0;
    const batchSize = 100;

    // Import in batches
    for (let i = 0; i < newRecords.length; i += batchSize) {
      const batch = newRecords.slice(i, i + batchSize);
      
      try {
        const { error } = await supabase
          .from('funko_pops')
          .insert(batch);

        if (error) {
          console.error(`Batch error:`, error);
          errorCount += batch.length;
        } else {
          importedCount += batch.length;
          console.log(`Imported batch ${Math.floor(i / batchSize) + 1}, total: ${importedCount}`);
        }
      } catch (batchError) {
        console.error(`Batch ${Math.floor(i / batchSize) + 1} failed:`, batchError);
        errorCount += batch.length;
      }
    }

    // Create scraping jobs for newly imported records
    if (importedCount > 0) {
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

        console.log(`Created ${scrapingJobs.length} scraping jobs`);
      }
    }

    const result = {
      success: true,
      totalFetched: rawData.length,
      newRecords: newRecords.length,
      imported: importedCount,
      errors: errorCount,
      duplicatesSkipped: transformedData.length - newRecords.length,
      message: `Successfully imported ${importedCount} new Funko Pops`
    };

    console.log('Import completed:', result);

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Import failed:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        message: 'Import failed'
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
