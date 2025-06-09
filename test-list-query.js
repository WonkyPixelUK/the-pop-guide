const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://pafgjwmgueerxdxtneyg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhZmdqd21ndWVlcnhkeHRuZXlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwODgxODIsImV4cCI6MjA2MzY2NDE4Mn0.YInSl_Ct_ZM_fyZ1j2rgNQFacHDGTjg64vJGTtSb9FI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabase() {
  console.log('🔍 Testing database connection...');
  
  try {
    // Test 1: Basic connection
    console.log('\n📋 Test 1: Basic connection');
    const { data: testData, error: testError } = await supabase
      .from('funko_pops')
      .select('id')
      .limit(1);
    
    if (testError) {
      console.log('❌ Basic connection failed:', testError.message);
      return;
    }
    console.log('✅ Basic connection successful');

    // Test 2: Check if custom_lists table exists and has data
    console.log('\n📋 Test 2: Custom lists table');
    const { data: allLists, error: allListsError } = await supabase
      .from('custom_lists')
      .select('id, name, is_public, created_at')
      .limit(5);
    
    if (allListsError) {
      console.log('❌ Custom lists query failed:', allListsError.message);
    } else {
      console.log(`✅ Found ${allLists.length} lists in total`);
      allLists.forEach(list => {
        console.log(`  - ${list.name} (${list.is_public ? 'public' : 'private'}) - ${list.id}`);
      });
    }

    // Test 3: Check specific list IDs from the user's tests
    const testListIds = [
      'e7d945c8-2611-4bc7-99f2-c28a2e2b299e', // From the current screenshot
      '68855a9c-cbca-4075-8ceb-67bf92851e3b'  // From the original issue
    ];

    for (const listId of testListIds) {
      console.log(`\n📋 Test 3: Checking specific list ${listId}`);
      const { data: specificList, error: specificError } = await supabase
        .from('custom_lists')
        .select('*')
        .eq('id', listId)
        .single();
      
      if (specificError) {
        if (specificError.code === 'PGRST116') {
          console.log(`❌ List ${listId} not found (doesn't exist)`);
        } else {
          console.log(`❌ Error checking list ${listId}:`, specificError.message);
        }
      } else {
        console.log(`✅ Found list: ${specificList.name}`);
        console.log(`   Public: ${specificList.is_public}`);
        console.log(`   Created: ${specificList.created_at}`);
        console.log(`   User: ${specificList.user_id}`);
      }
    }

    // Test 4: Check all public lists
    console.log('\n📋 Test 4: All public lists');
    const { data: publicLists, error: publicError } = await supabase
      .from('custom_lists')
      .select('id, name, created_at')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (publicError) {
      console.log('❌ Public lists query failed:', publicError.message);
    } else {
      console.log(`✅ Found ${publicLists.length} public lists:`);
      publicLists.forEach(list => {
        console.log(`  - ${list.name} - ${list.id}`);
      });
    }

  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
  }
}

testDatabase(); 