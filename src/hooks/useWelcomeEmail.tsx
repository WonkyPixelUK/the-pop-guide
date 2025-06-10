
import { supabase } from '@/integrations/supabase/client';

// This should only be called explicitly on signup, not on every auth state change
export const sendWelcomeEmailOnSignup = async (userEmail: string, fullName?: string) => {
  try {
    // Check if this is a genuinely new user by checking when they were created
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user || !user.email) {
      console.log('No user found for welcome email');
      return;
    }

    // Only send if user was created within the last 5 minutes (indicating new signup)
    const userCreated = new Date(user.created_at);
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    
    if (userCreated < fiveMinutesAgo) {
      console.log('User is not new, skipping welcome email');
      return;
    }

    // Check if we've already sent a welcome email for this user
    const sentFlag = `welcome_email_sent_${user.id}`;
    const alreadySent = localStorage.getItem(sentFlag);
    
    if (alreadySent) {
      console.log('Welcome email already sent for this user');
      return;
    }

    await supabase.functions.invoke('send-email', {
      body: {
        type: 'welcome',
        to: userEmail,
        data: {
          fullName: fullName || user.user_metadata?.full_name || 'Collector'
        }
      }
    });
    
    // Mark as sent to prevent duplicates
    localStorage.setItem(sentFlag, 'true');
    console.log('Welcome email sent successfully to new user');
    
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
};

// Legacy hook - now just a placeholder to prevent breaking changes
export const useWelcomeEmail = () => {
  // This hook no longer automatically sends emails
  // Welcome emails should be explicitly triggered on signup only
};
