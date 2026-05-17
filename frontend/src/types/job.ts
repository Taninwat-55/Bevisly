export interface Job {
  id: string;
  title: string;
  company?: string | null;
  location?: string | null;
  description?: string | null;
  requirements?: string | null;
  paid?: boolean | null;
  apply_url?: string | null;

  // Compensation fields
  compensation_type?: "salary" | "salary_and_equity" | "equity_only" | "volunteer" | null;
  show_salary_range?: boolean | null;
  salary_min?: number | null;
  salary_max?: number | null;
  pay_period?: "hourly" | "monthly" | "yearly" | null;
  payment_currency?: string | null;
  payment_amount?: number | null;
  equity_min?: number | null;
  equity_max?: number | null;
  application_deadline?: string | null;
  start_date?: string | null;

  // Employer-related (optional for candidates)
  job_type?: string | null;
  department?: string | null;
  work_mode?: string | null;
  employer_id?: string;
  company_id?: string | null;
  company_logo?: string | null;
  employer_verified?: boolean;
  featured?: boolean | null;

  // Joined fields
  contact_person?: {
    full_name: string | null;
    email: string | null;
  } | null;

  // Timestamps
  created_at?: string | null;
  updated_at?: string | null;
  expires_at?: string | null;

  // Company-level fields (joined from companies table)
  company_responsibility_score?: number | null;
  company_slug?: string | null;

  screening_questions?: string[] | null;

  proof_tasks?: {
    id: string;
    title: string;
    description?: string | null;
    expected_time?: string | null;
    submission_format?: string | null;
    submission_type?: string | null;
    ai_tools_allowed?: boolean | null;
    duration_minutes?: number | null;
    attachments?: string[] | null;
    rubric_criteria?: { name: string; weight: number; description: string }[] | null;
    rubric_locked_at?: string | null;
  }[];
}
