import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Briefcase, Building2 } from "lucide-react";
import type { CandidateJob } from "@/types";
import { getAllJobs } from "@/lib/api/jobs";
import { getErrorMessage } from "@/lib/error";

function JobPreviewCard({ job }: { job: CandidateJob }) {
  return (
    <Link
      to={`/jobs/${job.id}`}
      className="block rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 hover:shadow-md hover:-translate-y-0.5 transition-all"
    >
      {/* 🏢 Company */}
      <div className="text-xs text-[var(--color-text-muted)] flex items-center gap-1 mb-1">
        <Briefcase size={14} /> {job.company ?? "Company"}
      </div>

      {/* 💼 Job title */}
      <h3 className="font-semibold text-[var(--color-text)] mb-1 line-clamp-1">
        {job.title}
      </h3>

      {/* 📍 Meta info */}
      <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
        {job.location && (
          <span className="flex items-center gap-1">
            <MapPin size={12} /> {job.location}
          </span>
        )}
        <span
          className={`rounded-md border border-[var(--color-border)] px-2 py-0.5 ${
            job.paid
              ? "bg-[var(--color-success)]/10 text-[var(--color-success)]"
              : "bg-[var(--color-candidate)]/10 text-[var(--color-candidate)]"
          }`}
        >
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
      .then((data) => setJobs(data ?? []))
      .catch((e) => setErr(getErrorMessage(e)));
  }, []);

  return (
    <section
      id="jobs"
      className="bg-[var(--color-bg)] py-20 border-t border-[var(--color-border)]"
    >
      <div className="mx-auto max-w-7xl px-6">
        <header className="mb-10 text-center md:text-left">
          <h2 className="heading-lg">Explore Proof-Based Roles</h2>
          <p className="body-base text-[var(--color-text-muted)] mt-1">
            Real company tasks you can complete to prove your skills — earn XP or paid opportunities.
          </p>
        </header>

        {err && <p className="body-base text-[var(--color-error)]">{err}</p>}

        {/* 🕳 Empty state */}
        {!err && (!jobs || jobs.length === 0) && (
          <div className="text-center py-16 text-[var(--color-text-muted)]">
            <Building2
              size={36}
              className="mx-auto mb-3 text-[var(--color-border)]"
            />
            <p>No proof-based roles available yet.</p>
            <p className="mt-1 text-sm">
              We’re onboarding early companies — join now to be first in line.
            </p>
            <Link
              to="/auth?role=employer"
              className="inline-block mt-4 text-sm text-[var(--color-employer)] hover:underline"
            >
              Are you an employer? Post a role →
            </Link>
          </div>
        )}

        {/* 🧩 Job cards */}
        {!err && jobs && jobs.length > 0 && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {jobs.slice(0, 6).map((job) => (
              <JobPreviewCard key={job.id} job={job} />
            ))}
          </div>
        )}

        {/* 🔗 Footer link */}
        {jobs && jobs.length > 0 && (
          <div className="mt-10 text-center">
            <Link
              to="/jobs"
              className="text-sm font-medium text-[var(--color-employer)] hover:underline"
            >
              Browse all open roles →
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}