import { supabase } from "../supabaseClient";
import type { Company, CompanyMember } from "@/types";

/**
 * Get the current user's company (Maps to Profile for MVP)
 */
export async function getCurrentCompany(): Promise<Company | null> {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error || !data) return null;
  
  // Map Profile to Company type
  return {
    id: data.id,
    name: data.company_name || data.full_name || "My Company",
    slug: data.username,
    logo_url: null, // Profile doesn't have logo_url yet, could fetch if needed
    owner_id: data.id,
    created_at: data.created_at,
    subscription_tier: data.subscription_tier,
    active_jobs_count: data.active_jobs_count,
    monthly_job_posts_count: data.monthly_job_posts_count,
    credits: data.credits,
  };
}

/**
 * Get all companies the user belongs to (Single Tenant MVP)
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

  // Call the RPC function created in migration
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

// ------------------------------------------------------------------
// Stubbed functions for compatibility with components expecting them
// ------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getCompanyMembers(_companyId: string): Promise<CompanyMember[]> {
  return []; // No multi-user support in MVP yet
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function createCompany(name: string, _slug?: string): Promise<Company> {
  // In MVP, creating a company is just updating the profile
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("profiles")
    .update({ company_name: name })
    .eq("id", user.id)
    .select()
    .single();

  if (error) throw error;
  
  return {
    id: data.id,
    name: data.company_name,
    slug: null,
    logo_url: null,
    owner_id: data.id,
    created_at: data.created_at
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function inviteToCompany(_companyId: string, _email: string) {
  throw new Error("Team features main available in Pro SaaS plan.");
}

