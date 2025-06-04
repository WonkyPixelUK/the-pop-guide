-- Create contributor_rewards table to track user achievements and rewards
CREATE TABLE IF NOT EXISTS contributor_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reward_type TEXT NOT NULL CHECK (reward_type IN ('free_month', 'recognition_badge', 'early_access')),
  reward_reason TEXT NOT NULL,
  submissions_count INTEGER NOT NULL,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Prevent duplicate rewards of same type for same user
  UNIQUE(user_id, reward_type)
);

-- Create contributor_stats table for efficient tracking
CREATE TABLE IF NOT EXISTS contributor_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_submissions INTEGER DEFAULT 0,
  approved_submissions INTEGER DEFAULT 0,
  pending_submissions INTEGER DEFAULT 0,
  rejected_submissions INTEGER DEFAULT 0,
  first_submission_at TIMESTAMP WITH TIME ZONE,
  last_submission_at TIMESTAMP WITH TIME ZONE,
  contribution_score INTEGER DEFAULT 0, -- Weighted score: approved=10, pending=5, rejected=1
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_contributor_rewards_user_id ON contributor_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_contributor_rewards_reward_type ON contributor_rewards(reward_type);
CREATE INDEX IF NOT EXISTS idx_contributor_rewards_granted_at ON contributor_rewards(granted_at DESC);
CREATE INDEX IF NOT EXISTS idx_contributor_stats_contribution_score ON contributor_stats(contribution_score DESC);
CREATE INDEX IF NOT EXISTS idx_contributor_stats_approved_submissions ON contributor_stats(approved_submissions DESC);

-- Enable RLS
ALTER TABLE contributor_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributor_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for contributor_rewards
CREATE POLICY "Users can view their own rewards" ON contributor_rewards
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage rewards" ON contributor_rewards
  FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for contributor_stats
CREATE POLICY "Users can view their own stats" ON contributor_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Public can view leaderboard stats" ON contributor_stats
  FOR SELECT USING (true); -- Allow public viewing for leaderboards

CREATE POLICY "Service role can manage stats" ON contributor_stats
  FOR ALL USING (auth.role() = 'service_role');

-- Function to update contributor stats when submission status changes
CREATE OR REPLACE FUNCTION update_contributor_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Handle INSERT
  IF TG_OP = 'INSERT' THEN
    INSERT INTO contributor_stats (user_id, total_submissions, pending_submissions, first_submission_at, last_submission_at, contribution_score)
    VALUES (NEW.submitted_by, 1, 1, NEW.created_at, NEW.created_at, 5)
    ON CONFLICT (user_id) DO UPDATE SET
      total_submissions = contributor_stats.total_submissions + 1,
      pending_submissions = contributor_stats.pending_submissions + 1,
      last_submission_at = NEW.created_at,
      contribution_score = contributor_stats.contribution_score + 5,
      updated_at = NOW();
    
    RETURN NEW;
  END IF;
  
  -- Handle UPDATE (status change)
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    DECLARE
      score_change INTEGER := 0;
      approved_change INTEGER := 0;
      pending_change INTEGER := 0;
      rejected_change INTEGER := 0;
    BEGIN
      -- Calculate score changes based on status transition
      IF OLD.status = 'pending_review' AND NEW.status = 'approved' THEN
        score_change := 5; -- +10 for approved, -5 for removing pending
        approved_change := 1;
        pending_change := -1;
      ELSIF OLD.status = 'pending_review' AND NEW.status = 'rejected' THEN
        score_change := -4; -- +1 for rejected, -5 for removing pending
        rejected_change := 1;
        pending_change := -1;
      ELSIF OLD.status = 'rejected' AND NEW.status = 'approved' THEN
        score_change := 9; -- +10 for approved, -1 for removing rejected
        approved_change := 1;
        rejected_change := -1;
      END IF;
      
      -- Update stats
      UPDATE contributor_stats SET
        approved_submissions = approved_submissions + approved_change,
        pending_submissions = pending_submissions + pending_change,
        rejected_submissions = rejected_submissions + rejected_change,
        contribution_score = contribution_score + score_change,
        updated_at = NOW()
      WHERE user_id = NEW.submitted_by;
      
      -- Check for reward eligibility after approval
      IF NEW.status = 'approved' THEN
        PERFORM check_and_grant_rewards(NEW.submitted_by);
      END IF;
    END;
    
    RETURN NEW;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic stats updates
CREATE TRIGGER update_contributor_stats_trigger
  AFTER INSERT OR UPDATE ON user_submitted_funkos
  FOR EACH ROW
  EXECUTE FUNCTION update_contributor_stats();

-- Function to check and grant rewards based on contribution milestones
CREATE OR REPLACE FUNCTION check_and_grant_rewards(contributor_user_id UUID)
RETURNS VOID AS $$
DECLARE
  stats_record contributor_stats%ROWTYPE;
  existing_reward contributor_rewards%ROWTYPE;
BEGIN
  -- Get current stats
  SELECT * INTO stats_record FROM contributor_stats WHERE user_id = contributor_user_id;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Check for 50+ approved submissions milestone (free month reward)
  IF stats_record.approved_submissions >= 50 THEN
    -- Check if reward already granted
    SELECT * INTO existing_reward FROM contributor_rewards 
    WHERE user_id = contributor_user_id AND reward_type = 'free_month';
    
    IF NOT FOUND THEN
      -- Grant free month reward
      INSERT INTO contributor_rewards (
        user_id, 
        reward_type, 
        reward_reason, 
        submissions_count,
        expires_at
      ) VALUES (
        contributor_user_id,
        'free_month',
        'Contributed 50+ approved Funko Pops to the database',
        stats_record.approved_submissions,
        NOW() + INTERVAL '1 year' -- Reward is valid for 1 year
      );
      
      -- Extend their subscription by 1 month
      INSERT INTO user_subscriptions (
        user_id,
        status,
        current_period_end,
        created_at,
        updated_at
      ) VALUES (
        contributor_user_id,
        'active',
        COALESCE(
          (SELECT current_period_end FROM user_subscriptions WHERE user_id = contributor_user_id ORDER BY created_at DESC LIMIT 1),
          NOW()
        ) + INTERVAL '1 month',
        NOW(),
        NOW()
      )
      ON CONFLICT (user_id) DO UPDATE SET
        current_period_end = GREATEST(user_subscriptions.current_period_end, NOW()) + INTERVAL '1 month',
        status = 'active',
        updated_at = NOW();
    END IF;
  END IF;
  
  -- Check for recognition badges at different milestones
  IF stats_record.approved_submissions >= 10 AND NOT EXISTS (
    SELECT 1 FROM contributor_rewards 
    WHERE user_id = contributor_user_id AND reward_type = 'recognition_badge'
  ) THEN
    INSERT INTO contributor_rewards (
      user_id, 
      reward_type, 
      reward_reason, 
      submissions_count
    ) VALUES (
      contributor_user_id,
      'recognition_badge',
      'Top Contributor - 10+ approved submissions',
      stats_record.approved_submissions
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get contributor leaderboard
CREATE OR REPLACE FUNCTION get_contributor_leaderboard(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  approved_submissions INTEGER,
  contribution_score INTEGER,
  first_contribution_date TIMESTAMP WITH TIME ZONE,
  has_free_month_reward BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cs.user_id,
    u.email,
    cs.approved_submissions,
    cs.contribution_score,
    cs.first_submission_at,
    EXISTS(SELECT 1 FROM contributor_rewards cr WHERE cr.user_id = cs.user_id AND cr.reward_type = 'free_month') as has_free_month_reward
  FROM contributor_stats cs
  JOIN auth.users u ON u.id = cs.user_id
  WHERE cs.approved_submissions > 0
  ORDER BY cs.contribution_score DESC, cs.approved_submissions DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's contribution summary
CREATE OR REPLACE FUNCTION get_user_contribution_summary(check_user_id UUID)
RETURNS TABLE (
  total_submissions INTEGER,
  approved_submissions INTEGER,
  pending_submissions INTEGER,
  contribution_score INTEGER,
  rewards_earned INTEGER,
  next_milestone INTEGER,
  progress_to_next_milestone NUMERIC
) AS $$
DECLARE
  stats_record contributor_stats%ROWTYPE;
  rewards_count INTEGER;
  next_milestone INTEGER;
BEGIN
  -- Get stats
  SELECT * INTO stats_record FROM contributor_stats WHERE user_id = check_user_id;
  
  IF NOT FOUND THEN
    stats_record.total_submissions := 0;
    stats_record.approved_submissions := 0;
    stats_record.pending_submissions := 0;
    stats_record.contribution_score := 0;
  END IF;
  
  -- Count rewards
  SELECT COUNT(*) INTO rewards_count FROM contributor_rewards WHERE user_id = check_user_id;
  
  -- Calculate next milestone
  IF stats_record.approved_submissions < 10 THEN
    next_milestone := 10;
  ELSIF stats_record.approved_submissions < 50 THEN
    next_milestone := 50;
  ELSIF stats_record.approved_submissions < 100 THEN
    next_milestone := 100;
  ELSE
    next_milestone := ((stats_record.approved_submissions / 50) + 1) * 50;
  END IF;
  
  RETURN QUERY SELECT
    stats_record.total_submissions,
    stats_record.approved_submissions,
    stats_record.pending_submissions,
    stats_record.contribution_score,
    rewards_count,
    next_milestone,
    CASE 
      WHEN next_milestone > 0 THEN 
        ROUND((stats_record.approved_submissions::NUMERIC / next_milestone::NUMERIC) * 100, 1)
      ELSE 100.0
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments
COMMENT ON TABLE contributor_rewards IS 'Tracks rewards granted to prolific contributors';
COMMENT ON TABLE contributor_stats IS 'Aggregated statistics for user contributions';
COMMENT ON FUNCTION check_and_grant_rewards IS 'Automatically checks and grants rewards based on contribution milestones';
COMMENT ON FUNCTION get_contributor_leaderboard IS 'Returns top contributors for leaderboard display';
COMMENT ON FUNCTION get_user_contribution_summary IS 'Returns comprehensive contribution summary for a user';

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON contributor_rewards TO authenticated;
GRANT ALL ON contributor_stats TO authenticated;
GRANT EXECUTE ON FUNCTION check_and_grant_rewards TO authenticated;
GRANT EXECUTE ON FUNCTION get_contributor_leaderboard TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_contribution_summary TO authenticated; 