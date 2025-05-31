// @supabase-auth-override public
// @ts-ignore: Deno types for local dev
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const COINBASE_API_URL = "https://api.commerce.coinbase.com";
const API_VERSION = "2018-03-22";

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { user_id, email, plan_type = 'pro' } = await req.json();
    
    if (!user_id || !email) {
      return new Response(
        JSON.stringify({ error: "Missing user_id or email" }), 
        { status: 400, headers: corsHeaders }
      );
    }

    const apiKey = Deno.env.get("COINBASE_COMMERCE_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Coinbase API key not configured" }), 
        { status: 500, headers: corsHeaders }
      );
    }

    // Get crypto pricing (5% discount from regular price)
    const regularPrice = 9.99;
    const cryptoPrice = 9.49;

    // Create Coinbase Commerce charge
    const chargeData = {
      name: `PopGuide ${plan_type.charAt(0).toUpperCase() + plan_type.slice(1)} Subscription`,
      description: `Monthly subscription to PopGuide ${plan_type} plan with 5% crypto discount`,
      pricing_type: 'fixed_price',
      local_price: {
        amount: cryptoPrice.toFixed(2),
        currency: "USD",
      },
      metadata: {
        user_id,
        email,
        plan_type,
        payment_method: "crypto",
        discount_percent: "5",
        original_price: regularPrice.toFixed(2)
      },
      redirect_url: `${Deno.env.get("SITE_URL")}/profile?crypto=success`,
      cancel_url: `${Deno.env.get("SITE_URL")}/pricing?crypto=cancel`,
    };

    console.log("Creating Coinbase charge with data:", JSON.stringify(chargeData, null, 2));

    const response = await fetch(`${COINBASE_API_URL}/charges`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CC-Api-Key': apiKey,
        'X-CC-Version': API_VERSION,
      },
      body: JSON.stringify(chargeData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Coinbase API error:", errorText);
      return new Response(
        JSON.stringify({ error: `Coinbase API error: ${errorText}` }), 
        { status: response.status, headers: corsHeaders }
      );
    }

    const result = await response.json();
    const charge = result.data;

    console.log("Coinbase charge created:", charge.id);

    // Store pending payment in database
    const { error: dbError } = await supabase.from('crypto_payments').insert({
      user_id,
      coinbase_charge_id: charge.id,
      amount_usd: cryptoPrice,
      currency: 'USD',
      status: 'pending',
      expires_at: charge.expires_at,
      metadata: chargeData.metadata,
      pricing_snapshot: charge.pricing,
    });

    if (dbError) {
      console.error("Database error:", dbError);
      return new Response(
        JSON.stringify({ error: "Failed to store payment record" }), 
        { status: 500, headers: corsHeaders }
      );
    }

    return new Response(
      JSON.stringify({ 
        checkout_url: charge.hosted_url,
        charge_id: charge.id,
        expires_at: charge.expires_at
      }), 
      { headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error) {
    console.error("Crypto checkout error:", error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 500, headers: corsHeaders }
    );
  }
}); 