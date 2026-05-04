import { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  getEmployerJobs,
  getEmployerSubmissionsWithFeedback,
  getJobWithTasks,
  updateJobWithTasks,
  updateJobStatus,
  deleteJob,
} from "@/lib/api";
import { getErrorMessage, withTimeout } from "@/lib/errorUtils";
import { useAuth } from "@/hooks/useAuth";
import type { EmployerJob, EmployerSubmission } from "@/types";
import type { ProofTask } from "@/types";
import {
  Briefcase,
  Users,
  ArrowLeft,
  MoreVertical,
  Pause,
  Play,
  Archive,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import TalentBoard from "@/components/talent/TalentBoard";
import EmployerReviewProof from "./EmployerReviewProof";
import EmployerJobForm from "./EmployerJobForm";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { AnimatePresence, motion } from "framer-motion";

export default function EmployerTalentBoardPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState<EmployerJob[]>([]);
  const [submissions, setSubmissions] = useState<EmployerSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<
    string | null
  >(null);

  // Job management state
  const [isEditingJob, setIsEditingJob] = useState(false);
  const [editJobData, setEditJobData] = useState<Partial<
    EmployerJob & { proof_tasks: ProofTask[] }
  > | null>(null);
  const [editJobLoading, setEditJobLoading] = useState(false);
  const [showJobActions, setShowJobActions] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const selectedJobId = searchParams.get("jobId");
  const selectedJob = jobs.find((j) => j.id === selectedJobId);

  useEffect(() => {
    if (!user?.id) return;
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const [jobsData, subsData] = await Promise.all([
          getEmployerJobs(user.id),
          getEmployerSubmissionsWithFeedback(user.id),
        ]);
        if (mounted) {
          setJobs(jobsData);
          setSubmissions(subsData);
        }
      } catch {
        toast.error("Failed to load talent board.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [user?.id]);

  const jobSubmissions = useMemo(
    () => submissions.filter((s) => s.job_id === selectedJobId),
    [submissions, selectedJobId],
  );

  const handleStatusUpdate = async (status: string) => {
    if (!selectedJobId) return;
    try {
      await withTimeout(updateJobStatus(selectedJobId, status), 10000, () =>
        toast.loading("This is taking longer than expected...", {
          id: "timeout-warning",
        }),
      );
      toast.dismiss("timeout-warning");
      toast.success(`Job marked as ${status}`);
      setJobs((prev) =>
        prev.map((j) => (j.id === selectedJobId ? { ...j, status } : j)),
      );
      setShowJobActions(false);
    } catch (error: unknown) {
      toast.dismiss("timeout-warning");
      toast.error(getErrorMessage(error, "Failed to update status"));
    }
  };

  const handleDeleteJob = async () => {
    if (!selectedJobId) return;
    setIsDeleting(true);
    try {
      await withTimeout(deleteJob(selectedJobId), 10000, () =>
        toast.loading("This is taking longer than expected...", {
          id: "timeout-warning",
        }),
      );
      toast.dismiss("timeout-warning");
      toast.success("Job deleted");
      setJobs((prev) => prev.filter((j) => j.id !== selectedJobId));
      setSearchParams({});
      setConfirmDelete(false);
    } catch (error: unknown) {
      toast.dismiss("timeout-warning");
      toast.error(getErrorMessage(error, "Failed to delete job"));
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-[var(--color-text-muted)]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[var(--color-brand-primary)] border-t-transparent rounded-full animate-spin" />
          <p>Loading talent board...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      {selectedJobId && selectedJob ? (
        /* ── Kanban View ── */
        <div className="space-y-6 flex flex-col">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <Button
                variant="ghost"
                size="sm"
                className="mb-2 -ml-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                onClick={() => setSearchParams({})}
              >
                <ArrowLeft size={16} className="mr-1" /> All Jobs
              </Button>
              <h1 className="text-2xl font-bold font-display text-[var(--color-text)] flex items-center gap-2">
                {selectedJob.title}
                <span
                  className={`text-xs px-2 py-0.5 rounded-full border ${
                    selectedJob.status === "active"
                      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                      : "bg-slate-500/10 text-slate-500 border-slate-500/20"
                  }`}
                >
                  {selectedJob.status}
                </span>
              </h1>
              <p className="text-[var(--color-text-muted)] text-sm mt-1">
                Manage candidates and move them through the hiring pipeline.
              </p>
            </div>

            {/* Job Management Toolbar */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  if (!selectedJobId) return;
                  setEditJobLoading(true);
                  try {
                    const data = await getJobWithTasks(selectedJobId);
                    setEditJobData(
                      data as unknown as EmployerJob & {
                        proof_tasks: ProofTask[];
                      },
                    );
                    setIsEditingJob(true);
                  } catch {
                    toast.error("Failed to load job for editing");
                  } finally {
                    setEditJobLoading(false);
                  }
                }}
              >
                {editJobLoading ? "Loading..." : "Edit Job"}
              </Button>

              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 p-0"
                  onClick={() => setShowJobActions(!showJobActions)}
                >
                  <MoreVertical size={18} />
                </Button>

                {showJobActions && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <button
                      onClick={() =>
                        handleStatusUpdate(
                          selectedJob.status === "active" ? "paused" : "active",
                        )
                      }
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-[var(--color-surface-hover)] flex items-center gap-2 text-[var(--color-text)] transition-colors"
                    >
                      {selectedJob.status === "active" ? (
                        <>
                          <Pause size={14} /> Pause Job
                        </>
                      ) : (
                        <>
                          <Play size={14} /> Resume Job
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleStatusUpdate("closed")}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-[var(--color-surface-hover)] flex items-center gap-2 text-[var(--color-text)] transition-colors"
                    >
                      <Archive size={14} /> Close Job
                    </button>
                    <button
                      onClick={() =>
                        window.open(`/jobs/${selectedJobId}`, "_blank")
                      }
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-[var(--color-surface-hover)] flex items-center gap-2 text-[var(--color-text)] transition-colors"
                    >
                      <Users size={14} /> View Public Page
                    </button>
                    <div className="h-px bg-[var(--color-border)] my-1" />
                    <button
                      onClick={() => {
                        setShowJobActions(false);
                        setConfirmDelete(true);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-red-50 dark:hover:bg-red-900/10 text-red-500 flex items-center gap-2 transition-colors"
                    >
                      <Trash2 size={14} /> Delete Job
                    </button>
                  </div>
                )}

                {showJobActions && (
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowJobActions(false)}
                  />
                )}
              </div>
            </div>
          </div>

          <TalentBoard
            submissions={jobSubmissions}
            setSubmissions={setSubmissions}
            onReview={(id) => setSelectedSubmissionId(id)}
          />
        </div>
      ) : (
        /* ── Job Picker Grid ── */
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold font-display text-[var(--color-text)]">
              Talent Board
            </h1>
            <p className="text-[var(--color-text-muted)] text-sm mt-1">
              Select a job to manage its candidate pipeline.
            </p>
          </div>

          {jobs.length === 0 ? (
            <div className="text-center p-12 border border-dashed border-[var(--color-border)] rounded-2xl bg-[var(--color-surface)]">
              <div className="w-16 h-16 mx-auto bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] rounded-full flex items-center justify-center mb-4">
                <Briefcase size={32} />
              </div>
              <h3 className="text-xl font-bold text-[var(--color-text)] mb-2">
                No jobs yet
              </h3>
              <p className="text-[var(--color-text-muted)] max-w-sm mx-auto">
                Post a job from the Dashboard to start managing candidates here.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job) => (
                <button
                  key={job.id}
                  onClick={() => setSearchParams({ jobId: job.id })}
                  className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm hover:shadow-md hover:border-[var(--color-brand-primary)]/50 transition-all text-left flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          job.status === "active"
                            ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                            : "bg-slate-400"
                        }`}
                      />
                      <span className="text-xs font-semibold text-[var(--color-text-muted)] capitalize">
                        {job.status}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg text-[var(--color-text)] mb-1 truncate">
                      {job.title}
                    </h3>
                    <p className="text-sm text-[var(--color-text-muted)] truncate">
                      {job.location} • {job.job_type}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center gap-1.5 text-sm font-medium text-blue-600 dark:text-blue-400">
                    <Users size={16} />
                    <span>
                      {submissions.filter((s) => s.job_id === job.id).length}{" "}
                      Candidates
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Edit Job Slide-Over ── */}
      {createPortal(
        <AnimatePresence>
          {isEditingJob && editJobData && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                onClick={() => {
                  setIsEditingJob(false);
                  setEditJobData(null);
                }}
              />
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="fixed top-0 right-0 z-50 h-full w-full max-w-2xl bg-[var(--color-bg)] border-l border-[var(--color-border)] shadow-2xl overflow-y-auto"
              >
                <div className="sticky top-0 z-10 bg-[var(--color-bg)]/80 backdrop-blur-md border-b border-[var(--color-border)] px-6 py-4 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-[var(--color-text)]">
                    Edit Job
                  </h2>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10"
                      onClick={() => {
                        setIsEditingJob(false);
                        setConfirmDelete(true);
                      }}
                    >
                      Delete Job
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIsEditingJob(false);
                        setEditJobData(null);
                      }}
                    >
                      ✕ Close
                    </Button>
                  </div>
                </div>
                <div className="p-6">
                  <EmployerJobForm
                    mode="edit"
                    defaultValues={editJobData}
                    onSubmit={async (values) => {
                      if (!selectedJobId) return;
                      await updateJobWithTasks(selectedJobId, values);
                    }}
                    submitLabel="Update Job"
                    onSuccess={async () => {
                      toast.success("Job updated!");
                      setIsEditingJob(false);
                      setEditJobData(null);
                      if (user?.id) {
                        const updatedJobs = await getEmployerJobs(user.id);
                        setJobs(updatedJobs);
                      }
                    }}
                  />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body,
      )}

      {/* ── Review Proof Slide-Over ── */}
      {createPortal(
        <AnimatePresence>
          {selectedSubmissionId && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                onClick={() => setSelectedSubmissionId(null)}
              />
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="fixed top-0 right-0 z-50 h-full w-full max-w-5xl bg-[var(--color-bg)] border-l border-[var(--color-border)] shadow-2xl overflow-y-auto"
              >
                <div className="sticky top-0 z-10 bg-[var(--color-bg)]/80 backdrop-blur-md border-b border-[var(--color-border)] px-6 py-4 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-[var(--color-text)]">
                    Review Proof
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedSubmissionId(null)}
                  >
                    ✕ Close
                  </Button>
                </div>
                <div className="p-0">
                  <EmployerReviewProof
                    submissionId={selectedSubmissionId}
                    onBack={() => setSelectedSubmissionId(null)}
                  />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body,
      )}

      {/* Delete Job Confirmation */}
      <ConfirmDialog
        open={confirmDelete}
        title="Delete this job?"
        message="This will permanently remove the job listing and all associated candidate submissions. This cannot be undone."
        confirmLabel="Delete Job"
        cancelLabel="Keep It"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleDeleteJob}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
