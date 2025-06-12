import { supabase } from '@/integrations/supabase/client';

async function setupAdmin() {
  try {
    // Execute each function in sequence
    const { error: rlsError } = await supabase.rpc('enable_rls', {
      table_names: [
        'profiles',
        'funko_pops',
        'subscriptions',
        'retailers',
        'members',
        'email_templates',
        'admin_activity_log'
      ]
    });
    if (rlsError) throw rlsError;
    console.log('✅ RLS enabled');

    const { error: tableError } = await supabase.rpc('create_admin_activity_log');
    if (tableError) throw tableError;
    console.log('✅ Admin activity log table created');

    const { error: columnError } = await supabase.rpc('add_admin_column');
    if (columnError) throw columnError;
    console.log('✅ Admin column added');

    const { error: functionError } = await supabase.rpc('create_is_admin_function');
    if (functionError) throw functionError;
    console.log('✅ Is admin function created');

    const { error: policiesError } = await supabase.rpc('create_admin_policies');
    if (policiesError) throw policiesError;
    console.log('✅ Admin policies created');

    const { error: userError } = await supabase.rpc('setup_admin_user', {
      admin_email: 'brains@popguide.co.uk'
    });
    if (userError) throw userError;
    console.log('✅ Admin user set up');

    const { error: loggingError } = await supabase.rpc('create_activity_logging_function');
    if (loggingError) throw loggingError;
    console.log('✅ Activity logging function created');

    console.log('🎉 Admin setup completed successfully!');
  } catch (error) {
    console.error('❌ Error during admin setup:', error);
  }
}

setupAdmin(); 