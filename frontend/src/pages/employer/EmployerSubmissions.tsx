/**
 * Employer dashboard for reviewing candidate submissions.
 * Includes dropdown filter, sorting, and feedback modal.
 */

import { useEffect, useState, useMemo, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getEmployerSubmissionsWithFeedback } from "@/lib/api/submissions";
import type { EmployerSubmission } from "@/types";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  Loader2,
  Filter,
  ArrowUpDown,
  Eye,
  ClipboardList,
  CheckCircle2,
  Clock,
  Star,
  X,
} from "lucide-react";

export default function EmployerSubmissions() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState<EmployerSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  const [filter, setFilter] = useState<"all" | "pending" | "reviewed">("all");
  const [sortNewest, setSortNewest] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [selectedFeedback, setSelectedFeedback] = useState<{
    strengths?: string | null;
    improvements?: string | null;
    stars?: number | null;
    created_at?: string | null;
  } | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  /* ─── Fetch Data ─────────────────────────────── */
  useEffect(() => {
    if (!user?.id) return;
    async function load() {
      try {
        const data = await getEmployerSubmissionsWithFeedback(user!.id);
        setSubmissions(data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load submissions");
      } finally {
        setLoading(false);
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  /* ─── Close dropdown on outside click ─────────────────────────────── */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ─── Derived Data ─────────────────────────────── */
  const filtered = useMemo(() => {
    const list =
      filter === "all"
        ? submissions
        : submissions.filter((s) => s.status === filter);
    return [...list].sort((a, b) =>
      sortNewest
        ? new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime()
        : new Date(a.created_at!).getTime() - new Date(b.created_at!).getTime()
    );
  }, [submissions, filter, sortNewest]);

  const stats = useMemo(() => {
    const total = submissions.length;
    const reviewed = submissions.filter((s) => s.status === "reviewed").length;
    const pending = total - reviewed;
    return { total, reviewed, pending };
  }, [submissions]);

  /* ─── Loading State ─────────────────────────────── */
  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen text-[var(--color-text-muted)]">
        <Loader2 className="animate-spin mr-2" /> Loading submissions...
      </div>
    );

  /* ─── Main Layout ─────────────────────────────── */
  return (
    <div className="min-h-screen bg-[var(--color-bg)] px-8 py-10 relative">
      {/* Header */}
      <header className="mb-8">
        <h1 className="heading-lg text-[var(--color-employer-dark)]">
          Candidate Submissions
        </h1>
        <p className="text-[var(--color-text-muted)]">
          View, filter, and review candidate proofs.
        </p>
      </header>

      {/* Stats Bar */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex gap-6 text-sm">
          <p className="text-[var(--color-text)]">
            Total: <strong>{stats.total}</strong>
          </p>
          <p className="text-[var(--color-success)]">
            Reviewed: <strong>{stats.reviewed}</strong>
          </p>
          <p className="text-[var(--color-warning)]">
            Pending: <strong>{stats.pending}</strong>
          </p>
        </div>

        <div className="ml-auto flex gap-3 text-sm relative" ref={dropdownRef}>
          {/* Sort button */}
          <button
            onClick={() => setSortNewest((prev) => !prev)}
            className="border border-[var(--color-border)] rounded-[var(--radius-button)] px-3 py-1.5 flex items-center gap-2 text-[var(--color-text)] hover:bg-[var(--color-border)] transition"
          >
            <ArrowUpDown size={14} />
            {sortNewest ? "Newest first" : "Oldest first"}
          </button>

          {/* Filter Dropdown */}
          <button
            onClick={() => setDropdownOpen((o) => !o)}
            aria-haspopup="listbox"
            aria-expanded={dropdownOpen}
            className="border border-[var(--color-border)] rounded-[var(--radius-button)] px-3 py-1.5 flex items-center gap-2 text-[var(--color-text)] hover:bg-[var(--color-border)] transition"
          >
            <Filter size={14} />
            {filter === "all"
              ? "All Submissions"
              : filter === "reviewed"
                ? "Reviewed"
                : "Pending"}
          </button>

          {dropdownOpen && (
            <ul
              role="listbox"
              tabIndex={-1}
              className="absolute top-full right-0 mt-1 w-40 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-soft)] z-20 overflow-hidden"
            >
              {[
                { value: "all", label: "All" },
                { value: "pending", label: "Pending" },
                { value: "reviewed", label: "Reviewed" },
              ].map(({ value, label }) => (
                <li
                  key={value}
                  role="option"
                  aria-selected={filter === value}
                  onClick={() => {
                    setFilter(value as "all" | "pending" | "reviewed");
                    setDropdownOpen(false);
                  }}
                  className={`px-3 py-2 text-sm cursor-pointer flex items-center gap-2 hover:bg-[var(--color-border)] transition ${filter === value
                      ? "bg-[var(--color-border)] text-[var(--color-employer-dark)] font-medium"
                      : "text-[var(--color-text-muted)]"
                    }`}
                >
                  {value === "reviewed" ? (
                    <CheckCircle2 size={14} />
                  ) : value === "pending" ? (
                    <Clock size={14} />
                  ) : (
                    <ClipboardList size={14} />
                  )}
                  {label}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Submissions List */}
      {filtered.length === 0 ? (
        <div className="text-center text-[var(--color-text-muted)] py-20 border border-dashed border-[var(--color-border)] rounded-xl">
          <p className="mb-2">No submissions found.</p>
          <button
            onClick={() => navigate("/employer/jobs")}
            className="text-[var(--color-employer-dark)] underline hover:text-[var(--color-employer)]"
          >
            Go to My Jobs
          </button>
        </div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((s) => (
            <li
              key={s.id}
              className="border border-[var(--color-border)] rounded-[var(--radius-card)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-hover)] transition"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-medium text-[var(--color-text)] leading-tight">
                  {s.proof_tasks?.title || "Untitled Task"}
                </h3>
                <span
                  className={`text-xs font-medium ${s.status === "reviewed"
                      ? "text-[var(--color-success)]"
                      : "text-[var(--color-warning)]"
                    }`}
                >
                  {s.status}
                </span>
              </div>

              <p className="text-sm text-[var(--color-text-muted)] mb-2">
                Job: {s.jobs?.title || "Unknown"} <br />
                Candidate: {s.user_id}
              </p>

              {s.feedback?.[0]?.stars ? (
                <p className="text-xs text-[var(--color-text-muted)] mb-3">
                  ⭐ {s.feedback[0].stars} stars given
                </p>
              ) : (
                <p className="text-xs text-[var(--color-text-muted)] italic mb-3">
                  Awaiting feedback
                </p>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/employer/review/${s.id}`)}
                  className="flex-1 bg-[var(--color-employer)] text-white py-2 rounded-[var(--radius-button)] hover:bg-[var(--color-employer-dark)] transition flex items-center justify-center gap-1"
                >
                  <ClipboardList size={14} /> Review
                </button>

                <button
                  disabled={!s.feedback?.length}
                  onClick={() => setSelectedFeedback(s.feedback?.[0] || null)}
                  className={`flex-1 border border-[var(--color-border)] py-2 rounded-[var(--radius-button)] flex items-center justify-center gap-1 text-sm transition ${s.feedback?.length
                      ? "text-[var(--color-accent)] hover:bg-[var(--color-border)] hover:text-white"
                      : "text-[var(--color-text-muted)] opacity-50 cursor-not-allowed"
                    }`}
                >
                  <Eye size={14} /> View
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Feedback Modal */}
      {selectedFeedback && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-30 animate-fadeIn"
          role="dialog"
          aria-modal="true"
        >
          <div
            ref={(el) => {
              if (el) {
                const focusable = el.querySelectorAll<HTMLElement>(
                  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                focusable[0]?.focus();

                const handleKey = (e: KeyboardEvent) => {
                  if (e.key === "Escape") setSelectedFeedback(null);
                  if (e.key === "Tab" && focusable.length > 0) {
                    const first = focusable[0];
                    const last = focusable[focusable.length - 1];
                    if (e.shiftKey && document.activeElement === first) {
                      e.preventDefault();
                      last.focus();
                    } else if (!e.shiftKey && document.activeElement === last) {
                      e.preventDefault();
                      first.focus();
                    }
                  }
                };
                document.addEventListener("keydown", handleKey);
                return () => document.removeEventListener("keydown", handleKey);
              }
            }}
            className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-card)] shadow-[var(--shadow-hover)] w-full max-w-lg p-6 relative focus:outline-none"
          >
            <button
              onClick={() => setSelectedFeedback(null)}
              className="absolute top-3 right-3 text-[var(--color-text-muted)] hover:text-[var(--color-error)] transition"
            >
              <X size={18} aria-label="Close modal" />
            </button>

            <h2 className="heading-md mb-4">Feedback Details</h2>

            <div className="mb-3 flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  size={20}
                  className={
                    i <= (selectedFeedback.stars || 0)
                      ? "text-[var(--color-employer)] fill-[var(--color-employer)]"
                      : "text-[var(--color-border)]"
                  }
                />
              ))}
            </div>

            <p className="text-sm text-[var(--color-text-muted)] mb-4">
              Given on{" "}
              {new Date(selectedFeedback.created_at || "").toLocaleDateString()}
            </p>

            <div className="space-y-4 text-sm">
              <div>
                <h3 className="font-medium text-[var(--color-text)] mb-1">
                  Strengths
                </h3>
                <p className="text-[var(--color-text-muted)] whitespace-pre-line">
                  {selectedFeedback.strengths || "No strengths provided."}
                </p>
              </div>

              <div>
                <h3 className="font-medium text-[var(--color-text)] mb-1">
                  Improvements
                </h3>
                <p className="text-[var(--color-text-muted)] whitespace-pre-line">
                  {selectedFeedback.improvements || "No comments provided."}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedFeedback(null)}
                className="px-4 py-2 rounded-[var(--radius-button)] border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-border)] transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
