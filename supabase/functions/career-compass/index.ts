import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const ALLOWED_ORIGIN = Deno.env.get("ALLOWED_ORIGIN") ?? "https://bevisly.com";

const corsHeaders = {
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type, x-client-timeout",
};

function ok(body: unknown) {
    return new Response(JSON.stringify(body), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
}

function err(message: string) {
    return new Response(JSON.stringify({ error: message }), {
        status: 200, // Return 200 so frontend can parse the error JSON
        headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
}

// ── Prompt assembly ──────────────────────────────────────────────────────────

function buildPrompt(
    profile: Record<string, unknown>,
    intake: Record<string, unknown>,
    submissions: Record<string, unknown>[],
    projects: Record<string, unknown>[],
): string {
    const eduList = (Array.isArray(profile.education) ? profile.education : []) as { level: string; field?: string; institution?: string; graduation_year?: string }[];
    const exp = profile.experience as Record<string, string> | null;
    const skills = (profile.skills as string[] | null)?.join(", ") || "Not listed";
    const eduSummary = eduList.length
        ? eduList.map((e) => `${e.level}${e.field ? ` in ${e.field}` : ""}${e.institution ? ` — ${e.institution}` : ""}${e.graduation_year ? ` (${e.graduation_year})` : ""}`).join("; ")
        : "Not specified";

    // Build proof history block
    const proofLines: string[] = [];
    for (const sub of submissions) {
        const job = sub.jobs as Record<string, unknown> | null;
        const task = sub.proof_tasks as Record<string, unknown> | null;
        const feedbackArr = (sub.feedback as Record<string, unknown>[] | null) || [];
        const fb = feedbackArr[0] as Record<string, unknown> | undefined;

        if (!fb) continue; // Skip unreviewed submissions

        const rubricScores = (fb.rubric_scores as { name: string; score: number; note?: string }[] | null) || [];
        const rubricLine = rubricScores.length
            ? rubricScores.map((r) => `  • ${r.name}: ${r.score}/5${r.note ? ` — "${r.note}"` : ""}`).join("\n")
            : "  (no rubric scores)";

        proofLines.push(
            `---\nJob: ${job?.title ?? "Unknown"} at ${job?.company ?? "Unknown company"}\n` +
            `Proof task: ${task?.title ?? "Unknown"} — ${String(task?.description ?? "").slice(0, 200)}\n` +
            `Rubric scores:\n${rubricLine}\n` +
            `Employer feedback — Strengths: ${fb.strengths ?? "n/a"} | Improvements: ${fb.improvements ?? "n/a"}\n` +
            `Stars: ${fb.stars ?? "n/a"}/5 | Hiring outcome: ${sub.hiring_stage ?? "n/a"}`,
        );
    }

    const hasRatedSubmissions = proofLines.length > 0;
    const proofBlock = hasRatedSubmissions
        ? proofLines.join("\n")
        : "No employer-rated proof submissions yet. Base guidance on profile data and intake answers only. Note this data limitation explicitly in your output.";

    const projectBlock = (projects as { title: string; skills?: string[] }[]).length
        ? (projects as { title: string; skills?: string[] }[])
            .map((p) => `• ${p.title}${p.skills?.length ? ` (${p.skills.join(", ")})` : ""}`)
            .join("\n")
        : "No portfolio projects listed.";

    return `You are a career guidance assistant for Bevisly, a recruitment platform where candidates prove skills through real employer-set proof tasks. Your job is to give honest, evidence-based career guidance grounded in the candidate's actual proof submission and rubric data — not generic advice.

## Candidate Background
Name: ${profile.full_name ?? "Unknown"}
Bio: ${profile.bio ?? "Not provided"}
Skills (self-reported): ${skills}
Education: ${edu?.level ?? "Not specified"}${edu?.field ? `, ${edu.field}` : ""}${edu?.institution ? ` — ${edu.institution}` : ""}
Experience: ${exp?.years ?? "Not specified"}
Bevisly score: ${profile.bevisly_score ?? 0}/100

## What They're Aiming For (intake form)
Target roles: ${(intake.target_roles as string[])?.join(", ") || "Not specified"}
Company preference: ${(intake.company_types as string[])?.join(", ") || "Not specified"}
Work arrangement: ${intake.work_arrangement ?? "Not specified"}
12-month goal: ${intake.career_goal ?? "Not provided"}
Self-reported strength: ${intake.biggest_strength ?? "Not provided"}
Self-reported blocker: ${intake.perceived_blocker ?? "Not provided"}
Currently learning: ${intake.active_learning || "Nothing mentioned"}
Job search urgency: ${intake.urgency ?? "Not specified"}

## Proof History (employer-verified)
${proofBlock}

## Portfolio Projects
${projectBlock}

## Instructions
Produce a JSON object with exactly these keys:

- career_direction: array of up to 3 recommended role types based on demonstrated strengths. Each object has:
  - role (string): the role type name
  - fit_score (integer 0–100): how well their proof data supports this path
  - reasoning (string): 2–3 sentences citing specific rubric patterns or feedback themes
  - key_strengths (string[]): 2–4 strengths grounded in the proof data

- proof_readiness: one object per role listed in their target_roles. Each object has:
  - role (string): matches target role name
  - readiness_score (integer 0–100): how prepared they are right now
  - explanation (string): 1–2 sentences on what the score reflects
  - what_would_improve_it (string): 1 concrete action that would raise this score

- skills_gap: top 3–5 gaps they need to close. Each object has:
  - skill (string): skill or competency name
  - gap_level (string): exactly one of "minor", "moderate", "significant"
  - evidence (string): quote or reference the rubric criterion name and score that reveals this gap. If no proof data, note that.
  - suggestion (string): 1 practical suggestion to close this gap

- overall_summary (string): 2–3 honest sentences summarising where this candidate stands and what matters most for their next move.

Rules:
- Every claim in career_direction and skills_gap must cite specific proof data (rubric criterion name + score). No vague statements.
- If proof data is limited, explicitly lower confidence scores and note the limitation.
- Do not invent rubric scores or employer names not present in the data.
- Validate the candidate's self-reported strengths only if the proof data supports them. If the data contradicts them, say so respectfully.
- Return ONLY valid JSON matching the schema above. No markdown, no code fences, no preamble.

${JSON.stringify({
    career_direction: [
        { role: "example", fit_score: 80, reasoning: "...", key_strengths: ["..."] },
    ],
    proof_readiness: [
        { role: "example", readiness_score: 70, explanation: "...", what_would_improve_it: "..." },
    ],
    skills_gap: [
        { skill: "example", gap_level: "moderate", evidence: "...", suggestion: "..." },
    ],
    overall_summary: "...",
})}`;
}

// ── Main handler ─────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const { session_id, user_id } = await req.json();

        if (!session_id || !user_id) {
            return err("Missing session_id or user_id");
        }

        const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
        const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
        const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

        if (!GEMINI_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
            return err("Server configuration error: missing environment variables");
        }

        const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

        // ── Pull all candidate data in parallel ──────────────────────────────

        const [profileRes, submissionsRes, projectsRes, sessionRes] = await Promise.all([
            db.from("profiles")
                .select("full_name, bio, skills, education, experience, bevisly_score, work_status")
                .eq("id", user_id)
                .single(),

            db.from("submissions")
                .select(`
                    id, status, hiring_stage, completed_at,
                    jobs ( title, company ),
                    proof_tasks ( title, description, rubric_criteria ),
                    feedback ( strengths, improvements, stars, rubric_scores )
                `)
                .eq("user_id", user_id)
                .in("status", ["submitted", "reviewed"])
                .order("completed_at", { ascending: false })
                .limit(10),

            db.from("candidate_projects")
                .select("title, skills")
                .eq("user_id", user_id)
                .limit(6),

            db.from("career_compass_sessions")
                .select("intake_data")
                .eq("id", session_id)
                .single(),
        ]);

        if (profileRes.error || !profileRes.data) {
            return err("Could not load candidate profile");
        }
        if (sessionRes.error || !sessionRes.data) {
            return err("Session not found");
        }

        const profile = profileRes.data as Record<string, unknown>;
        const submissions = (submissionsRes.data ?? []) as Record<string, unknown>[];
        const projects = (projectsRes.data ?? []) as Record<string, unknown>[];
        const intake = sessionRes.data.intake_data as Record<string, unknown>;

        // ── Build prompt and call Gemini ─────────────────────────────────────

        const prompt = buildPrompt(profile, intake, submissions, projects);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 90000);

        const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 3000,
                        responseMimeType: "application/json",
                    },
                }),
                signal: controller.signal,
            },
        );
        clearTimeout(timeoutId);

        const geminiData = await geminiRes.json();

        if (!geminiRes.ok) {
            console.error("Gemini error:", geminiData);
            return err(geminiData.error?.message || "Gemini API error");
        }

        // Parse response — skip thinking parts if present
        const parts: { thought?: boolean; text?: string }[] =
            geminiData.candidates?.[0]?.content?.parts || [];
        const responsePart = parts.find((p) => !p.thought && p.text) ?? parts[0];
        const rawText = responsePart?.text || "";

        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.error("No JSON in Gemini response:", rawText.slice(0, 300));
            return err("AI returned an unexpected response format. Please try again.");
        }

        let result: Record<string, unknown>;
        try {
            result = JSON.parse(jsonMatch[0]);
        } catch {
            console.error("JSON parse failed:", rawText.slice(0, 300));
            return err("Failed to parse AI response. Please try again.");
        }

        // ── Save result to session ───────────────────────────────────────────

        await db
            .from("career_compass_sessions")
            .update({ ai_output: result, status: "analysis_ready" })
            .eq("id", session_id);

        return ok({ result });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("career-compass error:", message);
        return err(message);
    }
});
