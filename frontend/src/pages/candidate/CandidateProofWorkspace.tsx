import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { 
  getProofTaskDetails, 
  startProof, 
  completeProof, 
  checkSubmissionStatus 
} from "@/lib/api/submissions";
import { 
  Loader2, Clock, Package, Brain, CheckCircle2, 
  Upload, Paperclip, Download, Link as LinkIcon, 
  FileText, AlignLeft, Lock, Info 
} from "lucide-react";
import { motion } from "framer-motion";
import type { ProofTask } from "@/types/shared";

export default function CandidateProofWorkspace() {
  const { id: proof_task_id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [task, setTask] = useState<ProofTask | null>(null);
  
  
  // Form State
  const [link, setLink] = useState("");
  const [textSubmission, setTextSubmission] = useState(""); // For the "Text Entry" tab
const [reflection, setReflection] = useState(""); // For the "Reflection" box
  const [file, setFile] = useState<File | null>(null);
  
  // UI State
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [inputMode, setInputMode] = useState<"link" | "file" | "text">("link");
  
  // ✅ New: Lock state
  const [isLocked, setIsLocked] = useState(false);
  const [existingFileUrl, setExistingFileUrl] = useState<string | null>(null);

  // Helper: Credit Calc
  const calculateCredits = (timeStr?: string | null) => {
    if (!timeStr) return 5;
    const lower = timeStr.toLowerCase();
    if (lower.includes("hour") || lower.includes("hr")) return 10;
    if (lower.includes("30") || lower.includes("min")) return 5;
    return 5;
  };

  useEffect(() => {
    if (!proof_task_id) return;
    
    const init = async () => {
      setLoading(true);
      try {
        // 1. Load Task Details
        const taskData = await getProofTaskDetails(proof_task_id);
        if (!taskData) {
          toast.error("Task not found");
          return;
        }
        setTask(taskData);

        // Default mode based on task preference
        let mode: "link" | "file" | "text" = "link";
        if (taskData.submission_type === "file") mode = "file";
        else if (taskData.submission_type === "text") mode = "text";
        setInputMode(mode);

        // 2. Load Existing Submission (if any)
        if (taskData.job_id) {
          // Ensure DB record exists
          await startProof(taskData.job_id, taskData.id);
          
          // Fetch content
          const existing = await checkSubmissionStatus(taskData.job_id);
          if (existing) {
            setLink(existing.submission_link || "");
            setReflection(existing.reflection || "");
            
            // If previously submitted file, we can't preload the File object, but we can show the URL
            if (existing.submission_link && existing.submission_link.includes("supabase")) {
                setExistingFileUrl(existing.submission_link);
            }

            // Lock if submitted/reviewed
            if (["submitted", "reviewed", "hired", "rejected"].includes(existing.status || "")) {
              setIsLocked(true);
              // Force the view to match the data found
              if (existing.reflection && !existing.submission_link) setInputMode("text");
              else if (existing.submission_link?.includes("supabase")) setInputMode("file");
              else if (existing.submission_link) setInputMode("link");
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

async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isLocked) return;
    if (!task) return toast.error("Task not found.");

    // Validation: Ensure at least ONE thing is submitted
    const hasLink = link.trim().length > 0;
    const hasFile = !!file || !!existingFileUrl;
    const hasText = textSubmission.trim().length > 0;

    if (!hasLink && !hasFile && !hasText) {
        return toast.error("Please add a link, upload a file, or write a text response.");
    }

    setSubmitting(true);
    try {
      if (!task.job_id) throw new Error("Job ID missing");
      
      // ✅ Send ALL 3 types of data
      await completeProof({
        job_id: task.job_id,
        submission_link: link || undefined,
        text_response: textSubmission || undefined,
        reflection,
        file: file || undefined,
      });
      
      toast.success("🚀 Proof submitted!");
      navigate("/candidate/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
}

  if (loading || !task) return (
    <div className="flex justify-center items-center min-h-screen text-[var(--color-text-muted)]">
      <Loader2 className="animate-spin mr-2" size={18} /> Loading workspace...
    </div>
  );

  return (
    <motion.div className="min-h-screen bg-[var(--color-bg)] px-8 py-10">
      {/* 🏁 Header */}
      <header className="mb-10 text-center">
        <h1 className="heading-lg text-[var(--color-text)] mb-1">{task.title}</h1>
        <div className="flex items-center justify-center gap-3 mt-2">
           <p className="text-xs text-[var(--color-text-muted)]">
             Status: <span className={`font-medium ${isLocked ? "text-[var(--color-success)]" : "text-[var(--color-candidate-light)]"}`}>
               {isLocked ? "Submitted & Locked" : "In Progress"}
             </span>
           </p>
           <span className="text-xs font-semibold bg-[var(--color-surface)] border border-[var(--color-border)] px-2 py-0.5 rounded-full text-[var(--color-candidate-dark)]">
             🏆 Earn {calculateCredits(task.expected_time)} Credits
           </span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* LEFT PANEL: Instructions */}
        <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-card)] shadow-[var(--shadow-soft)] p-6 space-y-5 h-fit">
          <h2 className="heading-md text-[var(--color-text)] mb-3">📋 Instructions</h2>
          <ul className="text-sm text-[var(--color-text-muted)] space-y-3">
            <InfoRow icon={<Clock size={14} />} label="Expected Time" value={task.expected_time || "30 min"} />
            <InfoRow icon={<Package size={14} />} label="Format" value={task.submission_type || "Any"} />
            <InfoRow icon={<Brain size={14} />} label="AI Tools" value={task.ai_tools_allowed ? "Allowed" : "Not Allowed"} />
          </ul>
          <div className="pt-4 border-t border-[var(--color-border)]">
            <p className="font-medium text-[var(--color-text)] mb-2">Task Brief</p>
            <div className="text-sm text-[var(--color-text-muted)] leading-relaxed whitespace-pre-line bg-[var(--color-bg)] p-4 rounded-[var(--radius-button)] border border-[var(--color-border)]">
              {task.description || "No description provided."}
            </div>
          </div>
          {/* Attachments */}
          {task.attachments && task.attachments.length > 0 && (
            <div className="pt-4 border-t border-[var(--color-border)]">
              <p className="font-medium text-[var(--color-text)] mb-2 flex items-center gap-2">
                <Paperclip size={14} /> Task Assets
              </p>
              <div className="flex flex-col gap-2">
                {task.attachments.map((url, i) => {
                  const name = decodeURIComponent(url.split('/').pop() || `File ${i+1}`).replace(/^\d+-/, '');
                  return (
                    <a key={i} href={url} target="_blank" rel="noreferrer" className="flex items-center justify-between text-xs bg-[var(--color-bg)] border border-[var(--color-border)] px-3 py-2 rounded-[var(--radius-button)] hover:bg-[var(--color-bg-hover)] transition">
                      <div className="flex items-center gap-2">
                        <FileText size={14} className="text-[var(--color-employer)]"/>
                        <span className="truncate max-w-[250px]">{name}</span>
                      </div>
                      <Download size={14}/>
                    </a>
                  )
                })}
              </div>
            </div>
          )}
        </section>

        {/* RIGHT PANEL: Submission */}
        <motion.section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-card)] shadow-[var(--shadow-soft)] p-6 h-fit" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          
          <div className="flex items-center justify-between mb-4">
            <h2 className="heading-md text-[var(--color-text)]">
              {isLocked ? "✅ Submission Sent" : "🚀 Submit Your Proof"}
            </h2>
            {isLocked && <Lock size={20} className="text-[var(--color-text-muted)]" />}
          </div>

          {/* Tabs */}
          <div className="flex border-b border-[var(--color-border)] mb-5">
            {[
              { id: "link", label: "Link", icon: LinkIcon },
              { id: "file", label: "File", icon: Upload },
              { id: "text", label: "Text Entry", icon: AlignLeft },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => !isLocked && setInputMode(tab.id as any)}
                disabled={isLocked && inputMode !== tab.id} // Disable inactive tabs if locked
                className={`flex-1 pb-2 text-sm font-medium transition flex justify-center gap-2 ${
                  inputMode === tab.id
                    ? "text-[var(--color-candidate)] border-b-2 border-[var(--color-candidate)]"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text)] disabled:opacity-30"
                }`}
              >
                <tab.icon size={14} /> {tab.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* 🔗 Link Input */}
            {inputMode === "link" && (
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--color-text)]">Submission Link</label>
                <div className="relative">
                  <LinkIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                  <input
                    type="url"
                    value={link}
                    disabled={isLocked}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="https://..."
                    className="w-full pl-9 pr-3 py-2 text-sm border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] rounded-[var(--radius-button)] focus:ring-2 focus:ring-[var(--color-candidate-light)] disabled:opacity-60"
                  />
                </div>
              </div>
            )}

            {/* 🗂 File Upload */}
            {inputMode === "file" && (
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--color-text)]">Upload File</label>
                
                {/* If locked or existing file exists, show download link instead of dropzone */}
                {existingFileUrl ? (
                    <a href={existingFileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 border border-[var(--color-border)] rounded-[var(--radius-button)] bg-[var(--color-bg)] hover:bg-[var(--color-bg-hover)] transition">
                        <FileText size={20} className="text-[var(--color-candidate)]" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[var(--color-text)] truncate">Uploaded Submission</p>
                            <p className="text-xs text-[var(--color-text-muted)]">Click to view</p>
                            <input ref={fileInputRef} type="file" disabled={isLocked} className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                        </div>
                        <Download size={16} className="text-[var(--color-text-muted)]" />
                    </a>
                ) : (
                    <>
                    <div
                        onClick={() => !isLocked && fileInputRef.current?.click()}
                        className={`flex flex-col items-center justify-center border border-[var(--color-border)] border-dashed bg-[var(--color-bg)] rounded-[var(--radius-button)] px-3 py-8 transition ${isLocked ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-[var(--color-bg-hover)]"}`}
                    >
                        <Upload size={24} className="text-[var(--color-candidate)] mb-2" />
                        <span className="text-sm font-medium text-[var(--color-text)]">{file ? file.name : "Click to upload"}</span>
                        <input ref={fileInputRef} type="file" disabled={isLocked} className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                    </div>
                    <div className="flex items-start gap-2 mt-3 text-xs text-[var(--color-text-muted)] bg-[var(--color-surface)] p-2 rounded border border-[var(--color-border)]">
                        <Info size={14} className="shrink-0 mt-0.5" />
                        <p>
                            Note: Only one file can be uploaded. If you have multiple files, please compress them into a single <strong>.zip</strong> file.
                        </p>
                    </div>
                    </>
                )}
              </div>
            )}

            {/* 📝 Text Entry */}
            {inputMode === "text" && (
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--color-text)]">Your Response</label>
                <textarea
                  rows={12}
                  value={textSubmission}
                  disabled={isLocked}
                  onChange={(e) => setTextSubmission(e.target.value)}
                  placeholder="Type your response here..."
                  className="w-full border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] rounded-[var(--radius-button)] px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-candidate-light)] resize-y disabled:opacity-60"
                />
              </div>
            )}

            {/* ✍️ Reflection (Hidden in Text Mode) */}
            {inputMode !== "text" && (
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--color-text)]">Reflection / Notes</label>
                <textarea
                  rows={5}
                  value={reflection}
                  disabled={isLocked}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder="Briefly explain your work..."
                  className="w-full border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] rounded-[var(--radius-button)] px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-candidate-light)] resize-y disabled:opacity-60"
                />
              </div>
            )}

            {!isLocked ? (
                <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 rounded-[var(--radius-button)] bg-[var(--color-candidate)] text-white font-medium flex items-center justify-center gap-2 hover:bg-[var(--color-candidate-dark)] transition disabled:opacity-70"
                >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <><CheckCircle2 size={16} /> Submit Proof</>}
                </button>
            ) : (
                <div className="p-3 bg-[var(--color-success)]/10 border border-[var(--color-success)]/20 rounded-[var(--radius-button)] text-center text-sm text-[var(--color-success)] font-medium">
                    Proof Submitted Successfully
                </div>
            )}
          </form>
        </motion.section>
      </div>
    </motion.div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <li className="flex items-center gap-2">
      <span className="opacity-80 text-[var(--color-text-muted)]">{icon}</span>
      <span className="text-sm text-[var(--color-text)] font-medium">{label}:</span>
      <span className="text-sm text-[var(--color-text-muted)]">{value}</span>
    </li>
  );
}