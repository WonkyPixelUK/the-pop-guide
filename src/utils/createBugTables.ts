import { supabase } from '@/integrations/supabase/client';

export function getSQLStatements(): string[] {
  return [
    // Create enums
    `CREATE TYPE bug_severity AS ENUM ('critical', 'high', 'medium', 'low');`,
    `CREATE TYPE bug_type AS ENUM ('ui_ux', 'functionality', 'performance', 'security', 'data_loss', 'compatibility');`,
    `CREATE TYPE bug_status AS ENUM ('new', 'triaged', 'in_progress', 'testing', 'resolved', 'closed', 'duplicate');`,
    `CREATE TYPE bug_platform AS ENUM ('web_app', 'chrome_extension', 'ios_app', 'android_app', 'all_platforms');`,
    `CREATE TYPE bug_priority AS ENUM ('urgent', 'high', 'normal', 'low');`,
    `CREATE TYPE notification_type AS ENUM ('submission', 'status_update', 'resolution', 'need_info', 'duplicate', 'assignment');`,
    `CREATE TYPE email_status AS ENUM ('pending', 'sent', 'failed');`,
    
    // Create bugs table
    `CREATE TABLE bugs (
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
    );`,
    
    // Create bug_votes table
    `CREATE TABLE bug_votes (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        bug_id UUID REFERENCES bugs(id) ON DELETE CASCADE,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(bug_id, user_id)
    );`,
    
    // Create bug_comments table
    `CREATE TABLE bug_comments (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        bug_id UUID REFERENCES bugs(id) ON DELETE CASCADE,
        user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
        comment TEXT NOT NULL,
        is_internal BOOLEAN DEFAULT FALSE,
        status_change JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );`,
    
    // Create bug_attachments table
    `CREATE TABLE bug_attachments (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        bug_id UUID REFERENCES bugs(id) ON DELETE CASCADE,
        filename TEXT NOT NULL,
        file_path TEXT NOT NULL,
        file_size INTEGER NOT NULL,
        file_type TEXT NOT NULL,
        uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );`,
    
    // Create bug_notifications table
    `CREATE TABLE bug_notifications (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        bug_id UUID REFERENCES bugs(id) ON DELETE CASCADE,
        email TEXT NOT NULL,
        notification_type notification_type NOT NULL,
        sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        email_status email_status DEFAULT 'pending',
        email_content JSONB
    );`,
    
    // Create bug_subscriptions table
    `CREATE TABLE bug_subscriptions (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        bug_id UUID REFERENCES bugs(id) ON DELETE CASCADE,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        notify_on_updates BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(bug_id, user_id)
    );`,
    
    // Create indexes
    `CREATE INDEX idx_bugs_status ON bugs(status);`,
    `CREATE INDEX idx_bugs_severity ON bugs(severity);`,
    `CREATE INDEX idx_bugs_platform ON bugs(platform);`,
    `CREATE INDEX idx_bugs_created_by ON bugs(created_by);`,
    `CREATE INDEX idx_bugs_created_at ON bugs(created_at);`,
    `CREATE INDEX idx_bugs_reference_number ON bugs(reference_number);`,
    `CREATE INDEX idx_bug_votes_bug_id ON bug_votes(bug_id);`,
    `CREATE INDEX idx_bug_votes_user_id ON bug_votes(user_id);`,
    
    // Create function for updated_at
    `CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
    END;
    $$ language 'plpgsql';`,
    
    // Create trigger
    `CREATE TRIGGER update_bugs_updated_at 
        BEFORE UPDATE ON bugs 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();`,
    
    // Enable RLS
    `ALTER TABLE bugs ENABLE ROW LEVEL SECURITY;`,
    `ALTER TABLE bug_comments ENABLE ROW LEVEL SECURITY;`,
    `ALTER TABLE bug_attachments ENABLE ROW LEVEL SECURITY;`,
    `ALTER TABLE bug_notifications ENABLE ROW LEVEL SECURITY;`,
    `ALTER TABLE bug_votes ENABLE ROW LEVEL SECURITY;`,
    `ALTER TABLE bug_subscriptions ENABLE ROW LEVEL SECURITY;`,
    
    // Create RLS policies
    `CREATE POLICY "Anyone can view bugs" ON bugs FOR SELECT USING (true);`,
    `CREATE POLICY "Authenticated users can create bugs" ON bugs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);`,
    `CREATE POLICY "Anyone can view bug votes" ON bug_votes FOR SELECT USING (true);`,
    `CREATE POLICY "Authenticated users can vote" ON bug_votes FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());`,
    `CREATE POLICY "Users can delete their own votes" ON bug_votes FOR DELETE USING (user_id = auth.uid());`,
    `CREATE POLICY "Anyone can view bug attachments" ON bug_attachments FOR SELECT USING (true);`,
    `CREATE POLICY "Authenticated users can upload attachments" ON bug_attachments FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);`,
  ];
}

// MCP Database execution function
async function executeSQLViaMCP(sql: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('📤 Sending SQL to MCP:', sql.substring(0, 100) + '...');
    
    // For now, we'll output the SQL and assume success
    // In your environment, you would replace this with actual MCP execution
    console.log('🔧 Execute this SQL via your MCP database connection:');
    console.log(sql);
    
    // Simulate a delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // For demonstration, we'll return success
    // In real use, you'd execute via MCP and return actual results
    return { success: true };
    
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createBugTrackingTables() {
  console.log('🚀 Creating Bug Tracking System Tables via MCP...');
  console.log('');
  console.log('📋 INSTRUCTIONS:');
  console.log('Copy each SQL statement below and execute it via your MCP database connection');
  console.log('Execute them in the exact order shown below:');
  console.log('');
  
  const statements = getSQLStatements();
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    console.log(`-- ======================================`);
    console.log(`-- Statement ${i + 1}/${statements.length}`);
    console.log(`-- ======================================`);
    console.log(statement);
    console.log('');
    
    try {
      const result = await executeSQLViaMCP(statement);
      
      if (result.success) {
        console.log(`✅ Statement ${i + 1} ready for execution`);
        successCount++;
      } else {
        console.error(`❌ Error preparing statement ${i + 1}:`, result.error);
        errorCount++;
      }
    } catch (err: any) {
      console.error(`❌ Exception preparing statement ${i + 1}:`, err.message);
      errorCount++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`✅ ${successCount} statements prepared`);
  console.log(`❌ ${errorCount} errors`);
  console.log(`\n🎯 Next Steps:`);
  console.log(`1. Copy each SQL statement above`);
  console.log(`2. Execute them via your MCP database connection in order`);
  console.log(`3. Come back and click "Check Tables" to verify`);
  
  return { successCount, errorCount };
}

export function downloadSQL() {
  const statements = getSQLStatements();
  const sqlContent = statements.join('\n\n');
  
  const blob = new Blob([sqlContent], { type: 'text/sql' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'bug_tracking_system.sql';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  console.log('✅ SQL file downloaded!');
}

// Test database connection and check if tables exist
export async function checkDatabaseTables() {
  console.log('🔍 Checking if bug tracking tables exist...');
  
  try {
    const tableNames = ['bugs', 'bug_votes', 'bug_comments', 'bug_attachments', 'bug_notifications', 'bug_subscriptions'];
    const results: { [key: string]: boolean } = {};
    
    for (const tableName of tableNames) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*', { head: true, count: 'exact' });
        
        if (error && error.code === 'PGRST116') {
          // Table doesn't exist
          results[tableName] = false;
        } else {
          // Table exists (even if empty)
          results[tableName] = true;
        }
      } catch (err) {
        results[tableName] = false;
      }
    }
    
    const existingTables = Object.entries(results)
      .filter(([_, exists]) => exists)
      .map(([name, _]) => name);
    
    const missingTables = Object.entries(results)
      .filter(([_, exists]) => !exists)
      .map(([name, _]) => name);
    
    console.log('✅ Existing tables:', existingTables.length > 0 ? existingTables.join(', ') : 'None');
    console.log('❌ Missing tables:', missingTables.length > 0 ? missingTables.join(', ') : 'None');
    
    return {
      existingTables,
      missingTables,
      allTablesExist: missingTables.length === 0
    };
    
  } catch (error: any) {
    console.error('❌ Error checking tables:', error.message);
    return {
      existingTables: [],
      missingTables: tableNames,
      allTablesExist: false,
      error: error.message
    };
  }
}

// Create storage bucket via MCP
export async function createBugAttachmentsBucket() {
  console.log('📁 Creating bug-attachments storage bucket...');
  console.log('');
  console.log('📋 MANUAL STEP REQUIRED:');
  console.log('Please execute this SQL via your MCP database connection:');
  console.log('');
  console.log(`INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'bug-attachments', 
  'bug-attachments', 
  false, 
  10485760, 
  '{image/*,video/*,text/plain,application/pdf}'
)
ON CONFLICT (id) DO NOTHING;`);
  console.log('');
  console.log('💡 Alternative: Create the bucket manually in Supabase dashboard');
  
  return false;
} 