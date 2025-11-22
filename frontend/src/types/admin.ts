// src/types/admin.ts
export interface AdminStats {
  total_users: number;
  total_jobs: number;
  total_submissions: number;
  total_feedbacks: number;
  avg_feedback_score: string | number;
}

export interface BevislyUser {
  id: string;
  email: string;
  role: "candidate" | "employer" | "admin";
  created_at: string;
}

export interface AdminJob {
  id: string;
  title: string;
  status: string;
  company?: string;
  location?: string;
  created_at: string;
  employer_email: string;
  featured?: boolean | null;
}

export interface AdminFeedback {
  id: string;
  submission_id: string;
  job_title: string;
  candidate_email: string;
  employer_email: string;
  rating: number | null;
  comment: string;
  created_at: string;
}

export interface FeedbackMessage {
  id: string;
  user_id: string | null;
  category: string | null;
  message: string;
  page: string | null;
  created_at: string | null;
  profiles?: {
    full_name: string | null;
    email: string | null;
  } | null;
}
