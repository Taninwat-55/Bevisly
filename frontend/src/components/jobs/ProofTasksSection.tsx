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

//   const handleAdd = () =>
//     onChange([
//       ...proofTasks,
//       {
//         id: "",
//         title: "",
//         description: "",
//         expected_time: "",
//         submission_format: "",
//         ai_tools_allowed: false,
//       },
//     ]);

  const handleRemove = (index: number) =>
    onChange(proofTasks.filter((_, i) => i !== index));

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-[var(--color-text)]">
          Proof Tasks
        </h2>
        {/* <button
          type="button"
          onClick={handleAdd}
          className="inline-flex text-[var(--color-text)] items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md border border-[var(--color-border)] hover:bg-[var(--color-bg-hover)] transition"
        >
          <Plus size={14} /> Add Task
        </button> */}
      </div>

      {proofTasks.map((task, index) => (
        <div
          key={index}
          className="border border-[var(--color-border)] rounded-[var(--radius-card)] p-4 space-y-3 relative mb-3"
        >
          {proofTasks.length > 1 && (
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="absolute top-3 right-3 text-[var(--color-text-muted)] hover:text-[var(--color-error)] transition"
              title="Remove task"
            >
              <Trash2 size={16} />
            </button>
          )}

          <input
            type="text"
            placeholder="Task Title"
            value={task.title}
            onChange={(e) => handleChange(index, "title", e.target.value)}
            className="w-full text-[var(--color-text)] border border-[var(--color-border)] rounded-[var(--radius-input)] p-2"
          />

          <textarea
            placeholder="Task Description"
            value={task.description ?? ""}
            onChange={(e) => handleChange(index, "description", e.target.value)}
            rows={3}
            className="w-full text-[var(--color-text)] border border-[var(--color-border)] rounded-[var(--radius-input)] p-2"
          />

          <div className="grid sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Expected Time (e.g., 30m)"
              value={task.expected_time ?? ""}
              onChange={(e) =>
                handleChange(index, "expected_time", e.target.value)
              }
              className="border text-[var(--color-text)] border-[var(--color-border)] rounded-[var(--radius-input)] p-2"
            />
            <input
              type="text"
              placeholder="Submission Format (e.g., GitHub link)"
              value={task.submission_format ?? ""}
              onChange={(e) =>
                handleChange(index, "submission_format", e.target.value)
              }
              className="border text-[var(--color-text)] border-[var(--color-border)] rounded-[var(--radius-input)] p-2"
            />
          </div>

          <div className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              checked={task.ai_tools_allowed ?? false}
              onChange={(e) =>
                handleChange(index, "ai_tools_allowed", e.target.checked)
              }
              className="accent-[var(--color-employer-dark)]"
            />
            <label className="text-sm text-[var(--color-text)]">
              AI Tools Allowed
            </label>
          </div>
        </div>
      ))}

      {errors && (
        <p className="text-[var(--color-error)] text-xs mt-2">{errors}</p>
      )}
    </section>
  );
}
