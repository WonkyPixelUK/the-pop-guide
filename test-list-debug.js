const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

async function checkList() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.log('Environment variables not found. Checking .env file...');
    return;
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  const listId = '68855a9c-cbca-4075-8ceb-67bf92851e3b'; // From the URL in the screenshot
  
  console.log('🔍 Checking list:', listId);
  
  // Check basic list info
  const { data: list, error: listError } = await supabase
    .from('custom_lists')
    .select('*')
    .eq('id', listId)
    .single();
    
  console.log('📋 List data:', list);
  if (listError) console.log('❌ List error:', listError);
  
  // Check list items directly
  const { data: items, error: itemsError } = await supabase
    .from('list_items')
    .select('*')
    .eq('list_id', listId);
    
  console.log('📦 List items count:', items?.length || 0);
  console.log('📦 List items:', items);
  if (itemsError) console.log('❌ Items error:', itemsError);
  
  // Check with full join
  const { data: fullData, error: fullError } = await supabase
    .from('custom_lists')
    .select(`
      *,
      list_items (
        id,
        funko_pops (
          id,
          name,
          series,
          number
        )
      )
    `)
    .eq('id', listId)
    .single();
    
  console.log('🔗 Full data list_items:', fullData?.list_items?.length || 0);
  if (fullError) console.log('❌ Full error:', fullError);
  
  if (fullData?.list_items) {
    console.log('🎯 Sample list items:', fullData.list_items.slice(0, 2));
  }
}

checkList().catch(console.error); 