import { supabase } from '@/integrations/supabase/client';

export const AdminTools = {
  /**
   * Mark a user as a retailer by email
   */
  async markAsRetailer(email: string) {
    try {
      // Get the current session
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error('Not authenticated');
      }

      // Update the user's profile to mark as retailer
      const { data, error } = await supabase
        .from('profiles')
        .update({
          is_retailer: true,
          retailer_subscription_status: 'active',
          retailer_subscription_expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
          updated_at: new Date().toISOString()
        })
        .eq('email', email)
        .select();

      if (error) {
        throw error;
      }

      return {
        success: true,
        message: `Successfully marked ${email} as retailer`,
        data
      };
    } catch (error: any) {
      console.error('Error marking user as retailer:', error);
      return {
        success: false,
        message: error.message || 'Failed to mark user as retailer',
        error
      };
    }
  },

  /**
   * Get retailer status for a user by email
   */
  async getRetailerStatus(email: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('email, is_retailer, retailer_subscription_status, retailer_subscription_expires_at')
        .eq('email', email)
        .single();

      if (error) {
        throw error;
      }

      return {
        success: true,
        data
      };
    } catch (error: any) {
      console.error('Error getting retailer status:', error);
      return {
        success: false,
        message: error.message || 'Failed to get retailer status',
        error
      };
    }
  },

  /**
   * Update retailer subscription status
   */
  async updateRetailerSubscription(email: string, status: 'active' | 'expired' | 'cancelled' | 'pending') {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          retailer_subscription_status: status,
          updated_at: new Date().toISOString()
        })
        .eq('email', email)
        .select();

      if (error) {
        throw error;
      }

      return {
        success: true,
        message: `Updated subscription status for ${email} to ${status}`,
        data
      };
    } catch (error: any) {
      console.error('Error updating retailer subscription:', error);
      return {
        success: false,
        message: error.message || 'Failed to update subscription status',
        error
      };
    }
  }
};

// Helper function to mark brains@popguide.co.uk as retailer
export const setupRetailerAccount = async () => {
  const result = await AdminTools.markAsRetailer('brains@popguide.co.uk');
  console.log('Setup retailer account result:', result);
  return result;
};

// Run this in browser console: setupRetailerAccount()
(window as any).setupRetailerAccount = setupRetailerAccount;
(window as any).AdminTools = AdminTools; 