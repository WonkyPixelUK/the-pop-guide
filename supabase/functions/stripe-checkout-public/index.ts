// @supabase-auth-override public
// @ts-ignore: Deno types for local dev
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
const STRIPE_PRICE_ID = Deno.env.get("STRIPE_PRICE_ID");
const SITE_URL = Deno.env.get("SITE_URL");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  try {
    const { email } = await req.json();
    if (!email) {
      return new Response(JSON.stringify({ error: "Missing email" }), { status: 400, headers: corsHeaders });
    }
    if (!STRIPE_SECRET_KEY || !STRIPE_PRICE_ID || !SITE_URL) {
      return new Response(JSON.stringify({ error: "Missing Stripe environment variables" }), { status: 500, headers: corsHeaders });
    }
    const sessionRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        "payment_method_types[0]": "card",
        mode: "subscription",
        customer_email: email,
        "line_items[0][price]": STRIPE_PRICE_ID,
        "line_items[0][quantity]": "1",
        "subscription_data[trial_period_days]": "3",
        success_url: `${SITE_URL}/profile?checkout=success`,
        cancel_url: `${SITE_URL}/pricing?checkout=cancel`,
      }),
    });
    const session = await sessionRes.json();
    if (session.url) {
      return new Response(JSON.stringify({ url: session.url }), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    } else {
      return new Response(JSON.stringify({ error: session.error?.message || "Stripe error" }), {
        status: 500,
        headers: corsHeaders,
      });
    }
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
  }
}); 