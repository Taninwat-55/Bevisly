// src/lib/api/jobs.ts
import { supabase } from "../supabaseClient";
import type { EmployerJob, EmployerJobSummary, CandidateJob, ProofTask } from "@/types";

 // ✅ Fetch all public jobs (for candidates)
export async function getAllJobs(): Promise<CandidateJob[]> {
  const { data, error } = await supabase
    .from("jobs")
    .select(
      "id, title, description, company, location, paid, created_at, proof_tasks(id, title, expected_time)"
    )
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

// ✅ Fetch single job + its proof tasks
export async function getJobWithTasks(job_id: string) {
  const { data, error } = await supabase
    .from("jobs")
    .select(
      "id, title, description, company, location, paid, created_at, created_by, proof_tasks(id, title, description, expected_time, submission_format, ai_tools_allowed)"
    )
    .eq("id", job_id)
    .single();

  if (error) throw error;
  return data;
}

//✅ Fetch all jobs created by the logged-in employer
// ✅ Fetch all jobs created by the logged-in employer
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
      created_at,
      proof_tasks ( id, title, expected_time, ai_tools_allowed )
    `)
    .eq("employer_id", employer_id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as (EmployerJob & { proof_tasks?: ProofTask[] })[];
}
// export async function getEmployerJobs(
//   employer_id: string
// ): Promise<EmployerJob[]> {
//   const { data, error } = await supabase
//     .from("jobs")
//     .select("id, title, description, company, location, paid, created_at")
//     .eq("employer_id", employer_id) 
//     .order("created_at", { ascending: false });

//   if (error) throw error;
//   return data;
// }

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

export async function getFeaturedJobs() {
  const { data, error } = await supabase
    .from("jobs")
    .select("id, title, company, location, created_at")
    .eq("featured", true)
    .eq("is_public", true)
    .limit(6);
  if (error) throw error;
  return data;
}

/**
 * ✅ Create a job and its associated proof task(s)
 */
export async function createJobWithTasks(
  values: Partial<EmployerJob & { proof_tasks?: ProofTask[] }>
) {
  // 1️⃣ Create the job
  const safeString = (val: string | null | undefined) => val ?? "";

const { data: job, error: jobError } = await supabase.from("jobs").insert([
  {
    title: safeString(values.title),
    company: safeString(values.company),
    location: safeString(values.location),
    description: safeString(values.description),
    paid: values.paid ?? false,
    employer_id: (await supabase.auth.getUser()).data.user?.id ?? "",
    is_public: true,
    salary_range: values.salary_range ?? null,
    job_type: values.job_type ?? null,
    department: values.department ?? null,
    work_mode: values.work_mode ?? null,
  },
])
  .select("id")
  .single();

  if (jobError) throw jobError;

  // 2️⃣ Create proof tasks (if provided)
  if (values.proof_tasks && values.proof_tasks.length > 0) {
    const proofInserts = values.proof_tasks.map((task) => ({
      job_id: job.id,
      title: task.title,
      description: task.description,
      expected_time: task.expected_time,
      submission_format: task.submission_format,
      ai_tools_allowed: task.ai_tools_allowed ?? false,
    }));

    const { error: proofError } = await supabase
      .from("proof_tasks")
      .insert(proofInserts);

    if (proofError) throw proofError;
  }

  return job;
}

/**
 * ✅ Update an existing job and its proof tasks
 */
export async function updateJobWithTasks(
  job_id: string,
  values: Partial<EmployerJob & { proof_tasks?: ProofTask[] }>
) {
  // 1️⃣ Update main job
  const { error: jobError } = await supabase
    .from("jobs")
    .update({
      title: values.title,
      company: values.company,
      location: values.location,
      description: values.description,
      paid: values.paid ?? false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", job_id);

  if (jobError) throw jobError;

  // 2️⃣ Refresh proof tasks — delete old + insert new
  if (values.proof_tasks && values.proof_tasks.length > 0) {
    const { error: delError } = await supabase
      .from("proof_tasks")
      .delete()
      .eq("job_id", job_id);
    if (delError) throw delError;

    const inserts = values.proof_tasks.map((t) => ({
      job_id,
      title: t.title,
      description: t.description,
      expected_time: t.expected_time,
      submission_format: t.submission_format,
      ai_tools_allowed: t.ai_tools_allowed ?? false,
    }));

    const { error: insertError } = await supabase
      .from("proof_tasks")
      .insert(inserts);
    if (insertError) throw insertError;
  }

  return true;
}