import { supabase } from "../supabaseClient";
import type {
  CandidateSubmission,
  EmployerSubmission,
  ProofTask,
  CandidateFeedbackEntry,
} from "@/types";

/**
 * Get all submissions by a candidate (for candidate dashboard/profile)
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
 * Get all submissions for an employer’s jobs (for review dashboard)
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
 * Get details for a single proof task (for job detail / proof workspace)
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
  // Cast the result to ProofTask | null to satisfy the union type
  return (data as ProofTask | null) ?? null;
}

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

// 1. Update getSubmissionById to select new columns
export async function getSubmissionById(submission_id: string) {
  const { data, error } = await supabase
    .from("submissions")
    .select(`
      id,
      user_id,
      job_id,
      status,
      submission_link,
      file_url,       
      text_response,  
      reflection,
      video_url,
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

// 2. Update submitProof to save all fields
export async function submitProof({
  job_id,
  submission_link,
  text_response,
  reflection,
  video_url, // ✅ Add this
  file,
}: {
  job_id: string;
  submission_link?: string;
  text_response?: string;
  reflection?: string;
  video_url?: string; // ✅ Add type
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
      submission_link: submission_link || null,
      file_url: uploadedFileUrl || null,
      text_response: text_response || null,
      reflection,
      video_url: video_url || null,
      status: "submitted",
      completed_at: new Date().toISOString(),
      resume_url: profile?.resume_url || null,
    })
    .eq("job_id", job_id)
    .eq("user_id", user.id)
    .select();

  if (error) throw error;
  return data?.[0];
}

// 3. Update completeProof signature to match
export async function completeProof(params: any) {
  return submitProof(params);
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

export async function startProof(job_id: string, proof_task_id?: string) {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error("Not authenticated");

  // 1. Check if ANY submission for this job exists
  const { data: existing } = await supabase
    .from("submissions")
    .select("id, status")
    .eq("user_id", user.id)
    .eq("job_id", job_id)
    .maybeSingle();

  if (existing) {
    return existing.id; // Return existing ID peacefully
  }

  // 2. Try to insert
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

  if (error) {
    // ✅ HANDLE RACE CONDITION: 
    // If error code is 23505 (Unique Violation), it means another request 
    // created it 1ms ago. We just fetch that one instead of crashing.
    if (error.code === '23505') {
       const { data: retry } = await supabase
         .from("submissions")
         .select("id")
         .eq("user_id", user.id)
         .eq("job_id", job_id)
         .single();
       return retry?.id;
    }
    throw error;
  }
  return data.id;
}

export async function saveDraft({
  job_id,
  submission_link,
  text_response,
  reflection,
  file,
}: {
  job_id: string;
  submission_link?: string;
  text_response?: string;
  reflection?: string;
  file?: File | null;
}) {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error("Not authenticated");

  let uploadedFileUrl: string | null = null;

  // Handle file upload if a new file is provided
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

  // Update submission record
  const { data, error } = await supabase
    .from("submissions")
    .update({
      submission_link: submission_link || null,
      // Only update file_url if a new file was uploaded, otherwise keep existing
      ...(uploadedFileUrl ? { file_url: uploadedFileUrl } : {}),
      text_response: text_response || null,
      reflection,
      status: "in_progress", // Force status to stay in_progress
      updated_at: new Date().toISOString(), // Track last save
    })
    .eq("job_id", job_id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}