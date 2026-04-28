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

        const { raw_input, company_name } = await req.json();

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

        const prompt = `
      Act as an expert Technical Hiring Manager for ${
            company_name || "a tech company"
        }.
      Based on the following raw, unstructured inputs from a hiring manager, generate a compelling Job Description, extract a concise Job Title, list the Requirements, and design a practical Proof Task.
      
      Raw Input / Ideas:
      ${raw_input}

      The Job Title should be concise and professional (e.g. "Senior React Developer", "Growth Marketing Specialist").
      The Job Description should be engaging and highlight the impact of the role.
      The Requirements should be clear bullet points.
      The Proof Task should be a realistic challenge (45-60 mins) to verify the core skills implied by the input.

      Return ONLY a JSON object with this exact structure (no markdown formatting):
      {
        "title": "Extracted Job Title",
        "description": "Full job description text (can use markdown)",
        "requirements": "List of requirements (markdown bullet points)",
        "proof_tasks": [
          {
            "title": "Task Title",
            "description": "Detailed instructions...",
            "expected_time": "45-60 mins",
            "submission_format": "github_repo" 
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
