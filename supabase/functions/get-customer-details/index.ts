import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { customer_id } = await req.json();

    if (!customer_id) {
      return new Response(
        JSON.stringify({ error: 'Customer ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify user is authenticated
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Verify the customer belongs to the authenticated user
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (userError || !userData || userData.stripe_customer_id !== customer_id) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Stripe
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('Stripe secret key not configured');
    }

    // Fetch customer details from Stripe
    const customerResponse = await fetch(`https://api.stripe.com/v1/customers/${customer_id}`, {
      headers: {
        'Authorization': `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (!customerResponse.ok) {
      throw new Error(`Stripe API error: ${customerResponse.status}`);
    }

    const customer = await customerResponse.json();

    // Fetch payment methods (cards) for the customer
    const paymentMethodsResponse = await fetch(`https://api.stripe.com/v1/payment_methods?customer=${customer_id}&type=card`, {
      headers: {
        'Authorization': `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    let defaultCard = null;
    if (paymentMethodsResponse.ok) {
      const paymentMethods = await paymentMethodsResponse.json();
      if (paymentMethods.data && paymentMethods.data.length > 0) {
        // Get the default payment method or the first one
        const defaultPaymentMethod = paymentMethods.data.find(pm => pm.id === customer.default_source) 
          || paymentMethods.data[0];
        
        if (defaultPaymentMethod && defaultPaymentMethod.card) {
          defaultCard = {
            last4: defaultPaymentMethod.card.last4,
            brand: defaultPaymentMethod.card.brand,
            exp_month: defaultPaymentMethod.card.exp_month,
            exp_year: defaultPaymentMethod.card.exp_year,
          };
        }
      }
    }

    // Extract billing information
    const billing = {
      email: customer.email,
      name: customer.name,
      address: customer.address,
      phone: customer.phone,
    };

    return new Response(
      JSON.stringify({ 
        billing,
        card: defaultCard,
        customer: {
          id: customer.id,
          created: customer.created,
          balance: customer.balance,
          currency: customer.currency,
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error fetching customer details:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}); 