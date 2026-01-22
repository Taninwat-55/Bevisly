import { supabase } from "../supabaseClient";
import type { EmployerStats, EmployerRecentSubmission } from "@/types";

/**
 * Fetch core stats for EmployerHome:
 * - Total jobs posted
 * - Active submissions count
 * - Average feedback score
 * - Latest 3 submissions (with proof + feedback)
 */
export async function getEmployerStats(
  employer_id: string
): Promise<EmployerStats> {
  // 1️⃣ Count total jobs posted
  const { data: jobs, count: jobsPosted, error: jobsError } = await supabase
    .from("jobs")
    .select("id", { count: "exact" })
    .eq("employer_id", employer_id);

  if (jobsError) throw jobsError;
  const jobIds = jobs?.map((j) => j.id) || [];

  // If employer has no jobs, return empty stats
  if (!jobIds.length) {
    return {
      jobsPosted: 0,
      activeSubmissions: 0,
      avgScore: null,
      submissions: [],
    };
  }

  // Count active submissions
  const { count: activeCount, error: subErr } = await supabase
    .from("submissions")
    .select("*", { count: "exact", head: true })
    .in("job_id", jobIds)
    .eq("status", "submitted");

  if (subErr) throw subErr;

  // Fetch latest submissions (with proof + feedback)
  const { data: subs, error: recentErr } = await supabase
    .from("submissions")
    .select(`
      id,
      user_id,
      job_id,
      created_at,
      proof_tasks ( id, title ),
      feedback ( stars )
    `)
    .in("job_id", jobIds)
    .order("created_at", { ascending: false })
    .limit(3);

  if (recentErr) throw recentErr;
  const submissions = (subs || []).map((s: any) => ({
    ...s,
    proof_tasks: Array.isArray(s.proof_tasks) ? s.proof_tasks[0] : s.proof_tasks,
  })) as EmployerRecentSubmission[];

  // Calculate average score
  const stars =
    subs
      ?.flatMap((s) => s.feedback?.map((f: { stars: number | null }) => f.stars))
      .filter((v): v is number => typeof v === "number") || [];
  const avgScore =
    stars.length > 0
      ? Number((stars.reduce((a, b) => a + b, 0) / stars.length).toFixed(1))
      : null;

  return {
    jobsPosted: jobsPosted || 0,
    activeSubmissions: activeCount || 0,
    avgScore,
    submissions,
  };
}