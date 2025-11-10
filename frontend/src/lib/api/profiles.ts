import { supabase } from "../supabaseClient";

export async function uploadResume(file: File) {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error("Not authenticated");

  const filePath = `resumes/${user.id}/${Date.now()}-${file.name}`;
  const { error: uploadErr } = await supabase.storage
    .from("resumes")
    .upload(filePath, file);

  if (uploadErr) throw uploadErr;

  const { data: publicUrlData } = supabase.storage
    .from("resumes")
    .getPublicUrl(filePath);

  const publicUrl = publicUrlData?.publicUrl;
  if (!publicUrl) throw new Error("Failed to retrieve public URL");

  // ✅ Save to profile
  const { error: updateErr } = await supabase
    .from("profiles")
    .update({
      resume_url: publicUrl,
      resume_updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (updateErr) throw updateErr;
  return publicUrl;
}

export async function getProfileResume(user_id: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("resume_url, resume_updated_at")
    .eq("id", user_id)
    .single();

  if (error) throw error;
  return data;
}