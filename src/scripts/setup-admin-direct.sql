-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE funko_pops ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE retailers ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- Create admin_activity_log table
CREATE TABLE IF NOT EXISTS admin_activity_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add is_admin column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_id AND is_admin = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create policies for admin access
CREATE POLICY "Admins can do everything" ON profiles
  FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can do everything" ON funko_pops
  FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can do everything" ON subscriptions
  FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can do everything" ON retailers
  FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can do everything" ON members
  FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can do everything" ON email_templates
  FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can do everything" ON admin_activity_log
  FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()));

-- Set up brains@popguide.co.uk as admin
UPDATE profiles
SET is_admin = TRUE
WHERE email = 'brains@popguide.co.uk';

-- Create function to log admin activity
CREATE OR REPLACE FUNCTION log_admin_activity(
  action_type TEXT,
  description TEXT,
  metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  activity_id UUID;
BEGIN
  INSERT INTO admin_activity_log (user_id, action_type, description, metadata)
  VALUES (auth.uid(), action_type, description, metadata)
  RETURNING id INTO activity_id;
  
  RETURN activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 