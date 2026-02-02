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
  Loader2, Clock, Upload, Link as LinkIcon,
  Github, Video,
  Terminal, Play, Maximize2, Minimize2,
  Code2, Layout, Save, X, AlertCircle
} from "lucide-react";
import type { ProofTask } from "@/types/shared";
import ReactMarkdown from 'react-markdown';
import { Button } from "@/components/ui/Button";

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
  const [activeTab, setActiveTab] = useState<"code" | "preview" | "submission">("submission");
  const [consoleOpen, setConsoleOpen] = useState(true);

  // Form State
  const [link, setLink] = useState("");
  const [videoLink, setVideoLink] = useState("");
  const [textSubmission, setTextSubmission] = useState("");
  const [reflection, setReflection] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [existingFileUrl, setExistingFileUrl] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);

  // Draft State
  const [draftStatus, setDraftStatus] = useState<"saved" | "saving" | "unsaved">("unsaved");

  // Submission Modal State
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);

  useEffect(() => {
    if (!proof_task_id) return;
    const init = async () => {
      setLoading(true);
      try {
        const taskData = await getProofTaskDetails(proof_task_id);
        if (!taskData) throw new Error("Task not found");
        setTask(taskData);

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
        reflection,
      });
      setDraftStatus("saved");
      setTimeout(() => setDraftStatus("unsaved"), 3000);
    } catch {
      setDraftStatus("unsaved");
      toast.error("Failed to save draft");
    }
  }, [task?.job_id, link, reflection, isLocked]);

  async function handleSubmit() {
    if (isLocked || !task?.job_id) return;
    setSubmitting(true);
    toast.loading("Deploying proof...", { id: "submit" });
    try {
      await completeProof({
        job_id: task.job_id,
        submission_link: link || undefined,
        text_response: textSubmission || undefined,
        reflection: reflection,
        video_url: videoLink || undefined,
        file: file || undefined,
      });
      toast.success("Proof Deployed Successfully", { id: "submit" });
      navigate("/candidate/dashboard");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Submission failed", { id: "submit" });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#1e1e1e] text-slate-400">
      <Loader2 className="animate-spin mb-4" size={32} />
      <p className="font-mono text-sm">Initializing Environment...</p>
    </div>
  );

  if (!task) return null;

  return (
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
          <div className="h-9 flex items-center px-4 bg-[#252526] border-b border-[#3e3e42] text-xs font-medium text-slate-400">
            TASK.md
          </div>
          <div className="flex-1 overflow-y-auto p-6 prose prose-invert prose-sm max-w-none prose-headings:text-slate-200 prose-p:text-slate-400 prose-code:text-orange-400 prose-code:bg-[#2d2d30] prose-code:px-1 prose-code:py-0.5 prose-code:rounded">
            <ReactMarkdown>{task.description || "*No description provided.*"}</ReactMarkdown>

            <div className="mt-8 pt-8 border-t border-[#3e3e42]">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Constraints</h4>
              <div className="flex gap-2 flex-wrap">
                <div className={`text-xs px-2 py-1 rounded border ${task.ai_tools_allowed ? 'border-green-900 bg-green-900/20 text-green-400' : 'border-red-900 bg-red-900/20 text-red-400'}`}>
                  {task.ai_tools_allowed ? "AI Types: Allowed" : "No AI Tools"}
                </div>
                <div className="text-xs px-2 py-1 rounded border border-blue-900 bg-blue-900/20 text-blue-400">
                  Format: {task.submission_type}
                </div>
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
              label="Submission Config"
            />
            {task.submission_type !== 'file' && (
              <IDETab
                active={activeTab === 'code'}
                onClick={() => setActiveTab('code')}
                icon={Code2}
                label="Response Editor"
              />
            )}
            <IDETab
              active={activeTab === 'preview'}
              onClick={() => setActiveTab('preview')}
              icon={Video}
              label="Preview / Media"
            />
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6 relative">

            {activeTab === 'submission' && (
              <div className="max-w-2xl mx-auto space-y-6">

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

                {/* Reflection */}
                <div>
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 block">
                    Implementation Notes / Reflection
                  </label>
                  <textarea
                    className="w-full h-32 bg-[#252526] border border-[#3e3e42] rounded p-3 text-sm text-slate-300 focus:border-blue-500 outline-none resize-none font-mono"
                    placeholder="// Describe your approach, trade-offs, and design decisions..."
                    value={reflection}
                    onChange={(e) => setReflection(e.target.value)}
                    disabled={isLocked}
                  />
                </div>
              </div>
            )}

            {activeTab === 'code' && (
              <div className="h-full flex flex-col">
                <textarea
                  className="flex-1 bg-[#1e1e1e] border-none outline-none text-slate-300 font-mono text-sm resize-none p-0 leading-relaxed"
                  placeholder="// Write your solution code or text response here..."
                  value={textSubmission}
                  onChange={(e) => setTextSubmission(e.target.value)}
                  disabled={isLocked}
                  spellCheck={false}
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
                  placeholder="https://loom.com/..."
                  className="w-full bg-[#252526] border border-[#3e3e42] rounded px-4 py-2 text-sm text-slate-200 focus:border-blue-500 outline-none mb-4"
                  value={videoLink}
                  onChange={(e) => setVideoLink(e.target.value)}
                  disabled={isLocked}
                />
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
      {showConfirmModal && (
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
        </div>
      )}

    </div>
  );
}