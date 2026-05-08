const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
import { supabase } from "../supabaseClient";
import type { RubricCriterion, RubricScore } from "@/types";

export interface GeneratedJobListing {
    title: string;
    description: string;
    requirements: string; // Edge function returns markdown bullet points.
    proof_tasks: {
        title: string;
        description: string;
        expected_time: string;
        submission_format: string;
        rubric_criteria?: RubricCriterion[];
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

export interface SuggestFeedbackResult {
    strengths?: string;
    improvements?: string;
    suggested_rating?: number; // legacy fallback when no rubric is set
    rubric_scores?: RubricScore[];
}

export async function suggestFeedback(
    rating: number,
    criteria: string,
    submissionContent: string,
    taskDescription?: string | null,
    reflection?: string | null,
    rubricCriteria?: RubricCriterion[] | null,
): Promise<SuggestFeedbackResult> {
    const { data, error } = await supabase.functions.invoke(
        "suggest-feedback",
        {
            body: {
                rating,
                criteria,
                submission_content: submissionContent,
                task_description: taskDescription ?? null,
                reflection: reflection ?? null,
                rubric_criteria: rubricCriteria ?? null,
            },
        },
    );

    if (error) {
        throw error; // Throws FunctionsHttpError if not 2xx
    }
    if (data?.error) {
        throw new Error(data.error);
    }

    return {
        strengths: data.strengths,
        improvements: data.improvements,
        suggested_rating: data.suggested_rating,
        rubric_scores: Array.isArray(data.rubric_scores)
            ? data.rubric_scores
            : undefined,
    };
}
