// @ts-ignore: Deno types for local dev
// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.6.0?target=deno";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from "npm:resend@2.0.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2022-11-15",
});
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const sendEmail = async (type: string, to: string, data: any) => {
  await fetch(Deno.env.get("SEND_EMAIL_ENDPOINT")!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, to, data }),
  });
};

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
    const customer_id = subscription.customer;
    const user_id = subscription.metadata?.user_id;
    const subscription_type = subscription.metadata?.subscription_type || 'pro';
    const tier = subscription.metadata?.tier;
    
    if (user_id) {
      let status = subscription.status;
      
      if (subscription_type === 'retailer') {
        // Handle retailer subscriptions
        await supabase
          .from("profiles")
          .update({ 
            retailer_subscription_status: status,
            retailer_tier: tier,
            is_retailer: true
          })
          .eq("stripe_customer_id", customer_id);
          
        // Update retailer profile
        await supabase
          .from("retailer_profiles")
          .update({ 
            retailer_status: status === 'active' ? 'active' : 'pending',
            retailer_tier: tier,
            stripe_retailer_subscription_id: subscription.id
          })
          .eq("user_id", user_id);
          
        // Send retailer welcome email on new active subscription
        if (event.type === "customer.subscription.created" && status === "active") {
          const { data: userData } = await supabase.from("profiles").select("email, full_name").eq("stripe_customer_id", customer_id).single();
          if (userData?.email) {
            await sendEmail("retailer_welcome", userData.email, { 
              fullName: userData.full_name,
              tier: tier 
            });
          }
        }
      } else {
        // Handle regular Pro subscriptions
        await supabase
          .from("profiles")
          .update({ subscription_status: status })
          .eq("stripe_customer_id", customer_id);
          
        // Send pro_welcome email on new active/trialing subscription
        if (event.type === "customer.subscription.created" && (status === "active" || status === "trialing")) {
          const { data: userData } = await supabase.from("profiles").select("email, full_name").eq("stripe_customer_id", customer_id).single();
          if (userData?.email) {
            await sendEmail("pro_welcome", userData.email, { fullName: userData.full_name });
          }
        }
      }
      
      // Store customer_id if not already present
      if (customer_id) {
        await supabase
          .from("profiles")
          .update({ stripe_customer_id: customer_id })
          .eq("id", user_id)
          .is("stripe_customer_id", null);
      }
    }
  }
  // Send invoice_reminder 7 days before payment
  if (event.type === "invoice.upcoming") {
    const invoice = event.data.object;
    const customer_id = invoice.customer;
    // Find user by customer_id
    const { data: userData } = await supabase.from("profiles").select("email, full_name").eq("stripe_customer_id", customer_id).single();
    if (userData?.email) {
      await sendEmail("invoice_reminder", userData.email, {
        fullName: userData.full_name,
        renewalDate: new Date(invoice.next_payment_attempt * 1000).toLocaleDateString(),
        amount: `$${(invoice.amount_due / 100).toFixed(2)}`,
      });
    }
  }
  // Send payment_receipt on invoice.paid
  if (event.type === "invoice.paid") {
    const invoice = event.data.object;
    const customer_id = invoice.customer;
    const { data: userData } = await supabase.from("profiles").select("email, full_name").eq("stripe_customer_id", customer_id).single();
    if (userData?.email) {
      await sendEmail("payment_receipt", userData.email, {
        fullName: userData.full_name,
        amount: `$${(invoice.amount_paid / 100).toFixed(2)}`,
        invoiceNumber: invoice.number,
        date: new Date(invoice.status_transitions.paid_at * 1000).toLocaleDateString(),
      });
    }
  }
  return new Response(JSON.stringify({ received: true }), { status: 200 });
}); 