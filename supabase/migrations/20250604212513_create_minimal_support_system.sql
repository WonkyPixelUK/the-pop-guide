-- Create custom types for the support system
CREATE TYPE IF NOT EXISTS support_category AS ENUM (
  'bug_report',
  'feature_request', 
  'account_issue',
  'payment_billing',
  'technical_support',
  'data_issue',
  'api_support',
  'mobile_app',
  'chrome_extension',
  'general_inquiry',
  'retailer_support',
  'subscription_help'
);

CREATE TYPE IF NOT EXISTS support_priority AS ENUM ('low', 'medium', 'high', 'urgent');

CREATE TYPE IF NOT EXISTS support_status AS ENUM (
  'new', 
  'open', 
  'pending', 
  'resolved', 
  'closed', 
  'escalated'
);

CREATE TYPE IF NOT EXISTS support_source AS ENUM (
  'web_form', 
  'email', 
  'auto_bug', 
  'auto_feature', 
  'api', 
  'chat',
  'dashboard'
);

-- Main support tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_number VARCHAR(20) UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  guest_email VARCHAR(255),
  guest_name VARCHAR(255),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category support_category NOT NULL,
  priority support_priority NOT NULL DEFAULT 'medium',
  status support_status NOT NULL DEFAULT 'new',
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  source support_source NOT NULL,
  attachments TEXT[],
  tags VARCHAR[],
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  closed_at TIMESTAMP WITH TIME ZONE,
  first_response_at TIMESTAMP WITH TIME ZONE,
  customer_satisfaction_rating INTEGER CHECK (customer_satisfaction_rating >= 1 AND customer_satisfaction_rating <= 5),
  customer_feedback TEXT,
  
  -- Constraints
  CONSTRAINT valid_guest_contact CHECK (
    (user_id IS NOT NULL) OR 
    (guest_email IS NOT NULL AND guest_name IS NOT NULL)
  )
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_category ON support_tickets(category);
CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON support_tickets(created_at);
CREATE INDEX IF NOT EXISTS idx_support_tickets_ticket_number ON support_tickets(ticket_number);

-- Enable RLS (Row Level Security)
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY IF NOT EXISTS "Users can view own tickets" ON support_tickets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can create tickets" ON support_tickets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update own tickets" ON support_tickets
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Grant permissions for authenticated users
GRANT SELECT, INSERT, UPDATE ON support_tickets TO authenticated;

-- Grant permissions for service role (for functions)
GRANT ALL ON support_tickets TO service_role;
