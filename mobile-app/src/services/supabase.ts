// Import the configured Supabase client from App.tsx
import { supabase } from '../../App';

// Helper function for better error handling
export const handleSupabaseError = (error: any) => {
  console.error('Supabase Error:', error);
  
  if (error?.code === 'PGRST116') {
    return 'No data found';
  }
  if (error?.code === 'PGRST301') {
    return 'Database connection error';
  }
  if (error?.message?.includes('JWT')) {
    return 'Authentication error - please log in again';
  }
  
  return error?.message || 'An unexpected error occurred';
};

// Test connection function
export const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('funko_pops')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('Connection test failed:', error);
      return false;
    }
    
    console.log('✅ Supabase connection successful');
    return true;
  } catch (error) {
    console.error('❌ Connection test error:', error);
    return false;
  }
};

// Re-export the supabase client for other services
export { supabase }; 