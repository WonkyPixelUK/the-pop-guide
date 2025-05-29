import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

async function updateCollectionValues() {
  // Get all users
  const { data: users, error: userError } = await supabaseClient.from('profiles').select('id, last_collection_value')
  if (userError) throw userError

  for (const user of users) {
    // Get all owned Pops for user
    const { data: collection, error: collError } = await supabaseClient
      .from('user_collections')
      .select('id, funko_pop_id, last_value')
      .eq('user_id', user.id)
    if (collError) continue

    let totalValue = 0
    for (const item of collection) {
      // Get latest value for this Pop
      const { data: pop, error: popError } = await supabaseClient
        .from('funko_pops')
        .select('estimated_value')
        .eq('id', item.funko_pop_id)
        .single()
      if (popError) continue
      const newValue = pop.estimated_value || 0
      totalValue += newValue
      // Update user_collections with value and change
      const valueChange = item.last_value !== null && item.last_value !== undefined ? newValue - item.last_value : 0
      await supabaseClient.from('user_collections').update({
        last_value: newValue,
        last_value_updated: new Date().toISOString(),
        last_value_change: valueChange
      }).eq('id', item.id)
    }
    // Update profile with collection value and change
    const valueChange = user.last_collection_value !== null && user.last_collection_value !== undefined ? totalValue - user.last_collection_value : 0
    await supabaseClient.from('profiles').update({
      last_collection_value: totalValue,
      last_collection_value_updated: new Date().toISOString(),
      last_collection_value_change: valueChange
    }).eq('id', user.id)
  }
}

Deno.serve(async (req) => {
  try {
    await updateCollectionValues()
    return new Response(JSON.stringify({ success: true }), { status: 200 })
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 })
  }
}) 