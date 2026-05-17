import { createClient } from "@supabase/supabase-js";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM = "Bevisly <hello@bevisly.com>";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function sendEmail({ to, subject, html }: { to: string[]; subject: string; html: string }) {
  if (!RESEND_API_KEY) {
    console.error("⚠️ No RESEND_API_KEY — email not sent");
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  });
  if (!res.ok) {
    const detail = await res.text();
    console.error(`❌ Resend error ${res.status}: ${detail}`);
  } else {
    console.log(`✅ Email sent to ${to.join(", ")}`);
  }
}

interface SubmissionRecord {
  id: string;
  job_id: string;
  user_id: string;
  status: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const payload = await req.json();
    const { record, old_record, type, table } = payload;

    console.log(`🔔 Webhook received: ${type} on ${table}`);

    if (table !== "submissions") return new Response("Ignored", { headers: corsHeaders });

    if (type === "UPDATE") {
      const newStatus = (record as SubmissionRecord).status;
      const oldStatus = (old_record as SubmissionRecord | undefined)?.status;

      console.log(`🔄 Status Change: ${oldStatus} -> ${newStatus}`);

      if (newStatus === "submitted" && oldStatus !== "submitted") {
        await notifyEmployer(record as SubmissionRecord);
      }

      if (newStatus === "reviewed" && oldStatus !== "reviewed") {
        console.log("Status changed to reviewed. Notifying candidate:", (record as SubmissionRecord).user_id);
        await notifyCandidate(record as SubmissionRecord);
      }
    }

    return new Response(JSON.stringify({ message: "Notification processed" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("❌ Error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

/* ─── Helpers ─── */

async function notifyEmployer(record: SubmissionRecord) {
  console.log("📧 Notifying Employer...");

  const { data: job } = await supabase
    .from("jobs")
    .select(`title, employer_id, profiles!employer_id ( email )`)
    .eq("id", record.job_id)
    .single();

  const { data: candidate } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", record.user_id)
    .single();

  // Supabase returns profiles as a single object for foreign key joins
  const employerEmail = (job?.profiles as { email?: string } | null)?.email;
  const candidateName = candidate?.full_name || "A Candidate";
  const escapedCandidateName = escapeHtml(candidateName);
  const escapedJobTitle = escapeHtml(job?.title || "");
  const escapedRecordId = escapeHtml(String(record.id));

  if (employerEmail) {
    await sendEmail({
      to: [employerEmail],
      subject: `🚀 New Submission: ${job?.title}`,
      html: `
        <h2>New Proof Submitted</h2>
        <p><strong>${escapedCandidateName}</strong> just submitted work for <strong>${escapedJobTitle}</strong>.</p>
        <p style="margin-top: 20px;">
          <a href="https://bevisly.vercel.app/employer/review/${escapedRecordId}" style="background-color: #0077cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Review Submission
          </a>
        </p>
      `,
    });
  }
}

async function notifyCandidate(record: SubmissionRecord) {
  const { data: candidate } = await supabase
    .from("profiles")
    .select("email, full_name")
    .eq("id", record.user_id)
    .single();

  const { data: job } = await supabase
    .from("jobs")
    .select("title")
    .eq("id", record.job_id)
    .single();

  if (candidate?.email) {
    const escapedCandidateName = escapeHtml(candidate.full_name || "Candidate");
    const escapedJobTitle = escapeHtml(job?.title || "");

    await sendEmail({
      to: [candidate.email],
      subject: `⭐ Feedback Received: ${job?.title}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #ff8b3d; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Proof Reviewed!</h1>
          </div>
          <div style="padding: 30px; background-color: #ffffff;">
            <p style="font-size: 16px; color: #333; margin-bottom: 10px;">Hi <strong>${escapedCandidateName}</strong>,</p>
            <p style="font-size: 16px; color: #555; line-height: 1.5;">
              Good news! An employer has reviewed your proof submission for <strong>${escapedJobTitle}</strong>.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://bevisly.com/candidate/proofs"
                 style="background-color: #ff8b3d; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">
                 View Feedback & Score
              </a>
            </div>
            <p style="font-size: 14px; color: #999; text-align: center; margin-top: 30px;">
              Keep building your proof portfolio.<br>
              &mdash; The Bevisly Team
            </p>
          </div>
        </div>
      `,
    });
  } else {
    console.error("Candidate email not found for ID:", record.user_id);
  }
}


function escapeHtml(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
