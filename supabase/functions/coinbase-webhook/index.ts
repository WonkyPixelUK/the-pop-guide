// @ts-ignore: Deno types for local dev
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// Send email function
const sendEmail = async (type: string, to: string, data: any) => {
  try {
    await fetch(Deno.env.get("SEND_EMAIL_ENDPOINT")!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, to, data }),
    });
  } catch (error) {
    console.error("Email send error:", error);
  }
};

function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  // Note: In production, implement proper HMAC SHA256 verification
  // For now, just check if signature exists
  return !!signature;
}

serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const signature = req.headers.get("X-CC-Webhook-Signature");
    const payload = await req.text();
    const webhookSecret = Deno.env.get("COINBASE_COMMERCE_WEBHOOK_SECRET");
    
    if (!signature) {
      console.error("Missing webhook signature");
      return new Response("Missing signature", { status: 401 });
    }

    // Verify webhook signature (simplified for demo)
    if (webhookSecret && !verifyWebhookSignature(payload, signature, webhookSecret)) {
      console.error("Invalid webhook signature");
      return new Response("Invalid signature", { status: 401 });
    }

    const event = JSON.parse(payload);
    console.log("Received Coinbase webhook:", event.type, event.data?.id);

    switch (event.type) {
      case 'charge:created':
        console.log("Charge created:", event.data.id);
        break;

      case 'charge:confirmed':
        await handleChargeConfirmed(event.data);
        break;

      case 'charge:failed':
        await handleChargeFailed(event.data);
        break;

      case 'charge:delayed':
        console.log("Charge delayed (pending confirmation):", event.data.id);
        break;

      case 'charge:pending':
        console.log("Charge pending:", event.data.id);
        break;

      case 'charge:resolved':
        console.log("Charge resolved:", event.data.id);
        break;

      default:
        console.log("Unhandled webhook type:", event.type);
    }

    return new Response(JSON.stringify({ received: true }), { 
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Webhook processing error:", error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
});

async function handleChargeConfirmed(charge: any) {
  try {
    console.log("Processing confirmed charge:", charge.id);
    
    const userId = charge.metadata?.user_id;
    const email = charge.metadata?.email;
    
    if (!userId) {
      console.error("No user_id in charge metadata");
      return;
    }

    // Update crypto payment status
    const { error: paymentError } = await supabase
      .from('crypto_payments')
      .update({ 
        status: 'confirmed',
        confirmed_at: new Date().toISOString(),
        // Store the actual crypto amount and currency from the payment
        amount_crypto: charge.payments?.[0]?.value?.crypto?.amount,
        crypto_currency: charge.payments?.[0]?.value?.crypto?.currency
      })
      .eq('coinbase_charge_id', charge.id);

    if (paymentError) {
      console.error("Failed to update crypto payment:", paymentError);
      return;
    }

    // Update user subscription status
    const { error: userError } = await supabase
      .from('users')
      .update({ 
        subscription_status: 'active',
        crypto_customer_id: charge.id,
        crypto_discount_used: true,
        preferred_payment_method: 'crypto'
      })
      .eq('id', userId);

    if (userError) {
      console.error("Failed to update user subscription:", userError);
      return;
    }

    // Send confirmation email
    if (email) {
      await sendEmail("crypto_payment_success", email, {
        amount: charge.pricing?.local?.amount,
        currency: charge.pricing?.local?.currency,
        cryptoAmount: charge.payments?.[0]?.value?.crypto?.amount,
        cryptoCurrency: charge.payments?.[0]?.value?.crypto?.currency,
        chargeId: charge.id
      });
    }

    console.log("Successfully processed confirmed charge:", charge.id);
    
  } catch (error) {
    console.error("Error handling confirmed charge:", error);
  }
}

async function handleChargeFailed(charge: any) {
  try {
    console.log("Processing failed charge:", charge.id);
    
    const userId = charge.metadata?.user_id;
    
    if (!userId) {
      console.error("No user_id in charge metadata");
      return;
    }

    // Update crypto payment status
    const { error: paymentError } = await supabase
      .from('crypto_payments')
      .update({ 
        status: 'failed'
      })
      .eq('coinbase_charge_id', charge.id);

    if (paymentError) {
      console.error("Failed to update crypto payment:", paymentError);
      return;
    }

    console.log("Successfully processed failed charge:", charge.id);
    
  } catch (error) {
    console.error("Error handling failed charge:", error);
  }
} 