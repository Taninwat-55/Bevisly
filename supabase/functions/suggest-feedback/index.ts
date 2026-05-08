import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type, x-client-timeout",
};

type RubricCriterion = {
    name: string;
    weight: number;
    description: string;
};

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const {
            rating,
            submission_content,
            criteria,
            task_description,
            reflection,
            rubric_criteria,
        } = await req.json();

        const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
        if (!GEMINI_API_KEY) {
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

        const hasRubric = Array.isArray(rubric_criteria)
            && rubric_criteria.length > 0;

        const rubricBlock = hasRubric
            ? (rubric_criteria as RubricCriterion[])
                .map((c, i) =>
                    `${i + 1}. **${c.name}** (weight ${c.weight}/100) — ${c.description}`
                )
                .join("\n")
            : "";

        const rubricInstruction = hasRubric
            ? `\n## Scoring Rubric (locked)\n${rubricBlock}\n\nFor each criterion, give a 1–5 score and a one-line note that points to specific evidence in the submission supporting the score (paraphrase or quote). Do not score against any criteria not listed above.`
            : "";

        const responseShape = hasRubric
            ? `{
  "rubric_scores": [
    { "name": "<criterion name verbatim>", "score": 4, "note": "Evidence-based note (≤25 words)" }
  ],
  "strengths": "1–3 specific strengths across the whole submission (max 60 words)",
  "improvements": "1–3 specific, constructive suggestions (max 60 words)"
}`
            : `{
  "suggested_rating": 4,
  "strengths": "What the candidate did well... (max 60 words)",
  "improvements": "What could be improved... (max 60 words)"
}`;

        const prompt = `
You are an expert Technical Evaluator and Senior Mentor reviewing a candidate's proof task submission.

## Task
Title: ${criteria || "General"}
${task_description ? `Description: ${task_description.slice(0, 1000)}` : ""}
${rubricInstruction}

## Candidate's Submission
${submission_content ? submission_content.slice(0, 3000) : "N/A"}

${reflection ? `## Candidate's Reflection\n${reflection.slice(0, 1000)}` : ""}

## Your Job
Evaluate whether the submission fulfills the task requirements. Consider:
- Does the work match what was asked for in the task description?
- Quality, depth, and correctness of the submission
- The candidate's self-awareness shown in their reflection (if provided)
${hasRubric
    ? "- Score each rubric criterion independently. Cite specific evidence from the submission for each score."
    : "- Provide a single 1–5 rating and a strengths/improvements summary."}

Return ONLY a valid JSON object exactly in this shape:
${responseShape}
`;

        const model = "gemini-2.5-flash";
        const version = "v1beta";
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

        const response = await fetch(
            `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
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
        const data = await response.json();

        if (response.ok) {
            // Skip thinking parts (thought: true) — only take the actual response part
            const parts: { thought?: boolean; text?: string }[] =
                data.candidates?.[0]?.content?.parts || [];
            const responsePart = parts.find((p) => !p.thought && p.text) ??
                parts[0];
            const rawText = responsePart?.text || "";

            console.log("Gemini raw response:", rawText.slice(0, 200));

            const jsonMatch = rawText.match(/\{[\s\S]*\}/);

            let parsedData;
            try {
                if (!jsonMatch) {
                    throw new Error("No JSON object found in response");
                }
                parsedData = JSON.parse(jsonMatch[0]);
            } catch (e) {
                console.error("Failed to parse AI response:", rawText);
                parsedData = hasRubric
                    ? {
                        rubric_scores: [],
                        strengths: "",
                        improvements:
                            "AI evaluation failed to produce a result. Please try again.",
                    }
                    : {
                        suggested_rating: rating || 3,
                        feedback:
                            "AI evaluation failed to produce a result. Please try again.",
                    };
            }

            // If we asked for a rubric but the model returned the legacy shape,
            // synthesise a rubric_scores array so the frontend has something to show.
            if (
                hasRubric && !Array.isArray(parsedData.rubric_scores) &&
                typeof parsedData.suggested_rating === "number"
            ) {
                parsedData.rubric_scores = (rubric_criteria as RubricCriterion[])
                    .map((c) => ({
                        name: c.name,
                        score: parsedData.suggested_rating,
                        note: "",
                    }));
            }

            return new Response(JSON.stringify(parsedData), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        } else {
            console.error("Gemini API Error (Feedback):", data);
            return new Response(
                JSON.stringify({
                    error: data.error?.message || "Failed to generate feedback",
                }),
                {
                    status: 200, // Return 200 so frontend can parse error JSON
                    headers: {
                        ...corsHeaders,
                        "Content-Type": "application/json",
                    },
                },
            );
        }
    } catch (error) {
        const errorMessage = error instanceof Error
            ? error.message
            : "Unknown error";
        return new Response(
            JSON.stringify({ error: errorMessage }),
            {
                status: 200,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            },
        );
    }
});
