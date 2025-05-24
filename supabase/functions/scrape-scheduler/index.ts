
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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Starting scraping scheduler...')

    // Get Funko Pops that need price updates (haven't been scraped in 24 hours)
    const { data: funkoPops, error: funkoError } = await supabaseClient
      .from('funko_pops')
      .select('id, name, series, number')
      .or(`last_price_update.is.null,last_price_update.lt.${new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()}`)
      .limit(50) // Limit to prevent overwhelming

    if (funkoError) {
      console.error('Error fetching Funko Pops:', funkoError)
      throw funkoError
    }

    console.log(`Found ${funkoPops?.length || 0} Funko Pops needing price updates`)

    // Create scraping jobs for each source
    const sources = ['ebay', 'amazon', 'funko_store', 'hobbydb']
    const jobs = []

    for (const pop of funkoPops || []) {
      for (const source of sources) {
        // Check if there's already a pending job for this pop and source
        const { data: existingJob } = await supabaseClient
          .from('scraping_jobs')
          .select('id')
          .eq('funko_pop_id', pop.id)
          .eq('source', source)
          .eq('status', 'pending')
          .single()

        if (!existingJob) {
          jobs.push({
            funko_pop_id: pop.id,
            source,
            status: 'pending',
            next_scrape_due: new Date().toISOString()
          })
        }
      }
    }

    if (jobs.length > 0) {
      const { error: jobError } = await supabaseClient
        .from('scraping_jobs')
        .insert(jobs)

      if (jobError) {
        console.error('Error creating scraping jobs:', jobError)
        throw jobError
      }

      console.log(`Created ${jobs.length} new scraping jobs`)
    }

    // Process pending jobs (limit to 10 at a time to avoid rate limits)
    const { data: pendingJobs, error: pendingError } = await supabaseClient
      .from('scraping_jobs')
      .select(`
        id,
        funko_pop_id,
        source,
        funko_pops(name, series, number)
      `)
      .eq('status', 'pending')
      .lte('next_scrape_due', new Date().toISOString())
      .limit(10)

    if (pendingError) {
      console.error('Error fetching pending jobs:', pendingError)
      throw pendingError
    }

    console.log(`Processing ${pendingJobs?.length || 0} pending jobs`)

    // Process each job
    for (const job of pendingJobs || []) {
      try {
        // Update job status to running
        await supabaseClient
          .from('scraping_jobs')
          .update({ status: 'running', updated_at: new Date().toISOString() })
          .eq('id', job.id)

        // Call the appropriate scraping function based on source
        const functionName = `scrape-${job.source.replace('_', '-')}`
        
        const { error: scrapeError } = await supabaseClient.functions.invoke(functionName, {
          body: {
            jobId: job.id,
            funkoPopId: job.funko_pop_id,
            funkoPopData: job.funko_pops
          }
        })

        if (scrapeError) {
          console.error(`Error calling ${functionName}:`, scrapeError)
          
          // Update job status to failed
          await supabaseClient
            .from('scraping_jobs')
            .update({
              status: 'failed',
              error_message: scrapeError.message,
              retry_count: job.retry_count + 1,
              next_scrape_due: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // Retry in 1 hour
              updated_at: new Date().toISOString()
            })
            .eq('id', job.id)
        }
      } catch (error) {
        console.error(`Error processing job ${job.id}:`, error)
      }
    }

    return new Response(
      JSON.stringify({
        message: 'Scraping scheduler completed',
        funkoPopCount: funkoPops?.length || 0,
        jobsCreated: jobs.length,
        jobsProcessed: pendingJobs?.length || 0
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in scraping scheduler:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
