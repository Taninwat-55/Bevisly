import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCandidateStats } from "@/hooks/useCandidateStats";
import { getAllJobs } from "@/lib/api/jobs";
import { getCandidateApplications } from "@/lib/api/submissions";
import { supabase } from "@/lib/supabaseClient";
import type { CandidateJob } from "@/types";
import JobCard from "@/components/jobs/JobCard";
import ApplicationStatusTracker from "@/components/candidate/ApplicationStatusTracker";
import { Link, useNavigate } from "react-router-dom";
import {
  Trophy,
  Target,
  Briefcase,
  TrendingUp,
  ArrowRight,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import WelcomeBanner from "@/components/common/WelcomeBanner";

export default function CandidateDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { proofsCompleted, avgScore, jobsApplied, bevislyScore } = useCandidateStats();
  const [jobs, setJobs] = useState<CandidateJob[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [applications, setApplications] = useState<Awaited<ReturnType<typeof getCandidateApplications>>>([]);
  const [loadingApplications, setLoadingApplications] = useState(true);
  const [hasPracticed, setHasPracticed] = useState(true); // default true to avoid flash

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const data = await getAllJobs();
        setJobs(data.slice(0, 3));
      } catch (error) {
        console.error("Failed to fetch jobs", error);
      } finally {
        setLoadingJobs(false);
      }
    };
    fetchJobs();
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    getCandidateApplications(user.id)
      .then(setApplications)
      .catch(() => {})
      .finally(() => setLoadingApplications(false));
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from("practice_submissions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .then(({ count }) => setHasPracticed((count ?? 0) > 0));
  }, [user?.id]);

  const displayName = user?.email?.split("@")[0] || "Candidate";

  return (
    <div className="space-y-8 pb-10">

      {/* ── Welcome Banner (first visit) ────────────────────────── */}
      <WelcomeBanner
        role="candidate"
        userName={displayName}
      />

      {/* ── Practice & Improve Banner (hidden once the user has any submission) ── */}
      {!hasPracticed && (
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-[var(--color-brand-primary)]/30 bg-[var(--color-brand-primary)]/5 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--color-brand-primary)]/15 text-[var(--color-brand-primary)]">
              <Zap size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--color-text)]">Practice & Improve</p>
              <p className="text-xs text-[var(--color-text-muted)]">Complete AI-graded challenges and earn credits instantly</p>
            </div>
          </div>
          <button
            onClick={() => navigate("/candidate/practice")}
            className="shrink-0 px-4 py-2 rounded-xl bg-[var(--color-brand-primary)] text-white text-sm font-semibold hover:bg-[var(--color-brand-primary)]/90 transition-colors whitespace-nowrap"
          >
            Start Practicing →
          </button>
        </div>
      )}

      {/* ── Hero Section ────────────────────────────── */}
      <div className="relative group overflow-hidden rounded-3xl p-8 lg:p-10 border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl">
        {/* Background Gradient/Mesh */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-[var(--color-brand-primary)]/10 to-[var(--color-brand-secondary)]/10 rounded-full blur-[100px] -z-10 translate-x-1/3 -translate-y-1/3" />

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-display text-[var(--color-text)] mb-2">
                Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-brand-primary)] to-[var(--color-brand-secondary)] capitalize">{displayName}</span>
              </h1>
              <p className="text-[var(--color-text-muted)] text-lg max-w-xl">
                Your Bevisly Score is <strong className="text-[var(--color-text)]">{bevislyScore ?? 0}</strong>.
                Complete proof tasks and practice challenges to climb the leaderboard.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={() => window.location.href = '/candidate/jobs'} size="lg" className="shadow-glow-primary">
                Find Work
              </Button>
            </div>
          </div>

          {/* Stats Row within Hero */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 md:mt-12 max-w-3xl">
            {/* Bevisly Score — flagship card */}
            <div className="glass-panel bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/20 dark:to-purple-500/20 p-4 rounded-2xl border border-indigo-300/40 dark:border-indigo-700/40 backdrop-blur-md">
              <div className="flex items-center gap-3 mb-1">
                <div className="p-2 rounded-lg bg-indigo-500/15 text-indigo-500">
                  <Zap size={18} />
                </div>
                <span className="text-sm text-[var(--color-text-muted)] font-medium">Bevisly Score</span>
              </div>
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{bevislyScore ?? 0}</div>
            </div>

            <div className="glass-panel bg-white/50 dark:bg-black/20 p-4 rounded-2xl border border-[var(--color-border)]/50 backdrop-blur-md">
              <div className="flex items-center gap-3 mb-1">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                  <Trophy size={18} />
                </div>
                <span className="text-sm text-[var(--color-text-muted)] font-medium">Proofs</span>
              </div>
              <div className="text-2xl font-bold text-[var(--color-text)]">{proofsCompleted}</div>
            </div>

            <div className="glass-panel bg-white/50 dark:bg-black/20 p-4 rounded-2xl border border-[var(--color-border)]/50 backdrop-blur-md">
              <div className="flex items-center gap-3 mb-1">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                  <Target size={18} />
                </div>
                <span className="text-sm text-[var(--color-text-muted)] font-medium">Avg Score</span>
              </div>
              <div className="text-2xl font-bold text-[var(--color-text)]">{avgScore ? avgScore : "-"}</div>
            </div>

            <div className="glass-panel bg-white/50 dark:bg-black/20 p-4 rounded-2xl border border-[var(--color-border)]/50 backdrop-blur-md">
              <div className="flex items-center gap-3 mb-1">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                  <TrendingUp size={18} />
                </div>
                <span className="text-sm text-[var(--color-text-muted)] font-medium">Applied</span>
              </div>
              <div className="text-2xl font-bold text-[var(--color-text)]">{jobsApplied}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Recommended Jobs ────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold font-display text-[var(--color-text)] flex items-center gap-2">
            <Briefcase className="text-[var(--color-brand-primary)]" size={24} />
            Recommended Roles
          </h2>
          <Link to="/candidate/jobs" className="text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-brand-primary)] flex items-center gap-1 transition-colors">
            View All <ArrowRight size={16} />
          </Link>
        </div>

        {loadingJobs ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {jobs.length === 0 ? (
              <div className="col-span-full text-center p-8 md:p-12 border border-dashed border-[var(--color-border)] rounded-2xl bg-[var(--color-surface)] shadow-sm">
                 <div className="w-16 h-16 mx-auto bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] rounded-full flex items-center justify-center mb-4">
                     <Briefcase size={32} />
                 </div>
                 <h3 className="text-xl font-bold text-[var(--color-text)] mb-2">Your next opportunity awaits!</h3>
                 <p className="text-[var(--color-text-muted)] max-w-md mx-auto mb-6">
                     No roles to show yet — browse open positions and complete a proof task to get matched with top companies.
                 </p>
                 <Button onClick={() => window.location.href = '/candidate/jobs'} size="lg" className="shadow-glow-primary bg-[var(--color-brand-primary)] text-white hover:bg-blue-700">
                     Go Find Your First Role →
                 </Button>
              </div>
            ) : (
              jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))
            )}
          </div>
        )}
      </div>

      {/* ── Your Applications ────────────────────────────── */}
      {(loadingApplications || applications.length > 0) && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold font-display text-[var(--color-text)] flex items-center gap-2">
              <TrendingUp className="text-[var(--color-brand-primary)]" size={24} />
              Your Applications
            </h2>
            <Link to="/candidate/proofs" className="text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-brand-primary)] flex items-center gap-1 transition-colors">
              View All <ArrowRight size={16} />
            </Link>
          </div>

          {loadingApplications ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] animate-pulse" />
              ))}
            </div>
          ) : (
            <ApplicationStatusTracker applications={applications} />
          )}
        </div>
      )}

    </div>
  );
}