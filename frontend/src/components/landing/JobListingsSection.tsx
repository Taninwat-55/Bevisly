// src/components/landing/JobListingsSection.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Briefcase } from "lucide-react";
import type { CandidateJob } from "@/types";
import { getAllJobs } from "@/lib/api/jobs";
import { getErrorMessage } from "@/lib/error";

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

export default function JobListingsSection() {
  const [jobs, setJobs] = useState<CandidateJob[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    getAllJobs()
      .then((data) => {
        console.log("Fetched jobs:", data);
        setJobs(data ?? []);
      })
      .catch((e) => {
        console.error("Error fetching jobs:", e);
        setErr(getErrorMessage(e));
      });
  }, []);

  return (
    <section
      id="jobs"
      className="bg-[var(--color-bg)] py-20 border-t border-[var(--color-border)]"
    >
      <div className="mx-auto max-w-7xl px-6">
        <header className="mb-10 flex items-baseline justify-between">
          <h2 className="heading-lg">Open roles</h2>
          <Link
            to="/jobs"
            className="text-sm text-[var(--color-employer)] hover:underline"
          >
            Browse all →
          </Link>
        </header>

        {err && <p className="body-base text-[var(--color-error)]">{err}</p>}

        {!err && (!jobs || jobs.length === 0) && (
          <p className="body-base text-[var(--color-text-muted)]">
            No jobs yet — check back soon.
          </p>
        )}

        {!err && jobs && jobs.length > 0 && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {jobs.slice(0, 6).map((job) => (
              <JobPreviewCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
