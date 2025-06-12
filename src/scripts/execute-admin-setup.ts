import { supabase } from '@/integrations/supabase/client';

async function executeAdminSetup() {
  try {
    // Enable RLS
    await supabase.rpc('enable_rls', {
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

    // Create admin_activity_log table
    await supabase.rpc('create_admin_activity_log');

    // Add is_admin column to profiles
    await supabase.rpc('add_admin_column');

    // Create is_admin function
    await supabase.rpc('create_is_admin_function');

    // Create admin policies
    await supabase.rpc('create_admin_policies');

    // Set up admin user
    await supabase.rpc('setup_admin_user', {
      admin_email: 'brains@popguide.co.uk'
    });

    // Create activity logging function
    await supabase.rpc('create_activity_logging_function');

    console.log('Admin setup completed successfully');
  } catch (error) {
    console.error('Error executing admin setup:', error);
  }
}

executeAdminSetup(); 