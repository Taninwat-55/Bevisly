import { supabase } from "../supabaseClient";
import type {
  CandidateJob,
  EmployerJob,
  EmployerJobSummary,
  ProofTask,
} from "@/types";
import { getCurrentCompanyId } from "./companies";

/* ──────────────────────────────────────────────
 * Fetch all public jobs (for candidates)
 * Includes salary range and pay fields for transparency
 * ────────────────────────────────────────────── */
export async function getAllJobs(): Promise<CandidateJob[]> {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("jobs")
    .select(`
      id,
      title,
      description,
      company,
      location,
      paid,
      featured,
      compensation_type,
      payment_amount,
      payment_currency,
      show_salary_range,
      salary_min,
      salary_max,
      equity_min,
      equity_max,
      pay_period,
      created_at,
      expires_at,
      apply_url,
      employer_id,
      company_id,
      proof_tasks ( id, title, expected_time ),
      employer:profiles!jobs_employer_id_fkey ( avatar_url, is_verified ),
      company_data:companies ( responsibility_score, slug, logo_url )
    `)
    .eq("status", "active")
    // Use an OR condition to include jobs with no deadline, or jobs whose deadline is in the future
    .or(`expires_at.is.null,expires_at.gt.${now}`)
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw error;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.map((job: any) => ({
    ...job,
    company_logo: job.company_data?.logo_url || job.employer?.avatar_url || null,
    employer_verified: job.employer?.is_verified ?? false,
    company_responsibility_score: job.company_data?.responsibility_score ?? null,
    company_slug: job.company_data?.slug ?? null,
  }));
}

/* ──────────────────────────────────────────────
 * Fetch single job + its proof tasks
 * ────────────────────────────────────────────── */
export async function getJobWithTasks(job_id: string) {
  const { data, error } = await supabase
    .from("jobs")
    .select(`
      id,
      title,
      description,
      company,
      location,
      paid,
      compensation_type,
      payment_amount,
      payment_currency,
      show_salary_range,
      salary_min,
      salary_max,
      equity_min,
      equity_max,
      pay_period,
      created_at,
      expires_at,
      employer_id,
      proof_tasks (
        id,
        title,
        description,
        expected_time,
        submission_format,
        ai_tools_allowed,
        attachments,
        rubric_criteria,
        rubric_locked_at
      ),
      employer:profiles!jobs_employer_id_fkey ( avatar_url, is_verified )
    `)
    .eq("id", job_id)
    .single();

  if (error) throw error;

  return {
    ...data,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    company_logo: (data as any).employer?.avatar_url || null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    employer_verified: (data as any).employer?.is_verified ?? false,
  };
}

/* ──────────────────────────────────────────────
 * Fetch all jobs created by the logged-in employer
 * ────────────────────────────────────────────── */
export async function getEmployerJobs(
  employer_id: string,
): Promise<(EmployerJob & { proof_tasks?: ProofTask[] })[]> {
  const { data, error } = await supabase
    .from("jobs")
    .select(`
      id,
      title,
      description,
      company,
      location,
      paid,
      compensation_type,
      status,
      payment_amount,
      payment_currency,
      show_salary_range,
      salary_min,
      salary_max,
      equity_min,
      equity_max,
      pay_period,
      created_at,
      featured,
      proof_tasks ( id, title, expected_time, ai_tools_allowed, rubric_criteria, rubric_locked_at )
    `)
    .eq("employer_id", employer_id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as (EmployerJob & { proof_tasks?: ProofTask[] })[];
}

/* ──────────────────────────────────────────────
 * Employer job summary (dashboard view)
 * ────────────────────────────────────────────── */
export async function getEmployerJobSummary(
  employer_id: string,
): Promise<EmployerJobSummary[]> {
  const { data, error } = await supabase
    .from("employer_job_summary")
    .select("*")
    .eq("employer_id", employer_id);

  if (error) throw error;
  if (error) throw error;
  return data;
}

/* ──────────────────────────────────────────────
 * Fetch all jobs for a company (multi-tenant)
 * ────────────────────────────────────────────── */
export async function getCompanyJobs(
  company_id: string,
): Promise<(EmployerJob & { proof_tasks?: ProofTask[] })[]> {
  const { data, error } = await supabase
    .from("jobs")
    .select(`
      id,
      title,
      description,
      company,
      location,
      paid,
      compensation_type,
      status,
      payment_amount,
      payment_currency,
      show_salary_range,
      salary_min,
      salary_max,
      equity_min,
      equity_max,
      pay_period,
      created_at,
      featured,
      proof_tasks ( id, title, expected_time, ai_tools_allowed, rubric_criteria, rubric_locked_at )
    `)
    .eq("company_id", company_id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as (EmployerJob & { proof_tasks?: ProofTask[] })[];
}

/* ──────────────────────────────────────────────
 * Featured jobs for homepage
 * ────────────────────────────────────────────── */
export async function getFeaturedJobs() {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("jobs")
    .select(
      "id, title, company, location, created_at, show_salary_range, salary_min, salary_max, pay_period",
    )
    .eq("featured", true)
    .eq("is_public", true)
    .eq("status", "active")
    .or(`expires_at.is.null,expires_at.gt.${now}`)
    .limit(6);

  if (error) throw error;
  return data;
}

/* ──────────────────────────────────────────────
 * Create a job + associated proof tasks
 * ────────────────────────────────────────────── */
export async function createJobWithTasks(
  values: Partial<EmployerJob & { proof_tasks?: ProofTask[] }>,
) {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error("User not authenticated.");

  // 1️⃣ Look up the user's company_id and company name
  const companyId = await getCurrentCompanyId();

  let companyName = values.company ?? "";
  if (companyId && !companyName) {
    // Fetch company name if not provided
    const { data: companyData } = await supabase
      .from("companies")
      .select("name")
      .eq("id", companyId)
      .single();
    companyName = companyData?.name ?? "";
  }

  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .insert([
      {
        title: values.title ?? "",
        company: companyName,
        location: values.location ?? "",
        description: values.description ?? "",
        requirements: values.requirements ?? "",
        paid: values.paid ?? false,
        payment_amount: values.payment_amount ?? null,
        payment_currency: values.payment_currency ?? "DKK",
        show_salary_range: values.show_salary_range ?? false,
        salary_min: values.salary_min ?? null,
        salary_max: values.salary_max ?? null,
        pay_period: values.pay_period ?? "monthly",
        employer_id: user.id,
        company_id: companyId,
        expires_at: values.application_deadline
          ? new Date(values.application_deadline).toISOString()
          : values.expires_at ?? null,
        is_public: true,
        job_type: values.job_type ?? null,
        department: values.department ?? null,
        work_mode: values.work_mode ?? null,
        screening_questions: (values.screening_questions?.length) ? values.screening_questions : null,
      },
    ])
    .select("id")
    .single();

  if (jobError) throw jobError;

  // 2️⃣ Create proof tasks (if any)
  if (values.proof_tasks?.length && values.proof_tasks[0].title) {
    const proofInserts = values.proof_tasks.map((task) => ({
      job_id: job.id,
      title: task.title,
      description: task.description,
      duration_minutes: task.duration_minutes || 30,
      expected_time: task.expected_time || "30 mins",
      submission_format: task.submission_format,
      submission_type: task.submission_type ?? "link",
      recommended_platform: task.recommended_platform ?? null,
      attachments: task.attachments ?? [],
      rubric_criteria: task.rubric_criteria ?? null,
      follow_up_questions: task.follow_up_questions?.length ? task.follow_up_questions : null,
    }));

    const { error: proofError } = await supabase
      .from("proof_tasks")
      .insert(proofInserts);
    if (proofError) throw proofError;
  }

  return job;
}

/* ──────────────────────────────────────────────
 * Update an existing job + proof tasks
 * ────────────────────────────────────────────── */
export async function updateJobWithTasks(
  job_id: string,
  values: Partial<EmployerJob & { proof_tasks?: ProofTask[] }>,
) {
  const { error: jobError } = await supabase
    .from("jobs")
    .update({
      title: values.title,
      company: values.company,
      location: values.location,
      description: values.description,
      requirements: values.requirements,
      paid: values.paid ?? false,
      payment_amount: values.payment_amount ?? null,
      payment_currency: values.payment_currency ?? "DKK",
      show_salary_range: values.show_salary_range ?? false,
      salary_min: values.salary_min ?? null,
      salary_max: values.salary_max ?? null,
      pay_period: values.pay_period ?? "monthly",
      job_type: values.job_type ?? null,
      department: values.department ?? null,
      work_mode: values.work_mode ?? null,
      expires_at: values.application_deadline
        ? new Date(values.application_deadline).toISOString()
        : values.expires_at ?? null,
      screening_questions: (values.screening_questions?.length) ? values.screening_questions : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", job_id);

  if (jobError) throw jobError;

  // 2️⃣ Reconcile proof tasks (UPSERT-by-id, never delete a locked rubric)
  if (values.proof_tasks?.length) {
    // Fetch existing tasks to know which are locked
    const { data: existing, error: fetchError } = await supabase
      .from("proof_tasks")
      .select("id, rubric_locked_at")
      .eq("job_id", job_id);
    if (fetchError) throw fetchError;

    const lockedById = new Map<string, string | null>(
      (existing ?? []).map((t) => [t.id, t.rubric_locked_at as string | null]),
    );
    const incomingIds = new Set(
      values.proof_tasks.filter((t) => t.id).map((t) => t.id as string),
    );

    // Delete tasks that are no longer in the form. (RLS / FK will surface an
    // error if a task that has submissions is removed — that's the right
    // signal to the user.)
    const toDelete = (existing ?? [])
      .map((t) => t.id as string)
      .filter((id) => !incomingIds.has(id));
    if (toDelete.length) {
      const { error: delError } = await supabase
        .from("proof_tasks")
        .delete()
        .in("id", toDelete);
      if (delError) throw delError;
    }

    // Update existing or insert new
    for (const t of values.proof_tasks) {
      const basePayload = {
        job_id,
        title: t.title,
        description: t.description,
        duration_minutes: t.duration_minutes || 30,
        expected_time: t.expected_time || "30 mins",
        submission_format: t.submission_format,
        submission_type: t.submission_type ?? "link",
        recommended_platform: t.recommended_platform ?? null,
        attachments: t.attachments ?? [],
        follow_up_questions: t.follow_up_questions?.length ? t.follow_up_questions : null,
      };

      if (t.id && lockedById.has(t.id)) {
        // Existing task: only allow rubric edit if not locked
        const isLocked = !!lockedById.get(t.id);
        const updatePayload = isLocked
          ? basePayload
          : { ...basePayload, rubric_criteria: t.rubric_criteria ?? null };

        const { error: updateError } = await supabase
          .from("proof_tasks")
          .update(updatePayload)
          .eq("id", t.id);
        if (updateError) throw updateError;
      } else {
        // New task: persist rubric on insert
        const { error: insertError } = await supabase
          .from("proof_tasks")
          .insert({ ...basePayload, rubric_criteria: t.rubric_criteria ?? null });
        if (insertError) throw insertError;
      }
    }
  }

  return true;
}

/* ──────────────────────────────────────────────
 * Update job status (Active / Paused / Closed)
 * ────────────────────────────────────────────── */
export async function updateJobStatus(job_id: string, status: string) {
  const { error } = await supabase
    .from("jobs")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", job_id);

  if (error) throw error;
  return true;
}

/* ──────────────────────────────────────────────
 * Delete an existing job + proof tasks
 * ────────────────────────────────────────────── */
export async function deleteJob(job_id: string) {
  // 1. Delete all submissions related to this job
  const { error: subError } = await supabase
    .from("submissions")
    .delete()
    .eq("job_id", job_id);

  if (subError) {
    console.error("Error deleting submissions:", subError);
    throw subError;
  }

  // 2. Delete all proof tasks related to this job
  const { error: taskError } = await supabase
    .from("proof_tasks")
    .delete()
    .eq("job_id", job_id);

  if (taskError) {
    console.error("Error deleting proof tasks:", taskError);
    throw taskError;
  }

  // 3. Finally, delete the job itself
  const { error, count } = await supabase
    .from("jobs")
    .delete({ count: "exact" }) // Request exact count of deleted rows
    .eq("id", job_id);

  if (error) throw error;

  // 🚨 Validation: If count is 0, RLS probably blocked the delete
  if (count === 0) {
    throw new Error(
      "Job could not be deleted. You might be missing a DELETE policy in Supabase.",
    );
  }

  return true;
}

export async function getSavedJobIds(userId: string) {
  const { data } = await supabase
    .from("saved_jobs")
    .select("job_id")
    .eq("user_id", userId);
  return data ? data.map((r) => r.job_id) : [];
}

export async function toggleSavedJob(userId: string, jobId: string) {
  const { data } = await supabase
    .from("saved_jobs")
    .select("*")
    .eq("user_id", userId)
    .eq("job_id", jobId)
    .single();

  if (data) {
    // Unsave (Delete)
    await supabase.from("saved_jobs").delete().eq("user_id", userId).eq(
      "job_id",
      jobId,
    );
    return false; // Result: Not Saved
  } else {
    // Save (Insert)
    await supabase.from("saved_jobs").insert({
      user_id: userId,
      job_id: jobId,
    });
    return true; // Result: Saved
  }
}
