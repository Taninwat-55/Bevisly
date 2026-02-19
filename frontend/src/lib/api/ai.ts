const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export interface GeneratedJobListing {
    description: string;
    requirements: string[]; // or string, depending on how I handle it. The edge function returns string (markdown bullet points).
    proof_tasks: {
        title: string;
        description: string;
        expected_time: string;
        submission_format: string;
    }[];
}

export async function generateJobListing(
    title: string,
    skills: string,
    companyName: string,
): Promise<GeneratedJobListing> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
        controller.abort();
    }, 65000); // 65s timeout (AI generation can be slow on first call)

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
                    job_title: title,
                    skills: skills,
                    company_name: companyName,
                }),
                signal: controller.signal,
            },
        );
        clearTimeout(timeoutId);

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        return data;
    } catch (err) {
        clearTimeout(timeoutId);
        console.error("AI Generation Error:", err);
        throw err;
    }
}
