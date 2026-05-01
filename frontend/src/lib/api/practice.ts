import { supabase } from "../supabaseClient";

export type PracticeTask = {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  submission_format: string;
  expected_time: string;
  skills: string[];
  created_at: string;
};

export type PracticeSubmission = {
  id: string;
  user_id: string;
  practice_task_id: string;
  submission_content: string | null;
  submission_link: string | null;
  ai_score: number | null;
  ai_feedback: string | null;
  ai_strengths: string | null;
  ai_improvements: string | null;
  credits_awarded: number;
  graded_at: string | null;
  created_at: string;
};

export async function getPracticeTasks(): Promise<PracticeTask[]> {
  const { data, error } = await supabase
    .from("practice_tasks")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data as PracticeTask[];
}

export async function getPracticeTask(id: string): Promise<PracticeTask> {
  const { data, error } = await supabase
    .from("practice_tasks")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as PracticeTask;
}

export async function getMyPracticeSubmissions(userId: string): Promise<PracticeSubmission[]> {
  const { data, error } = await supabase
    .from("practice_submissions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as PracticeSubmission[];
}

export async function getMySubmissionForTask(userId: string, taskId: string): Promise<PracticeSubmission | null> {
  const { data, error } = await supabase
    .from("practice_submissions")
    .select("*")
    .eq("user_id", userId)
    .eq("practice_task_id", taskId)
    .maybeSingle();
  if (error) throw error;
  return data as PracticeSubmission | null;
}

export async function upsertPracticeSubmission(input: {
  user_id: string;
  practice_task_id: string;
  submission_content?: string;
  submission_link?: string;
}): Promise<PracticeSubmission> {
  const { data, error } = await supabase
    .from("practice_submissions")
    .upsert(input, { onConflict: "user_id,practice_task_id" })
    .select()
    .single();
  if (error) throw error;
  return data as PracticeSubmission;
}

export async function gradePracticeSubmission(submissionId: string): Promise<{
  score: number;
  feedback: string;
  strengths: string;
  improvements: string;
  credits_earned: number;
}> {
  const { data, error } = await supabase.functions.invoke("grade-practice", {
    body: { submission_id: submissionId },
  });
  if (error) throw error;
  return data;
}
