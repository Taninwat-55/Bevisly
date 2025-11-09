// src/lib/api/submissions.ts
import { supabase } from "../supabaseClient";
import type {
  CandidateSubmission,
  // CandidateFeedback,
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
// export async function getEmployerSubmissions(employer_id: string) {
// 1️⃣ Get job IDs owned by employer
// const { data: jobIds, error: jobErr } = await supabase
//   .from("jobs")
//   .select("id")
//   .eq("created_by", employer_id);
export async function getEmployerSubmissions(
  employer_id: string
): Promise<EmployerSubmission[]> {
  // 1️⃣ Get job IDs owned by employer
  const { data: jobIds, error: jobErr } = await supabase
    .from("jobs")
    .select("id")
    .eq("employer_id", employer_id); // ✅ fixed

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
      proof_tasks ( id, title ),
      jobs ( title ),
      feedback ( stars )
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
      "id, job_id, title, description, expected_time, submission_format, ai_tools_allowed"
    )
    .eq("id", proof_task_id)
    .maybeSingle();

  if (error) throw error;
  return data ?? null;
}

export async function submitProof({
  job_id,
  submission_link,
  reflection,
  file,
}: {
  job_id: string;
  submission_link?: string; // ✅ optional
  reflection?: string;
  file?: File | null; // ✅ optional (for non-dev proofs)
}) {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error("Not authenticated");

  // 🧠 Validate: at least one proof method
  if (!submission_link && !file) {
    throw new Error("A submission link or file is required.");
  }

  let uploadedFileUrl: string | null = null;

  // 📤 If file provided, upload it to Supabase Storage
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

  // 🧾 Store submission record
  const { data, error } = await supabase
    .from("submissions")
    .insert([
      {
        user_id: user.id,
        job_id,
        submission_link: uploadedFileUrl || submission_link || null, // ✅ either link or uploaded file
        reflection,
        status: "pending",
      },
    ])
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

/**
 * ✅ Get one submission with job + proof task details (for EmployerReview page)
 */
export async function getSubmissionById(submission_id: string) {
  const { data, error } = await supabase
    .from("submissions")
    .select(
      `
      id,
      user_id,
      job_id,
      status,
      submission_link,
      reflection,
      created_at,
      proof_tasks ( id, title, description ),
      jobs ( id, title, company )
    `
    )
    .eq("id", submission_id)
    .single();

  if (error) throw error;
  return data;
}
