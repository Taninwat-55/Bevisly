// src/components/jobs/ProofTasksSection.tsx
import { useState } from "react";
import { Trash2, UploadCloud, Paperclip, Clock } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";
import type { ProofTask } from "@/types";
import MarkdownEditor from "@/components/ui/MarkdownEditor"; // ✅ Import

interface ProofTasksSectionProps {
  proofTasks: ProofTask[];
  onChange: (tasks: ProofTask[]) => void;
  errors?: string;
}

const TIME_TIERS = [
  { label: "Quick Task (~30 min)", minutes: 30, credits: 5 },
  { label: "Standard Task (~1 hour)", minutes: 60, credits: 10 },
  { label: "Extended Task (~2 hours)", minutes: 120, credits: 20 },
  { label: "Deep Work (~4 hours)", minutes: 240, credits: 40 },
];

export default function ProofTasksSection({
  proofTasks,
  onChange,
  errors,
}: ProofTasksSectionProps) {
  const [uploading, setUploading] = useState(false);

  const handleChange = (index: number, field: keyof ProofTask, value: unknown) => {
    const updated = [...proofTasks];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  // ✅ Handle File Upload for Task Assets
  const handleFileUpload = async (index: number, files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);

    try {
      const newAttachments: string[] = [...(proofTasks[index].attachments || [])];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const filePath = `task-assets/${Date.now()}-${file.name}`;
        const { error } = await supabase.storage
          .from("task_attachments")
          .upload(filePath, file);

        if (error) throw error;

        const { data } = supabase.storage.from("task_attachments").getPublicUrl(filePath);
        newAttachments.push(data.publicUrl);
      }

      handleChange(index, "attachments", newAttachments);
      toast.success("Files uploaded!");
    } catch (error) {
      console.error(error);
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // ✅ Simple Credit Calculation Logic
  const calculateCredits = (timeStr: string) => {
    if (!timeStr) return 0;
    const lower = timeStr.toLowerCase();
    if (lower.includes("hour") || lower.includes("hr")) return 10;
    if (lower.includes("30") || lower.includes("min")) return 5;
    return 5;
  };

  const handleDurationChange = (index: number, minutes: number) => {
    const tier = TIME_TIERS.find((t) => t.minutes === minutes);
    const updated = [...proofTasks];
    updated[index] = { 
      ...updated[index], 
      duration_minutes: minutes,
      expected_time: tier ? tier.label : `${minutes} minutes` // Sync string for display
    };
    onChange(updated);
  };

  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-base font-semibold text-[var(--color-text)]">
          Proof Tasks (Optional)
        </h2>
        <button
          type="button"
          onClick={() => onChange([...proofTasks, { id: "", title: "" } as ProofTask])}
          className="text-sm text-[var(--color-employer)] hover:underline"
        >
          + Add Another Task
        </button>
      </div>

      {proofTasks.map((task, index) => (
        <div key={index} className="relative p-5 border border-[var(--color-border)] rounded-xl bg-[var(--color-bg)]/50 mb-6">
          {/* Remove button */}
          <button
            type="button"
            onClick={() => onChange(proofTasks.filter((_, i) => i !== index))}
            className="absolute top-3 right-3 text-[var(--color-text-muted)] hover:text-[var(--color-error)] transition"
            title="Remove task"
          >
            <Trash2 size={16} />
          </button>

          <div className="space-y-5">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                Task Title
              </label>
              <input
                type="text"
                value={task.title}
                onChange={(e) => handleChange(index, "title", e.target.value)}
                placeholder="e.g. Build a Landing Page"
                // ✅ FIXED: Added text color and standardized background
                className="w-full border border-[var(--color-border)] rounded-[var(--radius-input)] p-2 bg-[var(--color-bg)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-employer)]"
              />
            </div>

            {/* Description - Markdown Editor */}
            <div>
              <MarkdownEditor
                label="Task Description & Instructions"
                value={task.description ?? ""}
                onChange={(val) => handleChange(index, "description", val)}
                placeholder="Detailed instructions for the candidate (you can use markdown)..."
                rows={6}
              />
            </div>

            {/* ─── ✅ NEW: Standardized Time & Credit Selector ─── */}
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                Estimated Effort & Reward
              </label>
              <div className="relative">
                <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                <select
                  value={task.duration_minutes ?? 30}
                  onChange={(e) => handleDurationChange(index, Number(e.target.value))}
                  className="w-full pl-9 border border-[var(--color-border)] rounded-[var(--radius-input)] p-2 bg-[var(--color-bg)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-employer)] appearance-none"
                >
                  {TIME_TIERS.map((tier) => (
                    <option key={tier.minutes} value={tier.minutes}>
                      {tier.label} — {tier.credits} Credits
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Helper text to reinforce the value */}
              <p className="text-xs text-[var(--color-text-muted)] mt-1.5">
                This sets the proof value. Candidates earn <strong className="text-[var(--color-employer)]">{TIME_TIERS.find(t => t.minutes == (task.duration_minutes || 30))?.credits} credits</strong> for completion.
              </p>
            </div>
          </div>

            {/* Attachments Upload */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                Task Assets / Files
              </label>
              
              {/* File List */}
              {task.attachments && task.attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {task.attachments.map((url, i) => (
                    <div key={i} className="flex items-center gap-1 text-xs bg-[var(--color-surface)] border border-[var(--color-border)] px-2 py-1 rounded">
                      <Paperclip size={12} />
                      <a href={url} target="_blank" rel="noreferrer" className="hover:underline max-w-[150px] truncate">
                        Attachment {i + 1}
                      </a>
                    </div>
                  ))}
                </div>
              )}

              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-dashed border-[var(--color-border)] rounded-[var(--radius-button)] hover:bg-[var(--color-bg-hover)] text-sm text-[var(--color-text-muted)] transition">
                <UploadCloud size={16} />
                {uploading ? "Uploading..." : "Upload Files"}
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFileUpload(index, e.target.files)}
                />
              </label>
            </div>

            {/* Meta fields */}
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                  Expected Time
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1 hour"
                  value={task.expected_time ?? ""}
                  onChange={(e) => handleChange(index, "expected_time", e.target.value)}
                  // ✅ FIXED: Added text color and standardized background
                  className="w-full border border-[var(--color-border)] rounded-[var(--radius-input)] p-2 bg-[var(--color-bg)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-employer)]"
                />
                <p className="text-xs text-[var(--color-success)] mt-2">
                  ✨ Candidates earn ~{calculateCredits(task.expected_time || "")} credits for this task.
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}

      {proofTasks.length === 0 && (
        <div className="text-center py-8 border border-dashed border-[var(--color-border)] rounded-xl">
          <p className="text-sm text-[var(--color-text-muted)] mb-3">No proof task added. (Optional)</p>
          <button
            type="button"
            onClick={() => onChange([{ id: "", title: "" } as ProofTask])}
            className="text-sm font-medium text-[var(--color-employer)] hover:underline"
          >
            + Add a Proof Task
          </button>
        </div>
      )}

      {errors && <p className="text-[var(--color-error)] text-xs mt-2">{errors}</p>}
    </section>
  );
}