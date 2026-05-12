import { supabase } from "../supabaseClient";

export interface CandidateProject {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  link_url: string | null;
  thumbnail_url: string | null;
  skills: string[];
  created_at: string;
}

export async function getCandidateProjects(userId: string): Promise<CandidateProject[]> {
  const { data, error } = await supabase
    .from("candidate_projects")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as CandidateProject[];
}

export async function addCandidateProject(project: Omit<CandidateProject, "id" | "user_id" | "created_at">): Promise<CandidateProject> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("candidate_projects")
    .insert([
      { ...project, user_id: user.user.id }
    ])
    .select()
    .single();

  if (error) throw error;
  return data as CandidateProject;
}

export async function updateCandidateProject(id: string, project: Partial<Omit<CandidateProject, "id" | "user_id" | "created_at">>): Promise<CandidateProject> {
  const { data, error } = await supabase
    .from("candidate_projects")
    .update(project)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as CandidateProject;
}

export async function deleteCandidateProject(id: string): Promise<void> {
  const { error } = await supabase
    .from("candidate_projects")
    .delete()
    .eq("id", id);

  if (error) throw error;
}
