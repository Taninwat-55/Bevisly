import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { createJobWithTasks } from "@/lib/api/jobs";
import type { EmployerJob, ProofTask } from "@/types";

import JobInfoSection from "@/components/employer_jobs/JobInfoSection";
import JobDetailsSection from "@/components/employer_jobs/JobDetailsSection";
import ProofTasksSection from "@/components/employer_jobs/ProofTasksSection";
import SubmitSection from "@/components/employer_jobs/SubmitSection";
import type { EmployerJobFormValues } from "@/types/employer";
import { FileText, ChevronDown } from "lucide-react";
import { JOB_TEMPLATES } from "@/data/jobTemplates";

interface EmployerJobFormProps {
  mode?: "create" | "edit";
  defaultValues?: Partial<EmployerJob & { proof_tasks?: ProofTask[] }>;
  onSubmit?: (
    values: Partial<EmployerJob & { proof_tasks?: ProofTask[] }>
  ) => Promise<void>;
  submitLabel?: string;
  onSuccess?: () => void;
}

/* ─── Constants ─── */
const LIMITS = {
  TITLE: 100,
  COMPANY: 100,
  LOCATION: 100,
  DESCRIPTION: 10000, // ~2000 words
  TASK_TITLE: 150,
};

/* ─── Validation ─────────────────────────────── */
function validateJobForm(values: {
  title: string;
  company: string;
  location: string;
  description: string;
  proof_tasks: Array<Partial<ProofTask>>;
}) {
  const errors: Record<string, string> = {};
  const t = (v?: string | null) => (v ?? "").trim();

  // 1. Required Fields
  if (!t(values.title)) errors.title = "Job title is required.";
  if (!t(values.company)) errors.company = "Company name is required.";
  if (!t(values.location)) errors.location = "Location is required.";
  if (!t(values.description)) errors.description = "Description is required.";

  // 2. Length Limits (Security & UI Safety)
  if (t(values.title).length > LIMITS.TITLE) {
    errors.title = `Title is too long (max ${LIMITS.TITLE} chars).`;
  }
  if (t(values.company).length > LIMITS.COMPANY) {
    errors.company = `Company name is too long (max ${LIMITS.COMPANY} chars).`;
  }
  if (t(values.location).length > LIMITS.LOCATION) {
    errors.location = `Location is too long (max ${LIMITS.LOCATION} chars).`;
  }
  if (t(values.description).length > LIMITS.DESCRIPTION) {
    errors.description = `Description is too long (max ${LIMITS.DESCRIPTION} chars).`;
  }

  // 3. Task Validation
  if (values.proof_tasks.length > 0) {
    const firstTask = values.proof_tasks[0];

    // Check if task is partially filled
    const hasContent =
      (firstTask.description || "").trim() ||
      (firstTask.expected_time || "").trim();

    if (hasContent && !(firstTask.title || "").trim()) {
      errors.proof_tasks = "Task title is required if you add a task.";
    }

    if ((firstTask.title || "").length > LIMITS.TASK_TITLE) {
      errors.proof_tasks = `Task title is too long (max ${LIMITS.TASK_TITLE} chars).`;
    }
  }

  return errors;
}

/* ─── Main Component ─────────────────────────────── */
export default function EmployerJobForm({
  mode = "create",
  defaultValues,
  onSubmit,
  submitLabel,
  onSuccess,
}: EmployerJobFormProps) {
  const navigate = useNavigate();

  // Unified job state
  const [values, setValues] = useState<EmployerJobFormValues>({
    title: defaultValues?.title ?? "",
    description: defaultValues?.description ?? "",
    requirements: defaultValues?.requirements ?? "",
    company: defaultValues?.company ?? "",
    location: defaultValues?.location ?? "",
    paid: defaultValues?.paid ?? false,
    payment_amount: defaultValues?.payment_amount ?? null,
    payment_currency: defaultValues?.payment_currency ?? "EUR",
    show_salary_range: defaultValues?.show_salary_range ?? false,
    salary_min: defaultValues?.salary_min ?? null,
    salary_max: defaultValues?.salary_max ?? null,
    pay_period: defaultValues?.pay_period ?? "monthly",
    job_type: defaultValues?.job_type ?? "Internship",
    department: defaultValues?.department ?? "Frontend",
    work_mode: defaultValues?.work_mode ?? "Remote",
    proof_tasks: defaultValues?.proof_tasks ?? [
      {
        id: "",
        title: "",
        description: "",
        expected_time: "",
        submission_format: "",
        ai_tools_allowed: false,
      },
    ],
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showTemplates, setShowTemplates] = useState(false);

  const applyTemplate = (templateId: string) => {
    const template = JOB_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;

    setValues((prev) => ({
      ...prev,
      title: template.title,
      department: template.department,
      description: template.description,
      requirements: template.requirements,
      proof_tasks: template.proof_tasks.map(t => ({ ...t, id: crypto.randomUUID() })), // ensure unique IDs
    }));

    toast.success(`Loaded template: ${template.label}`);
    setShowTemplates(false);
  };

  /* ─── Handlers ─────────────────────────────── */
  const handleChange = (field: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validateJobForm(values);
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error("Please fix validation errors before submitting.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "edit" && onSubmit) {
        await onSubmit(values);
        toast.success("✅ Job updated successfully!");
        onSuccess?.();
      } else {
        await createJobWithTasks(values);
        toast.success("✅ Job posted successfully!");
        onSuccess?.();
        navigate("/employer/jobs");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit job");
    } finally {
      setLoading(false);
    }
  };

  /* ─── Render ─────────────────────────────── */
  return (
    <div className="space-y-6">
      {/* Template Helper */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-card)] p-5 shadow-[var(--shadow-soft)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-[var(--color-text)] flex items-center gap-2">
              <FileText size={18} className="text-[var(--color-employer)]" />
              Speed up posting with a template
            </h3>
            <p className="text-sm text-[var(--color-text-muted)]">
              Select a pre-filled job post to get started instantly.
            </p>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowTemplates(!showTemplates)}
              className="flex text-[var(--color-text)] items-center gap-2 px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[var(--radius-button)] text-sm font-medium hover:bg-[var(--color-bg-hover)] transition"
            >
              Select a Template <ChevronDown size={14} />
            </button>

            {showTemplates && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-card)] shadow-xl z-20 overflow-hidden">
                {JOB_TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => applyTemplate(t.id)}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-[var(--color-bg-hover)] border-b border-[var(--color-border)] last:border-0 transition"
                  >
                    <div className="font-medium text-[var(--color-text)]">{t.label}</div>
                    <div className="text-xs text-[var(--color-text-muted)]">{t.category}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-card)] shadow-[var(--shadow-soft)] p-8 space-y-8"
      >
        <JobInfoSection values={values} onChange={handleChange} errors={errors} />
        <div className="border-t border-[var(--color-border)] pt-8">
          <JobDetailsSection values={values} onChange={handleChange} />
        </div>
        <div className="border-t border-[var(--color-border)] pt-8">
          <ProofTasksSection
            proofTasks={values.proof_tasks}
            onChange={(tasks) => handleChange("proof_tasks", tasks)}
            errors={errors.proof_tasks}
          />
        </div>
        <SubmitSection loading={loading} mode={mode} submitLabel={submitLabel} />
      </form>
    </div>
  );
}
