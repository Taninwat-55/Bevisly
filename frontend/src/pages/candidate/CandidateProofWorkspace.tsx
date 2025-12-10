import { useState, useEffect, useRef } from "react";
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
  FileText, AlignLeft, Github, GitFork, Video
} from "lucide-react";
import { motion } from "framer-motion";
import type { ProofTask } from "@/types/shared";

export default function CandidateProofWorkspace() {
  const { id: proof_task_id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [task, setTask] = useState<ProofTask | null>(null);
  const [savingDraft, setSavingDraft] = useState(false);

  // 📝 Form State
  const [link, setLink] = useState("");
  const [videoLink, setVideoLink] = useState("");
  const [textSubmission, setTextSubmission] = useState("");
  const [reflection, setReflection] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmissions] = useState(false);
  const [inputMode, setInputMode] = useState<"link" | "file" | "text">("link");
  const [isLocked, setIsLocked] = useState(false);
  const [existingFileUrl, setExistingFileUrl] = useState<string | null>(null);

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

        // Auto-select mode
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
            // ✅ Load existing video link if available (assuming API returns it, otherwise it stays empty)
            // If you added video_url to checkSubmissionStatus return, map it here:
            // setVideoLink(existing.video_url || ""); 

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

  // ✅ Restored Draft Handler
  const handleSaveDraft = async () => {
    if (!task?.job_id) return;
    setSavingDraft(true);
    try {
      await saveDraft({
        job_id: task.job_id,
        submission_link: link,
        reflection,
        // video_url: videoLink // If you updated saveDraft to accept video_url
      });
      toast.success("Draft saved");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save draft");
    } finally {
      setSavingDraft(false);
    }
  };

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

    setSubmissions(true);
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

      toast.success("🚀 Proof submitted!");
      navigate("/candidate/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Submission failed");
    } finally {
      setSubmissions(false);
    }
  }

  if (loading || !task) return (
    <div className="flex justify-center items-center min-h-screen text-[var(--color-text-muted)]">
      <Loader2 className="animate-spin mr-2" size={18} /> Loading workspace...
    </div>
  );

  const isRepoChallenge = task.submission_type === "github_repo";
  const templateRepo = task.recommended_platform;

  return (
    <motion.div className="min-h-screen bg-[var(--color-bg)] px-8 py-10">
      <header className="mb-10 text-center">
        <h1 className="heading-lg text-[var(--color-text)] mb-2">{task.title}</h1>
        <div className="flex items-center justify-center gap-3">
          <span className={`text-xs font-medium px-2 py-1 rounded-full border ${isLocked ? "bg-green-100 text-green-700 border-green-200" : "bg-yellow-100 text-yellow-700 border-yellow-200"}`}>
            {isLocked ? "✅ Submitted" : "🚧 In Progress"}
          </span>
          {isRepoChallenge && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700">
              <Github size={12} /> Code Challenge
            </span>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* LEFT PANEL: Brief */}
        <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-card)] shadow-[var(--shadow-soft)] p-6 h-fit space-y-5">
          <h2 className="heading-md text-[var(--color-text)] mb-3">📋 Task Brief</h2>

          {isRepoChallenge && templateRepo && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg">
              <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-2 flex items-center gap-2">
                <GitFork size={16} /> Start Here
              </h3>
              <p className="text-sm text-blue-600/80 dark:text-blue-300/80 mb-3 leading-relaxed">
                This is a code challenge. Fork the repository below to get the starter code and tests.
              </p>
              <a
                href={templateRepo}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition shadow-sm"
              >
                <Github size={16} /> Open Template Repo
              </a>
            </div>
          )}

          <div className="text-sm text-[var(--color-text-muted)] leading-relaxed whitespace-pre-line bg-[var(--color-bg)] p-4 rounded-[var(--radius-button)] border border-[var(--color-border)]">
            {task.description || "No description provided."}
          </div>

          <ul className="text-sm text-[var(--color-text-muted)] space-y-3 pt-2">
            <li className="flex items-center gap-2"><Clock size={14} className="opacity-70" /> <strong>Time:</strong> {task.expected_time || "Flexible"}</li>
            <li className="flex items-center gap-2"><Brain size={14} className="opacity-70" /> <strong>AI Tools:</strong> {task.ai_tools_allowed ? "Allowed ✅" : "No ❌"}</li>
          </ul>
        </section>

        {/* RIGHT PANEL: Submission */}
        <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-card)] shadow-[var(--shadow-soft)] p-6 h-fit">
          <h2 className="heading-md text-[var(--color-text)] mb-4">
            {isLocked ? "Submission Details" : "🚀 Submit Proof"}
          </h2>

          {!isRepoChallenge && (
            <div className="flex border-b border-[var(--color-border)] mb-5">
              {[
                { id: "link", label: "Link", icon: LinkIcon },
                { id: "file", label: "File", icon: Upload },
                { id: "text", label: "Text", icon: AlignLeft },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => !isLocked && setInputMode(tab.id as any)}
                  disabled={isLocked && inputMode !== tab.id}
                  className={`flex-1 pb-2 text-sm font-medium transition flex justify-center gap-2 ${inputMode === tab.id
                    ? "text-[var(--color-candidate)] border-b-2 border-[var(--color-candidate)]"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text)] disabled:opacity-30"
                    }`}
                >
                  <tab.icon size={14} /> {tab.label}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            {inputMode === "link" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-[var(--color-text)]">
                    {isRepoChallenge ? "Your Repository URL" : "Submission Link (GitHub, Figma, Doc)"}
                  </label>
                  <div className="relative">
                    {isRepoChallenge ? <Github size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" /> : <LinkIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />}
                    <input
                      type="url"
                      value={link}
                      disabled={isLocked}
                      onChange={(e) => setLink(e.target.value)}
                      placeholder={isRepoChallenge ? "https://github.com/my-username/my-solution" : "https://..."}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] rounded-[var(--radius-button)] focus:ring-2 focus:ring-[var(--color-candidate-light)] disabled:opacity-60"
                    />
                  </div>
                </div>

                {!isLocked && (
                  <div className="p-4 bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800 rounded-xl transition-all hover:shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="p-1.5 bg-indigo-100 dark:bg-indigo-800 rounded-md text-indigo-600 dark:text-indigo-300">
                        <Video size={16} />
                      </span>
                      <label className="block text-sm font-semibold text-indigo-900 dark:text-indigo-100">
                        Video Walkthrough (Recommended)
                      </label>
                    </div>
                    <p className="text-xs text-indigo-700 dark:text-indigo-300 mb-3 leading-snug">
                      Stand out by recording a quick Loom or YouTube video explaining your work.
                    </p>
                    <input
                      type="url"
                      value={videoLink}
                      onChange={(e) => setVideoLink(e.target.value)}
                      placeholder="https://loom.com/share/..."
                      className="w-full px-3 py-2 text-sm border border-indigo-200 dark:border-indigo-700 bg-white dark:bg-black/20 text-[var(--color-text)] rounded-[var(--radius-button)] focus:ring-2 focus:ring-indigo-400 placeholder:text-indigo-300/60"
                    />
                  </div>
                )}
              </div>
            )}

            {inputMode === "file" && (
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--color-text)]">Upload File</label>
                {existingFileUrl ? (
                  <a href={existingFileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 border border-[var(--color-border)] rounded-[var(--radius-button)] bg-[var(--color-bg)] hover:bg-[var(--color-bg-hover)] transition">
                    <FileText size={20} className="text-[var(--color-candidate)]" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--color-text)] truncate">Uploaded Submission</p>
                    </div>
                    <Download size={16} className="text-[var(--color-text-muted)]" />
                  </a>
                ) : (
                  <div
                    onClick={() => !isLocked && fileInputRef.current?.click()}
                    className={`flex flex-col items-center justify-center border border-[var(--color-border)] border-dashed bg-[var(--color-bg)] rounded-[var(--radius-button)] px-3 py-8 transition ${isLocked ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-[var(--color-bg-hover)]"}`}
                  >
                    <Upload size={24} className="text-[var(--color-candidate)] mb-2" />
                    <span className="text-sm font-medium text-[var(--color-text)]">{file ? file.name : "Click to upload"}</span>
                    <input ref={fileInputRef} type="file" disabled={isLocked} className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                  </div>
                )}
              </div>
            )}

            {inputMode === "text" && (
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--color-text)]">Response</label>
                <textarea
                  rows={8}
                  value={textSubmission}
                  disabled={isLocked}
                  onChange={(e) => setTextSubmission(e.target.value)}
                  className="w-full border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] rounded-[var(--radius-button)] px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-candidate-light)]"
                />
              </div>
            )}

            {inputMode !== "text" && (
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--color-text)]">Reflection / Notes</label>
                <textarea
                  rows={4}
                  value={reflection}
                  disabled={isLocked}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder="Any challenges you faced?"
                  className="w-full border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] rounded-[var(--radius-button)] px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-candidate-light)] disabled:opacity-60"
                />
              </div>
            )}

            {/* Actions */}
            {!isLocked ? (
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={submitting || savingDraft}
                  className="flex-1 py-2.5 rounded-[var(--radius-button)] border border-[var(--color-border)] text-[var(--color-text-muted)] font-medium hover:bg-[var(--color-bg-hover)] transition flex items-center justify-center gap-2"
                >
                  {savingDraft ? <Loader2 size={16} className="animate-spin" /> : "Save Draft"}
                </button>
                <button
                  type="submit"
                  disabled={submitting || savingDraft}
                  className="flex-[2] py-2.5 rounded-[var(--radius-button)] bg-[var(--color-candidate)] text-white font-medium hover:bg-[var(--color-candidate-dark)] transition disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                  Submit Proof
                </button>
              </div>
            ) : (
              <div className="p-3 bg-green-100 text-green-700 text-center rounded-lg text-sm font-medium">
                Submission Received
              </div>
            )}
          </form>
        </section>
      </div>
    </motion.div>
  );
}