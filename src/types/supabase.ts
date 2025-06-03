export type FeatureRequest = {
  id: string;
  title: string;
  description: string | null;
  created_by: string | null;
  created_at: string;
  platform?: string;
};

export type FeatureRequestVote = {
  id: string;
  feature_request_id: string;
  user_id: string;
  vote: number; // 1 or -1
  created_at: string;
};

// Bug Tracking Types
export type BugSeverity = 'critical' | 'high' | 'medium' | 'low';
export type BugType = 'ui_ux' | 'functionality' | 'performance' | 'security' | 'data_loss' | 'compatibility';
export type BugStatus = 'new' | 'triaged' | 'in_progress' | 'testing' | 'resolved' | 'closed' | 'duplicate';
export type BugPlatform = 'web_app' | 'chrome_extension' | 'ios_app' | 'android_app' | 'all_platforms';
export type BugPriority = 'urgent' | 'high' | 'normal' | 'low';

export type Bug = {
  id: string;
  reference_number: string; // BUG-YYYY-NNNN format
  title: string;
  description: string;
  severity: BugSeverity;
  bug_type: BugType;
  platform: BugPlatform;
  status: BugStatus;
  priority: BugPriority;
  created_by: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  environment_data: {
    browser?: string;
    os?: string;
    screen_resolution?: string;
    user_agent?: string;
    url?: string;
    user_type?: 'free' | 'pro';
    additional_info?: Record<string, any>;
  };
  reproduction_steps?: string;
  expected_behavior?: string;
  actual_behavior?: string;
};

export type BugComment = {
  id: string;
  bug_id: string;
  user_id: string;
  comment: string;
  is_internal: boolean; // true for team-only comments
  status_change?: {
    from: BugStatus;
    to: BugStatus;
  };
  created_at: string;
};

export type BugAttachment = {
  id: string;
  bug_id: string;
  filename: string;
  file_path: string;
  file_size: number;
  file_type: string;
  uploaded_by: string;
  created_at: string;
};

export type BugNotification = {
  id: string;
  bug_id: string;
  email: string;
  notification_type: 'submission' | 'status_update' | 'resolution' | 'need_info' | 'duplicate' | 'assignment';
  sent_at: string;
  email_status: 'pending' | 'sent' | 'failed';
  email_content?: {
    subject: string;
    body: string;
  };
};

export type BugVote = {
  id: string;
  bug_id: string;
  user_id: string;
  created_at: string;
};

export type BugSubscription = {
  id: string;
  bug_id: string;
  user_id: string;
  notify_on_updates: boolean;
  created_at: string;
};

