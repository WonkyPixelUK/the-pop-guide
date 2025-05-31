-- Add crypto payment columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS crypto_customer_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_payment_method TEXT DEFAULT 'stripe';
ALTER TABLE users ADD COLUMN IF NOT EXISTS crypto_discount_used BOOLEAN DEFAULT FALSE;

-- Create crypto_payments table
CREATE TABLE IF NOT EXISTS crypto_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  coinbase_charge_id TEXT UNIQUE NOT NULL,
  amount_usd DECIMAL(10,2) NOT NULL,
  amount_crypto DECIMAL(20,8),
  currency TEXT NOT NULL,
  crypto_currency TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'failed', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  pricing_snapshot JSONB,
  UNIQUE(coinbase_charge_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_crypto_payments_user_id ON crypto_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_crypto_payments_status ON crypto_payments(status);
CREATE INDEX IF NOT EXISTS idx_crypto_payments_created_at ON crypto_payments(created_at);

-- Add RLS policies
ALTER TABLE crypto_payments ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own payments
CREATE POLICY "Users can view own crypto payments" ON crypto_payments
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Service role can do everything
CREATE POLICY "Service role can manage crypto payments" ON crypto_payments
  FOR ALL USING (auth.role() = 'service_role'); 