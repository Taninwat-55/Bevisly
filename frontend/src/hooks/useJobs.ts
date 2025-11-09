//. src/hooks/useJobs.ts
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export interface Job {
  id: string;
  title: string;
  company?: string | null;
  location?: string | null;
  description?: string | null;
  paid?: boolean | null;
  proof_tasks?: {
    id: string;
    title: string;
    description?: string | null;
    expected_time?: string | null;
    submission_format?: string | null;
    ai_tools_allowed?: boolean | null;
    duration_minutes?: number | null;
  }[];
}

export function useJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
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
          paid,
          description,
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
      else setJobs((data as unknown as Job[]) || []);
      setLoading(false);
    };

    fetchJobs();
  }, []);

  return { jobs, loading, error };
}