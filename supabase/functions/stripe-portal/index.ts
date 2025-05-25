// @ts-ignore: Deno types for local dev
// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.6.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2022-11-15",
});

serve(async (req: Request) => {
  try {
    const { customer_id } = await req.json();
    if (!customer_id) {
      return new Response(JSON.stringify({ error: "Missing customer_id" }), { status: 400 });
    }
    const returnUrl = Deno.env.get("SITE_URL") || "https://popguide.co.uk/profile";
    const session = await stripe.billingPortal.sessions.create({
      customer: customer_id,
      return_url: returnUrl,
    });
    return new Response(JSON.stringify({ url: session.url }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}); 