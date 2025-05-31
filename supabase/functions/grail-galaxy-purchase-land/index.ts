import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from request
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const body = await req.json();
    const { position_x, position_z, size_x, size_z, land_type, price } = body;

    // Validate required fields
    if (!position_x && position_x !== 0 || !position_z && position_z !== 0 || !size_x || !size_z || !land_type || !price) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if land position is already occupied
    const { data: existingLand, error: checkError } = await supabase
      .from('virtual_lands')
      .select('id')
      .eq('position_x', position_x)
      .eq('position_z', position_z)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error checking land:', checkError);
      return new Response(
        JSON.stringify({ error: 'Failed to check land availability' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (existingLand) {
      return new Response(
        JSON.stringify({ error: 'Land position already occupied' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user's current pop coins
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('pop_coins')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error getting user profile:', profileError);
      return new Response(
        JSON.stringify({ error: 'Failed to get user profile' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const currentCoins = profile.pop_coins || 0;

    // Check if user has enough coins
    if (currentCoins < price) {
      return new Response(
        JSON.stringify({ error: 'Insufficient Pop Coins' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Start transaction by creating the land
    const { data: newLand, error: landError } = await supabase
      .from('virtual_lands')
      .insert({
        owner_id: user.id,
        position_x,
        position_z,
        size_x,
        size_z,
        land_type,
        price
      })
      .select()
      .single();

    if (landError) {
      console.error('Error creating land:', landError);
      return new Response(
        JSON.stringify({ error: 'Failed to purchase land' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update user's pop coins
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ pop_coins: currentCoins - price })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating coins:', updateError);
      // Rollback land creation
      await supabase.from('virtual_lands').delete().eq('id', newLand.id);
      return new Response(
        JSON.stringify({ error: 'Failed to update Pop Coins' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Record transaction
    const { error: transactionError } = await supabase
      .from('pop_coin_transactions')
      .insert({
        user_id: user.id,
        transaction_type: 'land_purchase',
        amount: -price,
        description: `Purchased ${land_type} land at (${position_x}, ${position_z})`,
        balance_after: currentCoins - price
      });

    if (transactionError) {
      console.error('Error recording transaction:', transactionError);
      // Transaction failed but land purchase succeeded - this is acceptable
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        land: newLand,
        new_balance: currentCoins - price
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}); 