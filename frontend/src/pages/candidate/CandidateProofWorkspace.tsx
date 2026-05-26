import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  getProofTaskDetails,
  startProof,
  completeProof,
  saveDraft,
  checkSubmissionStatus,
  submitFollowUpAnswers,
} from "@/lib/api/submissions";
import {
  Loader2, Clock, Upload, Link as LinkIcon,
  Github, Video,
  Terminal, Play, Maximize2, Minimize2,
  FileText, Layout, Save, X, AlertCircle, Brain
} from "lucide-react";
import type { ProofTask } from "@/types/shared";
import ReactMarkdown from 'react-markdown';
import DOMPurify from 'dompurify';
import { Button } from "@/components/ui/Button";
import MarkdownEditorIDE from "@/components/common/MarkdownEditorIDE";
import SuccessCelebration from "@/components/common/SuccessCelebration";

// -- IDE Components -----------------------------------------

interface IDETabProps {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ size?: number }>;
  label: string;
}

const IDETab = ({ active, onClick, icon: Icon, label }: IDETabProps) => (
  <button
    onClick={onClick}
    className={`
      flex items-center gap-2 px-4 py-2 text-sm font-medium border-t-2 transition-colors
      ${active
        ? "border-[var(--color-brand-primary)] bg-[var(--color-bg)] text-[var(--color-text)]"
        : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]"
      }
    `}
  >
    <Icon size={14} />
    {label}
  </button>
);

export default function CandidateProofWorkspace() {
  const { id: proof_task_id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [task, setTask] = useState<ProofTask | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"code" | "preview" | "submission" | "reasoning">("submission");
  const [consoleOpen, setConsoleOpen] = useState(true);

  // Form State
  const [link, setLink] = useState("");
  const [videoLink, setVideoLink] = useState("");
  const [textSubmission, setTextSubmission] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [reasoningTrace, setReasoningTrace] = useState({ tradeoff: "", considered: "", uncertainty: "" });
  const [existingFileUrl, setExistingFileUrl] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);

  // Draft State
  const [draftStatus, setDraftStatus] = useState<"saved" | "saving" | "unsaved">("unsaved");

  // Submission Modal State
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Screening Q&A state
  const [screeningAnswers, setScreeningAnswers] = useState<string[]>([]);

  // Follow-up Q&A state
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [followUpAnswers, setFollowUpAnswers] = useState<string[]>([]);
  const [submittingFollowUp, setSubmittingFollowUp] = useState(false);

  useEffect(() => {
    if (!proof_task_id) return;
    const init = async () => {
      setLoading(true);
      try {
        const taskData = await getProofTaskDetails(proof_task_id);
        if (!taskData) throw new Error("Task not found");
        setTask(taskData);
        if (taskData.screening_questions && taskData.screening_questions.length > 0) {
          setScreeningAnswers(taskData.screening_questions.map(() => ""));
        }

        if (taskData.job_id) {
          const sid = await startProof(taskData.job_id, taskData.id);
          if (sid) setSubmissionId(sid);
          const existing = await checkSubmissionStatus(taskData.job_id);
          if (existing) {
            setLink(existing.submission_link || "");
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const rt = (existing as any).reasoning_trace;
            if (rt) setReasoningTrace(rt);
            if (existing.submission_link && existing.submission_link.includes("supabase")) {
              setExistingFileUrl(existing.submission_link);
            }
            if (["submitted", "reviewed", "hired", "rejected"].includes(existing.status || "")) {
              setIsLocked(true);
            }
          }
        }
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed to load task");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [proof_task_id]);

  const handleSaveDraft = useCallback(async () => {
    if (!task?.job_id || isLocked) return;
    setDraftStatus("saving");
    try {
      await saveDraft({
        job_id: task.job_id,
        submission_link: link,
        reasoning_trace: reasoningTrace,
      });
      setDraftStatus("saved");
      setTimeout(() => setDraftStatus("unsaved"), 3000);
    } catch {
      setDraftStatus("unsaved");
      toast.error("Failed to save draft");
    }
  }, [task?.job_id, link, reasoningTrace, isLocked]);

  async function handleSubmit() {
    if (isLocked || !task?.job_id) return;

    if (!reasoningTrace.tradeoff.trim() || !reasoningTrace.considered.trim() || !reasoningTrace.uncertainty.trim()) {
      toast.error("Complete the Reasoning tab before submitting.");
      setActiveTab("reasoning");
      return;
    }

    setSubmitting(true);
    toast.loading("Deploying proof...", { id: "submit" });
    try {
      const screeningQs = task.screening_questions?.filter(Boolean) ?? [];
      const builtScreeningAnswers = screeningQs.length > 0
        ? screeningQs.map((q, i) => ({ question: q, answer: screeningAnswers[i] ?? "" }))
        : undefined;

      const result = await completeProof({
        job_id: task.job_id,
        submission_link: link || undefined,
        text_response: textSubmission || undefined,
        reasoning_trace: reasoningTrace,
        video_url: videoLink || undefined,
        file: file || undefined,
        screening_answers: builtScreeningAnswers,
      });
      if (result?.id) setSubmissionId(result.id);
      toast.success("Proof Deployed Successfully", { id: "submit" });

      const questions = task.follow_up_questions?.filter(Boolean) ?? [];
      if (questions.length > 0) {
        setFollowUpAnswers(questions.map(() => ""));
        setShowFollowUpModal(true);
      } else {
        setShowCelebration(true);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Submission failed", { id: "submit" });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmitFollowUp() {
    const questions = task?.follow_up_questions?.filter(Boolean) ?? [];
    if (!submissionId || questions.length === 0) {
      setShowFollowUpModal(false);
      setShowCelebration(true);
      return;
    }
    setSubmittingFollowUp(true);
    try {
      const answers = questions.map((q, i) => ({
        question: q,
        answer: followUpAnswers[i] ?? "",
      }));
      await submitFollowUpAnswers(submissionId, answers);
      setShowFollowUpModal(false);
      setShowCelebration(true);
    } catch {
      toast.error("Failed to save answers. You can skip for now.");
      setShowFollowUpModal(false);
      setShowCelebration(true);
    } finally {
      setSubmittingFollowUp(false);
    }
  }

  function countWords(text: string): number {
    return text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
  }

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#1e1e1e] text-slate-400">
      <Loader2 className="animate-spin mb-4" size={32} />
      <p className="font-mono text-sm">Initializing Environment...</p>
    </div>
  );

  if (!task) return null;

  return (
    <>
    <div className="h-screen flex flex-col bg-[#1e1e1e] text-slate-300 font-sans overflow-hidden">

      {/* ── IDE Header ────────────────────────────────────────── */}
      <header className="h-14 bg-[#252526] border-b border-[#3e3e42] flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white font-bold">B</div>
          <div>
            <h1 className="text-sm font-medium text-white leading-tight">{task.title}</h1>
            <div className="flex items-center gap-2 text-[10px] text-slate-400">
              <Clock size={10} />
              <span>{task.expected_time || "45m"}</span>
              <span className="w-1 h-1 rounded-full bg-slate-500" />
              <span>{isLocked ? "Read Only" : "Workspace Active"}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 font-mono hidden md:inline-block">
            {draftStatus === 'saving' ? 'Saving...' : draftStatus === 'saved' ? 'Saved' : 'Unsaved changes'}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="h-8 bg-[#3e3e42] border-transparent text-white hover:bg-[#4e4e52] hover:text-white"
            onClick={handleSaveDraft}
            disabled={isLocked || draftStatus === 'saving'}
            leftIcon={<Save size={14} />}
          >
            Save Draft
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 bg-[#3e3e42] border-transparent text-white hover:bg-[#4e4e52] hover:text-white"
            onClick={() => navigate("/candidate/dashboard")}
          >
            Exit
          </Button>
          <Button
            size="sm"
            className="h-8 bg-green-600 hover:bg-green-700 text-white border-none shadow-none"
            onClick={() => setShowConfirmModal(true)}
            disabled={isLocked || submitting}
            leftIcon={submitting ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
          >
            Submit Proof
          </Button>
        </div>
      </header>

      {/* ── Main Workspace (Split Pane) ────────────────────── */}
      <div className="flex-1 flex overflow-hidden">

        {/* LEFT PANE: Task Description */}
        <div className="w-1/3 min-w-[320px] max-w-[600px] border-r border-[#3e3e42] flex flex-col bg-[#1e1e1e]">
          <div className="h-9 flex items-center justify-between px-4 bg-[#252526] border-b border-[#3e3e42]">
            <div className="flex items-center gap-1.5 text-xs">
              <FileText size={12} className="text-slate-500" />
              <span className="font-medium text-slate-300">TASK.md</span>
            </div>
            <span className="text-[10px] text-slate-600 font-mono">read-only</span>
          </div>
          <div className="flex-1 overflow-y-auto p-6 prose prose-invert prose-sm max-w-none
            prose-p:text-slate-300 prose-p:leading-7 prose-p:mb-3
            prose-strong:text-slate-100 prose-strong:font-semibold
            prose-ul:my-3 prose-ul:pl-5 prose-li:text-slate-300 prose-li:mb-1
            prose-code:text-orange-400 prose-code:bg-[#2d2d30] prose-code:px-1 prose-code:py-0.5 prose-code:rounded
            prose-headings:text-slate-200">
            <p className="text-[10px] font-mono uppercase tracking-widest text-slate-600 mb-4 not-prose">task description</p>
            <ReactMarkdown>{DOMPurify.sanitize(task.description || "*No description provided.*")}</ReactMarkdown>

            {Array.isArray(task.rubric_criteria) && task.rubric_criteria.length > 0 && (
              <div className="mt-8 pt-8 border-t border-[#3e3e42] not-prose">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Scoring Contract
                  </h4>
                  <span className="text-[10px] uppercase tracking-wider text-slate-500">
                    {task.rubric_locked_at ? "Locked" : "Set by employer"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  The employer will score your submission against these criteria. Weights show how much each one contributes.
                </p>
                <ul className="space-y-2">
                  {task.rubric_criteria.map((c) => (
                    <li
                      key={c.name}
                      className="flex items-start gap-3 bg-[#252526] border border-[#3e3e42] rounded px-3 py-2"
                    >
                      <span className="shrink-0 inline-flex items-center justify-center min-w-[40px] h-6 px-2 rounded bg-orange-500/10 text-orange-400 text-[11px] font-bold">
                        {c.weight}%
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-slate-200">{c.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{c.description}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-8 pt-8 border-t border-[#3e3e42]">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Constraints</h4>
              <div className="flex gap-2 flex-wrap">
                <div className="text-xs px-2 py-1 rounded border border-blue-900 bg-blue-900/20 text-blue-400">
                  Format: {task.submission_type}
                </div>
                {task.expected_time && (
                  <div className="text-xs px-2 py-1 rounded border border-slate-700 bg-slate-800/40 text-slate-400">
                    Est. {task.expected_time}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANE: Editor / Submission */}
        <div className="flex-1 flex flex-col bg-[#1e1e1e]">

          {/* Tabs */}
          <div className="h-9 flex bg-[#252526] border-b border-[#3e3e42]">
            <IDETab
              active={activeTab === 'submission'}
              onClick={() => setActiveTab('submission')}
              icon={Layout}
              label="Details"
            />
            {task.submission_type !== 'file' && (
              <IDETab
                active={activeTab === 'code'}
                onClick={() => setActiveTab('code')}
                icon={FileText}
                label="Your Response"
              />
            )}
            <IDETab
              active={activeTab === 'preview'}
              onClick={() => setActiveTab('preview')}
              icon={Video}
              label="Media"
            />
            <button
              onClick={() => setActiveTab('reasoning')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-t-2 transition-colors ${
                activeTab === 'reasoning'
                  ? "border-amber-400 bg-[var(--color-bg)] text-amber-400"
                  : "border-transparent text-slate-500 hover:text-slate-200 hover:bg-[#2d2d30]"
              }`}
            >
              <Brain size={14} />
              Reasoning
              {(!reasoningTrace.tradeoff.trim() || !reasoningTrace.considered.trim() || !reasoningTrace.uncertainty.trim()) && !isLocked && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 ml-0.5" />
              )}
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6 relative">

            {activeTab === 'submission' && (
              <div className="max-w-2xl mx-auto space-y-6">

                {/* Screening Questions */}
                {task.screening_questions && task.screening_questions.filter(Boolean).length > 0 && (
                  <div className="p-4 rounded-lg bg-[#252526] border border-[#3e3e42] space-y-4">
                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider block">
                      Screening Questions
                    </label>
                    <p className="text-xs text-slate-500">Answer these before submitting. Be specific — the employer reads these before reviewing your proof.</p>
                    {task.screening_questions.filter(Boolean).map((q, i) => (
                      <div key={i}>
                        <label className="text-xs text-slate-300 mb-1.5 block">{i + 1}. {q}</label>
                        <textarea
                          className="w-full bg-[#1e1e1e] border border-[#3e3e42] rounded px-3 py-2 text-sm text-slate-200 focus:border-blue-500 outline-none resize-none transition-colors"
                          rows={3}
                          placeholder="Your answer..."
                          value={screeningAnswers[i] ?? ""}
                          onChange={(e) => {
                            const next = [...screeningAnswers];
                            next[i] = e.target.value;
                            setScreeningAnswers(next);
                          }}
                          disabled={isLocked}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Link Input */}
                <div className="p-4 rounded-lg bg-[#252526] border border-[#3e3e42]">
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 block">
                    {task.submission_type === 'github_repo' ? 'Repository URL' : 'Project Link'}
                  </label>
                  <div className="flex gap-2">
                    <div className="h-10 w-10 rounded bg-[#333333] flex items-center justify-center text-slate-500">
                      {task.submission_type === 'github_repo' ? <Github size={18} /> : <LinkIcon size={18} />}
                    </div>
                    <input
                      type="url"
                      placeholder="https://..."
                      className="flex-1 bg-[#1e1e1e] border border-[#3e3e42] rounded px-3 text-sm text-slate-200 focus:border-blue-500 outline-none transition-colors font-mono"
                      value={link}
                      onChange={(e) => setLink(e.target.value)}
                      disabled={isLocked}
                    />
                  </div>
                </div>

                {/* File Upload (if applicable) */}
                {(task.submission_type === 'file' || task.submission_type === 'link') && (
                  <div className="p-4 rounded-lg bg-[#252526] border border-[#3e3e42]">
                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 block">
                      Artifact Upload
                    </label>
                    <div
                      onClick={() => !isLocked && fileInputRef.current?.click()}
                      className={`border-2 border-dashed border-[#3e3e42] rounded-lg p-8 flex flex-col items-center justify-center text-center transition-colors ${!isLocked ? 'hover:border-slate-500 hover:bg-[#2d2d30] cursor-pointer' : ''}`}
                    >
                      <Upload size={24} className="text-slate-500 mb-2" />
                      <span className="text-sm font-medium text-slate-300">
                        {file ? file.name : existingFileUrl ? "Update Submitted File" : "Drag file here or click to browse"}
                      </span>
                      <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} disabled={isLocked} />
                    </div>
                  </div>
                )}

              </div>
            )}

            {activeTab === 'code' && (
              <div className="h-full flex flex-col">
                <MarkdownEditorIDE
                  value={textSubmission}
                  onChange={setTextSubmission}
                  disabled={isLocked}
                  placeholder="Write your solution, explanation, or approach here…"
                  className="flex-1"
                  minHeight="100%"
                />
              </div>
            )}

            {activeTab === 'preview' && (
              <div className="max-w-xl mx-auto mt-10 text-center">
                <div className="w-16 h-16 rounded-full bg-[#252526] flex items-center justify-center mx-auto mb-4 text-slate-500">
                  <Video size={32} />
                </div>
                <h3 className="text-lg font-medium text-slate-200 mb-2">Video Walkthrough</h3>
                <p className="text-slate-500 mb-6 text-sm">Attach a Loom or YouTube link to verify your work visually.</p>

                <input
                  type="url"
                  placeholder="https://loom.com/... or https://youtube.com/..."
                  className="w-full bg-[#252526] border border-[#3e3e42] rounded px-4 py-2 text-sm text-slate-200 focus:border-blue-500 outline-none mb-4"
                  value={videoLink}
                  onChange={(e) => setVideoLink(e.target.value)}
                  disabled={isLocked}
                />
              </div>
            )}

            {activeTab === 'reasoning' && (
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="p-4 rounded-lg bg-[#252526] border border-amber-400/20">
                  <p className="text-xs text-amber-400/80 leading-relaxed">
                    Required before submitting. These three questions help employers evaluate your judgment — not just your output. Answer honestly in 1–3 sentences each.
                  </p>
                </div>

                {[
                  {
                    key: "tradeoff" as const,
                    label: "What was the most important decision you made in this task?",
                    hint: "2–3 sentences",
                    placeholder: "e.g. I chose to prioritise X over Y because the brief emphasised Z…",
                  },
                  {
                    key: "considered" as const,
                    label: "What did you consider and rule out?",
                    hint: "2–3 sentences",
                    placeholder: "e.g. I considered doing Z but ruled it out because it would have…",
                  },
                  {
                    key: "uncertainty" as const,
                    label: "What are you least confident about in your submission?",
                    hint: "1–2 sentences",
                    placeholder: "e.g. I'm uncertain whether my approach to X scales well when…",
                  },
                ].map(({ key, label, hint, placeholder }) => (
                  <div key={key} className="p-4 rounded-lg bg-[#252526] border border-[#3e3e42] space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <label className="text-sm font-medium text-slate-200 leading-snug">{label}</label>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider shrink-0 mt-0.5">{hint}</span>
                    </div>
                    <textarea
                      className="w-full bg-[#1e1e1e] border border-[#3e3e42] rounded px-3 py-2 text-sm text-slate-200 focus:border-amber-400/60 outline-none resize-none transition-colors"
                      rows={3}
                      placeholder={placeholder}
                      value={reasoningTrace[key]}
                      onChange={(e) => setReasoningTrace((prev) => ({ ...prev, [key]: e.target.value }))}
                      disabled={isLocked}
                    />
                  </div>
                ))}

                <p className="text-xs text-slate-600 text-right">
                  {countWords(reasoningTrace.tradeoff + " " + reasoningTrace.considered + " " + reasoningTrace.uncertainty)} words
                  {" "}· aim for under 200
                </p>
              </div>
            )}

          </div>

          {/* Console / Terminal Panel */}
          <div className={`border-t border-[#3e3e42] bg-[#1e1e1e] flex flex-col transition-all duration-300 ${consoleOpen ? 'h-48' : 'h-9'}`}>
            <div
              onClick={() => setConsoleOpen(!consoleOpen)}
              className="h-9 px-4 flex items-center gap-2 bg-[#252526] text-xs font-medium text-slate-400 cursor-pointer hover:text-slate-200 select-none"
            >
              <Terminal size={12} />
              <span>TERMINAL</span>
              <span className="ml-auto flex gap-2">
                {consoleOpen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
              </span>
            </div>

            {consoleOpen && (
              <div className="flex-1 p-4 font-mono text-xs overflow-y-auto">
                <div className="text-slate-500">
                  $ Initializing environment... <br />
                  $ Repository cloned successfully.<br />
                  $ Waiting for user input...
                </div>
                {draftStatus === 'saved' && (
                  <div className="text-green-500 mt-1">
                    $ Draft snapshot saved at {new Date().toLocaleTimeString()}
                  </div>
                )}
                {submitting && (
                  <div className="text-yellow-500 mt-1 animate-pulse">
                    $ Running verification tests...
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
      {/* ── Confirmation Modal ────────────────────────────── */}
      {showConfirmModal && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#252526] border border-[#3e3e42] rounded-lg shadow-2xl animate-in fade-in zoom-in-95 duration-200">

            <div className="flex items-center justify-between p-4 border-b border-[#3e3e42]">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <AlertCircle className="text-blue-400" size={20} />
                Confirm Submission
              </h3>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="text-slate-500 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <p className="text-sm text-slate-300 leading-relaxed">
                You are about to submit your proof for <strong>{task.title}</strong>.
                Please ensure all your files and links are correct. This action cannot be undone.
              </p>

              <div className="bg-[#1e1e1e] p-4 rounded border border-[#3e3e42]">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex items-center mt-0.5">
                    <input
                      type="checkbox"
                      className="peer h-4 w-4 appearance-none rounded-sm border border-slate-500 bg-[#252526] checked:bg-blue-600 checked:border-blue-600 transition-all cursor-pointer"
                      checked={consentChecked}
                      onChange={(e) => setConsentChecked(e.target.checked)}
                    />
                    <svg className="absolute w-3 h-3 text-white hidden peer-checked:block pointer-events-none left-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors select-none">
                    I consent to my work being shared with <span className="text-slate-200 font-medium">{task.company_name || "the hiring company"}</span> for evaluation purposes only.
                  </span>
                </label>
              </div>

              {/* EU AI Act — transparency notice */}
              <div className="bg-blue-950/30 border border-blue-500/20 rounded p-3 flex items-start gap-2.5">
                <svg className="shrink-0 mt-0.5 text-blue-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                <p className="text-xs text-slate-400 leading-relaxed">
                  <span className="text-slate-300 font-medium">AI-assisted evaluation:</span> An AI tool may help your evaluator summarise feedback on this submission. All final decisions are made by a human reviewer at {task.company_name || "the hiring company"}. You may request human-only review by contacting <a href="mailto:bevislyapp@gmail.com" className="text-blue-400 hover:underline">bevislyapp@gmail.com</a>.
                </p>
              </div>
            </div>

            <div className="p-4 bg-[#1e1e1e] border-t border-[#3e3e42] flex justify-end gap-3 rounded-b-lg">
              <Button
                variant="outline"
                className="border-[#3e3e42] text-slate-300 hover:text-white hover:bg-[#3e3e42]"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </Button>
              <Button
                className={`
                  ${consentChecked ? 'bg-green-600 hover:bg-green-700' : 'bg-slate-700 cursor-not-allowed opacity-50'}
                  text-white border-none
                `}
                onClick={() => {
                  if (consentChecked) {
                    setShowConfirmModal(false);
                    handleSubmit();
                  }
                }}
                disabled={!consentChecked || submitting}
              >
                Submit Proof
              </Button>
            </div>

          </div>
        </div>,
        document.body
      )}

    </div>

      {/* Follow-up Questions Modal */}
      {showFollowUpModal && task?.follow_up_questions && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-[#252526] border border-[#3e3e42] rounded-lg shadow-2xl animate-in fade-in zoom-in-95 duration-200 my-auto">
            <div className="flex items-center justify-between p-4 border-b border-[#3e3e42]">
              <div>
                <h3 className="text-base font-semibold text-white">Step 2: Follow-up Questions</h3>
                <p className="text-xs text-slate-400 mt-0.5">Answer in your own words. 150 words max each. AI wrote the work — only you know why.</p>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {task.follow_up_questions.filter(Boolean).map((question, idx) => {
                const words = countWords(followUpAnswers[idx] ?? "");
                const overLimit = words > 150;
                return (
                  <div key={idx}>
                    <label className="block text-sm font-medium text-slate-200 mb-2">
                      {idx + 1}. {question}
                    </label>
                    <textarea
                      className={`w-full bg-[#1e1e1e] border rounded px-3 py-2 text-sm text-slate-200 focus:outline-none resize-none transition-colors ${overLimit ? "border-red-500 focus:border-red-500" : "border-[#3e3e42] focus:border-blue-500"}`}
                      rows={4}
                      placeholder="Write your answer here..."
                      value={followUpAnswers[idx] ?? ""}
                      onChange={(e) => {
                        const next = [...followUpAnswers];
                        next[idx] = e.target.value;
                        setFollowUpAnswers(next);
                      }}
                    />
                    <p className={`text-xs mt-1 text-right ${overLimit ? "text-red-400" : "text-slate-500"}`}>
                      {words} / 150 words
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="p-4 bg-[#1e1e1e] border-t border-[#3e3e42] flex justify-between items-center rounded-b-lg gap-3">
              <button
                onClick={() => {
                  setShowFollowUpModal(false);
                  setShowCelebration(true);
                }}
                className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
              >
                Skip for now
              </button>
              <Button
                className={`bg-green-600 hover:bg-green-700 text-white border-none ${task.follow_up_questions.filter(Boolean).some((_, i) => countWords(followUpAnswers[i] ?? "") > 150) ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={handleSubmitFollowUp}
                disabled={submittingFollowUp || task.follow_up_questions.filter(Boolean).some((_, i) => countWords(followUpAnswers[i] ?? "") > 150)}
                leftIcon={submittingFollowUp ? <Loader2 size={14} className="animate-spin" /> : undefined}
              >
                Submit Answers
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Success Celebration */}
      <SuccessCelebration
        isVisible={showCelebration}
        onDismiss={() => {
          setShowCelebration(false);
          navigate("/candidate/dashboard");
        }}
        variant="proof-submitted"
        actionLabel="Back to Dashboard"
        onAction={() => navigate("/candidate/dashboard")}
      />
    </>
  );
}