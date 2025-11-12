import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import type { CandidateJob } from "@/types";

export function useJobs() {
  const [jobs, setJobs] = useState<CandidateJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select(`
          id,
          title,
          company,
          location,
          description,
          paid,
          show_salary_range,
          salary_min,
          salary_max,
          pay_period,
          payment_currency,
          proof_tasks (
            id,
            title,
            description,
            expected_time,
            submission_format,
            ai_tools_allowed,
            duration_minutes
          )
        `)
        .order("created_at", { ascending: false });

      if (error) setError(error.message);
      else setJobs((data as unknown as CandidateJob[]) || []);
      setLoading(false);
    };

    fetchJobs();
  }, []);

  return { jobs, loading, error };
}