
import { supabase } from '@/integrations/supabase/client';

export const sendMilestoneEmail = async (userEmail: string, userName: string, milestone: string, count: number, totalValue: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        type: 'milestone',
        to: userEmail,
        data: {
          userName,
          milestone,
          count,
          totalValue
        }
      }
    });

    if (error) throw error;
    console.log('Milestone email sent successfully');
    return { success: true };
  } catch (error) {
    console.error('Error sending milestone email:', error);
    return { success: false, error };
  }
};

export const sendWelcomeEmail = async (userEmail: string, fullName: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        type: 'welcome',
        to: userEmail,
        data: {
          fullName
        }
      }
    });

    if (error) throw error;
    console.log('Welcome email sent successfully');
    return { success: true };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error };
  }
};
