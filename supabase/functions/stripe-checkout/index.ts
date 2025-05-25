// @ts-ignore: Deno types for local dev
// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.6.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2022-11-15",
});

serve(async (req: Request) => {
  try {
    const { user_id, email } = await req.json();
    if (!user_id || !email) {
      return new Response(JSON.stringify({ error: "Missing user_id or email" }), { status: 400 });
    }
    const priceId = Deno.env.get("STRIPE_PRICE_ID");
    if (!priceId) {
      return new Response(JSON.stringify({ error: "Missing Stripe price ID" }), { status: 500 });
    }
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer_email: email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 3,
        metadata: { user_id },
      },
      success_url: `${Deno.env.get("SITE_URL")}/profile?checkout=success`,
      cancel_url: `${Deno.env.get("SITE_URL")}/pricing?checkout=cancel`,
    });
    return new Response(JSON.stringify({ url: session.url }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}); 