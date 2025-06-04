import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface ContributorStats {
  user_id: string;
  total_submissions: number;
  approved_submissions: number;
  pending_submissions: number;
  rejected_submissions: number;
  contribution_score: number;
  first_submission_at: string | null;
  last_submission_at: string | null;
  updated_at: string;
}

interface ContributorReward {
  id: string;
  user_id: string;
  reward_type: 'free_month' | 'recognition_badge' | 'early_access';
  reward_reason: string;
  submissions_count: number;
  granted_at: string;
  expires_at: string | null;
  is_active: boolean;
}

interface RewardProgress {
  approved: number;
  total: number;
  progressToFreeMonth: number;
  itemsUntilFreeMonth: number;
  nextMilestone: number;
  hasActiveFreeMonth: boolean;
  hasRecognitionBadge: boolean;
}

export const useContributorStats = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['contributor-stats', user?.id],
    queryFn: async (): Promise<ContributorStats | null> => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('contributor_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }
      
      return data || {
        user_id: user.id,
        total_submissions: 0,
        approved_submissions: 0,
        pending_submissions: 0,
        rejected_submissions: 0,
        contribution_score: 0,
        first_submission_at: null,
        last_submission_at: null,
        updated_at: new Date().toISOString()
      };
    },
    enabled: !!user?.id,
  });
};

export const useContributorRewards = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['contributor-rewards', user?.id],
    queryFn: async (): Promise<ContributorReward[]> => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('contributor_rewards')
        .select('*')
        .eq('user_id', user.id)
        .order('granted_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });
};

export const useRewardProgress = (): RewardProgress => {
  const { data: stats } = useContributorStats();
  const { data: rewards = [] } = useContributorRewards();
  
  const approved = stats?.approved_submissions || 0;
  const total = stats?.total_submissions || 0;
  
  const progressToFreeMonth = approved < 75 ? (approved / 75) * 100 : 100;
  const itemsUntilFreeMonth = Math.max(0, 75 - approved);
  
  // Determine next milestone
  let nextMilestone = 75; // Default to free month milestone
  if (approved >= 75) {
    nextMilestone = Math.ceil(approved / 50) * 50; // Next 50-item milestone
  } else if (approved >= 10) {
    nextMilestone = 75; // Recognition badge achieved, next is free month
  } else {
    nextMilestone = 10; // First milestone is recognition badge
  }
  
  const hasActiveFreeMonth = rewards.some(
    reward => reward.reward_type === 'free_month' && reward.is_active
  );
  
  const hasRecognitionBadge = rewards.some(
    reward => reward.reward_type === 'recognition_badge'
  );
  
  return {
    approved,
    total,
    progressToFreeMonth,
    itemsUntilFreeMonth,
    nextMilestone,
    hasActiveFreeMonth,
    hasRecognitionBadge,
  };
};

export const useUpdateContributorStats = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { error } = await supabase.rpc('update_contributor_stats', {
        contributor_user_id: user.id
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      // Invalidate and refetch contributor data
      queryClient.invalidateQueries({ queryKey: ['contributor-stats', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['contributor-rewards', user?.id] });
    },
    onError: (error) => {
      console.error('Error updating contributor stats:', error);
      toast({
        title: "Error",
        description: "Failed to update contributor statistics",
        variant: "destructive",
      });
    }
  });
};

export const useCheckMilestones = () => {
  const { toast } = useToast();
  const rewardProgress = useRewardProgress();
  
  const checkForNewMilestones = (previousApproved: number, newApproved: number) => {
    // Check for recognition badge milestone (10+ approved)
    if (previousApproved < 10 && newApproved >= 10) {
      toast({
        title: "🏆 Recognition Badge Earned!",
        description: "Congratulations! You've submitted 10+ approved Funko Pops and earned a recognition badge!",
        duration: 8000
      });
    }
    
    // Check for free month milestone (75+ approved)
    if (previousApproved < 75 && newApproved >= 75) {
      toast({
        title: "🎉 FREE MONTH EARNED!",
        description: "Amazing! You've reached 75 approved submissions and earned a FREE MONTH of premium access!",
        duration: 12000
      });
    }
    
    // Check for additional 50-item milestones after 75
    if (newApproved >= 75) {
      const previousMilestone = Math.floor(previousApproved / 50) * 50;
      const newMilestone = Math.floor(newApproved / 50) * 50;
      
      if (newMilestone > previousMilestone && newMilestone > 75) {
        toast({
          title: "🌟 Milestone Achievement!",
          description: `Incredible! You've reached ${newApproved} approved submissions! You're a top contributor!`,
          duration: 10000
        });
      }
    }
  };
  
  return { checkForNewMilestones, rewardProgress };
};

export const useContributorLeaderboard = (limit: number = 10) => {
  return useQuery({
    queryKey: ['contributor-leaderboard', limit],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_contributor_leaderboard', {
        limit_count: limit
      });
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUserContributionSummary = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user-contribution-summary', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase.rpc('get_user_contribution_summary', {
        check_user_id: user.id
      });
      
      if (error) throw error;
      return data?.[0] || null;
    },
    enabled: !!user?.id,
  });
};

// Hook to track submissions and automatically update rewards
export const useSubmissionTracker = () => {
  const updateStats = useUpdateContributorStats();
  const { checkForNewMilestones } = useCheckMilestones();
  const rewardProgress = useRewardProgress();
  
  const trackSubmission = async () => {
    const previousApproved = rewardProgress.approved;
    
    try {
      await updateStats.mutateAsync();
      
      // After successful update, check for new milestones
      // Note: This is a simplified check - in reality, the new count would come from the updated query
      const newApproved = previousApproved + 1; // Assuming one item was added
      checkForNewMilestones(previousApproved, newApproved);
      
    } catch (error) {
      console.error('Error tracking submission:', error);
    }
  };
  
  return {
    trackSubmission,
    isUpdating: updateStats.isPending,
    rewardProgress
  };
}; 