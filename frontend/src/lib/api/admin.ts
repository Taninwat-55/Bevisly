import { supabase } from "../supabaseClient";
import type {
  AdminStats,
  BevislyUser,
  AdminJob,
  AdminFeedback,
} from "../../types/admin";

// Fetch all users (Updated to query PROFILES)
export async function getAllUsers(): Promise<BevislyUser[]> {
  const { data, error } = await supabase
    .from("profiles") 
    .select("id, email, role, created_at, credits, is_verified")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (
    data?.map((u) => ({
      id: u.id,
      email: u.email ?? "",
      role: (u.role as BevislyUser["role"]) || "candidate",
      created_at: u.created_at ?? new Date().toISOString(),
      credits: u.credits ?? 0,
      is_verified: u.is_verified ?? false,
    })) ?? []
  );
}

// Fetch all jobs (Updated to join PROFILES)
export async function getAllJobs(): Promise<AdminJob[]> {
  const { data, error } = await supabase
    .from("jobs")
    .select(
      `
      id,
      title,
      status,
      company,
      location,
      created_at,
      featured, 
      profiles!employer_id ( email ) 
    ` 
    )
    .order("created_at", { ascending: false });

  if (error) throw error;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type RawJob = any; 

  return (
    (data as RawJob[])?.map((job) => ({
      id: job.id,
      title: job.title ?? "Untitled Job",
      status: job.status ?? "unknown",
      company: job.company ?? "—",
      location: job.location ?? "—",
      created_at: job.created_at ?? new Date().toISOString(),
      employer_email: job.profiles?.email ?? "—", 
    })) ?? []
  );
}

// Fetch all feedback logs
export async function getAllFeedbackLogs(): Promise<AdminFeedback[]> {
  const { data, error } = await supabase
    .from("feedback")
    .select(
      `
      id,
      submission_id,
      rating,
      comments,
      stars,
      created_at,
      submissions!feedback_submission_id_fkey (
        jobs ( title ),
        profiles!submissions_user_id_fkey ( email )
      ),
      employer:profiles!feedback_employer_id_fkey ( email )
    ` 
    )
    .order("created_at", { ascending: false });

  if (error) throw error;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type RawFeedback = any;

  return (
    (data as RawFeedback[])?.map((f) => ({
      id: f.id,
      job_title: f.submissions?.jobs?.title ?? "—",
      candidate_email: f.submissions?.profiles?.email ?? "—", 
      employer_email: f.employer?.email ?? "—",
      rating: f.rating ?? f.stars ?? null,
      comment: f.comments ?? "",
      created_at: f.created_at ?? new Date().toISOString(),
      submission_id: f.submission_id,
    })) ?? []
  );
}

export async function updateUserRole(userId: string, newRole: string) {
  const { error } = await supabase
    .from("profiles") 
    .update({ role: newRole })
    .eq("id", userId);
  if (error) throw error;
  return true;
}

export async function toggleFeaturedJob(jobId: string, newState: boolean) {
  const { error } = await supabase
    .from("jobs")
    .update({ featured: newState })
    .eq("id", jobId);
  if (error) throw error;
  return true;
}

// Add credits to a user (Admin only)
export async function setUserVerified(userId: string, verified: boolean): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .update({ is_verified: verified })
    .eq("id", userId);
  if (error) throw error;
}

export async function addCredits(userId: string, amount: number) {
  // First get current credits
  const { data: profile, error: fetchError } = await supabase
    .from("profiles")
    .select("credits")
    .eq("id", userId)
    .single();

  if (fetchError) throw fetchError;

  const current = profile?.credits || 0;
  const newBalance = current + amount;

  const { error } = await supabase
    .from("profiles")
    .update({ credits: newBalance })
    .eq("id", userId);

  if (error) throw error;
  return newBalance;
}

export async function getAdminStats(): Promise<AdminStats> {
  const { data, error } = await supabase.from("feedback").select("rating, stars");
  if (error) throw error;

  const [
    { count: total_users },
    { count: total_jobs },
    { count: total_submissions },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }), 
    supabase.from("jobs").select("*", { count: "exact", head: true }),
    supabase.from("submissions").select("*", { count: "exact", head: true }),
  ]);

  const safe = (n: number | null) => n ?? 0;
  const ratings = Array.isArray(data)
    ? data
        .map((f) => (f.rating ?? f.stars ?? 0) as number)
        .filter((n) => typeof n === "number" && !isNaN(n))
    : [];

  const avg_feedback_score =
    ratings.length > 0
      ? (ratings.reduce((a, b) => a + Number(b), 0) / ratings.length).toFixed(2)
      : "—";

  return {
    total_users: safe(total_users),
    total_jobs: safe(total_jobs),
    total_submissions: safe(total_submissions),
    total_feedbacks: data?.length ?? 0,
    avg_feedback_score,
  };
}

// Allowed tables for admin data viewer (security whitelist)
const ALLOWED_TABLES = [
  'profiles',
  'jobs', 
  'submissions',
  'feedback',
  'proof_tasks',
  'saved_jobs',
  'credit_transactions',
  'feedback_messages',
  'invitations',
];

export async function getTableData(table: string, limit = 25, offset = 0) {
  // Security: Validate table name against whitelist
  if (!ALLOWED_TABLES.includes(table)) {
    throw new Error(`Access denied: Table '${table}' is not in the allowed list`);
  }
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any; 
  const { data, error } = await sb
    .from(table)
    .select("*")
    .range(offset, offset + limit - 1);
  if (error) throw error;
  const columns = data && data.length > 0 ? Object.keys(data[0]) : [];
  return { columns, rows: data ?? [] };
}

// Fetch column schema (name + type) safely
export async function getTableSchema(table: string) {
  // Security: Validate table name against whitelist
  if (!ALLOWED_TABLES.includes(table)) {
    throw new Error(`Access denied: Table '${table}' is not in the allowed list`);
  }
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  
  const { data, error } = await sb
    .from("information_schema.columns")
    .select("column_name, data_type")
    .eq("table_name", table); 

  if (error) {
    console.warn("Schema fetch failed:", error.message);
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data?.filter((c: any) => typeof c.column_name === 'string') ?? [];
}