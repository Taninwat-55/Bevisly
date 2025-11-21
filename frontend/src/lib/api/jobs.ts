// src/lib/api/jobs.ts
import { supabase } from "../supabaseClient";
import type {
  EmployerJob,
  EmployerJobSummary,
  CandidateJob,
  ProofTask,
} from "@/types";

/* ──────────────────────────────────────────────
 * ✅ Fetch all public jobs (for candidates)
 * Includes salary range and pay fields for transparency
 * ────────────────────────────────────────────── */
export async function getAllJobs(): Promise<CandidateJob[]> {
  const { data, error } = await supabase
    .from("jobs")
    .select(`
      id,
      title,
      description,
      company,
      location,
      paid,
      payment_amount,
      payment_currency,
      show_salary_range,
      salary_min,
      salary_max,
      pay_period,
      created_at,
      proof_tasks ( id, title, expected_time )
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

/* ──────────────────────────────────────────────
 * ✅ Fetch single job + its proof tasks
 * ────────────────────────────────────────────── */
export async function getJobWithTasks(job_id: string) {
  const { data, error } = await supabase
    .from("jobs")
    .select(`
      id,
      title,
      description,
      company,
      location,
      paid,
      payment_amount,
      payment_currency,
      show_salary_range,
      salary_min,
      salary_max,
      pay_period,
      created_at,
      employer_id,  
      proof_tasks (
        id,
        title,
        description,
        expected_time,
        submission_format,
        ai_tools_allowed
      )
    `) // 👆 Replaced 'created_by' with 'employer_id' (or just remove it if unused)
    .eq("id", job_id)
    .single();

  if (error) throw error;
  return data;
}

/* ──────────────────────────────────────────────
 * ✅ Fetch all jobs created by the logged-in employer
 * ────────────────────────────────────────────── */
export async function getEmployerJobs(
  employer_id: string
): Promise<(EmployerJob & { proof_tasks?: ProofTask[] })[]> {
  const { data, error } = await supabase
    .from("jobs")
    .select(`
      id,
      title,
      description,
      company,
      location,
      paid,
      payment_amount,
      payment_currency,
      show_salary_range,
      salary_min,
      salary_max,
      pay_period,
      created_at,
      proof_tasks ( id, title, expected_time, ai_tools_allowed )
    `)
    .eq("employer_id", employer_id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as (EmployerJob & { proof_tasks?: ProofTask[] })[];
}

/* ──────────────────────────────────────────────
 * ✅ Employer job summary (dashboard view)
 * ────────────────────────────────────────────── */
export async function getEmployerJobSummary(
  employer_id: string
): Promise<EmployerJobSummary[]> {
  const { data, error } = await supabase
    .from("employer_job_summary")
    .select("*")
    .eq("employer_id", employer_id);

  if (error) throw error;
  return data;
}

/* ──────────────────────────────────────────────
 * ✅ Featured jobs for homepage
 * ────────────────────────────────────────────── */
export async function getFeaturedJobs() {
  const { data, error } = await supabase
    .from("jobs")
    .select(
      "id, title, company, location, created_at, show_salary_range, salary_min, salary_max, pay_period"
    )
    .eq("featured", true)
    .eq("is_public", true)
    .limit(6);

  if (error) throw error;
  return data;
}

/* ──────────────────────────────────────────────
 * ✅ Create a job + associated proof tasks
 * ────────────────────────────────────────────── */
export async function createJobWithTasks(
  values: Partial<EmployerJob & { proof_tasks?: ProofTask[] }>
) {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error("User not authenticated.");

  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .insert([
      {
        title: values.title ?? "",
        company: values.company ?? "",
        location: values.location ?? "",
        description: values.description ?? "",
        paid: values.paid ?? false,
        payment_amount: values.payment_amount ?? null,
        payment_currency: values.payment_currency ?? "EUR",
        show_salary_range: values.show_salary_range ?? false,
        salary_min: values.salary_min ?? null,
        salary_max: values.salary_max ?? null,
        pay_period: values.pay_period ?? "monthly",
        employer_id: user.id,
        is_public: true,
        job_type: values.job_type ?? null,
        department: values.department ?? null,
        work_mode: values.work_mode ?? null,
      },
    ])
    .select("id")
    .single();

  if (jobError) throw jobError;

  // 2️⃣ Create proof tasks (if any)
  if (values.proof_tasks?.length) {
    const proofInserts = values.proof_tasks.map((task) => ({
      job_id: job.id,
      title: task.title,
      description: task.description,
      expected_time: task.expected_time,
      submission_format: task.submission_format,
      submission_type: task.submission_type ?? "link",
      recommended_platform: task.recommended_platform ?? null,
      ai_tools_allowed: task.ai_tools_allowed ?? false,
    }));

    const { error: proofError } = await supabase
      .from("proof_tasks")
      .insert(proofInserts);
    if (proofError) throw proofError;
  }

  return job;
}

/* ──────────────────────────────────────────────
 * ✅ Update an existing job + proof tasks
 * ────────────────────────────────────────────── */
export async function updateJobWithTasks(
  job_id: string,
  values: Partial<EmployerJob & { proof_tasks?: ProofTask[] }>
) {
  const { error: jobError } = await supabase
    .from("jobs")
    .update({
      title: values.title,
      company: values.company,
      location: values.location,
      description: values.description,
      paid: values.paid ?? false,
      payment_amount: values.payment_amount ?? null,
      payment_currency: values.payment_currency ?? "EUR",
      show_salary_range: values.show_salary_range ?? false,
      salary_min: values.salary_min ?? null,
      salary_max: values.salary_max ?? null,
      pay_period: values.pay_period ?? "monthly",
      job_type: values.job_type ?? null,
      department: values.department ?? null,
      work_mode: values.work_mode ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", job_id);

  if (jobError) throw jobError;

  // 2️⃣ Refresh proof tasks
  if (values.proof_tasks?.length) {
    await supabase.from("proof_tasks").delete().eq("job_id", job_id);

    const inserts = values.proof_tasks.map((t) => ({
      job_id,
      title: t.title,
      description: t.description,
      expected_time: t.expected_time,
      submission_format: t.submission_format,
      submission_type: t.submission_type ?? "link",
      recommended_platform: t.recommended_platform ?? null,
      ai_tools_allowed: t.ai_tools_allowed ?? false,
    }));

    const { error: insertError } = await supabase
      .from("proof_tasks")
      .insert(inserts);
    if (insertError) throw insertError;
  }

  return true;
}

/* ──────────────────────────────────────────────
 * ✅ Delete an existing job + proof tasks
 * ────────────────────────────────────────────── */
export async function deleteJob(job_id: string) {
  const { error } = await supabase.from("jobs").delete().eq("id", job_id);
  if (error) throw error;
  return true;
}