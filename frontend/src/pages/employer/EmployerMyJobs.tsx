import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Briefcase, Eye, Pencil, Plus, Users, Calendar, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getEmployerJobs, getEmployerJobSummary } from "@/lib/api";
import type { EmployerJob, EmployerJobSummary } from "@/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import EmployerJobPreviewDrawer from "./EmployerJobPreviewDrawer";

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  paused: "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  closed: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700",
  archived: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700",
};

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}


export default function EmployerMyJobs() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<EmployerJob[]>([]);
  const [summaries, setSummaries] = useState<EmployerJobSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingJobId, setViewingJobId] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const [jobsData, summariesData] = await Promise.all([
          getEmployerJobs(user.id),
          getEmployerJobSummary(user.id),
        ]);
        if (mounted) {
          setJobs(jobsData);
          setSummaries(summariesData);
        }
      } catch (err) {
        console.error("EmployerMyJobs load error:", err);
        toast.error("Failed to load your jobs.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [user?.id]);

  const submissionsByJob = useMemo(() => {
    const map = new Map<string, number>();
    summaries.forEach((s) => {
      if (s.job_id) map.set(s.job_id, s.submissions_count ?? 0);
    });
    return map;
  }, [summaries]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-[var(--color-text-muted)]">
        <Loader2 className="animate-spin" size={28} />
        <p className="text-sm">Loading your jobs…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] text-xs font-bold uppercase tracking-widest">
            <Briefcase size={14} />
            My Jobs
          </div>
          <h1 className="text-3xl md:text-4xl font-bold font-display text-[var(--color-text)]">
            My Jobs
          </h1>
          <p className="text-[var(--color-text-muted)] text-lg max-w-xl leading-relaxed">
            All roles you've posted. Edit details, review applicants, or close roles you've filled.
          </p>
        </div>
      </div>

      {/* Empty state */}
      {jobs.length === 0 ? (
        <Card className="text-center py-16 px-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-[var(--color-brand-primary)]/10 flex items-center justify-center mb-4">
            <Briefcase size={28} className="text-[var(--color-brand-primary)]" />
          </div>
          <h2 className="text-xl font-semibold text-[var(--color-text)] mb-2">
            No jobs posted yet
          </h2>
          <p className="text-sm text-[var(--color-text-muted)] max-w-md mx-auto mb-6">
            Post your first role to start receiving proof-based applications from qualified candidates.
          </p>
          <Button
            size="md"
            leftIcon={<Plus size={16} />}
            onClick={() => navigate("/employer?post=true")}
          >
            Post Your First Job
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {jobs.map((job) => {
            const applicants = submissionsByJob.get(job.id) ?? 0;
            const status = job.status?.toLowerCase() ?? "active";
            const statusClass = STATUS_STYLES[status] ?? STATUS_STYLES.active;

            return (
              <Card
                key={job.id}
                className="p-5 hover:border-[var(--color-brand-primary)]/40 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <h3 className="text-lg font-semibold text-[var(--color-text)] truncate">
                        {job.title}
                      </h3>
                      <span
                        className={`text-[10px] uppercase tracking-wide font-bold px-2 py-0.5 rounded-full border ${statusClass}`}
                      >
                        {status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-[var(--color-text-muted)] flex-wrap">
                      <span className="flex items-center gap-1.5">
                        <Users size={13} />
                        {applicants} applicant{applicants === 1 ? "" : "s"}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar size={13} />
                        Posted {formatDate(job.created_at)}
                      </span>
                      {job.location && (
                        <span className="text-[var(--color-text-muted)]">{job.location}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setViewingJobId(job.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] transition-colors"
                    >
                      <Eye size={14} />
                      View
                    </button>
                    <Link
                      to={`/employer/talent-board?jobId=${job.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg bg-[var(--color-brand-primary)] text-white hover:opacity-90 transition-opacity"
                    >
                      <Pencil size={14} />
                      Manage
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <EmployerJobPreviewDrawer jobId={viewingJobId} onClose={() => setViewingJobId(null)} />
    </div>
  );
}
