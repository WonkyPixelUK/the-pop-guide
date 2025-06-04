-- Create user_submitted_funkos table for user contributions
CREATE TABLE IF NOT EXISTS user_submitted_funkos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  series TEXT NOT NULL,
  number TEXT NOT NULL,
  variant TEXT,
  description TEXT,
  release_date TEXT,
  exclusive_to TEXT,
  ean TEXT,
  image_url TEXT,
  rarity TEXT DEFAULT 'Common',
  is_exclusive BOOLEAN DEFAULT FALSE,
  is_vaulted BOOLEAN DEFAULT FALSE,
  is_chase BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'approved', 'rejected', 'needs_changes')),
  submitted_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewer_notes TEXT,
  is_price_tracking BOOLEAN DEFAULT FALSE,
  approved_funko_id UUID, -- References the final funko_pop when approved
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_submitted_funkos_submitted_by ON user_submitted_funkos(submitted_by);
CREATE INDEX IF NOT EXISTS idx_user_submitted_funkos_status ON user_submitted_funkos(status);
CREATE INDEX IF NOT EXISTS idx_user_submitted_funkos_created_at ON user_submitted_funkos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_submitted_funkos_reviewed_at ON user_submitted_funkos(reviewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_submitted_funkos_name_series ON user_submitted_funkos(name, series);
CREATE INDEX IF NOT EXISTS idx_user_submitted_funkos_is_price_tracking ON user_submitted_funkos(is_price_tracking);

-- Enable RLS
ALTER TABLE user_submitted_funkos ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own submissions
CREATE POLICY "Users can view their own submissions" ON user_submitted_funkos
  FOR SELECT USING (auth.uid() = submitted_by);

-- Users can insert their own submissions
CREATE POLICY "Users can submit funkos" ON user_submitted_funkos
  FOR INSERT WITH CHECK (auth.uid() = submitted_by);

-- Users can update their own pending submissions
CREATE POLICY "Users can update their pending submissions" ON user_submitted_funkos
  FOR UPDATE USING (
    auth.uid() = submitted_by 
    AND status IN ('pending_review', 'needs_changes')
  );

-- Admins/reviewers can view all submissions
CREATE POLICY "Reviewers can view all submissions" ON user_submitted_funkos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.uid() = id 
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Admins/reviewers can update submission status
CREATE POLICY "Reviewers can manage submissions" ON user_submitted_funkos
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.uid() = id 
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Service role can do everything (for automated processes)
CREATE POLICY "Service role can manage submissions" ON user_submitted_funkos
  FOR ALL USING (auth.role() = 'service_role');

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_submitted_funkos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for automatic updated_at updates
CREATE TRIGGER update_user_submitted_funkos_updated_at
  BEFORE UPDATE ON user_submitted_funkos
  FOR EACH ROW
  EXECUTE FUNCTION update_user_submitted_funkos_updated_at();

-- Function to handle submission approval (creates funko_pop and updates submission)
CREATE OR REPLACE FUNCTION approve_funko_submission(submission_id UUID, reviewer_id UUID, notes TEXT DEFAULT NULL)
RETURNS UUID AS $$
DECLARE
  submission_record user_submitted_funkos%ROWTYPE;
  new_funko_id UUID;
BEGIN
  -- Get the submission
  SELECT * INTO submission_record FROM user_submitted_funkos WHERE id = submission_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Submission not found';
  END IF;
  
  IF submission_record.status != 'pending_review' THEN
    RAISE EXCEPTION 'Submission is not pending review';
  END IF;
  
  -- Insert into main funko_pops table
  INSERT INTO funko_pops (
    name, series, number, variant, description, release_date, 
    exclusive_to, ean, image_url, rarity, is_exclusive, is_vaulted, is_chase,
    created_at, updated_at
  ) VALUES (
    submission_record.name, submission_record.series, submission_record.number,
    submission_record.variant, submission_record.description, 
    CASE WHEN submission_record.release_date != '' THEN submission_record.release_date::DATE ELSE NULL END,
    submission_record.exclusive_to, submission_record.ean, submission_record.image_url,
    submission_record.rarity, submission_record.is_exclusive, submission_record.is_vaulted, 
    submission_record.is_chase, NOW(), NOW()
  ) RETURNING id INTO new_funko_id;
  
  -- Update submission status
  UPDATE user_submitted_funkos SET
    status = 'approved',
    reviewed_by = reviewer_id,
    reviewed_at = NOW(),
    reviewer_notes = notes,
    approved_funko_id = new_funko_id,
    is_price_tracking = TRUE
  WHERE id = submission_id;
  
  RETURN new_funko_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reject submission
CREATE OR REPLACE FUNCTION reject_funko_submission(submission_id UUID, reviewer_id UUID, notes TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE user_submitted_funkos SET
    status = 'rejected',
    reviewed_by = reviewer_id,
    reviewed_at = NOW(),
    reviewer_notes = notes
  WHERE id = submission_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Submission not found';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to request changes on submission
CREATE OR REPLACE FUNCTION request_changes_funko_submission(submission_id UUID, reviewer_id UUID, notes TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE user_submitted_funkos SET
    status = 'needs_changes',
    reviewed_by = reviewer_id,
    reviewed_at = NOW(),
    reviewer_notes = notes
  WHERE id = submission_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Submission not found';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments for documentation
COMMENT ON TABLE user_submitted_funkos IS 'User-contributed Funko Pop submissions awaiting review';
COMMENT ON COLUMN user_submitted_funkos.status IS 'Review status: pending_review, approved, rejected, needs_changes';
COMMENT ON COLUMN user_submitted_funkos.is_price_tracking IS 'Whether price scraping has been initiated for this submission';
COMMENT ON COLUMN user_submitted_funkos.approved_funko_id IS 'ID of the funko_pop record created when this submission was approved';
COMMENT ON FUNCTION approve_funko_submission IS 'Approves a submission and creates corresponding funko_pop record';
COMMENT ON FUNCTION reject_funko_submission IS 'Rejects a submission with reviewer notes';
COMMENT ON FUNCTION request_changes_funko_submission IS 'Requests changes to a submission';

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON user_submitted_funkos TO authenticated;
GRANT EXECUTE ON FUNCTION approve_funko_submission TO authenticated;
GRANT EXECUTE ON FUNCTION reject_funko_submission TO authenticated;
GRANT EXECUTE ON FUNCTION request_changes_funko_submission TO authenticated; 