/**
 * 🧩 EmployerJobForm.tsx
 *
 * Unified job creation/editing form for employers.
 * Composed of modular sections for cleaner UX & maintainable structure.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { createJobWithTasks } from "@/lib/api/jobs";
import type { EmployerJob, ProofTask } from "@/types";

// 🧱 Modular sections
import JobInfoSection from "@/components/jobs/JobInfoSection";
import JobDetailsSection from "@/components/jobs/JobDetailsSection";
import ProofTasksSection from "@/components/jobs/ProofTasksSection";
import SubmitSection from "@/components/jobs/SubmitSection";
import type { EmployerJobFormValues } from "@/types/employer";

interface EmployerJobFormProps {
  mode?: "create" | "edit";
  defaultValues?: Partial<EmployerJob & { proof_tasks?: ProofTask[] }>;
  onSubmit?: (
    values: Partial<EmployerJob & { proof_tasks?: ProofTask[] }>
  ) => Promise<void>;
  submitLabel?: string;
  onSuccess?: () => void;
}

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

  if (!t(values.title)) errors.title = "Job title is required.";
  if (!t(values.company)) errors.company = "Company name is required.";
  if (!t(values.location)) errors.location = "Location is required.";
  if (!t(values.description)) errors.description = "Description is required.";

  if (values.proof_tasks.length > 0) {
    // Only validate if they started adding a task but left it blank
    const firstTask = values.proof_tasks[0];
    
    // ✅ FIX: Use (firstTask.title || "") to handle potential undefined
    if (!(firstTask.title || "").trim() && (firstTask.description || firstTask.expected_time)) {
       errors.proof_tasks = "Task title is required if you add a task.";
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

  // 🧠 Unified job state
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
  );
}
