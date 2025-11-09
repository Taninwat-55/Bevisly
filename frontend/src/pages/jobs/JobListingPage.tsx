import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useJobs } from "@/hooks/useJobs";
import {
  Loader2,
  Briefcase,
  Clock,
  Search,
  XCircle,
  LogIn,
} from "lucide-react";
import type { SessionUser } from "@/context/AuthContext";

export default function JobListingPage() {
  const { user } = useAuth();
  const role: SessionUser["role"] = user?.role ?? null;
  const { jobs, loading, error } = useJobs();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({
    paid: false,
    xp: false,
    aiAllowed: false,
    short: false,
  });

  /* 🕓 Debounce Search */
  const [debouncedQuery, setDebouncedQuery] = useState("");
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(handler);
  }, [query]);

  /* 🔁 If employer logs in, redirect to their job management */
  useEffect(() => {
    if (role === "employer") navigate("/employer/jobs");
  }, [role, navigate]);

  const toggleFilter = (key: keyof typeof filters) => {
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const clearFilters = () => {
    setFilters({ paid: false, xp: false, aiAllowed: false, short: false });
    setQuery("");
    setDebouncedQuery("");
  };

  /* 🎯 Filter + Search Logic */
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const proof = job.proof_tasks?.[0];
      const textMatch =
        job.title.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        job.company?.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        proof?.title?.toLowerCase().includes(debouncedQuery.toLowerCase());

      const paidMatch = filters.paid ? job.paid === true : true;
      const xpMatch = filters.xp ? job.paid === false : true;
      const aiMatch = filters.aiAllowed
        ? proof?.ai_tools_allowed === true
        : true;
      const shortMatch = filters.short
        ? proof?.expected_time?.toLowerCase().includes("30") ||
          (proof?.duration_minutes && proof.duration_minutes <= 30)
        : true;

      return textMatch && paidMatch && xpMatch && aiMatch && shortMatch;
    });
  }, [jobs, debouncedQuery, filters]);

  const hasActiveFilters =
    query.length > 0 || Object.values(filters).some((v) => v === true);

  /* 🧭 States */
  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen text-[var(--color-text-muted)]">
        <Loader2 className="animate-spin mr-2" size={18} /> Loading
        opportunities…
      </div>
    );

  if (error)
    return (
      <div className="p-10 text-center text-[var(--color-error)]">
        ⚠️ {error}
      </div>
    );

  if (!jobs.length)
    return (
      <div className="p-10 text-center text-[var(--color-text-muted)]">
        No proof opportunities available yet — check back soon!
      </div>
    );

  return (
    <div className="min-h-screen bg-[var(--color-bg)] px-8 py-10">
      {/* 🏁 Page Header */}
      <header className="mb-8 text-center">
        <h1 className="heading-lg mb-2">🔍 Browse Proof Opportunities</h1>
        <p className="body-base text-[var(--color-text-muted)] max-w-2xl mx-auto">
          {user
            ? "Find open proof tasks and start building your verified record."
            : "Browse proof-based roles. Sign in to apply or start a proof task."}
        </p>
      </header>

      {/* 🧭 Discovery Panel */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-card)] shadow-[var(--shadow-soft)] p-4 mb-8">
        {/* 🔍 Search Bar */}
        <div className="relative mb-3">
          <Search
            size={16}
            className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
              query
                ? "text-[var(--color-candidate)]"
                : "text-[var(--color-text-muted)]"
            }`}
          />
          <input
            type="text"
            placeholder="Search by job, company, or proof task…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-[var(--radius-button)]
                       border border-[var(--color-border)] bg-[var(--color-bg)]
                       focus:outline-none focus:ring-1 focus:ring-[var(--color-candidate)]"
          />
        </div>

        {/* 🎯 Filter Chips + Reset */}
        <div className="flex flex-wrap items-center gap-2 justify-between">
          <div className="flex flex-wrap gap-2">
            <FilterChip
              active={filters.paid}
              onClick={() => toggleFilter("paid")}
              label="💰 Paid Only"
            />
            <FilterChip
              active={filters.xp}
              onClick={() => toggleFilter("xp")}
              label="⭐ XP Only"
            />
            <FilterChip
              active={filters.short}
              onClick={() => toggleFilter("short")}
              label="⏱ Under 30m"
            />
            <FilterChip
              active={filters.aiAllowed}
              onClick={() => toggleFilter("aiAllowed")}
              label="🤖 AI Allowed"
            />
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-error)] transition"
            >
              <XCircle size={14} /> Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* 💼 Job Cards Grid */}
      {filteredJobs.length === 0 ? (
        <p className="text-center text-[var(--color-text-muted)]">
          No matches found for “{debouncedQuery}”.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredJobs.map((job) => {
            const proof = job.proof_tasks?.[0];

            const handleCTA = () => {
              if (!user) navigate("/auth");
              else navigate(`/candidate/job/${job.id}`);
            };

            return (
              <div
                key={job.id}
                className="group bg-[var(--color-surface)] border border-[var(--color-border)]
                           rounded-[var(--radius-card)] shadow-[var(--shadow-soft)]
                           p-6 transition-all hover:shadow-[var(--shadow-hover)] hover:-translate-y-[2px]"
              >
                {/* 🏷 Header */}
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-[var(--color-text)] leading-tight">
                    {job.title}
                  </h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      job.paid
                        ? "bg-[var(--color-success)]/10 text-[var(--color-success)]"
                        : "bg-[var(--color-candidate-light)]/10 text-[var(--color-candidate-dark)]"
                    }`}
                  >
                    {job.paid ? "Paid" : "XP only"}
                  </span>
                </div>

                {/* 🏢 Meta */}
                <p className="text-sm text-[var(--color-text-muted)] mb-3">
                  <Briefcase size={14} className="inline mr-1 opacity-80" />
                  {job.company || "Unknown"}{" "}
                  {job.location && `• ${job.location}`}
                </p>

                {/* 🧩 Proof Task Preview */}
                {proof && (
                  <div className="mb-3 text-sm text-[var(--color-text-muted)]">
                    <p className="font-medium text-[var(--color-text)] mb-1">
                      {proof.title}
                    </p>
                    <p className="line-clamp-2">
                      {proof.description ||
                        "A proof task is available for this role."}
                    </p>
                  </div>
                )}

                {/* ⏱ Expected Time */}
                {proof?.expected_time && (
                  <div className="flex items-center gap-1 text-xs text-[var(--color-text-muted)] mb-4">
                    <Clock size={13} className="opacity-80" /> Expected:{" "}
                    {proof.expected_time}
                  </div>
                )}

                {/* 🔗 CTA Button (Dynamic) */}
                <button
                  onClick={handleCTA}
                  className={`w-full py-2.5 rounded-[var(--radius-button)] font-medium transition ${
                    !user
                      ? "bg-[var(--color-bg-hover)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-candidate-dark)]"
                      : "bg-[var(--color-candidate)] text-white hover:bg-[var(--color-candidate-dark)]"
                  }`}
                >
                  {!user ? (
                    <span className="inline-flex items-center gap-1 justify-center">
                      <LogIn size={14} /> Sign in to Apply
                    </span>
                  ) : (
                    "View Details →"
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── Subcomponent: Filter Chip ───────────────────────────── */

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-sm rounded-full border transition-all duration-150 ${
        active
          ? "bg-[var(--color-candidate)] text-white border-[var(--color-candidate)]"
          : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-candidate-light)] hover:text-[var(--color-candidate-dark)]"
      }`}
    >
      {label}
    </button>
  );
}
