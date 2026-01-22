import { supabase } from "../supabaseClient";
import type { Company, CompanyMember } from "@/types";

/**
 * Get the current user's company (first company they belong to)
 */
export async function getCurrentCompany(): Promise<Company | null> {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) return null;

  const { data, error } = await supabase
    .from("company_members")
    .select(`
      company_id,
      role,
      companies:company_id (
        id,
        name,
        slug,
        logo_url,
        owner_id,
        created_at
      )
    `)
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  
  // Unwrap the nested company object
  const company = Array.isArray(data.companies) 
    ? data.companies[0] 
    : data.companies;
  
  return company as Company | null;
}

/**
 * Get all companies the user belongs to
 */
export async function getUserCompanies(): Promise<Company[]> {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) return [];

  const { data, error } = await supabase
    .from("company_members")
    .select(`
      company_id,
      role,
      companies:company_id (
        id,
        name,
        slug,
        logo_url,
        owner_id,
        created_at
      )
    `)
    .eq("user_id", user.id);

  if (error || !data) return [];

  return data
    .map((m) => (Array.isArray(m.companies) ? m.companies[0] : m.companies))
    .filter(Boolean) as Company[];
}

/**
 * Get members of a company
 */
export async function getCompanyMembers(companyId: string): Promise<CompanyMember[]> {
  const { data, error } = await supabase
    .from("company_members")
    .select(`
      id,
      company_id,
      user_id,
      role,
      invited_by,
      created_at,
      profiles:user_id (
        full_name,
        email
      )
    `)
    .eq("company_id", companyId);

  if (error) throw error;

  return data.map((m: any): CompanyMember => ({
    ...m,
    profiles: Array.isArray(m.profiles) ? m.profiles[0] : m.profiles,
  }));
}

/**
 * Create a new company and add creator as owner
 */
export async function createCompany(name: string, slug?: string): Promise<Company> {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error("Not authenticated");

  // Create company
  const { data: company, error: companyErr } = await supabase
    .from("companies")
    .insert({ name, slug, owner_id: user.id })
    .select()
    .single();

  if (companyErr) throw companyErr;

  // Add owner to members
  const { error: memberErr } = await supabase
    .from("company_members")
    .insert({
      company_id: company.id,
      user_id: user.id,
      role: "owner",
    });

  if (memberErr) throw memberErr;

  return company;
}

/**
 * Invite a user to a company by email
 */
export async function inviteToCompany(
  companyId: string,
  email: string,
  role: "admin" | "member" = "member"
): Promise<void> {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error("Not authenticated");

  // Find the user by email
  const { data: invitee, error: findErr } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (findErr || !invitee) {
    throw new Error("User not found with that email");
  }

  // Add them to company_members
  const { error } = await supabase
    .from("company_members")
    .insert({
      company_id: companyId,
      user_id: invitee.id,
      role,
      invited_by: user.id,
    });

  if (error) {
    if (error.code === "23505") {
      throw new Error("User is already a member of this company");
    }
    throw error;
  }
}
