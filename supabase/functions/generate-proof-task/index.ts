import "jsr:@supabase/functions-js@^2/edge-runtime.d.ts";

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
        const { job_title, job_description } = await req.json();

        if (!job_title || !job_description) {
            throw new Error("Missing job_title or job_description");
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
      Act as an expert Technical Hiring Manager. 
      Based on the following Job Description, generate a practical "Proof Task" that a candidate can do to prove their skills.
      The task should be realistic, take about 45-60 minutes, and test the core skills required.

      Job Title: ${job_title}
      Job Description: ${job_description.slice(0, 3000)}

      Return ONLY a JSON object with this exact structure (no markdown formatting):
      {
        "title": "Creative Title for the Task",
        "description": "Detailed step-by-step instructions...",
        "acceptance_criteria": "- Criterion 1\n- Criterion 2",
        "estimated_duration": "45 mins"
      }
    `;

        // Use a single fast model with timeout to prevent hung requests
        const model = "gemini-2.5-flash";
        const TIMEOUT_MS = 60000; // 60 second timeout

        type GeminiResponse = {
            candidates?: {
                content?: {
                    parts?: { text?: string }[];
                };
            }[];
        };
        let data: GeminiResponse | null = null;
        let lastError: string | null = null;
        const MAX_RETRIES = 3;

        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

            try {
                console.log(`Calling ${model} with ${TIMEOUT_MS}ms timeout (Attempt ${attempt})`);

                const response = await fetch(
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
                                maxOutputTokens: 1024,
                                responseMimeType: "application/json",
                            },
                        }),
                        signal: controller.signal,
                    },
                );

                const responseData = await response.json();
                clearTimeout(timeoutId);

                if (!response.ok) {
                    console.error(`Gemini API error (Attempt ${attempt}):`, responseData);
                    const isOverloaded = response.status === 503 || response.status === 429;
                    if (isOverloaded && attempt < MAX_RETRIES) {
                        console.log(`Retrying in ${attempt * 2} seconds...`);
                        await new Promise((resolve) => setTimeout(resolve, attempt * 2000));
                        continue; // Retry
                    }
                    throw new Error(responseData?.error?.message || "AI generation failed");
                }
                
                data = responseData;
                break; // Success! Break out of the loop
            } catch (err: unknown) {
                clearTimeout(timeoutId);
                const isAbort = err instanceof Error && err.name === "AbortError";
                lastError = err instanceof Error ? err.message : "Network error";
                
                if (!isAbort && attempt < MAX_RETRIES) {
                    console.log(`Network error (Attempt ${attempt}). Retrying...`);
                    await new Promise((resolve) => setTimeout(resolve, attempt * 2000));
                    continue; // Retry
                }
                if (isAbort) {
                    throw new Error("AI request timed out after 60 seconds. Please try again.");
                }
                throw err;
            }
        }

        if (!data) {
            throw new Error(lastError || "AI generation failed after multiple attempts");
        }

        let rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

        // Cleanup: Remove markdown code blocks and backticks
        // Sometimes models wrap JSON in ```json ... ``` or just ` ... `
        rawText = rawText.replace(/```json/gi, "").replace(/```/g, "").replace(
            /^`|`$/g,
            "",
        );

        // Find the first '{' and last '}' to extract just the JSON object
        const firstOpen = rawText.indexOf("{");
        const lastClose = rawText.lastIndexOf("}");

        if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
            rawText = rawText.substring(firstOpen, lastClose + 1);
        }

        let parsedTask;
        try {
            parsedTask = JSON.parse(rawText);
        } catch (err) {
            console.error("JSON Parse Error:", err, "Raw:", rawText);
            return new Response(
                JSON.stringify({
                    error: "Failed to parse AI response",
                    raw: rawText,
                }),
                {
                    status: 200,
                    headers: {
                        ...corsHeaders,
                        "Content-Type": "application/json",
                    },
                }, // Return 200 so frontend sees error
            );
        }

        if (!parsedTask.title || !parsedTask.description) {
            console.error("Missing keys in AI response:", parsedTask);
            return new Response(
                JSON.stringify({
                    error: "AI response missing required fields",
                    raw: JSON.stringify(parsedTask),
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

        return new Response(JSON.stringify(parsedTask), {
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
