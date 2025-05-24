
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useWelcomeEmail = () => {
  const { user } = useAuth();

  useEffect(() => {
    const sendWelcomeEmail = async () => {
      if (user && user.email) {
        try {
          await supabase.functions.invoke('send-email', {
            body: {
              type: 'welcome',
              to: user.email,
              data: {
                fullName: user.user_metadata?.full_name || 'Collector'
              }
            }
          });
          console.log('Welcome email sent successfully');
        } catch (error) {
          console.error('Error sending welcome email:', error);
        }
      }
    };

    // Only send welcome email for new users
    const checkAndSendWelcome = () => {
      const welcomeEmailSent = localStorage.getItem(`welcome_sent_${user?.id}`);
      if (user && !welcomeEmailSent) {
        sendWelcomeEmail();
        localStorage.setItem(`welcome_sent_${user?.id}`, 'true');
      }
    };

    if (user) {
      checkAndSendWelcome();
    }
  }, [user]);
};
