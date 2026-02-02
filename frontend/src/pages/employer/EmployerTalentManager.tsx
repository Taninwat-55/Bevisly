import { useEffect, useState, useMemo, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getEmployerSubmissionsWithFeedback } from "@/lib/api/submissions";
import { getEmployerJobs } from "@/lib/api/jobs";
import type { EmployerSubmission } from "@/types";
import toast from "react-hot-toast";
import { Loader2, Users, Briefcase, UserCheck, Star } from "lucide-react";
import TalentBoard from "@/components/talent/TalentBoard";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/Card";

export default function EmployerTalentManager() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<EmployerSubmission[]>([]);
  const [jobs, setJobs] = useState<{ id: string; title: string }[]>([]);
  const [selectedJob, setSelectedJob] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [live, setLive] = useState(false);

  // ref to throttle rapid DB updates
  const updateTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const batched = useRef(false);

  /* ── Load data ─────────────────────────────── */
  useEffect(() => {
    if (!user?.id) return;
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
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

    return () => {
      mounted = false;
    };
  }, [user?.id]);

  /* ── Live Supabase updates (batched) ───────── */
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel("submissions_live_sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "submissions" },
        (payload) => {
          const updated = payload.new as EmployerSubmission;
          if (!updated?.id) return;

          setSubmissions((prev) => {
            const idx = prev.findIndex((s) => s.id === updated.id);
            if (idx === -1) return [updated, ...prev];
            const clone = [...prev];
            clone[idx] = { ...clone[idx], ...updated };
            return clone;
          });

          if (updateTimeout.current) clearTimeout(updateTimeout.current);
          if (!batched.current) {
            toast.success("Live updates synced");
            batched.current = true;
          }
          setLive(true);
          updateTimeout.current = setTimeout(() => {
            batched.current = false;
            setLive(false);
          }, 2000);
        }
      )
      .subscribe();

    return () => {
      if (updateTimeout.current) clearTimeout(updateTimeout.current);
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  /* ── Filter by job ───────── */
  const filteredSubs = useMemo(() => {
    if (selectedJob === "all") return submissions;
    return submissions.filter((s) => s.job_id === selectedJob);
  }, [submissions, selectedJob]);

  /* ── Quick metrics ───────── */
  const totalCandidates = filteredSubs.length;
  const reviewed = filteredSubs.filter((s) => s.status === "reviewed").length;
  const hired = filteredSubs.filter((s) => s.hiring_stage === "hired").length;

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-[var(--color-text-muted)] gap-3">
        <Loader2 className="animate-spin text-[var(--color-brand-primary)]" size={32} />
        <p>Loading your talent board...</p>
      </div>
    );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold font-display text-[var(--color-text)] flex items-center gap-3">
              <Users size={28} /> Talent Manager
            </h1>

            {/* Live Indicator */}
            <AnimatePresence>
              {live && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-medium text-emerald-600">Live</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <p className="text-[var(--color-text-muted)] mt-1">
            Drag and drop candidates across your hiring pipeline.
          </p>
        </div>

        {/* Metrics & Filter */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Job Filter */}
          <div className="relative">
            <select
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
              className="appearance-none pl-9 pr-8 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 outline-none cursor-pointer hover:bg-[var(--color-surface-hover)] transition"
            >
              <option value="all">All Jobs</option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>{job.title}</option>
              ))}
            </select>
            <Briefcase size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" />
          </div>

          {/* Quick Stats */}
          <div className="flex gap-2">
            <Card className="flex items-center gap-2 px-3 py-2 border-l-4 border-l-blue-500">
              <UserCheck className="text-blue-500" size={16} />
              <div>
                <p className="text-[10px] uppercase text-[var(--color-text-muted)] font-bold">Total</p>
                <p className="text-sm font-bold leading-none">{totalCandidates}</p>
              </div>
            </Card>

            <Card className="flex items-center gap-2 px-3 py-2 border-l-4 border-l-amber-500">
              <Star className="text-amber-500" size={16} />
              <div>
                <p className="text-[10px] uppercase text-[var(--color-text-muted)] font-bold">Reviewed</p>
                <p className="text-sm font-bold leading-none">{reviewed}</p>
              </div>
            </Card>

            <Card className="flex items-center gap-2 px-3 py-2 border-l-4 border-l-emerald-500">
              <UserCheck className="text-emerald-500" size={16} />
              <div>
                <p className="text-[10px] uppercase text-[var(--color-text-muted)] font-bold">Hired</p>
                <p className="text-sm font-bold leading-none">{hired}</p>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <TalentBoard submissions={filteredSubs} setSubmissions={setSubmissions} />
    </div>
  );
}
