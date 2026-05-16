import type { Job } from "./job";

export type CandidateJob = Job;

export type CandidateSubmission = {
  id: string;
  job_id: string | null;
  proof_task_id: string | null;
  created_at: string | null;
  status: string | null;
  submission_link: string | null;
  reflection: string | null;
  jobs?: { title: string | null; company: string | null } | null;
  proof_tasks?: { title: string | null } | null;
};

export type CandidateFeedback = {
  strengths: string | null;
  improvements: string | null;
  stars: number | null;
  comments: string | null;
  feedback_letter?: string | null;
  created_at: string | null;
};

/**
 * Full joined feedback object returned from getCandidateFeedback().
 */
export type CandidateFeedbackEntry = {
  id: string;
  created_at: string | null;
  status: string | null;
  is_public?: boolean;
  submission_link?: string | null;
  reflection?: string | null;
  jobs: { title: string | null; company: string | null } | null;
  proof_tasks: { title: string | null } | null;
  feedback: CandidateFeedback[];
};

export type DashboardProof = {
  id: string;
  status:
    | "not_started"
    | "in_progress"
    | "submitted"
    | "reviewed"
    | string
    | null;
  created_at: string | null; 
  proof_tasks?: {
    id: string;
    title: string;
  } | null;
  jobs?: {
    title: string | null; 
    company: string | null; 
  } | null;
};