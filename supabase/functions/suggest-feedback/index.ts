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
        const { rating, submission_content, criteria } = await req.json();

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
      Act as a constructive and encouraging Senior Mentor.
      I have reviewed a candidate's submission.
      
      Rating: ${rating}/5
      Criteria: ${criteria || "General quality"}
      Submission Content (Snippet): "${
            submission_content ? submission_content.slice(0, 500) : "N/A"
        }"
      
      Please draft a short paragraph of feedback for the candidate.
      - If rating is low, be encouraging but point out gaps using the sandwich method.
      - If rating is high, praise specific strengths.
      - Keep it professional and helpful.
      - Max 100 words.

      Draft Feedback:
    `;

        const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];
        let response;
        let data;
        let lastError;
        let feedbackText = "Excellent work!";

        for (const model of models) {
            try {
                const version = "v1beta";

                response = await fetch(
                    `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            contents: [{ parts: [{ text: prompt }] }],
                        }),
                    },
                );

                data = await response.json();

                if (response.ok) {
                    feedbackText =
                        data.candidates?.[0]?.content?.parts?.[0]?.text ||
                        "Excellent work!";
                    break;
                } else {
                    lastError = data;
                }
            } catch (err) {
                lastError = err;
            }
        }

        if (!response?.ok) {
            console.error("Gemini API Error (Feedback):", lastError);
            return new Response(
                JSON.stringify({
                    error: lastError?.error?.message ||
                        "Failed to generate feedback",
                }),
                {
                    status: 200,
                    headers: {
                        ...corsHeaders,
                        "Content-Type": "application/json",
                    },
                },
            );
        }

        return new Response(JSON.stringify({ feedback: feedbackText }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
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
