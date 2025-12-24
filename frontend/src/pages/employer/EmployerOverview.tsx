import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { getEmployerStats } from "@/lib/api/employer";
import type { EmployerStats } from "@/types";
import { supabase } from "@/lib/supabaseClient";

export default function EmployerHome() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [companyName, setCompanyName] = useState("");
  const [stats, setStats] = useState<EmployerStats>({
    jobsPosted: 0,
    activeSubmissions: 0,
    avgScore: null,
    submissions: [],
  });

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      try {
        const result = await getEmployerStats(user.id);
        setStats(result);

        const { data: profile } = await supabase
          .from("profiles")
          .select("company_name")
          .eq("id", user.id)
          .single();
        
        if (profile?.company_name) setCompanyName(profile.company_name);
      } catch (err) {
        console.error("Error fetching employer stats:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.id]);

  if (loading)
    return (
      <div className="p-8 text-center text-[var(--color-text-muted)]">
        Loading dashboard…
      </div>
    );

  const { jobsPosted, activeSubmissions, avgScore, submissions } = stats;

  return (
    <motion.div
      className="min-h-screen bg-[var(--color-bg)] px-8 py-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      {/* Header */}
      <header className="mb-10">
        <div className="bg-gradient-to-r from-[var(--color-employer)]/10 to-transparent border border-[var(--color-border)] rounded-[var(--radius-card)] p-6 mb-8">
          <h1 className="heading-md text-[var(--color-employer-dark)] mb-1">
            👋 Welcome back, {companyName || user?.email?.split("@")[0]}!
          </h1>
          <p className="body-base text-[var(--color-text-muted)]">
            Manage your hiring workflow and discover top talent.
          </p>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            You have <strong>{activeSubmissions}</strong> submissions awaiting
            review.
          </p>
        </div>
      </header>

      {/* Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <StatCard label="Jobs Posted" value={jobsPosted} />
        <StatCard label="Active Submissions" value={activeSubmissions} />
        <StatCard
          label="Avg Feedback Score"
          value={avgScore ? `${avgScore}★` : "—"}
        />
      </section>

      {/* Recent Submissions */}
      <section className="bg-[var(--color-surface)] p-6 rounded-[var(--radius-card)] border border-[var(--color-border)] shadow-[var(--shadow-soft)] mb-10">
        <h2 className="heading-md mb-3">Recent Submissions</h2>
        {submissions.length ? (
          <ul className="divide-y divide-[var(--color-border)]">
            {submissions.map((s) => (
              <li key={s.id} className="py-3 text-sm flex justify-between items-center">
                <div>
                  <span className="font-medium text-[var(--color-text)]">{s.proof_tasks?.title}</span>
                  <span className="text-[var(--color-text-muted)] ml-2">
                    ({(s.user_id ?? "Unknown").slice(0, 8)}...)
                  </span>
                </div>
                <span className="text-xs text-[var(--color-text-muted)]">
                  {new Date(s.created_at ?? "").toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[var(--color-text-muted)] text-sm">
            No new submissions yet.
          </p>
        )}
      </section>

      {/* Quick Actions */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <ActionCard
          title="Post a Job"
          desc="Create a new proof-based task and start collecting candidate submissions."
          href="/employer/jobs/new"
        />
        <ActionCard
          title="🧠 Review Submissions"
          desc="Evaluate candidate proofs and provide structured feedback."
          href="/employer/submissions"
        />
        <ActionCard
          title="🌟 Explore Talent Pool"
          desc="Browse verified candidates with strong proof records."
          href="/employer/talent"
        />
      </section>
    </motion.div>
  );
}

/* ─── Subcomponents ─────────────────────────────── */

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-[var(--color-surface)] p-4 rounded-[var(--radius-card)] border border-[var(--color-border)] shadow-[var(--shadow-soft)] text-center">
      <div className="text-2xl font-semibold text-[var(--color-employer-dark)] mb-1">
        {value}
      </div>
      <p className="text-sm text-[var(--color-text-muted)]">{label}</p>
    </div>
  );
}

function ActionCard({
  title,
  desc,
  href,
}: {
  title: string;
  desc: string;
  href: string;
}) {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-card)] shadow-[var(--shadow-soft)] p-6 hover:shadow-md transition-all">
      <h2 className="font-semibold mb-2 text-[var(--color-text)]">{title}</h2>
      <p className="text-sm text-[var(--color-text-muted)] mb-4">{desc}</p>
      <Link
        to={href}
        className="text-[var(--color-employer-dark)] font-medium hover:underline"
      >
        Go →
      </Link>
    </div>
  );
}
