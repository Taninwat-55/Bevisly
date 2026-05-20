const ALLOWED_ORIGIN = Deno.env.get("ALLOWED_ORIGIN") ?? "https://bevisly.com";

const corsHeaders = {
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type, x-client-timeout",
};

Deno.serve(async (req: Request) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
        if (!GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY is not set.");
        }

        const {
            candidate_name,
            job_title,
            company_name,
            task_title,
            task_description,
            submission_content,
            reflection,
            rubric_criteria,
            rubric_scores,
            suggested_rating,
            strengths,
            improvements,
        } = await req.json();

        if (submission_content !== undefined && submission_content !== null && typeof submission_content !== "string") {
            throw new Error("Invalid submission_content");
        }
        if (typeof submission_content === "string" && submission_content.length > 20000) {
            throw new Error("submission_content exceeds maximum length");
        }

        const firstName = (candidate_name ?? "Candidate")
            .trim()
            .split(/\s+/)[0];

        const hasRubric =
            Array.isArray(rubric_scores) &&
            rubric_scores.length > 0 &&
            Array.isArray(rubric_criteria) &&
            rubric_criteria.length > 0;

        const rubricBlock = hasRubric
            ? `How we evaluated (rubric scores):\n${rubric_scores
                  .map(
                      (s: { name: string; score: number; note?: string }) =>
                          `- ${s.name}: ${s.score}/5${s.note ? ` — "${s.note}"` : ""}`,
                  )
                  .join("\n")}`
            : suggested_rating != null
              ? `Overall rating: ${suggested_rating}/5`
              : "";

        const prompt = `You are a hiring manager at ${company_name ?? "our company"} writing a professional feedback letter to a candidate named ${firstName} who completed a proof task for a ${job_title ?? "role"} position.

Task: ${task_title ?? "Proof Task"}
${task_description ? `Task description: ${task_description}` : ""}

${submission_content ? `Candidate's submission (excerpt):\n${String(submission_content).slice(0, 2000)}` : ""}
${reflection ? `Candidate's own reflection: ${String(reflection).slice(0, 500)}` : ""}

${rubricBlock}

${strengths ? `Strengths observed by our team: ${strengths}` : ""}
${improvements ? `Areas for improvement noted: ${improvements}` : ""}

Write a professional feedback letter (150–200 words) that:
1. Opens by addressing ${firstName} by first name only, and thanks them for completing the task
2. Gives an honest, specific summary of their performance based on the evidence above
3. Highlights 2–3 concrete strengths with references to their actual work
4. Notes 1–2 specific growth areas, framed constructively and kindly
5. Closes with genuine encouragement — regardless of hiring outcome
6. Uses "we/our team" voice throughout, signed from "${company_name ?? "the team"}"
7. Does NOT mention whether they are advancing in the hiring process — the employer communicates that separately
8. Written in plain text only — no markdown, no bullet points, no headers

Return JSON: { "letter": "..." }`;

        const model = "gemini-2.5-flash";
        const version = "v1beta";

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        const response = await fetch(
            `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 512,
                        responseMimeType: "application/json",
                        thinkingConfig: { thinkingBudget: 0 },
                    },
                }),
                signal: controller.signal,
            },
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Gemini API error ${response.status}: ${errText}`);
        }

        const data = await response.json();
        const parts = data.candidates?.[0]?.content?.parts ?? [];
        const rawText = parts
            .filter((p: { thought?: boolean; text?: string }) => !p.thought && p.text)
            .map((p: { text: string }) => p.text)
            .join("");

        const match = rawText.match(/\{[\s\S]*\}/);
        if (!match) {
            throw new Error("Could not extract JSON from Gemini response.");
        }

        const parsed = JSON.parse(match[0]);
        if (!parsed.letter) {
            throw new Error("Gemini did not return a letter field.");
        }

        return new Response(JSON.stringify({ letter: parsed.letter }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
        return new Response(JSON.stringify({ error: errorMessage }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
