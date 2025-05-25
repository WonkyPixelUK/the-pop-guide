// @ts-ignore: Deno types for local dev
// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.6.0?target=deno";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2022-11-15",
});
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req: Request) => {
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!sig || !webhookSecret) {
    return new Response("Missing signature or webhook secret", { status: 400 });
  }
  const body = await req.text();
  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }
  // Handle subscription events
  if (
    event.type === "customer.subscription.created" ||
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    const subscription = event.data.object;
    const user_id = subscription.metadata?.user_id;
    const customer_id = subscription.customer;
    if (user_id) {
      let status = subscription.status;
      // Update subscription status
      await supabase
        .from("users")
        .update({ subscription_status: status })
        .eq("id", user_id);
      // Store customer_id if not already present
      if (customer_id) {
        await supabase
          .from("users")
          .update({ stripe_customer_id: customer_id })
          .eq("id", user_id)
          .is("stripe_customer_id", null);
      }
    }
  }
  return new Response(JSON.stringify({ received: true }), { status: 200 });
}); 