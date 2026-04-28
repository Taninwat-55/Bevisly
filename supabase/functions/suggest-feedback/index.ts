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
      Act as an expert Technical Evaluator and Senior Mentor.
      I need you to review a candidate's submission.
      
      Criteria: ${criteria || "General quality"}
      Submission Content (Snippet): "${
            submission_content ? submission_content.slice(0, 3000) : "N/A"
        }"
      
      Please evaluate the submission and provide:
      1. A suggested rating from 1 to 5 (5 being exceptional, 1 being very poor).
      2. A short paragraph of feedback for the candidate. 
         - Point out specific strengths or mistakes based on the content.
         - Keep it constructive, professional, and helpful.
         - Max 100 words.

      Return ONLY a valid JSON object with this exact structure:
      {
        "suggested_rating": 4,
        "feedback": "Your feedback text here..."
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
                    },
                }),
                signal: controller.signal,
            },
        );

        clearTimeout(timeoutId);
        const data = await response.json();

        if (response.ok) {
            let rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
            
            // Clean up backticks if model ignored json mime type somehow
            rawText = rawText.replace(/```json/gi, "").replace(/```/g, "").replace(/^`|`$/g, "");
            
            let parsedData;
            try {
                parsedData = JSON.parse(rawText);
            } catch (e) {
                console.error("Failed to parse JSON:", rawText);
                parsedData = { suggested_rating: rating || 3, feedback: "Evaluation completed, but formatting failed. Please review manually." };
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
