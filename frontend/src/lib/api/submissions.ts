// src/lib/api/submissions.ts
import { supabase } from "../supabaseClient";
import type {
  CandidateSubmission,
  EmployerSubmission,
  ProofTask,
  CandidateFeedbackEntry,
} from "@/types";

/**
 * ✅ Get all submissions by a candidate (for candidate dashboard/profile)
 */
export async function getCandidateSubmissions(
  user_id: string
): Promise<CandidateSubmission[]> {
  const { data, error } = await supabase
    .from("submissions")
    .select(
      `
      id,
      job_id,
      proof_task_id,
      created_at,
      status,
      submission_link,
      reflection,
      jobs ( title, company ),
      proof_tasks ( title )
    `
    )
    .eq("user_id", user_id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * ✅ Get all submissions for an employer’s jobs (for review dashboard)
 */
export async function getEmployerSubmissions(
  employer_id: string
): Promise<EmployerSubmission[]> {
  const { data: jobIds, error: jobErr } = await supabase
    .from("jobs")
    .select("id")
    .eq("employer_id", employer_id);

  if (jobErr) throw jobErr;
  if (!jobIds?.length) return [];

  const ids = jobIds.map((j) => j.id);

  const { data, error } = await supabase
    .from("submissions")
    .select(
      `
      id,
      job_id,
      user_id,
      created_at,
      status,
      submission_link,
      reflection,
      proof_tasks ( id, title )
    `
    )
    .in("job_id", ids)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getEmployerSubmissionsWithFeedback(
  employer_id: string
): Promise<EmployerSubmission[]> {
  const { data: jobIds, error: jobErr } = await supabase
    .from("jobs")
    .select("id")
    .eq("employer_id", employer_id);

  if (jobErr) throw jobErr;
  if (!jobIds?.length) return [];

  const ids = jobIds.map((j) => j.id);

  const { data, error } = await supabase
    .from("submissions")
    .select(
      `
      id,
      job_id,
      user_id,
      created_at,
      status,
      submission_link,
      reflection,
      hiring_stage,
      employer_notes,
      resume_url,
      proof_tasks ( id, title ),
      jobs ( id, title ),
      feedback ( stars ),
      profiles:user_id ( full_name, email )
    `
    )
    .in("job_id", ids)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as EmployerSubmission[];
}

/**
 * ✅ Get details for a single proof task (for job detail / proof workspace)
 */
export async function getProofTaskDetails(
  proof_task_id: string
): Promise<ProofTask | null> {
  const { data, error } = await supabase
    .from("proof_tasks")
    .select(
      "id, job_id, title, description, expected_time, submission_format, ai_tools_allowed, attachments, recommended_platform, submission_type"
    )
    .eq("id", proof_task_id)
    .maybeSingle();

  if (error) throw error;
  // ✅ FIX: Cast the result to ProofTask | null to satisfy the union type
  return (data as ProofTask | null) ?? null;
}

// ✅ FIXED: Added .limit(1) to handle existing duplicates gracefully
export async function checkSubmissionStatus(job_id: string) {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) return null;

  const { data, error } = await supabase
    .from("submissions")
    .select("id, status, proof_task_id, submission_link, reflection, resume_url, created_at")
    .eq("user_id", user.id)
    .eq("job_id", job_id)
    .limit(1) // <-- Critical Fix: Stops crash if duplicates exist
    .maybeSingle();

  if (error) return null;
  return data;
}

export async function submitProof({
  job_id,
  submission_link,
  reflection,
  file,
}: {
  job_id: string;
  submission_link?: string;
  reflection?: string;
  file?: File | null;
}) {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error("Not authenticated");

  let uploadedFileUrl: string | null = null;

  if (file) {
    const filePath = `proofs/${user.id}/${Date.now()}-${file.name}`;
    const { error: uploadErr } = await supabase.storage
      .from("proofs")
      .upload(filePath, file);
    if (uploadErr) throw uploadErr;
    const { data: publicUrlData } = supabase.storage
      .from("proofs")
      .getPublicUrl(filePath);
    uploadedFileUrl = publicUrlData?.publicUrl || null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("resume_url")
    .eq("id", user.id)
    .maybeSingle();

  const { data, error } = await supabase
    .from("submissions")
    .update({
      submission_link: uploadedFileUrl || submission_link || null,
      reflection,
      status: "submitted",
      completed_at: new Date().toISOString(),
      resume_url: profile?.resume_url || null,
    })
    .eq("job_id", job_id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getCandidateFeedback(user_id: string) {
  const { data, error } = await supabase
    .from("submissions")
    .select(
      `
      id,
      created_at,
      status,
      submission_link,       
      reflection,            
      jobs (title, company),
      proof_tasks (title),
      feedback (
        strengths,
        improvements,
        stars,
        comments,
        created_at
      )
    `
    )
    .eq("user_id", user_id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as CandidateFeedbackEntry[];
}

export async function getSubmissionById(submission_id: string) {
  const { data, error } = await supabase
    .from("submissions")
    .select(`
      id,
      user_id,
      job_id,
      status,
      submission_link,
      reflection,
      resume_url,
      created_at,
      proof_tasks ( id, title, description ),
      jobs ( id, title, company ),
      profiles:user_id ( full_name, email, resume_url ), 
      feedback ( stars, strengths, improvements )
`)
    .eq("id", submission_id)
    .single();

  if (error) throw error;
  return data;
}

export async function getSubmissionsByJob(job_id: string): Promise<EmployerSubmission[]> {
  const { data, error } = await supabase
    .from("submissions")
    .select(`
      id,
      user_id,
      job_id,
      status,
      submission_link,
      reflection,
      resume_url,
      created_at,
      proof_tasks ( id, title ),
      jobs ( id, title, company )
`)
    .eq("job_id", job_id)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data as EmployerSubmission[];
}

// ✅ FIXED: Prevent duplicates by checking job_id + user_id first
export async function startProof(job_id: string, proof_task_id?: string) {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error("Not authenticated");

  // 1. Check if ANY submission for this job exists (ignore specific task ID to enforce 1 per job)
  const { data: existing } = await supabase
    .from("submissions")
    .select("id, status")
    .eq("user_id", user.id)
    .eq("job_id", job_id)
    .limit(1) // Handle bad data gracefully
    .maybeSingle();

  if (existing) {
    return existing.id; // Don't create new one, just return existing
  }

  // 2. Only insert if truly new
  const { data, error } = await supabase
    .from("submissions")
    .insert([
      {
        user_id: user.id,
        job_id,
        proof_task_id: proof_task_id ?? null,
        status: "in_progress",
        started_at: new Date().toISOString(),
      },
    ])
    .select("id")
    .single();

  if (error) throw error;
  return data.id;
}

export async function completeProof({
  job_id,
  submission_link,
  reflection,
  file,
}: {
  job_id: string;
  submission_link?: string;
  reflection?: string;
  file?: File | null;
}) {
  return submitProof({ job_id, submission_link, reflection, file });
}