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

export async function updateProfileData(
  userId: string,
  data: {
    full_name?: string;
    company_name?: string;
    avatar_url?: string | null;
    skills?: string[];
    languages?: string[];
    work_status?: string;
    bio?: string;
    linkedin_url?: string;
    github_url?: string;
    website_url?: string;
    is_public?: boolean;
    banner_url?: string | null;
    video_intro_url?: string | null;
    experience?: Record<string, unknown>[];
    education?: Record<string, unknown>[];
  },
) {
  const { error } = await supabase
    .from("profiles")
    .update(data)
    .eq("id", userId);

  if (error) throw error;
}

export async function downloadUserData(
  userId: string,
  role: "candidate" | "employer" | "admin",
) {
  // 1. Fetch Profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  // 2. Fetch Common Data (Saved Jobs)
  const { data: savedJobs } = await supabase
    .from("saved_jobs")
    .select("job_id, created_at")
    .eq("user_id", userId);

  let specificData = {};

  // 3. Fetch Role-Specific Data
  if (role === "employer") {
    const { data: jobs } = await supabase
      .from("jobs")
      .select("*")
      .eq("employer_id", userId);
    specificData = { posted_jobs: jobs };
  } else if (role === "candidate") {
    const { data: submissions } = await supabase
      .from("submissions")
      .select("*")
      .eq("user_id", userId);
    specificData = { submissions };
  }

  // 4. Construct JSON Blob
  const exportData = {
    user: profile,
    saved_jobs: savedJobs,
    ...specificData,
    exported_at: new Date().toISOString(),
  };

  return new Blob([JSON.stringify(exportData, null, 2)], {
    type: "application/json",
  });
}
