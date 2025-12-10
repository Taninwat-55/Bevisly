// src/types/shared.ts

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
};

// Shape of a feedback record from the `feedback` table.
export type Feedback = {
  id?: string;
  submission_id?: string | null;
  employer_id?: string | null;
  strengths: string | null;
  improvements: string | null;
  stars: number | null;
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
};

// Minimal proof card info used in public + candidate profile grids
export type ProofCardLite = {
  id?: string | null;
  job_title: string | null;
  rating: number | null;
  comments: string | null;
  reviewed_at: string | null;
  submission_id?: string | null; 
};

export type FeaturedJob = {
  id: string;
  title: string | null;
  company: string | null;
  location: string | null;
  created_at: string | null;
};