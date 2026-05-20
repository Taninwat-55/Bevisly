/**
 * Company Types - Multi-Tenant Architecture
 */

export type CompanyRole = "owner" | "admin" | "member";

export type Company = {
  id: string;
  name: string;
  slug: string | null;
  logo_url: string | null;
  team_photos?: string[] | null;
  owner_id: string | null;
  created_at: string | null;
  // Company Profile (set once in settings, shown on job posts)
  description?: string | null;
  mission?: string | null;
  culture?: string | null;
  website_url?: string | null;
  country?: string | null;
  // Company Details
  industry?: string | null;
  company_size?: string | null;
  stage?: string | null;
  founded_year?: number | null;
  business_model?: string[] | null;
  perks?: string[] | null;
  // Responsibility Score (anti-ghosting accountability)
  responsibility_score?: number | null;
  avg_review_days?: number | null;
  // Verification (set by admin on the owner's profile)
  is_verified?: boolean | null;
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
