/**
 * 🧩 ProofTasksSection.tsx
 * Handles dynamic proof-based tasks inside the job form.
 */

import { Trash2 } from "lucide-react";
import type { ProofTask } from "@/types";

interface ProofTasksSectionProps {
  proofTasks: ProofTask[];
  onChange: (tasks: ProofTask[]) => void;
  errors?: string;
}

export default function ProofTasksSection({
  proofTasks,
  onChange,
  errors,
}: ProofTasksSectionProps) {
  const handleChange = (
    index: number,
    field: keyof ProofTask,
    value: unknown
  ) => {
    const updated = [...proofTasks];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const handleRemove = (index: number) =>
    onChange(proofTasks.filter((_, i) => i !== index));

  return (
    <section>
      <h2 className="text-base font-semibold text-[var(--color-text)] mb-4">
        Proof Tasks
      </h2>

      {proofTasks.map((task, index) => (
        <div key={index} className="relative">
          {/* Divider between tasks */}
          {index > 0 && (
            <div className="border-t border-[var(--color-border)] my-6" />
          )}

          {/* Remove button */}
          {proofTasks.length > 1 && (
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="absolute -top-1 right-0 text-[var(--color-text-muted)] hover:text-[var(--color-error)] transition"
              title="Remove task"
            >
              <Trash2 size={16} />
            </button>
          )}

          {/* Fields */}
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
                placeholder="e.g. Build a landing page or analyze marketing data"
                className="w-full border border-[var(--color-border)] rounded-[var(--radius-input)] p-2 bg-[var(--color-bg)] text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-employer)]"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                Task Description
              </label>
              <textarea
                rows={3}
                value={task.description ?? ""}
                onChange={(e) =>
                  handleChange(index, "description", e.target.value)
                }
                placeholder="Describe what you expect the candidate to do."
                className="w-full border border-[var(--color-border)] rounded-[var(--radius-input)] p-2 bg-[var(--color-bg)] text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-employer)]"
              />
            </div>

            {/* Two-column group */}
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                  Expected Time
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1–2 hours"
                  value={task.expected_time ?? ""}
                  onChange={(e) =>
                    handleChange(index, "expected_time", e.target.value)
                  }
                  className="w-full border border-[var(--color-border)] rounded-[var(--radius-input)] p-2 bg-[var(--color-bg)] text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-employer)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                  Submission Method
                </label>
                <select
                  value={task.submission_type ?? "link"}
                  onChange={(e) =>
                    handleChange(index, "submission_type", e.target.value)
                  }
                  className="w-full border border-[var(--color-border)] rounded-[var(--radius-input)] p-2 bg-[var(--color-bg)] text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-employer)]"
                >
                  <option value="link">
                    🔗 Link (e.g. portfolio, GitHub, Figma, etc.)
                  </option>
                  <option value="file">📁 File upload (PDF, ZIP, etc.)</option>
                  <option value="text">
                    📝 Text entry (write directly in Bevis)
                  </option>
                  <option value="mixed">💡 Combination (link + file)</option>
                </select>
              </div>
            </div>

            {/* Recommended platform */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                Recommended Tool or Platform (optional)
              </label>
              <select
                value={task.recommended_platform ?? ""}
                onChange={(e) =>
                  handleChange(index, "recommended_platform", e.target.value)
                }
                className="w-full border border-[var(--color-border)] rounded-[var(--radius-input)] p-2 bg-[var(--color-bg)] text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-employer)]"
              >
                <option value="">No preference</option>
                <option value="GitHub">GitHub</option>
                <option value="Figma">Figma</option>
                <option value="Google Docs">Google Docs</option>
                <option value="Notion">Notion</option>
                <option value="Framer">Framer</option>
                <option value="Canva">Canva</option>
                <option value="Miro">Miro</option>
                <option value="Slides">Google Slides / PowerPoint</option>
                <option value="Other">Other</option>
              </select>

              {task.recommended_platform === "Other" && (
                <input
                  type="text"
                  placeholder="Specify tool or link (e.g. Behance, Dropbox, custom app...)"
                  value={task.submission_format ?? ""}
                  onChange={(e) =>
                    handleChange(index, "submission_format", e.target.value)
                  }
                  className="mt-2 w-full border border-[var(--color-border)] rounded-[var(--radius-input)] p-2 bg-[var(--color-bg)] text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-employer)]"
                />
              )}
            </div>

            {/* AI Tools */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={task.ai_tools_allowed ?? false}
                onChange={(e) =>
                  handleChange(index, "ai_tools_allowed", e.target.checked)
                }
                className="accent-[var(--color-employer-dark)]"
              />
              <label className="text-sm font-medium text-[var(--color-text)]">
                AI Tools Allowed
              </label>
            </div>
          </div>
        </div>
      ))}

      {errors && (
        <p className="text-[var(--color-error)] text-xs mt-2">{errors}</p>
      )}
    </section>
  );
}
