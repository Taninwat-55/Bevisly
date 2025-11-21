// src/types/employer.ts
import type { ProofTask } from "./shared";

// Type representing a single job posted by an employer.
export type EmployerJob = {
  id: string;
  title: string;
  description: string | null;
  company: string | null;
  location: string | null;
  paid: boolean | null;
  payment_amount?: number | null;
  payment_currency?: string | null;
  show_salary_range?: boolean | null;
  salary_min?: number | null;
  salary_max?: number | null;
  pay_period?: "hourly" | "monthly" | "yearly" | null;
  job_type?: string | null;
  department?: string | null;
  work_mode?: string | null;
  created_at: string | null;
  featured?: boolean | null;
  status?: string | null; 
  expires_at?: string | null;
};

/**
 * Type representing the summarized stats for each employer job.
 * Mirrors the SQL view `employer_job_summary`.
 */
export type EmployerJobSummary = {
  job_id: string | null;
  employer_id: string | null;
  title: string | null;
  submissions_count: number | null;
  avg_score: number | null;
};

export type HiringStage =
  | "new"
  | "shortlisted"
  | "interview"
  | "hold"
  | "hired"
  | "rejected";

// Type representing a candidate submission visible to an employer.
export type EmployerSubmission = {
  id: string;
  user_id: string | null;
  job_id: string | null;
  created_at: string | null;
  status: string | null;
  submission_link: string | null;
  reflection: string | null;
  proof_tasks: { id: string; title: string | null } | null;

  jobs?: { title: string | null } | null;
  feedback?: { stars: number | null }[] | null;

  // 🧭 Talent Manager fields
  hiring_stage?: HiringStage | null;
  employer_notes?: string | null;

  // 🆕 New — attach candidate resume for employers
  resume_url?: string | null;

  // ✅ NEW: Profile data fetched via join
  profiles?: {
    full_name: string | null;
    email: string | null;
    resume_url?: string | null;
  } | null;
};

// Used on EmployerHome.tsx for recent submissions section
export type EmployerRecentSubmission = {
  id: string;
  user_id: string | null;
  job_id: string | null;
  created_at: string | null;
  proof_tasks: { title: string | null } | null;
  feedback: { stars: number | null }[] | null;
};

// Summary of key employer stats (used on EmployerHome)
export type EmployerStats = {
  jobsPosted: number;
  activeSubmissions: number;
  avgScore: number | null;
  submissions: EmployerRecentSubmission[];
};


export interface EmployerJobFormValues {
  id?: string;
  title: string;
  description: string;
  company: string;
  location: string;
  paid: boolean;
  payment_amount?: number | null;
  payment_currency?: string | null;
  show_salary_range?: boolean; // toggle for salary visibility
  salary_min?: number | null;
  salary_max?: number | null;
  pay_period?: "hourly" | "monthly" | "yearly" | null;
  job_type?: string;
  department?: string;
  work_mode?: string;
  proof_tasks: ProofTask[];
}