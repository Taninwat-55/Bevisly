import { supabase } from "../supabaseClient";
import type { Company, CompanyMember } from "@/types";

/**
 * Get the current user's company from the real companies table.
 * Falls back to profile data for billing fields (subscription_tier, credits, etc.)
 */
export async function getCurrentCompany(): Promise<Company | null> {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) return null;

  // 1. Find the user's company via company_members
  const { data: membership, error: memError } = await supabase
    .from("company_members")
    .select("company_id, role")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (memError || !membership) {
    // No company membership found — fall back to profile-based shim for backward compat
    return getCurrentCompanyFromProfile(user.id);
  }

  // 2. Fetch the company
  const { data: company, error: compError } = await supabase
    .from("companies")
    .select("*")
    .eq("id", membership.company_id)
    .single();

  if (compError || !company) return null;

  // 3. Fetch billing data from profile (stays on profile for MVP)
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_tier, active_jobs_count, monthly_job_posts_count, credits")
    .eq("id", user.id)
    .single();

  return {
    id: company.id,
    name: company.name,
    slug: company.slug,
    logo_url: company.logo_url,
    owner_id: company.owner_id,
    created_at: company.created_at,
    description: company.description ?? null,
    mission: company.mission ?? null,
    culture: company.culture ?? null,
    website_url: company.website_url ?? null,
    responsibility_score: company.responsibility_score ?? null,
    subscription_tier: profile?.subscription_tier,
    active_jobs_count: profile?.active_jobs_count,
    monthly_job_posts_count: profile?.monthly_job_posts_count,
    credits: profile?.credits,
  };
}

/**
 * Fallback: Map profile to Company type (for users without company_members entry)
 */
async function getCurrentCompanyFromProfile(userId: string): Promise<Company | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    name: data.company_name || data.full_name || "My Company",
    slug: data.username,
    logo_url: null,
    owner_id: data.id,
    created_at: data.created_at,
    subscription_tier: data.subscription_tier,
    active_jobs_count: data.active_jobs_count,
    monthly_job_posts_count: data.monthly_job_posts_count,
    credits: data.credits,
  };
}

/**
 * Get the current user's company_id (convenience helper)
 */
export async function getCurrentCompanyId(): Promise<string | null> {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) return null;

  const { data } = await supabase
    .from("company_members")
    .select("company_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  return data?.company_id ?? null;
}

/**
 * Get all companies the user belongs to
 */
export async function getUserCompanies(): Promise<Company[]> {
  const company = await getCurrentCompany();
  return company ? [company] : [];
}

/**
 * Deduct credits from the company (user profile)
 */
export async function deductCompanyCredits(amount: number): Promise<boolean> {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase.rpc("deduct_credits", {
    user_id_input: user.id,
    amount: amount
  });

  if (error) {
    console.error("Credit deduction failed:", error);
    return false;
  }

  return !!data;
}

/**
 * Create a new company (for real multi-tenant usage)
 */
export async function createCompany(name: string, slug?: string): Promise<Company> {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error("Not authenticated");

  // Create the company
  const { data: company, error: compError } = await supabase
    .from("companies")
    .insert({ name, slug: slug || null, owner_id: user.id })
    .select()
    .single();

  if (compError) throw compError;

  // Add the creator as owner
  const { error: memError } = await supabase
    .from("company_members")
    .insert({ company_id: company.id, user_id: user.id, role: "owner" });

  if (memError) {
    console.error("Failed to create membership:", memError);
    // Don't throw — company was created, membership is secondary
  }

  // Also sync to profile.company_name for backward compatibility
  await supabase
    .from("profiles")
    .update({ company_name: name })
    .eq("id", user.id);

  return {
    id: company.id,
    name: company.name,
    slug: company.slug,
    logo_url: company.logo_url,
    owner_id: company.owner_id,
    created_at: company.created_at,
  };
}

/**
 * Update company name (syncs to both companies table and profile)
 */
export async function updateCompanyName(companyId: string, name: string): Promise<void> {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("companies")
    .update({ name, updated_at: new Date().toISOString() })
    .eq("id", companyId);

  if (error) throw error;

  // Keep profile.company_name in sync
  await supabase
    .from("profiles")
    .update({ company_name: name })
    .eq("id", user.id);
}

/**
 * Update company profile fields (about, mission, culture, website)
 */
export async function updateCompanyProfile(
  companyId: string,
  fields: { description?: string | null; mission?: string | null; culture?: string | null; website_url?: string | null }
): Promise<void> {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("companies")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", companyId);

  if (error) throw error;
}

/**
 * Get company profile by company_id (public — used on job detail pages)
 */
export async function getCompanyProfile(companyId: string): Promise<Company | null> {
  const { data, error } = await supabase
    .from("companies")
    .select("id, name, slug, logo_url, description, mission, culture, website_url, responsibility_score")
    .eq("id", companyId)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    logo_url: data.logo_url,
    owner_id: null,
    created_at: null,
    description: data.description ?? null,
    mission: data.mission ?? null,
    culture: data.culture ?? null,
    website_url: data.website_url ?? null,
    responsibility_score: data.responsibility_score ?? null,
  };
}

/**
 * Get company by slug (public — used by the Employer Brand Page)
 */
export async function getCompanyBySlug(slug: string): Promise<Company | null> {
  const { data, error } = await supabase
    .from("companies")
    .select("id, name, slug, logo_url, description, mission, culture, website_url, responsibility_score")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) return null;

  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    logo_url: data.logo_url,
    owner_id: null,
    created_at: null,
    description: data.description ?? null,
    mission: data.mission ?? null,
    culture: data.culture ?? null,
    website_url: data.website_url ?? null,
    responsibility_score: data.responsibility_score ?? null,
  };
}

/**
 * Get company members (stub for MVP — real implementation later)
 */
export async function getCompanyMembers(): Promise<CompanyMember[]> {
  return []; // Team features coming in Pro plan
}

/**
 * Invite to company (stub)
 */
export async function inviteToCompany() {
  throw new Error("Team features available in Pro SaaS plan.");
}
