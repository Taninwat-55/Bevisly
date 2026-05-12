import { supabase } from "../supabaseClient";

export interface Invitation {
  id: string;
  code: string;
  company_name: string | null;
  contact_name: string | null;
  contact_email: string | null;
  message: string | null;
  invite_type: string;
  is_used: boolean;
  used_at: string | null;
  sent_at: string | null;
  created_at: string;
}

export interface WaitlistEntry {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  website: string | null;
  status: "pending" | "invited" | "rejected";
  created_at: string;
}

export interface CreateInvitePayload {
  company_name: string;
  contact_name: string;
  contact_email: string;
  message?: string;
  invite_type?: "employer" | "candidate";
}

/**
 * Generate a unique, human-friendly invite code.
 * Format: BEV-XXXX-XXXX (e.g., BEV-K4F2-9TM7)
 */
function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // No I, O, 0, 1 to avoid confusion
  const segment = () =>
    Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `BEV-${segment()}-${segment()}`;
}

/**
 * Create a new invitation record in the database.
 */
export async function createInvitation(payload: CreateInvitePayload): Promise<Invitation> {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error("Not authenticated");

  const code = generateInviteCode();

  const { data, error } = await supabase
    .from("invitations")
    .insert({
      code,
      company_name: payload.company_name,
      contact_name: payload.contact_name,
      contact_email: payload.contact_email,
      message: payload.message || null,
      invite_type: payload.invite_type || "employer",
      created_by: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Invitation;
}

/**
 * List all waitlist entries
 */
export async function listWaitlist(): Promise<WaitlistEntry[]> {
  const { data, error } = await supabase
    .from("waitlist")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching waitlist:", error);
    throw new Error(error.message);
  }

  return data as WaitlistEntry[];
}

/**
 * Update waitlist status
 */
export async function updateWaitlistStatus(id: string, status: "pending" | "invited" | "rejected") {
  const { error } = await supabase
    .from("waitlist")
    .update({ status })
    .eq("id", id);

  if (error) {
    console.error("Error updating waitlist status:", error);
    throw new Error(error.message);
  }
}

/**
 * Send the invite email via the send-email edge function and update sent_at.
 */
export async function sendInviteEmail(invitation: Invitation): Promise<void> {
  const inviteUrl = `${window.location.origin}/auth?tab=signup&role=employer&invite=${invitation.code}`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="display: inline-block; width: 48px; height: 48px; background: #3b82f6; border-radius: 12px; line-height: 48px; color: white; font-weight: bold; font-size: 24px;">B</div>
        <h1 style="margin: 16px 0 0; font-size: 24px; color: #1e293b;">You're Invited to Bevisly</h1>
      </div>

      <p style="color: #475569; font-size: 16px; line-height: 1.6;">
        Hi ${invitation.contact_name},
      </p>

      <p style="color: #475569; font-size: 16px; line-height: 1.6;">
        We'd love to have <strong>${invitation.company_name}</strong> join Bevisly — the proof-first hiring platform for junior talent.
      </p>

      ${invitation.message ? `
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 24px 0;">
          <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${invitation.message}</p>
        </div>
      ` : ""}

      <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); border-radius: 16px; padding: 32px; text-align: center; margin: 32px 0;">
        <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 0 0 8px;">Your exclusive invite code</p>
        <p style="color: white; font-size: 28px; font-weight: bold; letter-spacing: 3px; margin: 0 0 20px; font-family: monospace;">${invitation.code}</p>
        <a href="${inviteUrl}" style="display: inline-block; background: white; color: #3b82f6; font-weight: 700; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-size: 16px;">
          Get Started Free →
        </a>
      </div>

      <div style="margin: 32px 0;">
        <h3 style="color: #1e293b; font-size: 16px; margin-bottom: 16px;">What you get as an early adopter:</h3>
        <ul style="color: #475569; font-size: 14px; line-height: 2; padding-left: 20px;">
          <li><strong>Everything is free</strong> — no credit card, no limits during early access</li>
          <li><strong>AI-generated proof tasks</strong> — describe the role, AI writes the task</li>
          <li><strong>Real work, not CVs</strong> — review actual deliverables from candidates</li>
          <li><strong>Shape the platform</strong> — your feedback directly influences what we build</li>
        </ul>
      </div>

      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;" />

      <p style="color: #94a3b8; font-size: 12px; text-align: center;">
        Bevisly — Proof-First Hiring for Junior Talent<br />
        <a href="https://bevisly.com" style="color: #3b82f6;">bevisly.com</a>
      </p>
    </div>
  `;

  const { error } = await supabase.functions.invoke("send-email", {
    body: {
      to: invitation.contact_email,
      subject: `${invitation.contact_name}, you're invited to Bevisly — hire junior talent with proof`,
      html,
      text: `Hi ${invitation.contact_name}, you're invited to join Bevisly. Your invite code: ${invitation.code}. Sign up at ${inviteUrl}`,
    },
  });

  if (error) throw error;

  // Mark invitation as sent
  await supabase
    .from("invitations")
    .update({ sent_at: new Date().toISOString() })
    .eq("id", invitation.id);
}

/**
 * List all invitations (admin only).
 */
export async function listInvitations(): Promise<Invitation[]> {
  const { data, error } = await supabase
    .from("invitations")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Invitation[];
}
