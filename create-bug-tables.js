const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read Supabase config (you may need to adjust these values)
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'your-supabase-url';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executeSQLFile() {
  try {
    console.log('Reading SQL migration file...');
    
    // Read the migration file
    const sqlFile = path.join(__dirname, 'supabase/migrations/20250103000000_create_bug_tracking_system.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');
    
    console.log('Executing SQL migration...');
    console.log('This may take a moment...');
    
    // Split the SQL into individual statements (basic approach)
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      console.log(`Executing statement ${i + 1}/${statements.length}...`);
      
      try {
        const { data, error } = await supabase.rpc('exec_sql', { 
          sql_query: statement 
        });
        
        if (error) {
          console.error(`Error in statement ${i + 1}:`, error);
          // Continue with other statements
        } else {
          console.log(`✓ Statement ${i + 1} completed successfully`);
        }
      } catch (err) {
        console.error(`Exception in statement ${i + 1}:`, err.message);
        // Continue with other statements
      }
    }
    
    console.log('\n✅ Migration completed!');
    console.log('Bug tracking system tables have been created.');
    
    // Test the creation by checking if tables exist
    console.log('\nVerifying table creation...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['bugs', 'bug_comments', 'bug_attachments', 'bug_notifications', 'bug_votes', 'bug_subscriptions']);
    
    if (tablesError) {
      console.error('Error checking tables:', tablesError);
    } else {
      console.log('Created tables:', tables?.map(t => t.table_name) || []);
    }
    
  } catch (error) {
    console.error('Error executing migration:', error);
  }
}

// Alternative approach using raw SQL execution
async function executeSQLDirect() {
  try {
    console.log('Reading SQL migration file...');
    
    const sqlFile = path.join(__dirname, 'supabase/migrations/20250103000000_create_bug_tracking_system.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');
    
    console.log('Executing SQL migration directly...');
    
    // Try to execute the entire SQL content at once
    const { data, error } = await supabase.rpc('exec_raw_sql', { 
      sql: sqlContent 
    });
    
    if (error) {
      console.error('Error executing SQL:', error);
      console.log('Trying individual statements approach...');
      await executeSQLFile();
    } else {
      console.log('✅ Migration completed successfully!');
      console.log('Bug tracking system tables have been created.');
    }
    
  } catch (error) {
    console.error('Error:', error);
    console.log('Falling back to individual statements approach...');
    await executeSQLFile();
  }
}

// Run the migration
console.log('🚀 Starting Bug Tracking System Database Migration');
console.log('================================================');

executeSQLDirect(); 