-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types for the support system
CREATE TYPE support_category AS ENUM (
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

CREATE TYPE support_priority AS ENUM ('low', 'medium', 'high', 'urgent');

CREATE TYPE support_status AS ENUM (
  'new', 
  'open', 
  'pending', 
  'resolved', 
  'closed', 
  'escalated'
);

CREATE TYPE support_source AS ENUM (
  'web_form', 
  'email', 
  'auto_bug', 
  'auto_feature', 
  'api', 
  'chat',
  'dashboard'
);

CREATE TYPE support_platform AS ENUM (
  'web_app', 
  'ios_app', 
  'android_app', 
  'chrome_extension', 
  'api'
);

CREATE TYPE support_activity_type AS ENUM (
  'created', 
  'status_changed', 
  'priority_changed', 
  'assigned', 
  'unassigned', 
  'category_changed', 
  'response_added', 
  'resolved', 
  'closed', 
  'reopened'
);

CREATE TYPE feature_status AS ENUM (
  'submitted', 
  'under_review', 
  'approved', 
  'in_development', 
  'testing', 
  'released', 
  'rejected'
);

-- Main support tickets table
CREATE TABLE support_tickets (
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
  platform support_platform,
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

-- Ticket responses/comments
CREATE TABLE support_ticket_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name VARCHAR(255), -- For staff responses
  author_email VARCHAR(255),
  is_staff BOOLEAN DEFAULT FALSE,
  message TEXT NOT NULL,
  attachments TEXT[],
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_internal BOOLEAN DEFAULT FALSE, -- Internal notes not visible to customers
  
  -- Constraints
  CONSTRAINT valid_response_author CHECK (
    (user_id IS NOT NULL) OR 
    (author_name IS NOT NULL AND author_email IS NOT NULL)
  )
);

-- Ticket activity log
CREATE TABLE support_ticket_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  activity_type support_activity_type NOT NULL,
  description TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feature requests (integrated with support tickets)
CREATE TABLE feature_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  requested_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  votes INTEGER DEFAULT 0,
  status feature_status DEFAULT 'submitted',
  estimated_effort VARCHAR(50),
  planned_release VARCHAR(50),
  implementation_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feature request votes
CREATE TABLE feature_request_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  feature_request_id UUID REFERENCES feature_requests(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one vote per user per feature
  UNIQUE(feature_request_id, user_id)
);

-- Support escalation rules
CREATE TABLE support_escalation_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  conditions JSONB NOT NULL, -- JSON conditions for triggering escalation
  actions JSONB NOT NULL, -- JSON actions to take when escalated
  is_active BOOLEAN DEFAULT TRUE,
  priority INTEGER DEFAULT 0, -- Higher priority rules are checked first
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Knowledge base articles
CREATE TABLE support_articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  category support_category,
  tags VARCHAR[],
  is_published BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Support team members
CREATE TABLE support_team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  role VARCHAR(50) NOT NULL DEFAULT 'agent', -- agent, supervisor, admin
  specialties support_category[],
  is_active BOOLEAN DEFAULT TRUE,
  max_concurrent_tickets INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_tickets_category ON support_tickets(category);
CREATE INDEX idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX idx_support_tickets_created_at ON support_tickets(created_at);
CREATE INDEX idx_support_tickets_assigned_to ON support_tickets(assigned_to);
CREATE INDEX idx_support_tickets_ticket_number ON support_tickets(ticket_number);

CREATE INDEX idx_support_ticket_responses_ticket_id ON support_ticket_responses(ticket_id);
CREATE INDEX idx_support_ticket_responses_created_at ON support_ticket_responses(created_at);

CREATE INDEX idx_support_ticket_activities_ticket_id ON support_ticket_activities(ticket_id);
CREATE INDEX idx_support_ticket_activities_created_at ON support_ticket_activities(created_at);

CREATE INDEX idx_feature_requests_status ON feature_requests(status);
CREATE INDEX idx_feature_requests_votes ON feature_requests(votes);
CREATE INDEX idx_feature_requests_created_at ON feature_requests(created_at);

CREATE INDEX idx_support_articles_is_published ON support_articles(is_published);
CREATE INDEX idx_support_articles_category ON support_articles(category);
CREATE INDEX idx_support_articles_slug ON support_articles(slug);

-- Create triggers for automatic updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_support_tickets_updated_at 
  BEFORE UPDATE ON support_tickets 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feature_requests_updated_at 
  BEFORE UPDATE ON feature_requests 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_escalation_rules_updated_at 
  BEFORE UPDATE ON support_escalation_rules 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_articles_updated_at 
  BEFORE UPDATE ON support_articles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_team_members_updated_at 
  BEFORE UPDATE ON support_team_members 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create activity log entries
CREATE OR REPLACE FUNCTION log_ticket_activity()
RETURNS TRIGGER AS $$
BEGIN
  -- Log status changes
  IF (TG_OP = 'UPDATE' AND OLD.status != NEW.status) THEN
    INSERT INTO support_ticket_activities (
      ticket_id, 
      activity_type, 
      description, 
      old_value, 
      new_value
    ) VALUES (
      NEW.id,
      'status_changed',
      'Ticket status changed from ' || OLD.status || ' to ' || NEW.status,
      OLD.status::text,
      NEW.status::text
    );
  END IF;

  -- Log priority changes
  IF (TG_OP = 'UPDATE' AND OLD.priority != NEW.priority) THEN
    INSERT INTO support_ticket_activities (
      ticket_id, 
      activity_type, 
      description, 
      old_value, 
      new_value
    ) VALUES (
      NEW.id,
      'priority_changed',
      'Ticket priority changed from ' || OLD.priority || ' to ' || NEW.priority,
      OLD.priority::text,
      NEW.priority::text
    );
  END IF;

  -- Log assignment changes
  IF (TG_OP = 'UPDATE' AND OLD.assigned_to IS DISTINCT FROM NEW.assigned_to) THEN
    INSERT INTO support_ticket_activities (
      ticket_id, 
      activity_type, 
      description, 
      old_value, 
      new_value
    ) VALUES (
      NEW.id,
      CASE 
        WHEN NEW.assigned_to IS NULL THEN 'unassigned'
        ELSE 'assigned'
      END,
      CASE 
        WHEN NEW.assigned_to IS NULL THEN 'Ticket unassigned'
        ELSE 'Ticket assigned to agent'
      END,
      OLD.assigned_to::text,
      NEW.assigned_to::text
    );
  END IF;

  -- Log creation
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO support_ticket_activities (
      ticket_id, 
      activity_type, 
      description
    ) VALUES (
      NEW.id,
      'created',
      'Ticket created: ' || NEW.title
    );
  END IF;

  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for activity logging
CREATE TRIGGER log_support_ticket_activity
  AFTER INSERT OR UPDATE ON support_tickets
  FOR EACH ROW EXECUTE FUNCTION log_ticket_activity();

-- Function to update feature request vote count
CREATE OR REPLACE FUNCTION update_feature_request_votes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE feature_requests 
    SET votes = votes + 1 
    WHERE id = NEW.feature_request_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE feature_requests 
    SET votes = votes - 1 
    WHERE id = OLD.feature_request_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ language 'plpgsql';

-- Create trigger for vote counting
CREATE TRIGGER update_feature_vote_count
  AFTER INSERT OR DELETE ON feature_request_votes
  FOR EACH ROW EXECUTE FUNCTION update_feature_request_votes();

-- Insert default escalation rules
INSERT INTO support_escalation_rules (name, description, conditions, actions) VALUES 
(
  'High Priority No Response',
  'Escalate high priority tickets with no response after 2 hours',
  '{"priority": "high", "no_response_hours": 2}',
  '{"notify_supervisor": true, "update_priority": "urgent"}'
),
(
  'Urgent Priority No Response', 
  'Escalate urgent tickets with no response after 30 minutes',
  '{"priority": "urgent", "no_response_minutes": 30}',
  '{"notify_supervisor": true, "assign_to_senior": true}'
),
(
  'Bug Report Critical',
  'Auto-escalate critical bug reports',
  '{"category": "bug_report", "keywords": ["critical", "crash", "data loss"]}',
  '{"update_priority": "urgent", "notify_dev_team": true}'
),
(
  'Payment Issues',
  'Fast-track payment and billing issues',
  '{"category": "payment_billing"}',
  '{"assign_to_billing_team": true, "update_priority": "high"}'
);

-- Create RLS (Row Level Security) policies
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_ticket_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_ticket_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_request_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_articles ENABLE ROW LEVEL SECURITY;

-- Users can view their own tickets
CREATE POLICY "Users can view own tickets" ON support_tickets
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create tickets
CREATE POLICY "Users can create tickets" ON support_tickets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own tickets (limited fields)
CREATE POLICY "Users can update own tickets" ON support_tickets
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can view responses to their tickets
CREATE POLICY "Users can view own ticket responses" ON support_ticket_responses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM support_tickets 
      WHERE id = ticket_id AND user_id = auth.uid()
    )
  );

-- Users can add responses to their tickets
CREATE POLICY "Users can respond to own tickets" ON support_ticket_responses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM support_tickets 
      WHERE id = ticket_id AND user_id = auth.uid()
    )
  );

-- Users can view activities for their tickets
CREATE POLICY "Users can view own ticket activities" ON support_ticket_activities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM support_tickets 
      WHERE id = ticket_id AND user_id = auth.uid()
    )
  );

-- Users can view feature requests
CREATE POLICY "Users can view feature requests" ON feature_requests
  FOR SELECT USING (true);

-- Users can create feature requests
CREATE POLICY "Users can create feature requests" ON feature_requests
  FOR INSERT WITH CHECK (auth.uid() = requested_by);

-- Users can vote on feature requests
CREATE POLICY "Users can vote on features" ON feature_request_votes
  FOR ALL USING (auth.uid() = user_id);

-- Users can view published articles
CREATE POLICY "Users can view published articles" ON support_articles
  FOR SELECT USING (is_published = true);

-- Grant permissions for authenticated users
GRANT SELECT, INSERT, UPDATE ON support_tickets TO authenticated;
GRANT SELECT, INSERT ON support_ticket_responses TO authenticated;
GRANT SELECT ON support_ticket_activities TO authenticated;
GRANT SELECT, INSERT, UPDATE ON feature_requests TO authenticated;
GRANT ALL ON feature_request_votes TO authenticated;
GRANT SELECT ON support_articles TO authenticated;

-- Grant permissions for service role (for functions)
GRANT ALL ON support_tickets TO service_role;
GRANT ALL ON support_ticket_responses TO service_role;
GRANT ALL ON support_ticket_activities TO service_role;
GRANT ALL ON feature_requests TO service_role;
GRANT ALL ON feature_request_votes TO service_role;
GRANT ALL ON support_articles TO service_role;
GRANT ALL ON support_escalation_rules TO service_role;
GRANT ALL ON support_team_members TO service_role; 