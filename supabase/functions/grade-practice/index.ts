import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const ALLOWED_ORIGIN = Deno.env.get("ALLOWED_ORIGIN") ?? "https://bevisly.com";

const corsHeaders = {
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type, x-client-timeout",
};

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const { submission_id } = await req.json();

        if (!submission_id) {
            return new Response(
                JSON.stringify({ error: "submission_id is required" }),
                { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
            );
        }

        const supabase = createClient(
            Deno.env.get("SUPABASE_URL")!,
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
        );

        const { data: submission, error: subError } = await supabase
            .from("practice_submissions")
            .select(`
                id,
                user_id,
                submission_content,
                submission_link,
                credits_awarded,
                practice_tasks (
                    id,
                    title,
                    description
                )
            `)
            .eq("id", submission_id)
            .single();

        if (subError || !submission) {
            return new Response(
                JSON.stringify({ error: "Submission not found" }),
                { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
            );
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const task = Array.isArray((submission as any).practice_tasks)
            ? (submission as any).practice_tasks[0]
            : (submission as any).practice_tasks;

        if (!task) {
            return new Response(
                JSON.stringify({ error: "Practice task not found" }),
                { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
            );
        }

        const submissionContent = submission.submission_content || submission.submission_link || "(no content provided)";

        const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
        if (!GEMINI_API_KEY) {
            return new Response(
                JSON.stringify({ error: "Server configuration error: Missing AI Key" }),
                { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
            );
        }

        const prompt = `You are an expert evaluator assessing a candidate's response to a practice task.

Task title: ${task.title}
Task instructions: ${task.description}

Candidate's submission:
${submissionContent.slice(0, 4000)}

Evaluate the submission on:
1. Relevance — does it address the task correctly?
2. Quality — depth, accuracy, and effort shown
3. Clarity — is it well-structured and easy to understand?
4. Practicality — would this work in a real context?

Return a JSON object with exactly these keys:
- "score": integer from 1 to 10 (10 = exceptional, 7 = solid, 4 = needs work, 1 = off-track)
- "feedback": 2-3 sentence overall assessment
- "strengths": 1-2 sentences on what was done well
- "improvements": 1-2 sentences on the most important thing to improve

Be honest but constructive. A score of 7 is good. Reserve 9-10 for truly exceptional responses.`;

        const model = "gemini-2.5-flash";
        const version = "v1beta";
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000);

        const response = await fetch(
            `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 1024,
                        responseMimeType: "application/json",
                        thinkingConfig: { thinkingBudget: 0 },
                    },
                }),
                signal: controller.signal,
            },
        );

        clearTimeout(timeoutId);

        let gradeResult = { score: 5, feedback: "AI grading unavailable. Please try again.", strengths: "", improvements: "" };

        if (response.ok) {
            const data = await response.json();
            const parts: { thought?: boolean; text?: string }[] = data.candidates?.[0]?.content?.parts || [];
            const responsePart = parts.find((p) => !p.thought && p.text) ?? parts[0];
            const rawText = responsePart?.text || "";

            const jsonMatch = rawText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                try {
                    const parsed = JSON.parse(jsonMatch[0]);
                    gradeResult = {
                        score: Math.min(10, Math.max(1, parseInt(parsed.score) || 5)),
                        feedback: parsed.feedback || "",
                        strengths: parsed.strengths || "",
                        improvements: parsed.improvements || "",
                    };
                } catch (_e) {
                    console.error("Failed to parse Gemini response:", rawText);
                }
            }
        } else {
            const errData = await response.json().catch(() => ({}));
            console.error("Gemini API error:", errData);
        }

        const score = gradeResult.score;
        let creditsToAward = 0;

        if ((submission as any).credits_awarded === 0) {
            if (score >= 8) creditsToAward = 40;
            else if (score >= 5) creditsToAward = 20;
            else creditsToAward = 5;
        }

        const now = new Date().toISOString();

        await supabase
            .from("practice_submissions")
            .update({
                ai_score: score,
                ai_feedback: gradeResult.feedback,
                ai_strengths: gradeResult.strengths,
                ai_improvements: gradeResult.improvements,
                graded_at: now,
                ...(creditsToAward > 0 ? { credits_awarded: creditsToAward } : {}),
            })
            .eq("id", submission_id);

        if (creditsToAward > 0) {
            const { data: profile } = await supabase
                .from("profiles")
                .select("credits")
                .eq("id", submission.user_id)
                .single();

            const currentCredits = (profile as any)?.credits ?? 0;

            await supabase
                .from("profiles")
                .update({ credits: currentCredits + creditsToAward })
                .eq("id", submission.user_id);
        }

        return new Response(
            JSON.stringify({
                score,
                feedback: gradeResult.feedback,
                strengths: gradeResult.strengths,
                improvements: gradeResult.improvements,
                credits_earned: creditsToAward,
            }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return new Response(
            JSON.stringify({ error: errorMessage }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
    }
});
