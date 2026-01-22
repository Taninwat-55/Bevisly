import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  getProofTaskDetails,
  startProof,
  completeProof,
  saveDraft,
  checkSubmissionStatus,
} from "@/lib/api/submissions";
import {
  Loader2, Clock, Brain, CheckCircle2,
  Upload, Download, Link as LinkIcon,
  FileText, AlignLeft, Github, GitFork, Video,
  ChevronDown, ChevronUp, Save
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { ProofTask } from "@/types/shared";

// Skeleton component for loading states
function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-[var(--color-border)] rounded-lg ${className}`} />
  );
}

// Loading skeleton for the workspace
function WorkspaceSkeleton() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] px-4 md:px-8 py-6 md:py-10">
      {/* Header skeleton */}
      <div className="mb-8 text-center">
        <Skeleton className="h-8 w-64 mx-auto mb-3" />
        <Skeleton className="h-6 w-32 mx-auto" />
      </div>

      {/* Content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
        <div className="glass-panel rounded-2xl p-6 space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-32 w-full" />
          <div className="flex gap-4">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
        <div className="glass-panel rounded-2xl p-6 space-y-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}

export default function CandidateProofWorkspace() {
  const { id: proof_task_id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [task, setTask] = useState<ProofTask | null>(null);
  const [savingDraft, setSavingDraft] = useState(false);
  const [draftStatus, setDraftStatus] = useState<"saved" | "saving" | "unsaved">("unsaved");

  // Form State
  const [link, setLink] = useState("");
  const [videoLink, setVideoLink] = useState("");
  const [textSubmission, setTextSubmission] = useState("");
  const [reflection, setReflection] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [inputMode, setInputMode] = useState<"link" | "file" | "text">("link");
  const [isLocked, setIsLocked] = useState(false);
  const [existingFileUrl, setExistingFileUrl] = useState<string | null>(null);

  // Mobile: Collapsible task brief
  const [isBriefExpanded, setIsBriefExpanded] = useState(true);

  useEffect(() => {
    if (!proof_task_id) return;

    const init = async () => {
      setLoading(true);
      try {
        const taskData = await getProofTaskDetails(proof_task_id);
        if (!taskData) {
          toast.error("Task not found");
          return;
        }
        setTask(taskData);

        // Auto-select mode based on task
        let mode: "link" | "file" | "text" = "link";
        if (taskData.submission_type === "file") mode = "file";
        else if (taskData.submission_type === "text") mode = "text";
        else if (taskData.submission_type === "github_repo") mode = "link";
        setInputMode(mode);

        if (taskData.job_id) {
          await startProof(taskData.job_id, taskData.id);
          const existing = await checkSubmissionStatus(taskData.job_id);

          if (existing) {
            setLink(existing.submission_link || "");
            setReflection(existing.reflection || "");

            if (existing.submission_link && existing.submission_link.includes("supabase")) {
              setExistingFileUrl(existing.submission_link);
            }

            if (["submitted", "reviewed", "hired", "rejected"].includes(existing.status || "")) {
              setIsLocked(true);
            }
          }
        }
      } catch (err: any) {
        toast.error(err.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [proof_task_id]);

  // Optimistic draft save with debounce
  const handleSaveDraft = useCallback(async () => {
    if (!task?.job_id || isLocked) return;

    // Optimistic update
    setDraftStatus("saving");
    setSavingDraft(true);

    try {
      await saveDraft({
        job_id: task.job_id,
        submission_link: link,
        reflection,
      });
      setDraftStatus("saved");
      toast.success("Draft saved", { duration: 2000 });

      // Reset to unsaved after 3 seconds to show user can edit again
      setTimeout(() => setDraftStatus("unsaved"), 3000);
    } catch (error) {
      console.error(error);
      setDraftStatus("unsaved");
      toast.error("Failed to save draft");
    } finally {
      setSavingDraft(false);
    }
  }, [task?.job_id, link, reflection, isLocked]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isLocked) return;
    if (!task) return toast.error("Task not found.");

    // Validate
    const hasLink = link.trim().length > 0;
    const hasFile = !!file || !!existingFileUrl;
    const hasText = textSubmission.trim().length > 0;

    if (!hasLink && !hasFile && !hasText) {
      return toast.error("Please provide a link, file, or text response.");
    }

    setSubmitting(true);

    // Optimistic UI: show success state immediately
    toast.loading("Submitting proof...", { id: "submit-proof" });

    try {
      if (!task.job_id) throw new Error("Job ID missing");

      await completeProof({
        job_id: task.job_id,
        submission_link: link || undefined,
        text_response: textSubmission || undefined,
        reflection: reflection,
        video_url: videoLink || undefined,
        file: file || undefined,
      });

      toast.success("🚀 Proof submitted!", { id: "submit-proof" });
      navigate("/candidate/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Submission failed", { id: "submit-proof" });
    } finally {
      setSubmitting(false);
    }
  }

  // Show skeleton while loading
  if (loading) return <WorkspaceSkeleton />;

  if (!task) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen gap-3">
        <p className="text-lg text-[var(--color-text)]">Task not found</p>
        <button
          onClick={() => navigate("/candidate/dashboard")}
          className="text-sm text-[var(--color-candidate)] hover:underline"
        >
          ← Back to Dashboard
        </button>
      </div>
    );
  }

  const isRepoChallenge = task.submission_type === "github_repo";
  const templateRepo = task.recommended_platform;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[var(--color-bg)] px-4 md:px-8 py-6 md:py-10 pb-32 lg:pb-10"
    >
      {/* Header - Mobile Optimized */}
      <header className="mb-6 md:mb-10 text-center max-w-5xl mx-auto">
        <h1 className="text-xl md:text-3xl font-bold text-[var(--color-text)] mb-2 px-4">
          {task.title}
        </h1>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <span className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${isLocked
              ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
              : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800"
            }`}>
            {isLocked ? "✅ Submitted" : "🚧 In Progress"}
          </span>
          {isRepoChallenge && (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[var(--color-surface)] text-[var(--color-text-muted)] text-xs font-medium border border-[var(--color-border)]">
              <Github size={12} />
              Code Challenge
            </span>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 max-w-5xl mx-auto">

        {/* TASK BRIEF - Collapsible on Mobile */}
        <section className="glass-panel rounded-2xl overflow-hidden">
          {/* Collapsible Header (Mobile) */}
          <button
            onClick={() => setIsBriefExpanded(!isBriefExpanded)}
            className="w-full flex items-center justify-between p-4 md:p-6 lg:cursor-default"
          >
            <h2 className="text-lg font-semibold text-[var(--color-text)] flex items-center gap-2">
              📋 Task Brief
            </h2>
            <motion.div
              animate={{ rotate: isBriefExpanded ? 180 : 0 }}
              className="lg:hidden text-[var(--color-text-muted)]"
            >
              <ChevronDown size={20} />
            </motion.div>
          </button>

          {/* Collapsible Content */}
          <AnimatePresence initial={false}>
            {(isBriefExpanded || window.innerWidth >= 1024) && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 md:px-6 md:pb-6 space-y-4">
                  {/* GitHub Challenge CTA */}
                  {isRepoChallenge && templateRepo && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl">
                      <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-2 flex items-center gap-2 text-sm">
                        <GitFork size={16} />
                        Start Here
                      </h3>
                      <p className="text-xs text-blue-600/80 dark:text-blue-300/80 mb-3 leading-relaxed">
                        Fork the repository below to get the starter code.
                      </p>
                      <a
                        href={templateRepo}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition shadow-sm active:scale-95"
                      >
                        <Github size={16} />
                        Open Template Repo
                      </a>
                    </div>
                  )}

                  {/* Description */}
                  <div className="text-sm text-[var(--color-text-muted)] leading-relaxed whitespace-pre-line bg-[var(--color-bg)] p-4 rounded-xl border border-[var(--color-border)] max-h-48 overflow-y-auto">
                    {task.description || "No description provided."}
                  </div>

                  {/* Metadata Pills */}
                  <div className="flex flex-wrap gap-2">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)]">
                      <Clock size={14} className="text-[var(--color-text-muted)]" />
                      <span className="text-xs text-[var(--color-text)]">{task.expected_time || "Flexible"}</span>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${task.ai_tools_allowed
                        ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800"
                        : "bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800"
                      }`}>
                      <Brain size={14} className={task.ai_tools_allowed ? "text-emerald-600" : "text-rose-600"} />
                      <span className={`text-xs ${task.ai_tools_allowed ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400"}`}>
                        AI {task.ai_tools_allowed ? "Allowed" : "Not Allowed"}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* SUBMISSION FORM */}
        <section className="glass-panel rounded-2xl p-4 md:p-6">
          <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">
            {isLocked ? "📄 Submission Details" : "🚀 Submit Your Proof"}
          </h2>

          {/* Input Mode Tabs */}
          {!isRepoChallenge && (
            <div className="flex rounded-xl bg-[var(--color-bg)] p-1 mb-5 border border-[var(--color-border)]">
              {[
                { id: "link", label: "Link", icon: LinkIcon },
                { id: "file", label: "File", icon: Upload },
                { id: "text", label: "Text", icon: AlignLeft },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => !isLocked && setInputMode(tab.id as typeof inputMode)}
                  disabled={isLocked && inputMode !== tab.id}
                  className={`flex-1 py-2.5 px-3 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${inputMode === tab.id
                      ? "bg-[var(--color-candidate)] text-white shadow-sm"
                      : "text-[var(--color-text-muted)] hover:text-[var(--color-text)] disabled:opacity-30"
                    }`}
                >
                  <tab.icon size={14} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Link Input */}
            {inputMode === "link" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-[var(--color-text)]">
                    {isRepoChallenge ? "Your Repository URL" : "Submission Link"}
                  </label>
                  <div className="relative">
                    {isRepoChallenge
                      ? <Github size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                      : <LinkIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                    }
                    <input
                      type="url"
                      value={link}
                      disabled={isLocked}
                      onChange={(e) => setLink(e.target.value)}
                      placeholder={isRepoChallenge ? "https://github.com/..." : "https://..."}
                      className="w-full pl-10 pr-4 py-3 text-sm border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] rounded-xl focus:ring-2 focus:ring-[var(--color-candidate)] focus:border-transparent outline-none disabled:opacity-60 transition-all"
                    />
                  </div>
                </div>

                {/* Video Walkthrough */}
                {!isLocked && (
                  <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 bg-indigo-100 dark:bg-indigo-800 rounded-lg">
                        <Video size={14} className="text-indigo-600 dark:text-indigo-300" />
                      </div>
                      <label className="text-sm font-semibold text-indigo-900 dark:text-indigo-100">
                        Video Walkthrough
                      </label>
                      <span className="text-[10px] px-1.5 py-0.5 bg-indigo-200 dark:bg-indigo-700 text-indigo-700 dark:text-indigo-200 rounded-full font-medium">
                        Recommended
                      </span>
                    </div>
                    <p className="text-xs text-indigo-700 dark:text-indigo-300 mb-3">
                      Stand out with a quick Loom or YouTube video.
                    </p>
                    <input
                      type="url"
                      value={videoLink}
                      onChange={(e) => setVideoLink(e.target.value)}
                      placeholder="https://loom.com/share/..."
                      className="w-full px-4 py-2.5 text-sm border border-indigo-200 dark:border-indigo-700 bg-white dark:bg-black/20 text-[var(--color-text)] rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none"
                    />
                  </div>
                )}
              </div>
            )}

            {/* File Input */}
            {inputMode === "file" && (
              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--color-text)]">Upload File</label>
                {existingFileUrl ? (
                  <a
                    href={existingFileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 p-4 border border-[var(--color-border)] rounded-xl bg-[var(--color-bg)] hover:bg-[var(--color-surface)] transition active:scale-[0.98]"
                  >
                    <FileText size={24} className="text-[var(--color-candidate)]" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--color-text)] truncate">Uploaded Submission</p>
                      <p className="text-xs text-[var(--color-text-muted)]">Tap to download</p>
                    </div>
                    <Download size={18} className="text-[var(--color-text-muted)]" />
                  </a>
                ) : (
                  <div
                    onClick={() => !isLocked && fileInputRef.current?.click()}
                    className={`flex flex-col items-center justify-center border-2 border-dashed border-[var(--color-border)] bg-[var(--color-bg)] rounded-xl px-4 py-10 transition-all active:scale-[0.98] ${isLocked ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-[var(--color-candidate)] hover:bg-[var(--color-surface)]"
                      }`}
                  >
                    <Upload size={28} className="text-[var(--color-candidate)] mb-2" />
                    <span className="text-sm font-medium text-[var(--color-text)]">
                      {file ? file.name : "Tap to upload"}
                    </span>
                    <span className="text-xs text-[var(--color-text-muted)] mt-1">
                      PDF, ZIP, DOCX, or image
                    </span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      disabled={isLocked}
                      className="hidden"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Text Input */}
            {inputMode === "text" && (
              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--color-text)]">Your Response</label>
                <textarea
                  rows={6}
                  value={textSubmission}
                  disabled={isLocked}
                  onChange={(e) => setTextSubmission(e.target.value)}
                  placeholder="Write your response here..."
                  className="w-full border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[var(--color-candidate)] focus:border-transparent outline-none disabled:opacity-60 resize-none"
                />
              </div>
            )}

            {/* Reflection (for non-text modes) */}
            {inputMode !== "text" && (
              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--color-text)]">
                  Reflection / Notes
                </label>
                <textarea
                  rows={3}
                  value={reflection}
                  disabled={isLocked}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder="Describe your approach or any challenges..."
                  className="w-full border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[var(--color-candidate)] focus:border-transparent outline-none disabled:opacity-60 resize-none"
                />
              </div>
            )}
          </form>

          {/* Locked State */}
          {isLocked && (
            <div className="mt-5 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-center rounded-xl">
              <CheckCircle2 size={20} className="inline-block mr-2" />
              Submission Received
            </div>
          )}
        </section>
      </div>

      {/* MOBILE FIXED ACTION BAR */}
      {!isLocked && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-0 left-0 right-0 lg:relative lg:mt-6 lg:max-w-5xl lg:mx-auto"
        >
          <div className="glass-panel border-t lg:border border-[var(--color-border)] p-4 flex gap-3 safe-area-inset-bottom">
            {/* Save Draft */}
            <motion.button
              type="button"
              onClick={handleSaveDraft}
              disabled={submitting || savingDraft}
              whileTap={{ scale: 0.95 }}
              className={`flex-1 py-3 rounded-xl border font-medium transition-all flex items-center justify-center gap-2 text-sm ${draftStatus === "saved"
                  ? "border-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400"
                  : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface)]"
                }`}
            >
              {savingDraft ? (
                <Loader2 size={16} className="animate-spin" />
              ) : draftStatus === "saved" ? (
                <CheckCircle2 size={16} />
              ) : (
                <Save size={16} />
              )}
              <span className="hidden sm:inline">
                {draftStatus === "saved" ? "Saved" : "Save Draft"}
              </span>
            </motion.button>

            {/* Submit */}
            <motion.button
              type="submit"
              onClick={handleSubmit}
              disabled={submitting || savingDraft}
              whileTap={{ scale: 0.95 }}
              className="flex-[2] py-3 rounded-xl bg-[var(--color-candidate)] text-white font-medium hover:bg-[var(--color-candidate-dark)] transition-all disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg shadow-[var(--color-candidate)]/20"
            >
              {submitting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <CheckCircle2 size={18} />
              )}
              Submit Proof
            </motion.button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}