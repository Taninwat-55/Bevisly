import { useEffect, useState } from "react";
import type { CandidateJob } from "@/types";
import { getAllJobs } from "@/lib/api/jobs"; 

export function useJobs() {
  const [jobs, setJobs] = useState<CandidateJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        // Use the centralized API function that fetches apply_url
        const data = await getAllJobs();
        setJobs(data || []);
      } catch (err: any) {
        setError(err.message || "Failed to fetch jobs");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  return { jobs, loading, error };
}