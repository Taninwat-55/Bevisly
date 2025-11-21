import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getEmployerSubmissionsWithFeedback } from "@/lib/api/submissions";
import { getEmployerJobs } from "@/lib/api/jobs";
import type { EmployerSubmission } from "@/types";
import toast from "react-hot-toast";
import { Loader2, Users, Briefcase } from "lucide-react";
import TalentBoard from "@/components/talent/TalentBoard";

export default function EmployerTalentManager() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<EmployerSubmission[]>([]);
  const [jobs, setJobs] = useState<{ id: string; title: string }[]>([]);
  const [selectedJob, setSelectedJob] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        // Load submissions and jobs in parallel
        const [subsData, jobsData] = await Promise.all([
          getEmployerSubmissionsWithFeedback(user.id),
          getEmployerJobs(user.id),
        ]);
        
        if (mounted) {
          setSubmissions(subsData);
          setJobs(jobsData);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load candidates");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [user?.id]);

  // Filter logic
  const filteredSubs = useMemo(() => {
    if (selectedJob === "all") return submissions;
    return submissions.filter((s) => s.job_id === selectedJob);
  }, [submissions, selectedJob]);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin text-[var(--color-text-muted)]" />
      </div>
    );

  return (
    <div className="min-h-screen bg-[var(--color-bg)] px-8 py-10 relative">
      <header className="flex items-center justify-between mb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="heading-lg text-[var(--color-employer-dark)] flex items-center gap-2">
              <Users size={20} /> Talent Manager
            </h1>
          </div>
          <p className="text-[var(--color-text-muted)] text-sm">
            Manage candidates across your hiring stages.
          </p>
        </div>

        {/* Job Filter */}
        <div className="flex items-center gap-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-button)] px-3 py-1.5 shadow-sm">
          <Briefcase size={14} className="text-[var(--color-text-muted)]" />
          <select
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
            className="text-sm bg-transparent text-[var(--color-text)] outline-none max-w-[200px]"
          >
            <option value="all">All Jobs</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title}
              </option>
            ))}
          </select>
        </div>
      </header>

      <TalentBoard submissions={filteredSubs} setSubmissions={setSubmissions} />
    </div>
  );
}