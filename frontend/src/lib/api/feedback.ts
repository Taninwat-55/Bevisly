import { supabase } from "../supabaseClient";
import type { Feedback } from "@/types";

/**
 * Fetch feedback for a specific submission (for employer or admin review)
 */
export async function getFeedbackBySubmission(
  submission_id: string
): Promise<Feedback[]> {
  const { data, error } = await supabase
    .from("feedback")
    .select("*")
    .eq("submission_id", submission_id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Add new feedback entry (used in EmployerReview.tsx)
 */
export async function createFeedback(entry: {
  submission_id: string;
  employer_id: string;
  strengths: string;
  improvements: string;
  stars: number;
}): Promise<Feedback> {
  const { data, error } = await supabase
    .from("feedback")
    .insert([entry])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Optionally update existing feedback (future-proof)
 */
export async function updateFeedback(
  feedback_id: string,
  updates: Partial<Feedback>
): Promise<Feedback> {
  const { data, error } = await supabase
    .from("feedback")
    .update(updates)
    .eq("id", feedback_id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
