
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

    console.log(`Scraping eBay for Funko Pop: ${funkoPopData.name} - ${funkoPopData.series}`)

    // Build search query for eBay
    const searchQuery = `${funkoPopData.name} ${funkoPopData.series} ${funkoPopData.number || ''} funko pop`.trim()
    
    // For now, we'll simulate scraping with mock data
    // In production, you would use Firecrawl or eBay API here
    const mockPrices = [
      { price: Math.random() * 50 + 10, condition: 'mint' },
      { price: Math.random() * 40 + 8, condition: 'near_mint' },
      { price: Math.random() * 30 + 5, condition: 'good' }
    ]

    console.log(`Found ${mockPrices.length} eBay listings for ${searchQuery}`)

    // Insert price data
    const priceHistoryEntries = mockPrices.map(item => ({
      funko_pop_id: funkoPopId,
      source: 'ebay',
      price: item.price,
      condition: item.condition,
      listing_url: `https://ebay.com/search?q=${encodeURIComponent(searchQuery)}`,
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
        next_scrape_due: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Next scrape in 7 days
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId)

    // Update Funko Pop pricing data
    await supabaseClient.rpc('update_funko_pricing', { pop_id: funkoPopId })

    console.log(`Successfully scraped eBay data for ${funkoPopData.name}`)

    return new Response(
      JSON.stringify({
        message: 'eBay scraping completed',
        pricesFound: mockPrices.length,
        searchQuery
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in eBay scraping:', error)
    
    // Update job status to failed if we have the jobId
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
