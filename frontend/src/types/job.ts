// src/types/job.ts
export interface Job {
  id: string;
  title: string;
  company?: string | null;
  location?: string | null;
  description?: string | null;
  paid?: boolean | null;

  // 🆕 Salary-related fields
  show_salary_range?: boolean | null;
  salary_min?: number | null;
  salary_max?: number | null;
  pay_period?: "hourly" | "monthly" | "yearly" | null;
  payment_currency?: string | null;

  // 🏢 Employer-related (optional for candidates)
  job_type?: string | null;
  department?: string | null;
  work_mode?: string | null;

  proof_tasks?: {
    id: string;
    title: string;
    description?: string | null;
    expected_time?: string | null;
    submission_format?: string | null;
    ai_tools_allowed?: boolean | null;
    duration_minutes?: number | null;
  }[];
}