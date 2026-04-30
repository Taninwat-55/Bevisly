import { supabase } from "../supabaseClient";
import type { Feedback, EmployerJob } from "@/types";

/**
 * Employer leaves feedback on a candidate submission
 */
export async function addFeedback({
  submission_id,
  employer_id,
  strengths,
  improvements,
  stars,
}: {
  submission_id: string;
  employer_id: string;
  strengths: string;
  improvements: string;
  stars: number;
}): Promise<Feedback> {
  const { data, error } = await supabase
    .from("feedback")
    .insert([
      {
        submission_id,
        employer_id,
        strengths,
        improvements,
        stars,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update an existing job
 */
export async function updateJobDetails(
  job_id: string,
  updates: Partial<EmployerJob>
): Promise<EmployerJob> {
  const { data, error } = await supabase
    .from("jobs")
    .update(updates)
    .eq("id", job_id)
    .select()
    .single();

  if (error) throw error;

  // Safely coerce to EmployerJob type
  return data as EmployerJob;
}

/**
 * Update a proof task (title, description, etc.)
 */
export async function updateProofTask(
  proof_task_id: string,
  updates: {
    title?: string;
    description?: string;
    expected_time?: string;
    submission_format?: string;
    ai_tools_allowed?: boolean;
  }
) {
  const { data, error } = await supabase
    .from("proof_tasks")
    .update(updates)
    .eq("id", proof_task_id)
    .select()
    .single();

  if (error) throw error;
  return data;
}


/**
 * Toggle job active/closed state
 */
export async function toggleJobStatus(job_id: string, currentStatus?: string) {
  const newStatus = currentStatus === "active" ? "closed" : "active";

  const { data, error } = await supabase
    .from("jobs")
    .update({ status: newStatus })
    .eq("id", job_id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function toggleJobFeatured(job_id: string, currentFeatured?: boolean) {
  const newFeatured = !currentFeatured;
  const { data, error } = await supabase
    .from("jobs")
    .update({ featured: newFeatured })
    .eq("id", job_id)
    .select()
    .single();

  if (error) throw error;
  return data;
}