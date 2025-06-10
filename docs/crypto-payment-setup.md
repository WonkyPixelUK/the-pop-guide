# 🚀 Crypto Payment System Setup Guide

## 🎯 Overview

This guide will walk you through deploying the **PopGuide Crypto Payment System** that integrates with Coinbase Commerce to accept Bitcoin, Ethereum, Litecoin, and other cryptocurrencies for PopGuide Pro subscriptions.

### ✨ Features Included:
- **5% crypto discount** (users pay $9.49 instead of $9.99)
- **Multi-currency support** (BTC, ETH, LTC, BCH, USDC, etc.)
- **Real-time webhooks** for payment confirmations
- **Beautiful payment selector** component
- **Email notifications** for payment status
- **Database tracking** of all crypto payments
- **Secure API integration** with environment variables

---

## 📋 Prerequisites

- ✅ PopGuide app running on localhost:8081
- ✅ Supabase project: `pafgjwmgueerxdxtneyg`
- ✅ Coinbase Commerce account and API key: `0fa56542-5679-492b-aeda-b086f1200a9f`

---

## 🔧 Step 1: Environment Variables Setup

### 1.1 Create `.env` file in your project root:

```bash
# Coinbase Commerce API Configuration
COINBASE_COMMERCE_API_KEY=0fa56542-5679-492b-aeda-b086f1200a9f
COINBASE_COMMERCE_API_VERSION=2018-03-22
COINBASE_COMMERCE_WEBHOOK_SECRET=your_webhook_secret_here

# Crypto Pricing
CRYPTO_PRICE_USD=9.49
CRYPTO_DISCOUNT_PERCENT=5

# Site URLs
SITE_URL=http://localhost:8081
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Email function endpoint
SEND_EMAIL_ENDPOINT=https://db.popguide.co.uk/functions/v1/send-email
```

### 1.2 Add Supabase Function Environment Variables:

In your Supabase dashboard (pafgjwmgueerxdxtneyg), go to **Settings > Edge Functions** and add:

```
COINBASE_COMMERCE_API_KEY=0fa56542-5679-492b-aeda-b086f1200a9f
COINBASE_COMMERCE_WEBHOOK_SECRET=your_webhook_secret_here
SITE_URL=http://localhost:8081
SEND_EMAIL_ENDPOINT=https://db.popguide.co.uk/functions/v1/send-email
```

---

## 🗄️ Step 2: Database Migration

Run the database migration to add crypto payment support:

```bash
# Apply the migration
supabase db push
```

This will create:
- `crypto_payments` table to track all crypto transactions
- New columns in `users` table for crypto customer info
- Proper indexes and RLS policies

---

## ⚙️ Step 3: Deploy Supabase Functions

Deploy the new Edge Functions:

```bash
# Deploy crypto checkout function
supabase functions deploy crypto-checkout

# Deploy crypto webhook function  
supabase functions deploy coinbase-webhook
```

### Function URLs will be:
- **Crypto Checkout**: `https://db.popguide.co.uk/functions/v1/crypto-checkout`
- **Webhook Handler**: `https://db.popguide.co.uk/functions/v1/coinbase-webhook`

---

## 🔗 Step 4: Configure Coinbase Commerce Webhooks

### 4.1 Login to Coinbase Commerce Dashboard

1. Go to [commerce.coinbase.com](https://commerce.coinbase.com)
2. Login with your account
3. Navigate to **Settings > Webhook subscriptions**

### 4.2 Add Webhook Endpoint

- **Endpoint URL**: `https://db.popguide.co.uk/functions/v1/coinbase-webhook`
- **Events to subscribe to**:
  - ✅ `charge:confirmed`
  - ✅ `charge:failed` 
  - ✅ `charge:delayed`
  - ✅ `charge:pending`
  - ✅ `charge:resolved`

### 4.3 Get Webhook Secret

1. After creating the webhook, copy the **Webhook Secret**
2. Add it to your Supabase function environment variables:
   ```
   COINBASE_COMMERCE_WEBHOOK_SECRET=your_actual_webhook_secret_here
   ```

---

## 🎨 Step 5: Update Frontend

### 5.1 Update Routing

Add the new pricing page to your routes in `src/App.tsx`:

```tsx
import PricingNew from '@/pages/PricingNew';

// Add to your routes
<Route path="/pricing-new" element={<PricingNew />} />
```

### 5.2 Test the Payment Flow

1. Start your dev server: `npm run dev`
2. Navigate to: `http://localhost:8081/pricing-new`
3. Click "Start 3-Day Pro Trial"
4. Choose "Cryptocurrency" payment method
5. Test the Coinbase Commerce checkout flow

---

## 🧪 Step 6: Testing

### 6.1 Test with Coinbase Commerce Sandbox

1. In Coinbase Commerce dashboard, use **Test mode**
2. Create test charges to verify webhook functionality
3. Check Supabase logs to ensure payments are recorded

### 6.2 Verify Database Updates

After a test payment, check your `crypto_payments` table:

```sql
SELECT * FROM crypto_payments 
ORDER BY created_at DESC 
LIMIT 5;
```

### 6.3 Test Email Notifications

Verify that confirmation emails are sent by checking:
- Supabase function logs
- Email delivery status
- User receives both pending and confirmation emails

---

## 📊 Step 7: Production Deployment

### 7.1 Update Production URLs

When deploying to production, update:

```bash
# In production .env
SITE_URL=https://popguide.co.uk
```

### 7.2 Update Coinbase Webhook URL

Change webhook URL to:
```
https://db.popguide.co.uk/functions/v1/coinbase-webhook
```

### 7.3 Switch to Live Mode

In Coinbase Commerce:
1. Switch from **Test mode** to **Live mode**
2. Update webhook URLs if needed
3. Verify all functions work with real payments

---

## 🔒 Security Checklist

- ✅ API keys stored in environment variables (not code)
- ✅ Webhook signature verification implemented
- ✅ Database RLS policies enabled
- ✅ CORS headers properly configured
- ✅ Service role key restricted to backend only

---

## 📈 Monitoring & Analytics

### Database Queries for Monitoring:

```sql
-- Total crypto payments today
SELECT COUNT(*), SUM(amount_usd) 
FROM crypto_payments 
WHERE created_at >= CURRENT_DATE;

-- Payment status breakdown
SELECT status, COUNT(*) 
FROM crypto_payments 
GROUP BY status;

-- Users who used crypto discount
SELECT COUNT(*) 
FROM users 
WHERE crypto_discount_used = true;
```

---

## 🚨 Troubleshooting

### Common Issues:

**1. Webhooks not working:**
- Check webhook URL in Coinbase dashboard
- Verify function deployment
- Check Supabase function logs

**2. Payments not updating in database:**
- Verify webhook secret matches
- Check Supabase service role key
- Review function error logs

**3. Email notifications not sending:**
- Verify `SEND_EMAIL_ENDPOINT` environment variable
- Check email function deployment
- Review Resend API integration

### Debug Commands:

```bash
# Check function logs
supabase functions logs crypto-checkout
supabase functions logs coinbase-webhook

# Test webhook locally
curl -X POST http://localhost:54321/functions/v1/coinbase-webhook \
  -H "Content-Type: application/json" \
  -d '{"test": "webhook"}'
```

---

## 💰 Expected Results

### User Experience:
1. **Pricing Page**: Users see both traditional and crypto payment options
2. **Payment Selection**: Clear comparison with 5% crypto discount highlighted  
3. **Checkout Flow**: Redirected to secure Coinbase Commerce checkout
4. **Confirmation**: Real-time payment tracking and email notifications

### Business Impact:
- **Lower fees**: ~1% vs 2.9% for credit cards
- **Global reach**: Accept payments from anywhere
- **No chargebacks**: Irreversible crypto payments
- **Premium positioning**: Attract crypto-savvy users

---

## 🎉 Success!

Your crypto payment system is now live! Users can pay with Bitcoin, Ethereum, and other cryptocurrencies while getting a 5% discount. The system handles everything automatically from checkout to confirmation emails.

**Questions?** Check the troubleshooting section or review the function logs in Supabase.

---

*Built with ❤️ for PopGuide - The Ultimate Funko Pop Collector's App* 