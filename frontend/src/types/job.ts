export interface Job {
  id: string;
  title: string;
  company?: string | null;
  location?: string | null;
  description?: string | null;
  requirements?: string | null;
  paid?: boolean | null;
  apply_url?: string | null;

  // Salary-related fields  
  show_salary_range?: boolean | null;
  salary_min?: number | null;
  salary_max?: number | null;
  pay_period?: "hourly" | "monthly" | "yearly" | null;
  payment_currency?: string | null;

  // Employer-related (optional for candidates)
  job_type?: string | null;
  department?: string | null;
  work_mode?: string | null;

  // Timestamps
  created_at?: string | null;
  updated_at?: string | null;
  expires_at?: string | null;

  proof_tasks?: {
    id: string;
    title: string;
    description?: string | null;
    expected_time?: string | null;
    submission_format?: string | null;
    ai_tools_allowed?: boolean | null;
    duration_minutes?: number | null;
    attachments?: string[] | null;
  }[];
}