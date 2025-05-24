
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
    const { funkoPopId, sources = ['ebay', 'amazon', 'funko_store', 'hobbydb'] } = await req.json()
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log(`Manual scraping requested for Funko Pop: ${funkoPopId}`)
    console.log(`Sources: ${sources.join(', ')}`)

    // Get the Funko Pop data
    const { data: funkoPopData, error: funkoError } = await supabaseClient
      .from('funko_pops')
      .select('*')
      .eq('id', funkoPopId)
      .single()

    if (funkoError) {
      console.error('Error fetching Funko Pop:', funkoError)
      throw funkoError
    }

    console.log(`Found Funko Pop: ${funkoPopData.name} - ${funkoPopData.series}`)

    // Create high-priority scraping jobs for each requested source
    const jobs = []
    for (const source of sources) {
      jobs.push({
        funko_pop_id: funkoPopId,
        source,
        status: 'pending',
        next_scrape_due: new Date().toISOString() // Immediate scheduling
      })
    }

    const { error: jobError } = await supabaseClient
      .from('scraping_jobs')
      .insert(jobs)

    if (jobError) {
      console.error('Error creating manual scraping jobs:', jobError)
      throw jobError
    }

    console.log(`Created ${jobs.length} manual scraping jobs`)

    // Process the jobs immediately
    for (const source of sources) {
      try {
        // Get the job we just created
        const { data: job } = await supabaseClient
          .from('scraping_jobs')
          .select('id')
          .eq('funko_pop_id', funkoPopId)
          .eq('source', source)
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (job) {
          // Update job status to running
          await supabaseClient
            .from('scraping_jobs')
            .update({ status: 'running', updated_at: new Date().toISOString() })
            .eq('id', job.id)

          // Call the appropriate scraping function
          const functionName = `scrape-${source.replace('_', '-')}`
          
          const { error: scrapeError } = await supabaseClient.functions.invoke(functionName, {
            body: {
              jobId: job.id,
              funkoPopId: funkoPopId,
              funkoPopData: funkoPopData,
              isManual: true // Flag to indicate this is a manual scrape
            }
          })

          if (scrapeError) {
            console.error(`Error calling ${functionName}:`, scrapeError)
            
            await supabaseClient
              .from('scraping_jobs')
              .update({
                status: 'failed',
                error_message: scrapeError.message,
                updated_at: new Date().toISOString()
              })
              .eq('id', job.id)
          }
        }
      } catch (error) {
        console.error(`Error processing manual job for ${source}:`, error)
      }
    }

    return new Response(
      JSON.stringify({
        message: 'Manual scraping initiated',
        funkoPopName: funkoPopData.name,
        jobsCreated: jobs.length,
        sources: sources
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in manual scraper:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
