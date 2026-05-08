/**
 * One row of a proof task's scoring rubric.
 * Locked once the first candidate submits (see proof_tasks.rubric_locked_at).
 */
export type RubricCriterion = {
  name: string;
  weight: number; // 1-100; criteria for one task must sum to 100
  description: string;
};

/**
 * Per-criterion score recorded inside `feedback.rubric_scores`.
 * `name` matches a RubricCriterion.name on the parent proof_task.
 */
export type RubricScore = {
  name: string;
  score: number; // 1-5
  note?: string | null;
};

/**
 * Shared type used by both candidate and employer flows.
 * Mirrors `proof_tasks` table shape used in both.
 */
export type ProofTask = {
  id: string;
  job_id?: string | null;
  title: string;
  description?: string | null;
  expected_time?: string | null;
  duration_minutes?: number | null;
  submission_format?: string | null;
  submission_type?: "link" | "file" | "text" | "mixed" | "github_repo";
  recommended_platform?: string | null;
  ai_tools_allowed?: boolean | null;
  attachments?: string[] | null;
  credits?: number | null;
  company_name?: string | null;
  rubric_criteria?: RubricCriterion[] | null;
  rubric_locked_at?: string | null;
};

// Shape of a feedback record from the `feedback` table.
export type Feedback = {
  id?: string;
  submission_id?: string | null;
  employer_id?: string | null;
  strengths: string | null;
  improvements: string | null;
  stars: number | null;
  rubric_scores?: RubricScore[] | null;
  created_at: string | null;
};

/**
 * Minimal public information shown in the leaderboard.
 * Mirrors the `profiles` table subset (name + credits).
 */
export type LeaderProfile = {
  full_name: string | null;
  credits: number | null;
};

// Minimal public-facing profile info
export type ProfileLite = {
  id: string;
  full_name: string | null;
  credits: number | null;
  username?: string | null;
  is_public?: boolean;
  avatar_url?: string | null;
};

// Minimal proof card info used in public + candidate profile grids
export type ProofCardLite = {
  id?: string | null;
  job_title: string | null;
  rating: number | null;
  comments: string | null;
  reviewed_at: string | null;
  submission_id?: string | null;
  is_public?: boolean;
  is_featured?: boolean;
};

export type FeaturedJob = {
  id: string;
  title: string | null;
  company: string | null;
  location: string | null;
  created_at: string | null;
};

/**
 * Full Profile shape mirroring the 'profiles' table.
 * Includes both Candidate and Employer fields (Billing/Credits).
 */
export type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: "candidate" | "employer" | "admin";
  credits: number;
  created_at: string | null;
  avatar_url?: string | null;

  // Employer Specific (Billing/Usage)
  company_name?: string | null;
  subscription_tier?:
    | "free"
    | "pro_saas"
    | "free_starter"
    | "founder_pro"
    | "growth_saas"
    | "candidate_pro";
  active_jobs_count?: number;
  monthly_job_posts_count?: number;
  billing_period_start?: string | null;
  billing_period_end?: string | null;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;

  // Candidate Specific
  resume_url?: string | null;
  resume_updated_at?: string | null;
  is_public?: boolean;
  is_verified?: boolean | null;
  username?: string | null;
  skills?: string[] | null;
  work_status?: string | null;
  bio?: string | null;
  linkedin_url?: string | null;
  github_url?: string | null;
  website_url?: string | null;
};
