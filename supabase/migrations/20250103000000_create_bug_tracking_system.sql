-- Create enums for bug tracking
CREATE TYPE bug_severity AS ENUM ('critical', 'high', 'medium', 'low');
CREATE TYPE bug_type AS ENUM ('ui_ux', 'functionality', 'performance', 'security', 'data_loss', 'compatibility');
CREATE TYPE bug_status AS ENUM ('new', 'triaged', 'in_progress', 'testing', 'resolved', 'closed', 'duplicate');
CREATE TYPE bug_platform AS ENUM ('web_app', 'chrome_extension', 'ios_app', 'android_app', 'all_platforms');
CREATE TYPE bug_priority AS ENUM ('urgent', 'high', 'normal', 'low');
CREATE TYPE notification_type AS ENUM ('submission', 'status_update', 'resolution', 'need_info', 'duplicate', 'assignment');
CREATE TYPE email_status AS ENUM ('pending', 'sent', 'failed');

-- Create bugs table
CREATE TABLE bugs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reference_number TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    severity bug_severity NOT NULL DEFAULT 'medium',
    bug_type bug_type NOT NULL,
    platform bug_platform NOT NULL,
    status bug_status NOT NULL DEFAULT 'new',
    priority bug_priority NOT NULL DEFAULT 'normal',
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    environment_data JSONB DEFAULT '{}',
    reproduction_steps TEXT,
    expected_behavior TEXT,
    actual_behavior TEXT
);

-- Create bug_comments table
CREATE TABLE bug_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    bug_id UUID REFERENCES bugs(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    comment TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE,
    status_change JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bug_attachments table
CREATE TABLE bug_attachments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    bug_id UUID REFERENCES bugs(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    file_type TEXT NOT NULL,
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bug_notifications table
CREATE TABLE bug_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    bug_id UUID REFERENCES bugs(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    notification_type notification_type NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    email_status email_status DEFAULT 'pending',
    email_content JSONB
);

-- Create bug_votes table
CREATE TABLE bug_votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    bug_id UUID REFERENCES bugs(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(bug_id, user_id)
);

-- Create bug_subscriptions table
CREATE TABLE bug_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    bug_id UUID REFERENCES bugs(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    notify_on_updates BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(bug_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX idx_bugs_status ON bugs(status);
CREATE INDEX idx_bugs_severity ON bugs(severity);
CREATE INDEX idx_bugs_platform ON bugs(platform);
CREATE INDEX idx_bugs_created_by ON bugs(created_by);
CREATE INDEX idx_bugs_created_at ON bugs(created_at);
CREATE INDEX idx_bugs_reference_number ON bugs(reference_number);

CREATE INDEX idx_bug_comments_bug_id ON bug_comments(bug_id);
CREATE INDEX idx_bug_comments_user_id ON bug_comments(user_id);
CREATE INDEX idx_bug_comments_created_at ON bug_comments(created_at);

CREATE INDEX idx_bug_attachments_bug_id ON bug_attachments(bug_id);

CREATE INDEX idx_bug_notifications_bug_id ON bug_notifications(bug_id);
CREATE INDEX idx_bug_notifications_email_status ON bug_notifications(email_status);

CREATE INDEX idx_bug_votes_bug_id ON bug_votes(bug_id);
CREATE INDEX idx_bug_votes_user_id ON bug_votes(user_id);

CREATE INDEX idx_bug_subscriptions_bug_id ON bug_subscriptions(bug_id);
CREATE INDEX idx_bug_subscriptions_user_id ON bug_subscriptions(user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for bugs table
CREATE TRIGGER update_bugs_updated_at 
    BEFORE UPDATE ON bugs 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE bugs ENABLE ROW LEVEL SECURITY;
ALTER TABLE bug_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE bug_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE bug_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE bug_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bug_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for bugs (public read, authenticated users can create)
CREATE POLICY "Anyone can view bugs" ON bugs FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create bugs" ON bugs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update their own bugs" ON bugs FOR UPDATE USING (created_by = auth.uid());
CREATE POLICY "Admins can update any bug" ON bugs FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.users.id = auth.uid() 
        AND auth.users.raw_app_meta_data->>'role' = 'admin'
    )
);

-- Create RLS policies for bug_comments
CREATE POLICY "Anyone can view non-internal comments" ON bug_comments FOR SELECT USING (NOT is_internal);
CREATE POLICY "Authenticated users can view internal comments if admin" ON bug_comments FOR SELECT USING (
    is_internal AND EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.users.id = auth.uid() 
        AND auth.users.raw_app_meta_data->>'role' = 'admin'
    )
);
CREATE POLICY "Authenticated users can create comments" ON bug_comments FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Create RLS policies for bug_attachments  
CREATE POLICY "Anyone can view bug attachments" ON bug_attachments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can upload attachments" ON bug_attachments FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Create RLS policies for bug_notifications (admin only)
CREATE POLICY "Admins can manage notifications" ON bug_notifications FOR ALL USING (
    EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.users.id = auth.uid() 
        AND auth.users.raw_app_meta_data->>'role' = 'admin'
    )
);

-- Create RLS policies for bug_votes
CREATE POLICY "Anyone can view bug votes" ON bug_votes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can vote" ON bug_votes FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());
CREATE POLICY "Users can delete their own votes" ON bug_votes FOR DELETE USING (user_id = auth.uid());

-- Create RLS policies for bug_subscriptions
CREATE POLICY "Users can view their own subscriptions" ON bug_subscriptions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Authenticated users can subscribe" ON bug_subscriptions FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());
CREATE POLICY "Users can update their own subscriptions" ON bug_subscriptions FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own subscriptions" ON bug_subscriptions FOR DELETE USING (user_id = auth.uid()); 