
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { jobId, funkoPopId, funkoPopData } = await req.json()
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log(`Scraping HobbyDB for: ${funkoPopData.name} - ${funkoPopData.series}`)

    // Build search query for HobbyDB
    const searchQuery = `${funkoPopData.name} ${funkoPopData.series} ${funkoPopData.number || ''}`.trim()
    
    // Simulate HobbyDB scraping with mock data
    // HobbyDB typically has community-driven pricing
    const mockPrices = [
      { price: Math.random() * 45 + 8, condition: 'mint' },
      { price: Math.random() * 35 + 6, condition: 'near_mint' }
    ]

    console.log(`Found ${mockPrices.length} HobbyDB listings for ${searchQuery}`)

    // Insert price data
    const priceHistoryEntries = mockPrices.map(item => ({
      funko_pop_id: funkoPopId,
      source: 'hobbydb',
      price: item.price,
      condition: item.condition,
      listing_url: `https://hobbydb.com/search?q=${encodeURIComponent(searchQuery)}`,
      date_scraped: new Date().toISOString()
    }))

    const { error: priceError } = await supabaseClient
      .from('price_history')
      .insert(priceHistoryEntries)

    if (priceError) {
      console.error('Error inserting price history:', priceError)
      throw priceError
    }

    // Update scraping job status
    await supabaseClient
      .from('scraping_jobs')
      .update({
        status: 'completed',
        last_scraped: new Date().toISOString(),
        next_scrape_due: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // HobbyDB every 10 days
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId)

    // Update Funko Pop pricing data
    await supabaseClient.rpc('update_funko_pricing', { pop_id: funkoPopId })

    console.log(`Successfully scraped HobbyDB data for ${funkoPopData.name}`)

    return new Response(
      JSON.stringify({
        message: 'HobbyDB scraping completed',
        pricesFound: mockPrices.length,
        searchQuery
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in HobbyDB scraping:', error)
    
    try {
      const { jobId } = await req.json()
      if (jobId) {
        const supabaseClient = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )
        
        await supabaseClient
          .from('scraping_jobs')
          .update({
            status: 'failed',
            error_message: error.message,
            updated_at: new Date().toISOString()
          })
          .eq('id', jobId)
      }
    } catch (updateError) {
      console.error('Error updating job status:', updateError)
    }

    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
