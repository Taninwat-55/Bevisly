/**
 * Company Types - Multi-Tenant Architecture
 */

export type CompanyRole = "owner" | "admin" | "member";

export type Company = {
  id: string;
  name: string;
  slug: string | null;
  logo_url: string | null;
  owner_id: string | null;
  created_at: string | null;
  // Pricing & Usage
  subscription_tier?: "free" | "pro_saas";
  active_jobs_count?: number;
  monthly_job_posts_count?: number;
  credits?: number;
};

export type CompanyMember = {
  id: string;
  company_id: string;
  user_id: string;
  role: CompanyRole;
  invited_by: string | null;
  created_at: string | null;
  // Joined profile info
  profiles?: {
    full_name: string | null;
    email: string | null;
  } | null;
};

export type CompanyWithMembers = Company & {
  members: CompanyMember[];
};
