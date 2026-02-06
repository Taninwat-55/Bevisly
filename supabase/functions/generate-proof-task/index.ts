import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
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

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                }),
            },
        );

        const data = await response.json();

        if (!response.ok) {
            console.error("Gemini API Error:", data);
            throw new Error(
                data.error?.message || "Failed to generate content",
            );
        }

        let rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

        // Clean up markdown code blocks if Gemini adds them
        rawText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();

        const parsedTask = JSON.parse(rawText);

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
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            },
        );
    }
});
