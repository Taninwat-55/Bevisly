import { supabase } from "../supabaseClient";
import type {
  AdminStats,
  BevisUser,
  AdminJob,
  AdminFeedback,
} from "../../types/admin";

// 🧾 Fetch all users (Updated to query PROFILES)
export async function getAllUsers(): Promise<BevisUser[]> {
  const { data, error } = await supabase
    .from("profiles") // ✅ Changed from 'users'
    .select("id, email, role, created_at")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (
    data?.map((u) => ({
      id: u.id,
      email: u.email ?? "",
      role: (u.role as BevisUser["role"]) || "candidate",
      created_at: u.created_at ?? new Date().toISOString(),
    })) ?? []
  );
}

// 🧾 Fetch all jobs (Updated to join PROFILES)
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
    ` // ✅ Changed users!employer_id to profiles!employer_id
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
      employer_email: job.profiles?.email ?? "—", // ✅ Access profiles
    })) ?? []
  );
}

// 🧾 Fetch all feedback logs
export async function getAllFeedbackLogs(): Promise<AdminFeedback[]> {
  const { data, error } = await supabase
    .from("feedback")
    .select(
      `
      id,
      rating,
      comments,
      stars,
      created_at,
      submissions!feedback_submission_id_fkey (
        jobs ( title ),
        profiles!submissions_user_id_fkey ( email )
      ),
      employer:profiles!feedback_employer_id_fkey ( email )
    ` // ✅ Updated joins to use profiles
    )
    .order("created_at", { ascending: false });

  if (error) throw error;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type RawFeedback = any;

  return (
    (data as RawFeedback[])?.map((f) => ({
      id: f.id,
      job_title: f.submissions?.jobs?.title ?? "—",
      candidate_email: f.submissions?.profiles?.email ?? "—", // ✅ Access profiles
      employer_email: f.employer?.email ?? "—",
      rating: f.rating ?? f.stars ?? null,
      comment: f.comments ?? "",
      created_at: f.created_at ?? new Date().toISOString(),
    })) ?? []
  );
}

// ... Keep toggleFeaturedJob, updateUserRole, getAdminStats, etc. as they were ...
// (Ensure updateUserRole updates 'profiles' table, not 'users')

export async function updateUserRole(userId: string, newRole: string) {
  const { error } = await supabase
    .from("profiles") // ✅ Changed from 'users'
    .update({ role: newRole })
    .eq("id", userId);
  if (error) throw error;
  return true;
}

// ... Keep the rest of the file unchanged ...
export async function toggleFeaturedJob(jobId: string, newState: boolean) {
  const { error } = await supabase
    .from("jobs")
    .update({ featured: newState })
    .eq("id", jobId);
  if (error) throw error;
  return true;
}

export async function getAdminStats(): Promise<AdminStats> {
  // Fetch all feedback rows
  const { data, error } = await supabase.from("feedback").select("rating, stars");
  if (error) throw error;

  const [
    { count: total_users },
    { count: total_jobs },
    { count: total_submissions },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }), // ✅ profiles
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

export async function getTableData(table: string, limit = 25, offset = 0) {
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

// 🧩 Fetch column schema (name + type) safely
export async function getTableSchema(table: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  
  const { data, error } = await sb
    .from("information_schema.columns")
    .select("column_name, data_type")
    .eq("table_name", table); // ✅ Now we use the 'table' variable to filter

  if (error) {
    console.warn("Schema fetch failed:", error.message);
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data?.filter((c: any) => typeof c.column_name === 'string') ?? [];
}