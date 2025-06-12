import { supabase } from '@/integrations/supabase/client';
import fs from 'fs';
import path from 'path';

async function executeSQL() {
  try {
    // Read the SQL file
    const sqlPath = path.join(process.cwd(), 'src/scripts/setup-admin-direct.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Execute the SQL
    const { error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      throw error;
    }

    console.log('✅ SQL executed successfully');
  } catch (error) {
    console.error('❌ Error executing SQL:', error);
  }
}

executeSQL(); 