export type FeatureRequest = {
  id: string;
  title: string;
  description: string | null;
  created_by: string | null;
  created_at: string;
};

export type FeatureRequestVote = {
  id: string;
  feature_request_id: string;
  user_id: string;
  vote: number; // 1 or -1
  created_at: string;
};

