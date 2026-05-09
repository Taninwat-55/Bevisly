import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { createJobWithTasks } from "@/lib/api/jobs";
import { getErrorMessage } from "@/lib/errorUtils";
import type { EmployerJob, ProofTask } from "@/types";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { EmployerJobFormValues } from "@/types/employer";
import {
  Briefcase, MapPin, DollarSign, BrainCircuit, ArrowRight, Calendar, Plus, Trash2,
  ChevronRight, CheckCircle2, AlertTriangle,
} from "lucide-react";
import { POPULAR_JOB_TITLES } from "@/data/popularJobTitles";
import { useCompany } from "@/hooks/useCompany";
import {
  RubricEditor,
  FollowUpQuestionsEditor,
  type ProofTaskRubricErrors,
  type RubricFieldError,
} from "@/components/employer/ProofTasksSection";

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
  const { company, loading: companyLoading } = useCompany();
  const formRef = useRef<HTMLDivElement>(null);


  const [step, setStep] = useState<1 | 2>(1);

  const [values, setValues] = useState<EmployerJobFormValues>({
    title: defaultValues?.title ?? "",
    description: defaultValues?.description ?? "",
    requirements: defaultValues?.requirements ?? "",
    company: defaultValues?.company ?? "",
    location: defaultValues?.location ?? "",
    payment_amount: defaultValues?.payment_amount ?? null,
    paid: defaultValues?.paid ?? true,
    compensation_type: defaultValues?.compensation_type ?? "salary",
    payment_currency: defaultValues?.payment_currency ?? "EUR",
    show_salary_range: true,
    salary_min: defaultValues?.salary_min ?? null,
    salary_max: defaultValues?.salary_max ?? null,
    equity_min: defaultValues?.equity_min ?? null,
    equity_max: defaultValues?.equity_max ?? null,
    pay_period: defaultValues?.pay_period ?? "monthly",
    job_type: defaultValues?.job_type ?? "Full-time",
    department: defaultValues?.department ?? "Engineering",
    work_mode: defaultValues?.work_mode ?? "Remote",
    start_date: defaultValues?.start_date ?? undefined,
    application_deadline: defaultValues?.application_deadline ?? undefined,
    proof_tasks: defaultValues?.proof_tasks ?? [],
  });

  // Sync company name from context into form state.
  // In create mode: always update when context resolves (field is readonly, user can't override).
  // In edit mode: only fill if form is currently empty (don't overwrite user edits).
  useEffect(() => {
    if (mode === "create" && company?.name) {
      setValues((prev) => ({ ...prev, company: company.name }));
    } else if (mode === "edit" && company?.name && !values.company) {
      setValues((prev) => ({ ...prev, company: company.name }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [company?.name, mode]);

  const [loading, setLoading] = useState(false);
  const [rubricErrors, setRubricErrors] = useState<ProofTaskRubricErrors>({});

  const [aiRubricTaskIds, setAiRubricTaskIds] = useState<Set<string>>(() => {
    if (mode !== "create") return new Set();
    const ids = new Set<string>();
    (defaultValues?.proof_tasks ?? []).forEach((t) => {
      const r = t.rubric_criteria;
      if (
        t.id &&
        Array.isArray(r) &&
        r.some((c) => c.name?.trim() && c.description?.trim())
      ) {
        ids.add(t.id);
      }
    });
    return ids;
  });

  const handleChange = (field: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleTaskChange = (index: number, field: keyof ProofTask, value: unknown) => {
    const newTasks = [...(values.proof_tasks || [])];
    newTasks[index] = { ...newTasks[index], [field]: value };
    handleChange("proof_tasks", newTasks);
  };

  function scrollToTop() {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function advanceToStep2() {
    const errors: string[] = [];
    if (!values.title?.trim()) errors.push("Job Title");
    // Company name is auto-filled from context in create mode — user can't edit it, so skip client-side validation
    if (mode === "edit" && !values.company?.trim()) errors.push("Company Name");
    if (!values.location?.trim()) errors.push("Location");
    if (!values.description?.trim()) errors.push("Job Description");
    const needsSalary = values.compensation_type === "salary" || values.compensation_type === "salary_and_equity";
    const needsEquity = values.compensation_type === "equity_only" || values.compensation_type === "salary_and_equity";
    if (needsSalary && !values.salary_min) errors.push("Min Salary");
    if (needsSalary && !values.salary_max) errors.push("Max Salary");
    if (needsEquity && !values.equity_min) errors.push("Min Equity %");
    if (needsEquity && !values.equity_max) errors.push("Max Equity %");
    if (errors.length > 0) {
      toast.error(`Please fill in: ${errors.join(", ")}`);
      return;
    }
    setStep(2);
    scrollToTop();
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const missingFields: string[] = [];
    if (!values.title?.trim()) missingFields.push("Job Title");
    // In create mode, company is auto-resolved server-side via company_id lookup
    if (mode === "edit" && !values.company?.trim()) missingFields.push("Company Name");
    if (!values.location?.trim()) missingFields.push("Location");
    if (!values.description?.trim()) missingFields.push("Job Description");
    const needsSalary = values.compensation_type === "salary" || values.compensation_type === "salary_and_equity";
    const needsEquity = values.compensation_type === "equity_only" || values.compensation_type === "salary_and_equity";
    if (needsSalary && !values.salary_min) missingFields.push("Min Salary");
    if (needsSalary && !values.salary_max) missingFields.push("Max Salary");
    if (needsEquity && !values.equity_min) missingFields.push("Min Equity %");
    if (needsEquity && !values.equity_max) missingFields.push("Max Equity %");

    const nextRubricErrors: ProofTaskRubricErrors = {};
    let firstFailingTaskIndex: number | null = null;

    values.proof_tasks?.forEach((task, index) => {
      if (!task.title?.trim()) missingFields.push(`Task Title (Task ${index + 1})`);
      if (!task.description?.trim()) missingFields.push(`Task Instructions (Task ${index + 1})`);

      if (task.rubric_locked_at) return;

      const rubric = task.rubric_criteria ?? [];
      const countOutOfRange = rubric.length < 3 || rubric.length > 5;
      const totalWeight = rubric.reduce((sum, c) => sum + (Number(c.weight) || 0), 0);
      const weightSumWrong = !countOutOfRange && totalWeight !== 100;
      const fields: RubricFieldError[] = rubric.map((c) => ({
        nameMissing: !c.name?.trim(),
        descriptionMissing: !c.description?.trim(),
      }));
      const anyFieldMissing = fields.some((f) => f.nameMissing || f.descriptionMissing);

      if (countOutOfRange || weightSumWrong || anyFieldMissing) {
        nextRubricErrors[index] = { countOutOfRange, weightSumWrong, fields };
        if (firstFailingTaskIndex === null) firstFailingTaskIndex = index;
      }
    });

    setRubricErrors(nextRubricErrors);

    if (missingFields.length > 0) {
      toast.error(`Please fill in: ${missingFields.join(", ")}`);
      return;
    }

    if (Object.keys(nextRubricErrors).length > 0) {
      toast.error("Scoring rubric needs attention. See the highlighted task below.");
      if (firstFailingTaskIndex !== null) {
        const node = document.getElementById(`proof-task-${firstFailingTaskIndex}`);
        node?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    if (needsSalary) {
      if (values.salary_min !== null && Number(values.salary_min) < 0) {
        toast.error("Salary amounts cannot be negative");
        return;
      }
      if (values.salary_max !== null && Number(values.salary_max) < 0) {
        toast.error("Salary amounts cannot be negative");
        return;
      }
      if (
        values.salary_min !== null &&
        values.salary_max !== null &&
        Number(values.salary_min) > Number(values.salary_max)
      ) {
        toast.error("Minimum salary cannot be greater than maximum salary");
        return;
      }
    }
    if (needsEquity) {
      if (values.equity_min !== null && Number(values.equity_min) < 0) {
        toast.error("Equity percentage cannot be negative");
        return;
      }
      if (
        values.equity_min !== null &&
        values.equity_max !== null &&
        Number(values.equity_min) > Number(values.equity_max)
      ) {
        toast.error("Minimum equity cannot be greater than maximum equity");
        return;
      }
    }

    // Derive `paid` from compensation_type before saving
    values.paid = needsSalary;

    const isFreeTier = !company?.subscription_tier || company.subscription_tier === "free";
    const activeJobs = company?.active_jobs_count || 0;

    if (mode === "create" && isFreeTier && activeJobs >= FREE_TIER_JOB_LIMIT) {
      toast.error(`Free Tier limit reached (${FREE_TIER_JOB_LIMIT} active jobs). Please upgrade to post more.`);
      return;
    }

    setLoading(true);
    try {
      if (mode === "edit" && onSubmit) {
        await onSubmit(values as Partial<EmployerJob & { proof_tasks?: ProofTask[] }>);
        toast.success("Job updated successfully!");
        onSuccess?.();
      } else {
        await createJobWithTasks(values as Partial<EmployerJob & { proof_tasks?: ProofTask[] }>);
        toast.success("Job posted successfully!");
        onSuccess?.();
        navigate("/employer");
      }
    } catch (err: unknown) {
      console.error(err);
      toast.error(getErrorMessage(err, "Failed to submit job"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={formRef} className="max-w-4xl mx-auto">

      {/* Step Indicator */}
      <div className="flex items-center gap-3 mb-6 px-1">
        <button
          type="button"
          onClick={() => { setStep(1); scrollToTop(); }}
          className="flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <span
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
              step === 1
                ? "bg-[var(--color-brand-primary)] text-white"
                : "bg-emerald-500 text-white"
            }`}
          >
            {step === 1 ? "1" : <CheckCircle2 size={14} />}
          </span>
          <span className={step === 1 ? "text-[var(--color-text)]" : "text-[var(--color-text-muted)]"}>
            Job Details
          </span>
        </button>

        <ChevronRight size={14} className="text-[var(--color-border)]" />

        <div className="flex items-center gap-2 text-sm font-medium">
          <span
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
              step === 2
                ? "bg-[var(--color-brand-primary)] text-white"
                : "bg-[var(--color-border)] text-[var(--color-text-muted)]"
            }`}
          >
            2
          </span>
          <span className={step === 2 ? "text-[var(--color-text)]" : "text-[var(--color-text-muted)]"}>
            Proof Task
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
            Optional
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ── STEP 1: JOB DETAILS ── */}
        {step === 1 && (
          <>
            {/* Basic Info */}
            <Card className="p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-3">
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
                    list="job-titles-list"
                  />
                  <datalist id="job-titles-list">
                    {POPULAR_JOB_TITLES.map((t) => (
                      <option key={t} value={t} />
                    ))}
                  </datalist>
                </div>

                <div className="relative">
                  <Input
                    label="Company Name"
                    placeholder={companyLoading ? "Loading..." : "e.g. Acme Corp"}
                    value={values.company ?? ""}
                    onChange={(e) => mode === "edit" ? handleChange("company", e.target.value) : undefined}
                    required
                    readOnly={mode === "create"}
                    className={mode === "create" ? "bg-[var(--color-surface-hover)] cursor-default" : ""}
                  />
                  {mode === "create" && (
                    <p className="text-xs text-[var(--color-text-muted)] mt-1.5">
                      {companyLoading
                        ? "Fetching your company name..."
                        : <>Auto-filled from your company settings. To change it, go to <button type="button" onClick={() => navigate("/employer/settings")} className="text-[var(--color-brand-primary)] hover:underline">Settings</button>.</>
                      }
                    </p>
                  )}
                </div>

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
                    className="w-full h-10 px-3 rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] text-sm focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 outline-none"
                    value={values.job_type ?? "Full-time"}
                    onChange={(e) => handleChange("job_type", e.target.value)}
                  >
                    <option>Full-time</option>
                    <option>Part-time</option>
                    <option>Contract</option>
                    <option>Internship</option>
                    <option>Freelance</option>
                    <option>Volunteer</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[var(--color-text)]">Work Mode</label>
                  <select
                    className="w-full h-10 px-3 rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] text-sm focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 outline-none"
                    value={values.work_mode ?? "Remote"}
                    onChange={(e) => handleChange("work_mode", e.target.value)}
                  >
                    <option>Remote</option>
                    <option>On-site</option>
                    <option>Hybrid</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Input
                    label="Start Date (Optional)"
                    type="date"
                    value={values.start_date ?? ""}
                    onChange={(e) => handleChange("start_date", e.target.value)}
                    leftIcon={<Calendar size={16} />}
                  />
                </div>

                <div className="space-y-1.5">
                  <Input
                    label="Application Deadline (Optional)"
                    type="date"
                    value={values.application_deadline ?? ""}
                    onChange={(e) => handleChange("application_deadline", e.target.value)}
                    leftIcon={<Calendar size={16} />}
                  />
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

            {/* Compensation */}
            <Card className="p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                  <DollarSign size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[var(--color-text)]">Compensation</h2>
                  <p className="text-sm text-[var(--color-text-muted)]">Salary transparency is required on Bevisly. Candidates see your real numbers.</p>
                </div>
              </div>

              {/* Compensation type */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[var(--color-text)]">Compensation type</label>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      { value: "salary", label: "Salary" },
                      { value: "salary_and_equity", label: "Salary + Equity" },
                      { value: "equity_only", label: "Equity only" },
                      { value: "volunteer", label: "Volunteer / Unpaid" },
                    ] as const
                  ).map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() =>
                        setValues((prev) => ({
                          ...prev,
                          compensation_type: value,
                          salary_min: value === "equity_only" || value === "volunteer" ? null : prev.salary_min,
                          salary_max: value === "equity_only" || value === "volunteer" ? null : prev.salary_max,
                          equity_min: value === "salary" || value === "volunteer" ? null : prev.equity_min,
                          equity_max: value === "salary" || value === "volunteer" ? null : prev.equity_max,
                        }))
                      }
                      className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all whitespace-nowrap ${
                        values.compensation_type === value
                          ? "bg-[var(--color-brand-primary)] text-white border-[var(--color-brand-primary)]"
                          : "bg-[var(--color-surface)] text-[var(--color-text-muted)] border-[var(--color-border)] hover:text-[var(--color-text)] hover:border-[var(--color-brand-primary)]/50 hover:bg-[var(--color-brand-primary)]/5"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Salary fields */}
              {(values.compensation_type === "salary" || values.compensation_type === "salary_and_equity") && (
                <div className="space-y-4 animate-fade-in">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[var(--color-text)]">Pay period</label>
                    <div className="inline-flex rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-1 gap-1">
                      {(["monthly", "yearly"] as const).map((period) => (
                        <button
                          key={period}
                          type="button"
                          onClick={() => handleChange("pay_period", period)}
                          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                            values.pay_period === period
                              ? "bg-[var(--color-surface)] text-[var(--color-text)] shadow-sm border border-[var(--color-border)]"
                              : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                          }`}
                        >
                          {period === "monthly" ? "Monthly" : "Yearly"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-[var(--color-text)]">Currency</label>
                      <select
                        className="w-full h-10 px-3 rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] text-sm"
                        value={values.payment_currency ?? "EUR"}
                        onChange={(e) => handleChange("payment_currency", e.target.value)}
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="SEK">SEK (kr)</option>
                        <option value="NOK">NOK (kr)</option>
                        <option value="DKK">DKK (kr)</option>
                        <option value="ISK">ISK (kr)</option>
                      </select>
                    </div>
                    <Input
                      label="Min salary *"
                      type="number"
                      placeholder={values.pay_period === "yearly" ? "e.g. 400000" : "e.g. 35000"}
                      value={values.salary_min ?? ""}
                      onChange={(e) => handleChange("salary_min", e.target.value)}
                    />
                    <Input
                      label="Max salary *"
                      type="number"
                      placeholder={values.pay_period === "yearly" ? "e.g. 500000" : "e.g. 45000"}
                      value={values.salary_max ?? ""}
                      onChange={(e) => handleChange("salary_max", e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Divider between salary and equity when showing both */}
              {values.compensation_type === "salary_and_equity" && (
                <hr className="border-[var(--color-border)]" />
              )}

              {/* Equity fields */}
              {(values.compensation_type === "equity_only" || values.compensation_type === "salary_and_equity") && (
                <div className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Min equity (%) *"
                      type="number"
                      placeholder="e.g. 0.1"
                      value={values.equity_min ?? ""}
                      onChange={(e) => handleChange("equity_min", e.target.value)}
                    />
                    <Input
                      label="Max equity (%) *"
                      type="number"
                      placeholder="e.g. 0.5"
                      value={values.equity_max ?? ""}
                      onChange={(e) => handleChange("equity_max", e.target.value)}
                    />
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Typical early-stage employee equity is 0.01%–2%. Be specific — candidates use this to evaluate the offer.
                  </p>
                </div>
              )}

              {/* Volunteer note */}
              {values.compensation_type === "volunteer" && (
                <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-5 py-4 text-sm text-[var(--color-text-muted)] animate-fade-in">
                  This position offers no monetary compensation or equity. Candidates will see it clearly labelled as <strong className="text-[var(--color-text)]">Volunteer / Unpaid</strong> on the listing.
                </div>
              )}

              <p className="text-xs text-[var(--color-text-muted)] italic">
                Compensation details are always displayed publicly on your job post.
              </p>
            </Card>

            {/* Step 1 Nav */}
            <div className="flex items-center justify-end pt-2">
              <Button
                type="button"
                size="lg"
                className="px-8"
                onClick={advanceToStep2}
                rightIcon={<ArrowRight size={18} />}
              >
                Next: Proof Task
              </Button>
            </div>
          </>
        )}

        {/* ── STEP 2: PROOF TASK ── */}
        {step === 2 && (
          <>
            <Card className="p-6 md:p-8 space-y-6 border-l-4 border-l-[var(--color-brand-primary)] shadow-glow-primary">
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-[var(--color-text)] flex items-center gap-2">
                    Proof Task
                    <span className="text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
                      Optional
                    </span>
                  </h2>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const newTask: ProofTask = {
                        id: crypto.randomUUID(),
                        title: "",
                        description: "",
                        expected_time: "1–2 hours",
                        submission_format: "link",
                        submission_type: "link",
                        rubric_criteria: [
                          { name: "", weight: 34, description: "" },
                          { name: "", weight: 33, description: "" },
                          { name: "", weight: 33, description: "" },
                        ],
                      };
                      handleChange("proof_tasks", [...(values.proof_tasks || []), newTask]);
                    }}
                    leftIcon={<Plus size={14} />}
                  >
                    Add Task
                  </Button>
                </div>
                <p className="text-sm text-[var(--color-text-muted)] mt-1">
                  The practical challenge candidates must solve. Includes a scoring rubric and optional follow-up questions.
                </p>
              </div>

              {(!values.proof_tasks || values.proof_tasks.length === 0) && (
                <div className="text-center py-10 border-2 border-dashed border-[var(--color-border)] rounded-2xl bg-[var(--color-bg)]/50">
                  <BrainCircuit size={40} className="mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                  <p className="text-[var(--color-text-muted)] text-sm max-w-xs mx-auto mb-4">
                    No proof task added. Candidates will only submit their profile and resume.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      const newTask: ProofTask = {
                        id: crypto.randomUUID(),
                        title: "",
                        description: "",
                        expected_time: "1–2 hours",
                        submission_format: "link",
                        submission_type: "link",
                        rubric_criteria: [
                          { name: "", weight: 34, description: "" },
                          { name: "", weight: 33, description: "" },
                          { name: "", weight: 33, description: "" },
                        ],
                      };
                      handleChange("proof_tasks", [newTask]);
                    }}
                    className="text-sm font-medium text-[var(--color-brand-primary)] hover:underline"
                  >
                    + Add a proof task
                  </button>
                </div>
              )}

              {values.proof_tasks?.map((task, index) => (
                <div
                  key={task.id || index}
                  id={`proof-task-${index}`}
                  className="p-6 bg-[var(--color-bg)] rounded-[var(--radius-card)] border border-[var(--color-border)] space-y-6 animate-fade-in-up scroll-mt-24"
                >
                  <div className="flex items-center">
                    {(values.proof_tasks?.length ?? 0) > 1 && (
                      <span className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">Task {index + 1}</span>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newTasks = values.proof_tasks?.filter((_, i) => i !== index);
                        handleChange("proof_tasks", newTasks);
                      }}
                      className="ml-auto text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>

                  <Input
                    label="Task Title"
                    placeholder="e.g. Build a Responsive Dashboard Component"
                    value={task.title ?? ""}
                    onChange={(e) => handleTaskChange(index, "title", e.target.value)}
                    required
                  />

                  <div className="space-y-1">
                    <Textarea
                      label="Task Instructions"
                      placeholder="Provide clear, step-by-step instructions for the candidate..."
                      value={task.description ?? ""}
                      onChange={(e) => handleTaskChange(index, "description", e.target.value)}
                      className="min-h-[150px] font-mono text-sm"
                      required
                    />
                    <p className="text-xs text-[var(--color-text-muted)]">
                      Candidates can submit via link, file upload, or text — any format that best shows their work.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[var(--color-text)]">Estimated Time</label>
                    <select
                      className="w-full h-10 px-3 rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] text-sm focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 focus:outline-none"
                      value={task.expected_time ?? "1–2 hours"}
                      onChange={(e) => handleTaskChange(index, "expected_time", e.target.value)}
                    >
                      <option value="&lt; 30 min">&lt; 30 min</option>
                      <option value="~1 hour">~1 hour</option>
                      <option value="1–2 hours">1–2 hours</option>
                      <option value="2–4 hours">2–4 hours</option>
                      <option value="Half day">Half day</option>
                      <option value="Full day">Full day</option>
                    </select>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      Bevisly recommends 1–3 hours max to maximise candidate quality.
                    </p>
                    {(task.expected_time === "Half day" || task.expected_time === "Full day") && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                        <AlertTriangle size={12} />
                        Tasks over 4 hours see significantly higher drop-off. Consider breaking it into smaller stages.
                      </p>
                    )}
                  </div>

                  <RubricEditor
                    task={task}
                    aiSuggested={!!task.id && aiRubricTaskIds.has(task.id)}
                    onChange={(criteria) => {
                      handleTaskChange(index, "rubric_criteria", criteria);
                      if (rubricErrors[index]) {
                        setRubricErrors((prev) => {
                          const next = { ...prev };
                          delete next[index];
                          return next;
                        });
                      }
                      if (task.id && aiRubricTaskIds.has(task.id)) {
                        setAiRubricTaskIds((prev) => {
                          const next = new Set(prev);
                          next.delete(task.id!);
                          return next;
                        });
                      }
                    }}
                    errors={rubricErrors[index]}
                  />

                  <FollowUpQuestionsEditor
                    questions={task.follow_up_questions ?? []}
                    onChange={(qs) => handleTaskChange(index, "follow_up_questions", qs)}
                  />
                </div>
              ))}
            </Card>

            {/* Step 2 Nav */}
            <div className="flex items-center justify-between pt-2">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => { setStep(1); scrollToTop(); }}
              >
                ← Back
              </Button>

              <div className="flex flex-col items-end gap-2">
                <Button
                  type="submit"
                  size="lg"
                  className="px-8"
                  isLoading={loading}
                  rightIcon={!loading ? <ArrowRight size={18} /> : undefined}
                >
                  {submitLabel || "Publish Job"}
                </Button>

                {mode === "create" && (!company?.subscription_tier || company.subscription_tier === "free") && (
                  <p className="text-xs text-right text-[var(--color-text-muted)]">
                    Free Tier: {company?.active_jobs_count || 0} / {FREE_TIER_JOB_LIMIT} active jobs used.
                  </p>
                )}
              </div>
            </div>
          </>
        )}

      </form>
    </div>
  );
}
