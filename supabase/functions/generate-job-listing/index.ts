// supabase/functions/generate-job-listing/index.ts
import "jsr:@supabase/functions-js@^2/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type, x-client-timeout",
};

Deno.serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ??
            "";
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        const { raw_input, company_name, company_description, company_mission, company_culture,
                company_industry, company_stage, company_size, company_business_model,
                duration_minutes } = await req.json();

        if (!raw_input) {
            throw new Error("Missing raw_input");
        }

        /* ── SECURITY: Authentication & Rate Limiting ── */
        const authHeader = req.headers.get("Authorization");
        let isAuthorized = false;

        if (authHeader) {
            // 1. Try to verify as a logged-in user
            const { data: { user }, error: authError } = await supabase.auth
                .getUser(authHeader.replace("Bearer ", ""));
            if (!authError && user) {
                isAuthorized = true;
                console.log(`Authorized request from user: ${user.email}`);
            }
        }

        if (!isAuthorized) {
            // 2. Fallback to IP-based rate limiting for landing page demo
            const clientIP = req.headers.get("x-real-ip") ||
                req.headers.get("x-forwarded-for") || "unknown";

            const { data: allowed, error: limitError } = await supabase.rpc(
                "check_ai_rate_limit",
                {
                    p_ip: clientIP,
                    p_limit: 3, // Allow 3 requests per 24h for visitors
                },
            );

            if (limitError || !allowed) {
                return new Response(
                    JSON.stringify({
                        error:
                            "Trial limit reached. Please sign up to generate more job tasks!",
                        isLimit: true,
                    }),
                    {
                        status: 429, // Too Many Requests
                        headers: {
                            ...corsHeaders,
                            "Content-Type": "application/json",
                        },
                    },
                );
            }
            console.log(`Public request allowed for IP: ${clientIP}`);
        }

        /* ── GEMINI AI LOGIC ──────────────────────────── */
        const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
        if (!GEMINI_API_KEY) {
            console.error("GEMINI_API_KEY is missing");
            return new Response(
                JSON.stringify({
                    error: "Server configuration error: Missing AI Key",
                }),
                {
                    status: 500,
                    headers: {
                        ...corsHeaders,
                        "Content-Type": "application/json",
                    },
                },
            );
        }

        const durationMin = typeof duration_minutes === "number" ? duration_minutes : 60;

        const tierLabel = durationMin <= 30 ? "30 minutes"
            : durationMin <= 60 ? "~1 hour"
            : durationMin <= 120 ? "~2 hours"
            : "~3 hours";

        const tierScope = durationMin <= 30
            ? "The task MUST be completable in 30 minutes by a qualified candidate. Scope it to exactly 1 tight, concrete deliverable. No open-ended design or research."
            : durationMin <= 60
            ? "The task should take roughly 1 hour. Scope it to 1–2 focused deliverables. Avoid scope creep."
            : durationMin <= 120
            ? "The task should take roughly 2 hours. Allow 2–3 deliverables or an open-ended problem that expects the candidate to explain their trade-offs and reasoning."
            : "The task should take roughly 3 hours. Design a complex multi-part challenge that tests systematic thinking, planning, and execution across multiple areas. Expect the candidate to make and justify decisions.";

        const rubricCount = durationMin <= 60 ? 3 : durationMin <= 120 ? 4 : 5;

        const companyContext = [
            company_description    ? `- About: ${company_description}` : "",
            company_mission        ? `- Mission: ${company_mission}` : "",
            company_culture        ? `- Culture & Values: ${company_culture}` : "",
            company_industry       ? `- Industry: ${company_industry}` : "",
            company_stage          ? `- Stage: ${company_stage}` : "",
            company_size           ? `- Team size: ${company_size}` : "",
            company_business_model?.length
                ? `- Business model: ${company_business_model.join(", ")}` : "",
        ].filter(Boolean).join("\n");

        const prompt = `
Act as an expert Technical Hiring Manager for ${company_name || "a tech company"}.
${companyContext ? `\nCompany Context:\n${companyContext}\n\nIMPORTANT: Use the company context above to deeply understand what this role means at this specific company — what "good" looks like here, what the company values in its people, and what the proof task should actually test. Do NOT copy or paraphrase this company information into the job description; that content is already shown to candidates separately. Instead, let it shape the accuracy and specificity of the proof task, the rubric criteria, and the follow-up questions.\n` : ""}
Based on the following raw, unstructured input from a hiring manager, generate a complete job listing with a proof task.

Raw Input:
${raw_input}

Instructions:
- Job Title: concise and professional (e.g. "Senior React Developer", "Growth Marketing Specialist")
- Job Description: engaging, highlights the impact of the role (use markdown)
- Requirements: clear markdown bullet points
- Job Type: infer from input — one of: "Full-time", "Part-time", "Contract", "Internship", "Freelance", "Volunteer". Default to "Full-time" if unclear.
- Work Mode: infer from input — one of: "Remote", "On-site", "Hybrid". Default to "Remote" if unclear.
- Location: extract city/country if mentioned, use "Remote" if it's a remote role, or leave empty string "" if not mentioned.
- Proof Task: a realistic, practical challenge (${tierLabel}) that directly tests the core skills this role requires.
- Time tier: ${tierScope}

Each Proof Task MUST include:
1. "rubric_criteria": exactly ${rubricCount} weighted scoring criteria
   - "name": short label (2–4 words), e.g. "Code clarity", "Problem decomposition", "UX polish"
   - "weight": integer 1–100; all weights MUST sum to exactly 100
   - "description": one-line plain-English description of what 'good' looks like
   Pick criteria that directly match the skill being tested.

2. "follow_up_questions": exactly 2–3 short interview probe questions based on the task (e.g. "Walk us through your approach.", "What trade-offs did you consider?", "How would you improve this given more time?")

Return ONLY a JSON object with this exact structure (no markdown, no code fences):
{
  "title": "Extracted Job Title",
  "description": "Full job description (markdown ok)",
  "requirements": "Requirements as markdown bullet points",
  "job_type": "Full-time",
  "work_mode": "Remote",
  "location": "",
  "proof_tasks": [
    {
      "title": "Task Title",
      "description": "Detailed task instructions...",
      "expected_time": "${tierLabel}",
      "submission_format": "github_repo",
      "rubric_criteria": [
        { "name": "Code clarity", "weight": 40, "description": "Readable structure, clear naming" },
        { "name": "Problem decomposition", "weight": 35, "description": "Breaks the problem into clean logical steps" },
        { "name": "Edge-case handling", "weight": 25, "description": "Anticipates failure modes and edge inputs" }
      ],
      "follow_up_questions": [
        "Walk us through your approach to this challenge.",
        "What trade-offs did you consider?",
        "How would you improve this given more time?"
      ]
    }
  ]
}
    `;

        const model = "gemini-2.5-flash"; // Updated from deprecated 1.5-flash
        const TIMEOUT_MS = 115000;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: {
                            temperature: 0.7,
                            maxOutputTokens: 4096,
                            responseMimeType: "application/json",
                        },
                    }),
                    signal: controller.signal,
                },
            );

            const data = await response.json();
            clearTimeout(timeoutId);

            if (!response.ok) {
                console.error("Gemini API error:", data);
                throw new Error(data?.error?.message || "AI generation failed");
            }

            let rawText = data.candidates?.[0]?.content?.parts?.[0]?.text ||
                "{}";
            rawText = rawText.replace(/```json/gi, "").replace(/```/g, "")
                .replace(/^`|`$/g, "");

            const parsedData = JSON.parse(rawText);
            return new Response(JSON.stringify(parsedData), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        } catch (err: unknown) {
            clearTimeout(timeoutId);
            const errorMessage = err instanceof Error
                ? err.message
                : "AI generation failed";
            return new Response(
                JSON.stringify({ error: errorMessage }),
                {
                    status: 500,
                    headers: {
                        ...corsHeaders,
                        "Content-Type": "application/json",
                    },
                },
            );
        }
    } catch (error) {
        console.error("Error:", error);
        return new Response(
            JSON.stringify({
                error: error instanceof Error ? error.message : "Unknown error",
            }),
            {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            },
        );
    }
});
