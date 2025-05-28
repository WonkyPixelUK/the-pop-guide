import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2022-11-15',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { customer_id } = req.body;
  if (!customer_id) {
    return res.status(400).json({ error: 'Missing customer_id' });
  }
  try {
    // Fetch customer
    const customer = await stripe.customers.retrieve(customer_id);
    // Fetch invoices
    const invoices = await stripe.invoices.list({ customer: customer_id, limit: 10 });
    // Get default card
    let card = null;
    if (customer && typeof customer !== 'string' && customer.invoice_settings.default_payment_method) {
      const pm = await stripe.paymentMethods.retrieve(
        customer.invoice_settings.default_payment_method as string
      );
      if (pm && pm.card) {
        card = {
          brand: pm.card.brand,
          last4: pm.card.last4,
          exp_month: pm.card.exp_month,
          exp_year: pm.card.exp_year,
        };
      }
    }
    // Get billing address
    const billing = customer && typeof customer !== 'string' ? customer.address : null;
    // Format invoices
    const invoiceList = invoices.data.map(inv => ({
      date: new Date(inv.created * 1000).toLocaleDateString(),
      amount: inv.amount_paid / 100,
      url: inv.invoice_pdf,
      status: inv.status,
    }));
    return res.status(200).json({ billing, card, invoices: invoiceList });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
} 