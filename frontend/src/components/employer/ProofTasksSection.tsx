import { useEffect, useState } from "react";
import {
  Trash2,
  UploadCloud,
  Paperclip,
  Clock,
  Github,
  Code2,
  Lock,
  Plus,
  AlertCircle,
  Sparkles,
  MessageSquare,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";
import type { ProofTask, RubricCriterion } from "@/types";
import MarkdownEditor from "@/components/common/MarkdownEditor";
import { useAuth } from "@/hooks/useAuth";

const DEFAULT_RUBRIC: RubricCriterion[] = [
  { name: "", weight: 34, description: "" },
  { name: "", weight: 33, description: "" },
  { name: "", weight: 33, description: "" },
];

export type RubricFieldError = {
  nameMissing?: boolean;
  descriptionMissing?: boolean;
};

export type RubricErrors = {
  countOutOfRange?: boolean;
  weightSumWrong?: boolean;
  fields?: RubricFieldError[];
};

export type ProofTaskRubricErrors = Record<number, RubricErrors>;

interface ProofTasksSectionProps {
  proofTasks: ProofTask[];
  onChange: (tasks: ProofTask[]) => void;
  errors?: string;
  rubricErrors?: ProofTaskRubricErrors;
}

const TIME_OPTIONS = [
  "15 mins", "30 mins", "45 mins", "1 hour", "2 hours", "4 hours", "Weekend"
];

export default function ProofTasksSection({
  proofTasks,
  onChange,
  errors,
  rubricErrors,
}: ProofTasksSectionProps) {
  const { user } = useAuth();
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
      const timestamp = Date.now();
      const uploadPromises = Array.from(files).map(async (file, i) => {
        const filePath = `${user?.id}/task-assets/${timestamp}-${i}-${file.name}`;
        const { error } = await supabase.storage
          .from("task_attachments")
          .upload(filePath, file);

        if (error) throw error;

        const { data } = supabase.storage.from("task_attachments").getPublicUrl(filePath);
        return data.publicUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      const newAttachments: string[] = [
        ...(proofTasks[index].attachments || []),
        ...uploadedUrls,
      ];

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
        <h2 className="text-base font-semibold text-[var(--color-text)] flex items-center gap-2">
          Proof Tasks (Skill Verification)
          <span className="text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">Optional</span>
        </h2>
        <button
          type="button"
          onClick={() =>
            onChange([
              ...proofTasks,
              {
                id: "",
                title: "",
                submission_type: "link",
                rubric_criteria: DEFAULT_RUBRIC.map((c) => ({ ...c })),
              } as ProofTask,
            ])
          }
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

            {/* Scoring Rubric */}
            <RubricEditor
              task={task}
              onChange={(criteria) => handleChange(index, "rubric_criteria", criteria)}
              errors={rubricErrors?.[index]}
            />

            {/* Follow-up Questions */}
            <FollowUpQuestionsEditor
              questions={task.follow_up_questions ?? []}
              onChange={(qs) => handleChange(index, "follow_up_questions", qs)}
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
                        <a href={url} target="_blank" rel="noopener noreferrer" className="hover:underline max-w-[120px] truncate">File {i + 1}</a>
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
            onClick={() =>
              onChange([
                {
                  id: "",
                  title: "",
                  submission_type: "link",
                  rubric_criteria: DEFAULT_RUBRIC.map((c) => ({ ...c })),
                } as ProofTask,
              ])
            }
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


interface RubricEditorProps {
  task: ProofTask;
  onChange: (criteria: RubricCriterion[]) => void;
  errors?: RubricErrors;
  aiSuggested?: boolean;
}

export function RubricEditor({ task, onChange, errors, aiSuggested }: RubricEditorProps) {
  const isLocked = !!task.rubric_locked_at;
  const hasStored = Array.isArray(task.rubric_criteria) && task.rubric_criteria.length > 0;
  const criteria = hasStored ? task.rubric_criteria! : DEFAULT_RUBRIC.map((c) => ({ ...c }));

  // Persist defaults to form state on first render so the visible 3 rows
  // are actually saved when the user submits without touching the rubric.
  useEffect(() => {
    if (!isLocked && !hasStored) {
      onChange(DEFAULT_RUBRIC.map((c) => ({ ...c })));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalWeight = criteria.reduce((sum, c) => sum + (Number(c.weight) || 0), 0);
  const weightOk = totalWeight === 100;
  const countOk = criteria.length >= 3 && criteria.length <= 5;
  const hasError =
    !!errors &&
    (errors.countOutOfRange ||
      errors.weightSumWrong ||
      (errors.fields ?? []).some((f) => f.nameMissing || f.descriptionMissing));

  const updateRow = (idx: number, patch: Partial<RubricCriterion>) => {
    const next = criteria.map((c, i) => (i === idx ? { ...c, ...patch } : c));
    onChange(next);
  };

  const removeRow = (idx: number) => {
    if (criteria.length <= 3) {
      toast.error("A rubric needs at least 3 criteria.");
      return;
    }
    onChange(criteria.filter((_, i) => i !== idx));
  };

  const addRow = () => {
    if (criteria.length >= 5) {
      toast.error("A rubric can have at most 5 criteria.");
      return;
    }
    onChange([...criteria, { name: "", weight: 0, description: "" }]);
  };

  return (
    <div
      className={`border rounded-xl p-4 transition-colors ${
        hasError
          ? "border-[var(--color-error)] bg-[var(--color-error)]/5"
          : "border-[var(--color-border)] bg-[var(--color-surface)]/40"
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <label className="text-sm font-semibold text-[var(--color-text)] flex items-center gap-2">
          Scoring Rubric
          <span className="text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            Required
          </span>
          {isLocked && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
              <Lock size={10} /> Locked
            </span>
          )}
        </label>
        <span
          className={`text-xs font-medium ${
            weightOk
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-[var(--color-error)]"
          }`}
        >
          Total weight: {totalWeight} / 100
        </span>
      </div>
      <p className="text-xs text-[var(--color-text-muted)] mb-3">
        {isLocked
          ? "First candidate has submitted. Rubric is locked for fairness."
          : "Define how this task will be scored. 3–5 criteria, each with a name, a weight (must sum to 100), and a one-line description of what 'good' looks like. Locks once the first candidate submits."}
      </p>

      {aiSuggested && !isLocked && (
        <div className="mb-3 flex items-start gap-2 p-2.5 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 text-xs text-purple-900 dark:text-purple-200">
          <Sparkles size={14} className="mt-0.5 shrink-0 text-purple-500" />
          <p>
            <span className="font-semibold">Suggested by AI</span> — review,
            edit, or replace before posting. The rubric is your contract with
            the candidate, so it should reflect how <em>you</em> evaluate work.
          </p>
        </div>
      )}

      {hasError && (
        <div className="mb-3 flex items-start gap-2 p-2.5 rounded-lg bg-[var(--color-error)]/10 border border-[var(--color-error)]/30 text-xs text-[var(--color-error)]">
          <AlertCircle size={14} className="mt-0.5 shrink-0" />
          <div className="space-y-1">
            {errors?.countOutOfRange && (
              <p>Add or remove rows so you have 3–5 criteria.</p>
            )}
            {errors?.weightSumWrong && (
              <p>Weights must add up to exactly 100. Currently {totalWeight}.</p>
            )}
            {(errors?.fields ?? []).some(
              (f) => f.nameMissing || f.descriptionMissing,
            ) && (
              <p>Fill in the highlighted name and description fields below.</p>
            )}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {criteria.map((c, idx) => {
          const fieldError = errors?.fields?.[idx];
          const nameBad = !!fieldError?.nameMissing;
          const descBad = !!fieldError?.descriptionMissing;
          return (
            <div
              key={idx}
              className="grid grid-cols-12 gap-3 items-start bg-[var(--color-bg)]/60 rounded-lg p-3"
            >
              <div className="col-span-3 flex flex-col gap-0.5">
                <input
                  type="text"
                  disabled={isLocked}
                  value={c.name}
                  onChange={(e) => updateRow(idx, { name: e.target.value })}
                  placeholder="e.g. Code clarity"
                  aria-invalid={nameBad}
                  className={`border rounded p-1.5 text-sm bg-[var(--color-bg)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-employer)] disabled:opacity-60 ${
                    nameBad
                      ? "border-[var(--color-error)]"
                      : "border-[var(--color-border)]"
                  }`}
                />
                {nameBad && (
                  <span className="text-[10px] text-[var(--color-error)]">
                    Name required
                  </span>
                )}
              </div>
              <input
                type="number"
                min={1}
                max={100}
                disabled={isLocked}
                value={c.weight ?? 0}
                onChange={(e) =>
                  updateRow(idx, { weight: Number(e.target.value) || 0 })
                }
                className="col-span-2 self-start border border-[var(--color-border)] rounded p-1.5 text-sm bg-[var(--color-bg)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-employer)] disabled:opacity-60"
              />
              <div className="col-span-6 flex flex-col gap-0.5">
                <input
                  type="text"
                  disabled={isLocked}
                  value={c.description}
                  onChange={(e) =>
                    updateRow(idx, { description: e.target.value })
                  }
                  placeholder="What 'good' looks like"
                  aria-invalid={descBad}
                  className={`border rounded p-1.5 text-sm bg-[var(--color-bg)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-employer)] disabled:opacity-60 ${
                    descBad
                      ? "border-[var(--color-error)]"
                      : "border-[var(--color-border)]"
                  }`}
                />
                {descBad && (
                  <span className="text-[10px] text-[var(--color-error)]">
                    Description required
                  </span>
                )}
              </div>
              <button
                type="button"
                disabled={isLocked || criteria.length <= 3}
                onClick={() => removeRow(idx)}
                className="col-span-1 self-start flex justify-center items-center text-[var(--color-text-muted)] hover:text-[var(--color-error)] disabled:opacity-30 disabled:cursor-not-allowed transition"
                title="Remove criterion"
              >
                <Trash2 size={14} />
              </button>
            </div>
          );
        })}
      </div>

      {!isLocked && (
        <div className="flex items-center justify-between mt-3">
          <button
            type="button"
            onClick={addRow}
            disabled={criteria.length >= 5}
            className="inline-flex items-center gap-1 text-xs font-medium text-[var(--color-employer)] hover:underline disabled:opacity-40 disabled:no-underline"
          >
            <Plus size={12} /> Add criterion
          </button>
          {!countOk && (
            <span className="text-xs text-[var(--color-error)]">
              Need 3–5 criteria
            </span>
          )}
        </div>
      )}
    </div>
  );
}

interface FollowUpQuestionsEditorProps {
  questions: string[];
  onChange: (questions: string[]) => void;
}

export function FollowUpQuestionsEditor({ questions, onChange }: FollowUpQuestionsEditorProps) {
  const update = (idx: number, value: string) => {
    const next = [...questions];
    next[idx] = value;
    onChange(next);
  };

  const remove = (idx: number) => {
    onChange(questions.filter((_, i) => i !== idx));
  };

  const add = () => {
    if (questions.length >= 3) return;
    onChange([...questions, ""]);
  };

  return (
    <div className="border border-[var(--color-border)] rounded-xl p-4 bg-[var(--color-surface)]/40">
      <div className="flex items-center justify-between mb-1">
        <label className="text-sm font-semibold text-[var(--color-text)] flex items-center gap-2">
          <MessageSquare size={14} />
          Follow-up Questions
          <span className="text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
            Optional
          </span>
        </label>
        <span className="text-xs text-[var(--color-text-muted)]">{questions.length} / 3</span>
      </div>
      <p className="text-xs text-[var(--color-text-muted)] mb-3">
        Candidates answer these after submitting (150 words max each). AI can write the plan — it can't explain your specific decisions in your own voice.
      </p>

      <div className="space-y-3">
        {questions.map((q, idx) => (
          <div key={idx} className="flex gap-3 items-start">
            <input
              type="text"
              value={q}
              onChange={(e) => update(idx, e.target.value)}
              placeholder={
                idx === 0
                  ? "e.g. Why did you structure your approach this way?"
                  : idx === 1
                  ? "e.g. What trade-offs did you consider?"
                  : "e.g. What would you do differently with more time?"
              }
              className="flex-1 border border-[var(--color-border)] rounded-[var(--radius-input)] p-2 text-sm bg-[var(--color-bg)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-employer)]"
            />
            <button
              type="button"
              onClick={() => remove(idx)}
              className="mt-1 text-[var(--color-text-muted)] hover:text-[var(--color-error)] transition"
              title="Remove question"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {questions.length < 3 && (
        <button
          type="button"
          onClick={add}
          className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[var(--color-employer)] hover:underline"
        >
          <Plus size={12} /> Add question
        </button>
      )}
    </div>
  );
}

interface ScreeningQuestionsEditorProps {
  questions: string[];
  onChange: (questions: string[]) => void;
}

export function ScreeningQuestionsEditor({ questions, onChange }: ScreeningQuestionsEditorProps) {
  const PLACEHOLDERS = [
    "e.g. Why do you want to work here?",
    "e.g. What's your most relevant experience?",
    "e.g. Where do you see yourself in 2 years?",
    "e.g. What excites you about this role?",
    "e.g. How do you handle working in a fast-paced environment?",
  ];

  const update = (idx: number, value: string) => {
    const next = [...questions];
    next[idx] = value;
    onChange(next);
  };

  const remove = (idx: number) => {
    onChange(questions.filter((_, i) => i !== idx));
  };

  const add = () => {
    if (questions.length >= 5) return;
    onChange([...questions, ""]);
  };

  return (
    <div className="border border-[var(--color-border)] rounded-xl p-4 bg-[var(--color-surface)]/40">
      <div className="flex items-center justify-between mb-1">
        <label className="text-sm font-semibold text-[var(--color-text)] flex items-center gap-2">
          <MessageSquare size={14} />
          Screening Questions
          <span className="text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
            Optional
          </span>
        </label>
        <span className="text-xs text-[var(--color-text-muted)]">{questions.length} / 5</span>
      </div>
      <p className="text-xs text-[var(--color-text-muted)] mb-3">
        Candidates answer these before their application is reviewed. Use these for motivation, culture-fit, or experience questions — even without a proof task.
      </p>

      <div className="space-y-3">
        {questions.map((q, idx) => (
          <div key={idx} className="flex gap-3 items-start">
            <input
              type="text"
              value={q}
              onChange={(e) => update(idx, e.target.value)}
              placeholder={PLACEHOLDERS[idx] ?? "e.g. Tell us more about yourself"}
              className="flex-1 border border-[var(--color-border)] rounded-[var(--radius-input)] p-2 text-sm bg-[var(--color-bg)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-employer)]"
            />
            <button
              type="button"
              onClick={() => remove(idx)}
              className="mt-1 text-[var(--color-text-muted)] hover:text-[var(--color-error)] transition"
              title="Remove question"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {questions.length < 5 && (
        <button
          type="button"
          onClick={add}
          className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[var(--color-employer)] hover:underline"
        >
          <Plus size={12} /> Add question
        </button>
      )}
    </div>
  );
}