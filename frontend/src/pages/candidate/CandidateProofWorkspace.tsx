/**
 * 🧠 CandidateProofWorkspace.tsx
 * Candidate view for completing and submitting proof tasks.
 */

import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  getProofTaskDetails,
  startProof,
  completeProof,
} from "@/lib/api/submissions";
import {
  Loader2,
  Clock,
  Package,
  Brain,
  CheckCircle2,
  Upload,
} from "lucide-react";
import { motion } from "framer-motion";
import type { ProofTask } from "@/types/shared";

export default function CandidateProofWorkspace() {
  const { id: proof_task_id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [task, setTask] = useState<ProofTask | null>(null);
  const [link, setLink] = useState("");
  const [reflection, setReflection] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  /* 🧠 Fetch task details */
  useEffect(() => {
    if (!proof_task_id) return;
    setLoading(true);
    getProofTaskDetails(proof_task_id)
      .then((res) => {
        if (!res) toast.error("Proof task not found");
        setTask(res ?? null);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [proof_task_id]);

  useEffect(() => {
    if (task?.job_id && task?.id) {
      startProof(task.job_id, task.id).catch(() => {});
    }
  }, [task]);

  /* 🚀 Handle submission */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!task) return toast.error("Task not found.");

    const format = task.submission_type || "link";

    if (format === "link" && !link.trim())
      return toast.error("Please include a valid submission link.");
    if (format === "file" && !file)
      return toast.error("Please attach your file.");

    setSubmitting(true);
    try {
      if (!task.job_id) {
        toast.error("Missing job reference. Please contact support.");
        return;
      }
      await completeProof({
        job_id: task.job_id,
        submission_link: link || undefined,
        reflection,
        file,
      });
      // await submitProof({
      //   job_id: task.job_id,
      //   submission_link: link || undefined,
      //   reflection,
      //   file,
      // });
      toast.success("🚀 Proof submitted successfully!");
      navigate("/candidate/dashboard");
    } catch (err: unknown) {
      if (err instanceof Error) toast.error(err.message);
      else toast.error("An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  }

  /* 🌀 Loading State */
  if (loading || !task)
    return (
      <div className="flex justify-center items-center min-h-screen text-[var(--color-text-muted)]">
        <Loader2 className="animate-spin mr-2" size={18} /> Loading proof task…
      </div>
    );

  /* 🧭 Dynamic Input based on submission_type */
  const renderSubmissionInput = () => {
    const format = task.submission_type || "link";

    return (
      <div>
        {/* 💡 Recommended platform hint */}
        {task.recommended_platform && (
          <p className="text-xs text-[var(--color-text-muted)] mb-3">
            💡 The employer recommends submitting this proof using{" "}
            <span className="font-medium text-[var(--color-text)]">
              {task.recommended_platform}
            </span>
            .
          </p>
        )}
        {/* {task.recommended_platform && (
          <p className="text-xs text-[var(--color-text-muted)] mb-2">
            💡 Recommended:{" "}
            <span className="font-medium text-[var(--color-text)]">
              {task.recommended_platform}
            </span>
          </p>
        )} */}

        {format === "file" ? (
          /* 🗂 File upload */
          <div>
            <label className="block text-sm font-medium mb-1 text-[var(--color-text)]">
              Upload File (PDF, Image, etc.)
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center border border-[var(--color-border)] border-dashed bg-[var(--color-bg)] rounded-[var(--radius-button)] px-3 py-6 cursor-pointer hover:bg-[var(--color-bg-hover)] transition"
            >
              <Upload
                size={20}
                className="text-[var(--color-text-muted)] mb-2"
              />
              <span className="text-sm text-[var(--color-text-muted)]">
                {file ? file.name : "Click to upload or drag a file here"}
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.png,.jpeg,.doc,.docx,.zip"
                className="hidden"
                onChange={(e) => {
                  const selected = e.target.files?.[0];
                  setFile(selected || null);
                  if (selected)
                    toast.success(`✅ ${selected.name} ready for upload`);
                }}
              />
            </div>
          </div>
        ) : format === "text" ? (
          /* ✍️ Text entry */
          <div>
            <label className="block text-sm font-medium mb-1 text-[var(--color-text)]">
              Write Your Proof
            </label>
            <textarea
              rows={6}
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="Write or paste your proof here..."
              className="w-full border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] rounded-[var(--radius-button)] px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-candidate-light)]"
            />
          </div>
        ) : format === "mixed" ? (
          /* 🧩 Mixed mode */
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-[var(--color-text)]">
                Proof Link
              </label>
              <input
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="Paste your proof link (GitHub, Figma, Notion, etc.)"
                className="w-full border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] rounded-[var(--radius-button)] px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-candidate-light)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-[var(--color-text)]">
                Upload File (optional)
              </label>
              <input
                ref={fileInputRef}
                type="file"
                className="w-full text-sm"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>
          </div>
        ) : (
          /* 🔗 Default link input */
          <div>
            <label className="block text-sm font-medium mb-1 text-[var(--color-text)]">
              Submission Link
            </label>
            <input
              type="url"
              required
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="Paste your submission link (e.g., Website, GitHub, Figma, Docs, etc.)"
              className="w-full border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] rounded-[var(--radius-button)] px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-candidate-light)]"
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <motion.div
      className="min-h-screen bg-[var(--color-bg)] px-8 py-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      {/* 🏁 Header */}
      <header className="mb-10 text-center">
        <h1 className="heading-lg text-[var(--color-text)] mb-1">
          {task.title}
        </h1>
        <p className="text-xs text-[var(--color-text-muted)] mt-2">
          Status:{" "}
          <span className="font-medium text-[var(--color-candidate-light)]">
            In Progress
          </span>
        </p>
        <p className="body-base text-[var(--color-text-muted)] max-w-2xl mx-auto">
          {task.description || "Complete the proof as described below."}
        </p>
      </header>

      {/* 🧩 Two-Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* --- Left Panel --- */}
        <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-card)] shadow-[var(--shadow-soft)] p-6 space-y-5">
          <h2 className="heading-md text-[var(--color-text)] mb-3">
            📋 Instructions
          </h2>

          <ul className="text-sm text-[var(--color-text-muted)] space-y-3">
            <InfoRow
              icon={<Clock size={14} />}
              label="Expected Time"
              value={task.expected_time || "30 min"}
            />
            <InfoRow
              icon={<Package size={14} />}
              label="Submission Type"
              value={task.submission_type || "Link"}
            />
            <InfoRow
              icon={<Brain size={14} />}
              label="AI Tools Allowed"
              value={
                task.ai_tools_allowed ? (
                  <span className="text-[var(--color-success)] font-medium">
                    Yes
                  </span>
                ) : (
                  <span className="text-[var(--color-error)] font-medium">
                    No
                  </span>
                )
              }
            />
          </ul>

          <div className="pt-3 border-t border-[var(--color-border)]">
            <p className="font-medium text-[var(--color-text)] mb-1">
              Task Brief
            </p>
            <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
              {task.description ||
                "Review the provided task details and submit your best proof."}
            </p>
          </div>
        </section>

        {/* --- Right Panel --- */}
        <motion.section
          className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-card)] shadow-[var(--shadow-soft)] p-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="heading-md mb-4 text-[var(--color-text)]">
            🚀 Submit Your Proof
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {renderSubmissionInput()}

            {/* ✏️ Reflection (optional for all non-text types) */}
            {task.submission_type !== "text" && (
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--color-text)]">
                  Reflection (optional)
                </label>
                <textarea
                  rows={4}
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder="Describe your approach, tools used, and challenges faced."
                  className="w-full border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] rounded-[var(--radius-button)] px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-candidate-light)]"
                />
              </div>
            )}

            {/* 🧾 Submit */}
            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-2.5 rounded-[var(--radius-button)] font-medium flex items-center justify-center gap-2 transition ${
                submitting
                  ? "bg-[var(--color-candidate-light)] text-white opacity-70 cursor-wait"
                  : "bg-[var(--color-candidate)] text-white hover:bg-[var(--color-candidate-dark)]"
              }`}
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Submitting…
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  Submit Proof
                </>
              )}
            </button>
          </form>
        </motion.section>
      </div>
    </motion.div>
  );
}

/* ─── Info Row ───────────────────────────── */
function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <li className="flex items-center gap-2">
      <span className="opacity-80 text-[var(--color-text-muted)]">{icon}</span>
      <span className="text-sm text-[var(--color-text)] font-medium">
        {label}:
      </span>
      <span className="text-sm text-[var(--color-text-muted)]">{value}</span>
    </li>
  );
}
