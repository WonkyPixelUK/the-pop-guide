import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../../App';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<{ success: boolean; error?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updates: { firstName?: string; lastName?: string; avatar_url?: string }) => Promise<{ success: boolean; error?: string }>;
  subscription: 'free' | 'pro' | null;
  refreshSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<'free' | 'pro' | null>(null);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
        } else {
          setSession(session);
          setUser(session?.user ?? null);
          if (session?.user) {
            await refreshSubscription();
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await refreshSubscription();
        } else {
          setSubscription(null);
        }
        
        setLoading(false);
      }
    );

    return () => {
      authSubscription?.unsubscribe();
    };
  }, []);

  const refreshSubscription = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('subscription_type, status, expires_at')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (error) {
        console.log('No active subscription found');
        setSubscription('free');
      } else {
        // Check if subscription is still valid
        const expiresAt = new Date(data.expires_at);
        const now = new Date();
        
        if (expiresAt > now) {
          setSubscription(data.subscription_type as 'pro');
        } else {
          setSubscription('free');
        }
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      setSubscription('free');
    }
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          data: {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            full_name: `${firstName.trim()} ${lastName.trim()}`,
          }
        }
      });

      if (error) {
        console.error('Sign up error:', error);
        return { success: false, error: error.message };
      }

      if (data.user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: data.user.id,
            email: email.toLowerCase().trim(),
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            full_name: `${firstName.trim()} ${lastName.trim()}`,
            subscription_type: 'free',
            created_at: new Date().toISOString()
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
        }

        Alert.alert(
          '✅ Account Created!',
          'Please check your email to verify your account before signing in.'
        );
      }

      return { success: true };
    } catch (error) {
      console.error('Sign up error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create account' 
      };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Signed in successfully:', data.user?.email);
      return { success: true };
    } catch (error) {
      console.error('Sign in error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to sign in' 
      };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        Alert.alert('Error', 'Failed to sign out');
      } else {
        console.log('✅ Signed out successfully');
        Alert.alert('👋 Signed Out', 'You have been signed out successfully');
      }
    } catch (error) {
      console.error('Sign out error:', error);
      Alert.alert('Error', 'Failed to sign out');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.toLowerCase().trim(),
        {
          redirectTo: 'com.popguide.app://reset-password'
        }
      );

      if (error) {
        console.error('Password reset error:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Password reset error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to send reset email' 
      };
    }
  };

  const updateProfile = async (updates: { firstName?: string; lastName?: string; avatar_url?: string }) => {
    if (!user) return { success: false, error: 'No user logged in' };

    try {
      const authUpdates: any = {};
      const profileUpdates: any = {};

      if (updates.firstName !== undefined) {
        profileUpdates.first_name = updates.firstName.trim();
      }
      if (updates.lastName !== undefined) {
        profileUpdates.last_name = updates.lastName.trim();
      }
      if (updates.firstName !== undefined || updates.lastName !== undefined) {
        const firstName = updates.firstName || user.user_metadata?.first_name || '';
        const lastName = updates.lastName || user.user_metadata?.last_name || '';
        profileUpdates.full_name = `${firstName} ${lastName}`.trim();
        authUpdates.data = { 
          ...user.user_metadata,
          first_name: firstName,
          last_name: lastName,
          full_name: `${firstName} ${lastName}`.trim()
        };
      }
      if (updates.avatar_url !== undefined) {
        profileUpdates.avatar_url = updates.avatar_url;
        authUpdates.data = { 
          ...user.user_metadata,
          avatar_url: updates.avatar_url
        };
      }

      // Update auth metadata
      if (Object.keys(authUpdates).length > 0) {
        const { error: authError } = await supabase.auth.updateUser(authUpdates);
        if (authError) throw authError;
      }

      // Update profile table
      if (Object.keys(profileUpdates).length > 0) {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .update({
            ...profileUpdates,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        if (profileError) throw profileError;
      }

      return { success: true };
    } catch (error) {
      console.error('Profile update error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update profile' 
      };
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    subscription,
    refreshSubscription,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 