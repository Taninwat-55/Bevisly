import { useState } from "react";
import { Trash2, UploadCloud, Paperclip, Clock, Github, Code2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";
import type { ProofTask } from "@/types";
import MarkdownEditor from "@/components/ui/MarkdownEditor";

interface ProofTasksSectionProps {
  proofTasks: ProofTask[];
  onChange: (tasks: ProofTask[]) => void;
  errors?: string;
}

const TIME_OPTIONS = [
  "15 mins", "30 mins", "45 mins", "1 hour", "2 hours", "4 hours", "Weekend"
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

    // Auto-fill instructions if switching to Code Challenge
    if (field === "submission_type" && value === "github_repo") {
      if (!updated[index].description) {
        updated[index].description =
          "1. **Fork** the template repository linked below.\n" +
          "2. Run `npm test` to see the failing tests.\n" +
          "3. **Fix the code** until all tests pass.\n" +
          "4. Push your changes and submit your repository link.";
      }
    }

    onChange(updated);
  };

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

  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-base font-semibold text-[var(--color-text)]">
          Proof Tasks (Skill Verification)
        </h2>
        <button
          type="button"
          onClick={() => onChange([...proofTasks, { id: "", title: "", submission_type: "link" } as ProofTask])}
          className="text-sm text-[var(--color-employer)] hover:underline"
        >
          + Add Task
        </button>
      </div>

      {proofTasks.map((task, index) => (
        <div key={index} className="relative p-5 border border-[var(--color-border)] rounded-xl bg-[var(--color-bg)]/50 mb-6 shadow-sm">
          <button
            type="button"
            onClick={() => onChange(proofTasks.filter((_, i) => i !== index))}
            className="absolute top-3 right-3 text-[var(--color-text-muted)] hover:text-[var(--color-error)] transition"
            title="Remove task"
          >
            <Trash2 size={16} />
          </button>

          <div className="space-y-5">
            {/* Task Type Selector */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">Task Type</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => handleChange(index, "submission_type", "link")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-[var(--radius-button)] text-sm font-medium border transition-all ${task.submission_type !== "github_repo"
                      ? "bg-[var(--color-employer)] text-white border-[var(--color-employer)]"
                      : "bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-employer)]"
                    }`}
                >
                  <Code2 size={16} /> Standard Task
                </button>
                <button
                  type="button"
                  onClick={() => handleChange(index, "submission_type", "github_repo")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-[var(--radius-button)] text-sm font-medium border transition-all ${task.submission_type === "github_repo"
                      ? "bg-gray-800 text-white border-gray-800 dark:bg-white dark:text-black"
                      : "bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-gray-500"
                    }`}
                >
                  <Github size={16} /> Code Challenge
                </button>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Task Title</label>
              <input
                type="text"
                value={task.title}
                onChange={(e) => handleChange(index, "title", e.target.value)}
                placeholder={task.submission_type === "github_repo" ? "e.g. Fix Broken Login API" : "e.g. Design a Landing Page"}
                className="w-full border border-[var(--color-border)] rounded-[var(--radius-input)] p-2 bg-[var(--color-bg)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-employer)]"
              />
            </div>

            {/* GitHub Template URL (Conditional) */}
            {task.submission_type === "github_repo" && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-lg animate-in fade-in slide-in-from-top-2">
                <label className="block text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  GitHub Template Repository URL
                </label>
                <p className="text-xs text-blue-700 dark:text-blue-300 mb-2">
                  Candidates will be asked to fork this repo. It should contain a failing test suite.
                </p>
                <div className="relative">
                  <Github size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
                  <input
                    type="url"
                    value={task.recommended_platform ?? ""}
                    onChange={(e) => handleChange(index, "recommended_platform", e.target.value)}
                    placeholder="https://github.com/your-org/react-challenge-template"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-blue-200 dark:border-blue-700 rounded-[var(--radius-input)] bg-white dark:bg-black/20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Instructions */}
            <MarkdownEditor
              label="Instructions & Brief"
              value={task.description ?? ""}
              onChange={(val) => handleChange(index, "description", val)}
              placeholder="Explain the task clearly..."
              rows={5}
            />

            {/* Attachments & Time */}
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-2">Assets / Files</label>
                {task.attachments && task.attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {task.attachments.map((url, i) => (
                      <div key={i} className="flex text-[var(--color-text)] items-center gap-1 text-xs bg-[var(--color-surface)] border border-[var(--color-border)] px-2 py-1 rounded">
                        <Paperclip size={12} />
                        <a href={url} target="_blank" rel="noreferrer" className="hover:underline max-w-[120px] truncate">File {i + 1}</a>
                      </div>
                    ))}
                  </div>
                )}
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-dashed border-[var(--color-border)] rounded-[var(--radius-button)] hover:bg-[var(--color-bg-hover)] text-sm text-[var(--color-text-muted)] transition w-full justify-center">
                  <UploadCloud size={16} />
                  {uploading ? "Uploading..." : "Upload Assets"}
                  <input type="file" multiple className="hidden" onChange={(e) => handleFileUpload(index, e.target.files)} />
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Expected Time</label>
                <div className="relative">
                  <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                  <select
                    value={task.expected_time ?? ""}
                    onChange={(e) => handleChange(index, "expected_time", e.target.value)}
                    className="w-full pl-9 border border-[var(--color-border)] rounded-[var(--radius-input)] p-2 bg-[var(--color-bg)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-employer)]"
                  >
                    <option value="" disabled>Select duration</option>
                    {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {proofTasks.length === 0 && (
        <div className="text-center py-8 border border-dashed border-[var(--color-border)] rounded-xl">
          <button
            type="button"
            onClick={() => onChange([{ id: "", title: "", submission_type: "link" } as ProofTask])}
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