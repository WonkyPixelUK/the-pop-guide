
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface ProfileActivity {
  id: string;
  user_id: string;
  activity_type: string; // Changed from union type to string for flexibility
  platform: string; // Changed from union type to string for flexibility
  title: string;
  subtitle?: string;
  image_url?: string;
  details?: any;
  is_current: boolean;
  started_at: string;
  ended_at?: string;
  created_at: string;
  updated_at: string;
}

export const useProfileActivities = (userId?: string) => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ProfileActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const targetUserId = userId || user?.id;

  useEffect(() => {
    if (targetUserId) {
      fetchActivities();
      setupRealtimeSubscription();
    }
  }, [targetUserId]);

  const fetchActivities = async () => {
    if (!targetUserId) return;

    try {
      const { data, error } = await supabase
        .from('profile_activities')
        .select('*')
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching activities:', error);
        return;
      }

      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    if (!targetUserId) return;

    const channel = supabase
      .channel(`profile_activities_${targetUserId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profile_activities',
          filter: `user_id=eq.${targetUserId}`,
        },
        (payload) => {
          console.log('Activity update:', payload);
          fetchActivities(); // Refresh activities on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const addActivity = async (activity: Omit<ProfileActivity, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      // End any current activities of the same type and platform
      if (activity.is_current) {
        await supabase
          .from('profile_activities')
          .update({ 
            is_current: false, 
            ended_at: new Date().toISOString() 
          })
          .eq('user_id', user.id)
          .eq('platform', activity.platform)
          .eq('is_current', true);
      }

      const { data, error } = await supabase
        .from('profile_activities')
        .insert({
          user_id: user.id,
          ...activity,
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding activity:', error);
        return;
      }

      return data;
    } catch (error) {
      console.error('Error adding activity:', error);
    }
  };

  return {
    activities,
    loading,
    addActivity,
    refetch: fetchActivities,
  };
};
