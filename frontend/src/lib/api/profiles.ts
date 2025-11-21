import { supabase } from "../supabaseClient";

export async function uploadResume(file: File) {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error("Not authenticated");

  const filePath = `${user.id}/${Date.now()}-${file.name}`;
  console.log("📤 Uploading to:", filePath);

  const { error: uploadErr } = await supabase.storage
    .from("resumes")
    .upload(filePath, file, { upsert: true, contentType: file.type });

  if (uploadErr) throw uploadErr;

  const { data: publicUrlData } = supabase.storage
    .from("resumes")
    .getPublicUrl(filePath);

  const publicUrl = publicUrlData?.publicUrl;
  if (!publicUrl) throw new Error("Failed to retrieve public URL");

  const { error: updateErr } = await supabase
    .from("profiles")
    .update({
      resume_url: publicUrl,
      resume_updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (updateErr) throw updateErr;

  console.log("✅ Resume uploaded successfully");
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

export async function updateProfileName(full_name: string) {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("profiles")
    .update({ full_name })
    .eq("id", user.id);

  if (error) throw error;
}