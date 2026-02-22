const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
import { supabase } from "../supabaseClient";

export interface GeneratedJobListing {
    title: string;
    description: string;
    requirements: string; // Edge function returns markdown bullet points.
    proof_tasks: {
        title: string;
        description: string;
        expected_time: string;
        submission_format: string;
    }[];
}

export async function generateJobListing(
    rawInput: string,
    companyName: string,
): Promise<GeneratedJobListing> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
        controller.abort();
    }, 120000); // 120s timeout (AI generation can be slow on first call)

    try {
        const response = await fetch(
            `${SUPABASE_URL}/functions/v1/generate-job-listing`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
                },
                body: JSON.stringify({
                    raw_input: rawInput,
                    company_name: companyName,
                }),
                signal: controller.signal,
            },
        );
        clearTimeout(timeoutId);

        let data;
        const textResponse = await response.text();

        try {
            data = JSON.parse(textResponse);
        } catch (e) {
            console.error("Failed to parse JSON from Edge Function:", e);
            throw new Error(
                `Invalid server response: ${textResponse.substring(0, 100)}`,
            );
        }

        if (data && data.error) {
            throw new Error(data.error);
        }

        return data;
    } catch (err) {
        clearTimeout(timeoutId);
        console.error("AI Generation Error:", err);
        throw err;
    }
}

export async function suggestFeedback(
    rating: number,
    criteria: string,
    submissionContent: string,
): Promise<string> {
    const { data, error } = await supabase.functions.invoke(
        "suggest-feedback",
        {
            body: {
                rating,
                criteria,
                submission_content: submissionContent,
            },
        },
    );

    if (error) {
        throw error; // Throws FunctionsHttpError if not 2xx
    }
    if (data?.error) {
        throw new Error(data.error);
    }

    return data.feedback;
}
