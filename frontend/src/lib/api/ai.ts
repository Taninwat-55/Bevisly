const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
import { supabase } from "../supabaseClient";
import type { RubricCriterion, RubricScore } from "@/types";

export interface GeneratedJobListing {
    title: string;
    description: string;
    requirements: string;
    job_type?: string;
    work_mode?: string;
    location?: string;
    proof_tasks: {
        title: string;
        description: string;
        expected_time: string;
        submission_format: string;
        rubric_criteria?: RubricCriterion[];
        follow_up_questions?: string[];
    }[];
}

export async function generateJobListing(
    rawInput: string,
    companyName: string,
    companyContext?: {
        description?: string | null;
        mission?: string | null;
        culture?: string | null;
    },
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
                    company_description: companyContext?.description ?? null,
                    company_mission: companyContext?.mission ?? null,
                    company_culture: companyContext?.culture ?? null,
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
    interview_questions?: string[];
}

export async function suggestFeedback(
    rating: number,
    criteria: string,
    submissionContent: string,
    taskDescription?: string | null,
    reflection?: string | null,
    rubricCriteria?: RubricCriterion[] | null,
    reasoningTrace?: { tradeoff: string; considered: string; uncertainty: string } | null,
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
                reasoning_trace: reasoningTrace ?? null,
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
        interview_questions: Array.isArray(data.interview_questions)
            ? data.interview_questions
            : undefined,
    };
}

// ── Career Compass ────────────────────────────────────────────────────────────

export interface CareerDirectionItem {
    role: string;
    fit_score: number;
    reasoning: string;
    key_strengths: string[];
}

export interface ProofReadinessItem {
    role: string;
    readiness_score: number;
    explanation: string;
    what_would_improve_it: string;
}

export interface SkillsGapItem {
    skill: string;
    gap_level: "minor" | "moderate" | "significant";
    evidence: string;
    suggestion: string;
}

export interface CareerCompassResult {
    career_direction: CareerDirectionItem[];
    proof_readiness: ProofReadinessItem[];
    skills_gap: SkillsGapItem[];
    overall_summary: string;
}

export async function runCareerCompass(
    sessionId: string,
    userId: string,
): Promise<CareerCompassResult> {
    const { data, error } = await supabase.functions.invoke("career-compass", {
        body: { session_id: sessionId, user_id: userId },
    });

    if (error) throw error;
    if (data?.error) throw new Error(data.error);

    return data.result as CareerCompassResult;
}

export async function draftFeedbackLetter(params: {
    candidateName: string;
    jobTitle: string;
    companyName: string;
    taskTitle: string;
    taskDescription?: string | null;
    submissionContent?: string | null;
    reflection?: string | null;
    rubricCriteria?: RubricCriterion[] | null;
    rubricScores?: RubricScore[] | null;
    suggestedRating?: number | null;
    strengths?: string | null;
    improvements?: string | null;
}): Promise<string | null> {
    const { data, error } = await supabase.functions.invoke(
        "draft-feedback-letter",
        {
            body: {
                candidate_name: params.candidateName,
                job_title: params.jobTitle,
                company_name: params.companyName,
                task_title: params.taskTitle,
                task_description: params.taskDescription ?? null,
                submission_content: params.submissionContent ?? null,
                reflection: params.reflection ?? null,
                rubric_criteria: params.rubricCriteria ?? null,
                rubric_scores: params.rubricScores ?? null,
                suggested_rating: params.suggestedRating ?? null,
                strengths: params.strengths ?? null,
                improvements: params.improvements ?? null,
            },
        },
    );
    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    if (!data?.letter) throw new Error("No letter returned from AI.");
    return data.letter as string;
}
