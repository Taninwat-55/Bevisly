import "jsr:@supabase/functions-js/edge-runtime.d.ts";

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
        const { raw_input, company_name } = await req.json();

        if (!raw_input) {
            throw new Error("Missing raw_input");
        }

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
            "submission_format": "github_repo" // or "file_upload" or "link"
          }
        ]
      }
    `;

        // Use the same model as generate-proof-task (which works)
        const model = "gemini-3-flash-preview";
        const TIMEOUT_MS = 115000; // 115 second timeout (generation can be slow)

        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

        let response;
        let data;

        try {
            console.log(`Calling ${model} with ${TIMEOUT_MS}ms timeout`);

            response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: {
                            temperature: 0.7,
                            maxOutputTokens: 2048,
                        },
                    }),
                    signal: controller.signal,
                },
            );

            data = await response.json();
        } catch (err: unknown) {
            clearTimeout(timeoutId);
            if (err instanceof Error && err.name === "AbortError") {
                throw new Error(
                    "AI request timed out. Please try again.",
                );
            }
            throw err;
        } finally {
            clearTimeout(timeoutId);
        }

        if (!response.ok) {
            console.error("Gemini API error:", data);
            throw new Error(data?.error?.message || "AI generation failed");
        }

        let rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

        // Cleanup: Remove markdown code blocks and backticks (just in case JSON mode fails or wraps it)
        rawText = rawText.replace(/```json/gi, "").replace(/```/g, "").replace(
            /^`|`$/g,
            "",
        );

        let parsedData;
        try {
            parsedData = JSON.parse(rawText);
        } catch (err) {
            console.error("JSON Parse Error:", err, "Raw:", rawText);
            return new Response(
                JSON.stringify({
                    error: "Failed to parse AI response",
                    raw: rawText,
                }),
                {
                    status: 200, // Return 200 so frontend handles error gracefully
                    headers: {
                        ...corsHeaders,
                        "Content-Type": "application/json",
                    },
                },
            );
        }

        return new Response(JSON.stringify(parsedData), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    } catch (error) {
        const errorMessage = error instanceof Error
            ? error.message
            : "Unknown error";
        console.error("Error:", error);
        return new Response(
            JSON.stringify({ error: errorMessage }),
            {
                status: 200,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            },
        );
    }
});
