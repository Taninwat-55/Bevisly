import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type, x-client-timeout",
};

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const { rating, submission_content, criteria, task_description, reflection } = await req.json();

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

        const prompt = `
You are an expert Technical Evaluator and Senior Mentor reviewing a candidate's proof task submission.

## Task
Title: ${criteria || "General"}
${task_description ? `Description: ${task_description.slice(0, 1000)}` : ""}

## Candidate's Submission
${submission_content ? submission_content.slice(0, 3000) : "N/A"}

${reflection ? `## Candidate's Reflection\n${reflection.slice(0, 1000)}` : ""}

## Your Job
Evaluate whether the submission fulfills the task requirements. Consider:
- Does the work match what was asked for in the task description?
- Quality, depth, and correctness of the submission
- The candidate's self-awareness shown in their reflection (if provided)

Provide:
1. A suggested rating from 1 to 5 (5 = exceptional, 1 = very poor)
2. Strengths: 1–3 specific things the candidate did well (max 60 words)
3. Areas for Improvement: 1–3 specific, constructive suggestions (max 60 words)

Return ONLY a valid JSON object:
{
  "suggested_rating": 4,
  "strengths": "What the candidate did well...",
  "improvements": "What could be improved..."
}
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
            const parts: { thought?: boolean; text?: string }[] = data.candidates?.[0]?.content?.parts || [];
            const responsePart = parts.find((p) => !p.thought && p.text) ?? parts[0];
            const rawText = responsePart?.text || "";

            console.log("Gemini raw response:", rawText.slice(0, 200));

            const jsonMatch = rawText.match(/\{[\s\S]*\}/);

            let parsedData;
            try {
                if (!jsonMatch) throw new Error("No JSON object found in response");
                parsedData = JSON.parse(jsonMatch[0]);
            } catch (e) {
                console.error("Failed to parse AI response:", rawText);
                parsedData = { suggested_rating: rating || 3, feedback: "AI evaluation failed to produce a result. Please try again." };
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
