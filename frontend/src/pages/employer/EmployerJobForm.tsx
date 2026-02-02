import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { createJobWithTasks } from "@/lib/api/jobs";
import type { EmployerJob, ProofTask } from "@/types";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { EmployerJobFormValues } from "@/types/employer";
import {
  FileText, Briefcase, MapPin, DollarSign, BrainCircuit, ArrowRight
} from "lucide-react";
import { JOB_TEMPLATES } from "@/data/jobTemplates";
import { useCompany } from "@/hooks/useCompany";

const FREE_TIER_JOB_LIMIT = 2;

interface EmployerJobFormProps {
  mode?: "create" | "edit";
  defaultValues?: Partial<EmployerJob & { proof_tasks?: ProofTask[] }>;
  onSubmit?: (
    values: Partial<EmployerJob & { proof_tasks?: ProofTask[] }>
  ) => Promise<void>;
  submitLabel?: string;
  onSuccess?: () => void;
}

export default function EmployerJobForm({
  mode = "create",
  defaultValues,
  onSubmit,
  submitLabel,
  onSuccess,
}: EmployerJobFormProps) {
  const navigate = useNavigate();
  const { company } = useCompany(); // Hook for checking limits

  // State
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
    job_type: defaultValues?.job_type ?? "Full-time",
    department: defaultValues?.department ?? "Engineering",
    work_mode: defaultValues?.work_mode ?? "Remote",
    proof_tasks: defaultValues?.proof_tasks ?? [
      {
        id: crypto.randomUUID(),
        title: "",
        description: "",
        expected_time: "2-4 hours",
        submission_format: "github_repo",
        ai_tools_allowed: true,
      },
    ],
  });

  const [loading, setLoading] = useState(false);

  // Handlers
  const handleChange = (field: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleTaskChange = (index: number, field: keyof ProofTask, value: unknown) => {
    const newTasks = [...(values.proof_tasks || [])];
    newTasks[index] = { ...newTasks[index], [field]: value };
    handleChange("proof_tasks", newTasks);
  };

  const applyTemplate = (template: typeof JOB_TEMPLATES[0]) => {
    setValues((prev) => ({
      ...prev,
      title: template.title,
      department: template.department,
      description: template.description || "",
      requirements: template.requirements || "",
      // Use existing task structure but update content
      proof_tasks: template.proof_tasks.map(t => ({
        id: crypto.randomUUID(),
        title: t.title || "",
        description: t.description || "",
        expected_time: t.expected_time || "2-4 hours",
        submission_format: t.submission_format || "github_repo",
        ai_tools_allowed: t.ai_tools_allowed ?? true
      }))
    }));
    toast.success("Template applied!");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!values.title || !values.company || !values.location) {
      toast.error("Please fill in all required fields");
      return;
    }

    // 🔒 GUARD: Freemium Limit Check
    const isFreeTier = !company?.subscription_tier || company.subscription_tier === 'free';
    const activeJobs = company?.active_jobs_count || 0;

    // Only block if creating a NEW job (editing ignores specific increment logic for now, though conceptually active count stays same)
    if (mode === "create" && isFreeTier && activeJobs >= FREE_TIER_JOB_LIMIT) {
      toast.error(`Free Tier limit reached (${FREE_TIER_JOB_LIMIT} active jobs). Please upgrade to post more.`);
      return;
    }

    setLoading(true);
    try {
      if (mode === "edit" && onSubmit) {
        await onSubmit(values);
        toast.success("Job updated successfully!");
        onSuccess?.();
      } else {
        await createJobWithTasks(values);
        toast.success("Job posted successfully!");
        onSuccess?.();
        navigate("/employer/dashboard");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit job");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

      {/* LEFT COLUMN: Form */}
      <div className="lg:col-span-2 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-8">

          {/* 1. Basic Info */}
          <Card className="p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600">
                <Briefcase size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[var(--color-text)]">Job Details</h2>
                <p className="text-sm text-[var(--color-text-muted)]">Basic information about the role.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <Input
                  label="Job Title"
                  placeholder="e.g. Senior Frontend Engineer"
                  value={values.title ?? ""}
                  onChange={(e) => handleChange("title", e.target.value)}
                  required
                />
              </div>

              <Input
                label="Company Name"
                placeholder="e.g. Acme Corp"
                value={values.company ?? ""}
                onChange={(e) => handleChange("company", e.target.value)}
                required
              />

              <Input
                label="Location"
                placeholder="e.g. Remote, London, NYC"
                value={values.location ?? ""}
                onChange={(e) => handleChange("location", e.target.value)}
                leftIcon={<MapPin size={16} />}
                required
              />

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[var(--color-text)]">Job Type</label>
                <select
                  className="w-full h-10 px-3 rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface)] text-sm focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 outline-none"
                  value={values.job_type ?? "Full-time"}
                  onChange={(e) => handleChange("job_type", e.target.value)}
                >
                  <option>Full-time</option>
                  <option>Part-time</option>
                  <option>Contract</option>
                  <option>Internship</option>
                  <option>Freelance</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[var(--color-text)]">Work Mode</label>
                <select
                  className="w-full h-10 px-3 rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface)] text-sm focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 outline-none"
                  value={values.work_mode ?? "Remote"}
                  onChange={(e) => handleChange("work_mode", e.target.value)}
                >
                  <option>Remote</option>
                  <option>On-site</option>
                  <option>Hybrid</option>
                </select>
              </div>
            </div>

            <Textarea
              label="Job Description"
              placeholder="Describe the role, responsibilities, and ideal candidate..."
              value={values.description ?? ""}
              onChange={(e) => handleChange("description", e.target.value)}
              className="min-h-[150px]"
              required
            />

            <Textarea
              label="Requirements"
              placeholder="- 3+ years of React experience&#10;- Strong TypeScript skills..."
              value={values.requirements ?? ""}
              onChange={(e) => handleChange("requirements", e.target.value)}
              className="min-h-[120px]"
            />
          </Card>

          {/* 2. Compensation */}
          <Card className="p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                <DollarSign size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[var(--color-text)]">Compensation</h2>
                <p className="text-sm text-[var(--color-text-muted)]">Salary range and currency.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
              <div className="space-y-1.5 col-span-2 md:col-span-1">
                <label className="text-sm font-medium text-[var(--color-text)]">Currency</label>
                <select
                  className="w-full h-10 px-3 rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface)] text-sm"
                  value={values.payment_currency ?? "USD"}
                  onChange={(e) => handleChange("payment_currency", e.target.value)}
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>

              <Input
                label="Min Salary (Annual)"
                type="number"
                placeholder="e.g. 50000"
                value={values.salary_min ?? ""}
                onChange={(e) => handleChange("salary_min", e.target.value)}
              />

              <Input
                label="Max Salary (Annual)"
                type="number"
                placeholder="e.g. 80000"
                value={values.salary_max ?? ""}
                onChange={(e) => handleChange("salary_max", e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="show_salary"
                checked={values.show_salary_range ?? false}
                onChange={(e) => handleChange("show_salary_range", e.target.checked)}
                className="rounded border-[var(--color-border)] text-[var(--color-brand-primary)] focus:ring-[var(--color-brand-primary)]/20"
              />
              <label htmlFor="show_salary" className="text-sm text-[var(--color-text)]">
                Display salary range publicly on job post
              </label>
            </div>
          </Card>

          {/* 3. Proof Tasks (The Core Value) */}
          <Card className="p-6 md:p-8 space-y-6 border-l-4 border-l-[var(--color-brand-primary)] shadow-glow-primary">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-brand-primary)] to-purple-600 flex items-center justify-center text-white shadow-md">
                <BrainCircuit size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[var(--color-text)]">Proof Task</h2>
                <p className="text-sm text-[var(--color-text-muted)]">The practical challenge candidates must solve.</p>
              </div>
            </div>

            {values.proof_tasks?.map((task, index) => (
              <div key={task.id || index} className="p-5 bg-[var(--color-bg)] rounded-[var(--radius-card)] border border-[var(--color-border)] space-y-5 animate-fade-in-up">
                <div className="flex justify-between items-start">
                  <h4 className="font-semibold text-[var(--color-text)] text-sm uppercase tracking-wider">Task Details</h4>
                </div>

                <Input
                  label="Task Title"
                  placeholder="e.g. Build a Responsive Dashboard Component"
                  value={task.title ?? ""}
                  onChange={(e) => handleTaskChange(index, "title", e.target.value)}
                  required
                />

                <Textarea
                  label="Task Instructions"
                  placeholder="Provide clear, step-by-step instructions for the candidate..."
                  value={task.description ?? ""}
                  onChange={(e) => handleTaskChange(index, "description", e.target.value)}
                  className="min-h-[150px] font-mono text-sm"
                  required
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[var(--color-text)]">Submission Format</label>
                    <select
                      className="w-full h-10 px-3 rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface)] text-sm"
                      value={task.submission_format ?? "github_repo"}
                      onChange={(e) => handleTaskChange(index, "submission_format", e.target.value)}
                    >
                      <option value="github_repo">GitHub Repository</option>
                      <option value="file_upload">File Upload (PDF/Zip)</option>
                      <option value="loom_video">Loom Video Walkthrough</option>
                      <option value="link">Valid URL</option>
                      <option value="figma_link">Figma Link</option>
                    </select>
                  </div>

                  <Input
                    label="Estimated Time"
                    placeholder="e.g. 2-4 hours"
                    value={task.expected_time ?? ""}
                    onChange={(e) => handleTaskChange(index, "expected_time", e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id={`ai_tools_${index}`}
                    checked={task.ai_tools_allowed ?? false}
                    onChange={(e) => handleTaskChange(index, "ai_tools_allowed", e.target.checked)}
                    className="rounded border-[var(--color-border)] text-[var(--color-brand-primary)]"
                  />
                  <label htmlFor={`ai_tools_${index}`} className="text-sm text-[var(--color-text)]">
                    Allow AI Tools (ChatGPT, Copilot, etc.) usage
                  </label>
                </div>
              </div>
            ))}
          </Card>

          {/* Submit Action */}
          <div className="flex flex-col items-end gap-2 pt-4">
            <Button
              type="submit"
              size="lg"
              className="w-full md:w-auto px-8"
              isLoading={loading}
              rightIcon={!loading && <ArrowRight size={18} />}
            >
              {submitLabel || "Post Job Now"}
            </Button>

            {/* Limit Warning */}
            {mode === "create" && (!company?.subscription_tier || company.subscription_tier === "free") && (
              <p className="text-xs text-right text-[var(--color-text-muted)]">
                Free Tier: {(company?.active_jobs_count || 0)} / {FREE_TIER_JOB_LIMIT} active jobs used.
              </p>
            )}

          </div>
        </form>
      </div>

      {/* RIGHT COLUMN: Templates/Tips */}
      <div className="space-y-6">
        <div className="sticky top-24 space-y-6">
          <Card className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white border-slate-700">
            <div className="mb-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <FileText size={18} className="text-blue-400" />
                Quick Templates
              </h3>
              <p className="text-slate-300 text-sm mt-1">Don't start from scratch. Pick a role to auto-fill details.</p>
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {JOB_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => applyTemplate(template)}
                  className="w-full text-left p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all group"
                >
                  <p className="font-medium text-sm text-slate-200 group-hover:text-white">{template.label}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">{template.category}</p>
                </button>
              ))}
            </div>
          </Card>

          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-sm">
            <h4 className="font-semibold text-blue-600 mb-2 flex items-center gap-2">
              <BrainCircuit size={16} /> Why Proof Tasks?
            </h4>
            <p className="text-[var(--color-text-muted)] leading-relaxed">
              Jobs with specific proof tasks get <strong>3x higher quality applicants</strong>.
              Candidates prefer showing their skills over writing cover letters.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
