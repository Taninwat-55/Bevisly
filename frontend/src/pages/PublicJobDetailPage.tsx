import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getJobWithTasks, getAllJobs } from "@/lib/api/jobs";
import { getErrorMessage } from "@/lib/error";
import type { ProofTask, CandidateJob } from "@/types";
import { Briefcase, MapPin, Clock } from "lucide-react";
import BackButton from "@/components/ui/BackButton";

type JobDetail = {
  id: string;
  title: string;
  description: string | null;
  company: string | null;
  location: string | null;
  paid: boolean | null;
  created_at: string | null;
  proof_tasks: ProofTask[];
};

function JobPreviewCard({ job }: { job: CandidateJob }) {
  return (
    <Link
      to={`/jobs/${job.id}`}
      className="block rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 hover:shadow-md hover:-translate-y-0.5 transition-all"
    >
      <div className="text-xs text-[var(--color-text-muted)] flex items-center gap-1 mb-1">
        <Briefcase size={14} /> {job.company ?? "Company"}
      </div>
      <h3 className="font-semibold text-[var(--color-text)] mb-1 line-clamp-1">
        {job.title}
      </h3>
      <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
        {job.location && (
          <span className="flex items-center gap-1">
            <MapPin size={12} /> {job.location}
          </span>
        )}
        <span className="rounded-md border border-[var(--color-border)] px-2 py-0.5">
          {job.paid ? "Paid" : "XP"}
        </span>
      </div>
    </Link>
  );
}

export default function PublicJobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [related, setRelated] = useState<CandidateJob[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([getJobWithTasks(id), getAllJobs()])
      .then(([jobData, allJobs]) => {
        setJob(jobData);
        // Filter out the current job and limit to 3 related ones
        const relatedJobs = (allJobs ?? [])
          .filter((j) => j.id !== id)
          .slice(0, 3);
        setRelated(relatedJobs);
      })
      .catch((e) => setErr(getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen text-[var(--color-text-muted)]">
        Loading job details...
      </div>
    );

  if (err)
    return (
      <div className="flex items-center justify-center min-h-screen text-[var(--color-error)]">
        {err}
      </div>
    );

  if (!job)
    return (
      <div className="flex items-center justify-center min-h-screen text-[var(--color-text-muted)]">
        Job not found.
      </div>
    );

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="mx-auto max-w-4xl px-6 py-16">
        {/* Back navigation */}
        <div className="mb-8">
          <BackButton to="/jobs" />
        </div>

        {/* Header */}
        <header className="border-b border-[var(--color-border)] pb-6 mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{job.title}</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--color-text-muted)]">
            {job.company && (
              <span className="flex items-center gap-1">
                <Briefcase size={14} /> {job.company}
              </span>
            )}
            {job.location && (
              <span className="flex items-center gap-1">
                <MapPin size={14} /> {job.location}
              </span>
            )}
            <span className="rounded-md border border-[var(--color-border)] px-2 py-0.5 text-xs">
              {job.paid ? "Paid" : "XP"}
            </span>
          </div>
        </header>

        {/* Description */}
        {job.description && (
          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-2">About the Role</h2>
            <p className="text-[var(--color-text-muted)] leading-relaxed whitespace-pre-line">
              {job.description}
            </p>
          </section>
        )}

        {/* Proof Tasks */}
        {job.proof_tasks && job.proof_tasks.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4">Proof Task</h2>
            <div className="space-y-4">
              {job.proof_tasks.map((task) => (
                <div
                  key={task.id}
                  className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
                >
                  <h3 className="font-semibold text-[var(--color-text)]">
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className="mt-2 text-sm text-[var(--color-text-muted)] leading-relaxed">
                      {task.description}
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[var(--color-text-muted)]">
                    {task.expected_time && (
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> {task.expected_time}
                      </span>
                    )}
                    {task.ai_tools_allowed && (
                      <span className="rounded-md border border-[var(--color-border)] px-2 py-0.5">
                        AI tools allowed
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="text-center mt-16">
          <p className="text-[var(--color-text-muted)] mb-4">
            Ready to take this challenge?
          </p>
          <Link
            to={`/auth?redirect=/candidate/proof/${job.id}`}
            className="inline-block rounded-[var(--radius-button)] bg-[var(--color-candidate)] text-white px-6 py-3 font-medium hover:brightness-110 transition shadow-[var(--shadow-soft)]"
          >
            Log in to Apply
          </Link>
        </section>
      </div>

      {/* Related Jobs */}
      {related.length > 0 && (
        <section className="border-t border-[var(--color-border)] bg-[var(--color-surface)] mt-20 py-14">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="text-xl font-semibold mb-6 text-center">
              More opportunities you might like
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <JobPreviewCard key={r.id} job={r} />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
