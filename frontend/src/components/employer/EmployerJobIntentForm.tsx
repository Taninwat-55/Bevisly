import { useState } from "react";
import {
  Sparkles, ArrowRight, Loader2, X, Rocket, ChevronDown,
  CheckCircle2, MessageSquare, ListChecks,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { generateJobListing, type GeneratedJobListing } from "@/lib/api/ai";
import { createJobWithTasks } from "@/lib/api/jobs";
import toast from "react-hot-toast";
import type { EmployerJob, ProofTask } from "@/types";

interface EmployerJobIntentFormProps {
  onClose: () => void;
  onGenerated: (jobData: Partial<EmployerJob & { proof_tasks: ProofTask[] }>) => void;
  onLaunched?: () => Promise<void>;
  companyName: string;
  companyDescription?: string | null;
  companyMission?: string | null;
  companyCulture?: string | null;
}

type CompensationType = "salary" | "salary_and_equity" | "equity_only" | "volunteer";

const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Internship", "Freelance", "Volunteer"];
const WORK_MODES = ["Remote", "On-site", "Hybrid"];
const COMP_TYPES: { value: CompensationType; label: string }[] = [
  { value: "salary", label: "Salary" },
  { value: "salary_and_equity", label: "Salary + Equity" },
  { value: "equity_only", label: "Equity only" },
  { value: "volunteer", label: "No pay (Volunteer)" },
];

export default function EmployerJobIntentForm({
  onClose,
  onGenerated,
  onLaunched,
  companyName,
  companyDescription,
  companyMission,
  companyCulture,
}: EmployerJobIntentFormProps) {
  const [stage, setStage] = useState<"input" | "review">("input");
  const [rawInput, setRawInput] = useState("");
  const [durationMinutes, setDurationMinutes] = useState<30 | 60 | 120 | 180>(60);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const [generated, setGenerated] = useState<GeneratedJobListing | null>(null);

  // Quick review form fields
  const [jobType, setJobType] = useState("Full-time");
  const [workMode, setWorkMode] = useState("Remote");
  const [location, setLocation] = useState("");
  const [compType, setCompType] = useState<CompensationType>("salary");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawInput.trim()) {
      toast.error("Please paste your job requirements or description.");
      return;
    }
    setIsGenerating(true);
    try {
      const data = await generateJobListing(rawInput, companyName, {
        description: companyDescription,
        mission: companyMission,
        culture: companyCulture,
      }, durationMinutes);
      setGenerated(data);
      setJobType(data.job_type || "Full-time");
      setWorkMode(data.work_mode || "Remote");
      setLocation(data.location || "");
      setStage("review");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate job listing. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const buildJobPayload = (): Partial<EmployerJob & { proof_tasks: ProofTask[] }> => {
    if (!generated) return {};
    return {
      title: generated.title || "Untitled Job",
      description: generated.description,
      requirements: Array.isArray(generated.requirements)
        ? (generated.requirements as string[]).join("\n")
        : generated.requirements,
      location,
      job_type: jobType,
      work_mode: workMode,
      compensation_type: compType,
      paid: compType !== "volunteer",
      show_salary_range: true,
      payment_currency: "DKK",
      pay_period: "monthly",
      salary_min: salaryMin ? Number(salaryMin) : null,
      salary_max: salaryMax ? Number(salaryMax) : null,
      proof_tasks: generated.proof_tasks.map((task) => ({
        ...task,
        id: crypto.randomUUID(),
        follow_up_questions: task.follow_up_questions ?? [],
      })) as ProofTask[],
    };
  };

  const handleLaunch = async () => {
    if (!generated) return;
    if (!location.trim()) {
      toast.error("Please enter a location.");
      return;
    }
    const needsSalary = compType === "salary" || compType === "salary_and_equity";
    if (needsSalary && (!salaryMin || !salaryMax)) {
      toast.error("Please enter a salary range.");
      return;
    }
    setIsLaunching(true);
    try {
      await createJobWithTasks(buildJobPayload());
      toast.success("Job launched!");
      await onLaunched?.();
    } catch (err) {
      console.error(err);
      toast.error("Failed to launch job. Please try again.");
    } finally {
      setIsLaunching(false);
    }
  };

  const handleCustomize = () => {
    if (!generated) return;
    onGenerated(buildJobPayload());
  };

  const needsSalary = compType === "salary" || compType === "salary_and_equity";
  const task = generated?.proof_tasks?.[0];

  // ── Input Stage ─────────────────────────────────────────────
  if (stage === "input") {
    return (
      <div className="relative w-full max-w-lg mx-auto flex flex-col justify-center">
        <div className="absolute -top-4 right-0 md:-right-4">
          <button
            onClick={onClose}
            className="p-2 text-white/50 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[var(--color-brand-primary)] shadow-lg shadow-blue-500/30 mb-4">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-1 font-display">Let AI build your job post</h2>
          <p className="text-base text-slate-400">
            Paste your rough requirements or an existing job description. AI generates the task, rubric, and interview questions — then you launch in one click.
          </p>
        </div>

        <form onSubmit={handleGenerate} className="space-y-4">
          <textarea
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            placeholder="e.g. We need a Senior React dev who knows Tailwind and Supabase. Looking for 5+ years experience. Need them to lead the frontend rewrite."
            className="w-full h-40 min-h-[120px] p-4 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:border-[var(--color-brand-primary)]/50 focus:ring-1 focus:ring-[var(--color-brand-primary)]/50 focus:outline-none resize-y"
            autoFocus
          />
          <div className="space-y-1.5">
            <p className="text-xs text-slate-400">Proof task length</p>
            <div className="flex gap-2">
              {([
                { label: "30 min", value: 30 },
                { label: "1 hour", value: 60 },
                { label: "2 hours", value: 120 },
                { label: "3 hours", value: 180 },
              ] as const).map((tier) => (
                <button
                  key={tier.value}
                  type="button"
                  onClick={() => setDurationMinutes(tier.value)}
                  className={`flex-1 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                    durationMinutes === tier.value
                      ? "bg-[var(--color-brand-primary)] border-[var(--color-brand-primary)] text-white"
                      : "border-white/10 text-slate-400 hover:border-[var(--color-brand-primary)]/50"
                  }`}
                >
                  {tier.label}
                </button>
              ))}
            </div>
          </div>
          <Button type="submit" disabled={isGenerating} className="w-full h-12 text-base font-semibold">
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                Generate Job Listing <ArrowRight className="ml-2 w-5 h-5" />
              </>
            )}
          </Button>
        </form>
      </div>
    );
  }

  // ── Review Stage ─────────────────────────────────────────────
  return (
    <div className="relative w-full max-w-lg mx-auto flex flex-col">
      <div className="absolute -top-4 right-0 md:-right-4">
        <button
          onClick={onClose}
          className="p-2 text-white/50 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-full"
        >
          <X size={20} />
        </button>
      </div>

      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        </div>
        <div>
          <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">AI Generated</p>
          <p className="text-sm text-slate-400">Review and launch, or customize further</p>
        </div>
      </div>

      {/* Generated Preview */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 mb-4 space-y-3">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">Job Title</p>
          <p className="text-white font-semibold text-base">{generated?.title}</p>
        </div>

        {task && (
          <>
            <div className="border-t border-white/10 pt-3">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <ListChecks className="w-3 h-3" /> Proof Task
              </p>
              <p className="text-white/90 text-sm font-medium">{task.title}</p>
              <p className="text-slate-400 text-xs mt-0.5">{task.expected_time}</p>
              {task.rubric_criteria && task.rubric_criteria.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {task.rubric_criteria.map((c, i) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-brand-primary)]/15 text-[var(--color-brand-primary)] border border-[var(--color-brand-primary)]/20"
                    >
                      {c.name} <span className="opacity-60">{c.weight}%</span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {task.follow_up_questions && task.follow_up_questions.length > 0 && (
              <div className="border-t border-white/10 pt-3">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" /> Follow-up Interview Questions
                </p>
                <ul className="space-y-1">
                  {task.follow_up_questions.map((q, i) => (
                    <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                      <span className="text-slate-600 shrink-0 mt-0.5">{i + 1}.</span>
                      {q}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>

      {/* Required Fields */}
      <div className="space-y-3 mb-5">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Job Type</label>
            <div className="relative">
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                className="w-full appearance-none bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[var(--color-brand-primary)]/50 focus:outline-none pr-8"
              >
                {JOB_TYPES.map((t) => <option key={t} value={t} className="bg-slate-900">{t}</option>)}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Work Mode</label>
            <div className="relative">
              <select
                value={workMode}
                onChange={(e) => setWorkMode(e.target.value)}
                className="w-full appearance-none bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[var(--color-brand-primary)]/50 focus:outline-none pr-8"
              >
                {WORK_MODES.map((m) => <option key={m} value={m} className="bg-slate-900">{m}</option>)}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs text-slate-400 mb-1 block">Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Remote, Copenhagen, London"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/25 focus:border-[var(--color-brand-primary)]/50 focus:outline-none"
          />
        </div>

        <div>
          <label className="text-xs text-slate-400 mb-1 block">Compensation</label>
          <div className="relative">
            <select
              value={compType}
              onChange={(e) => setCompType(e.target.value as CompensationType)}
              className="w-full appearance-none bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[var(--color-brand-primary)]/50 focus:outline-none pr-8"
            >
              {COMP_TYPES.map((c) => (
                <option key={c.value} value={c.value} className="bg-slate-900">{c.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {needsSalary && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Min salary (DKK/mo)</label>
              <input
                type="number"
                value={salaryMin}
                onChange={(e) => setSalaryMin(e.target.value)}
                placeholder="e.g. 3000"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/25 focus:border-[var(--color-brand-primary)]/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Max salary (DKK/mo)</label>
              <input
                type="number"
                value={salaryMax}
                onChange={(e) => setSalaryMax(e.target.value)}
                placeholder="e.g. 4500"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/25 focus:border-[var(--color-brand-primary)]/50 focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2">
        <Button
          onClick={handleLaunch}
          disabled={isLaunching}
          className="w-full h-12 text-base font-semibold"
        >
          {isLaunching ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Launching...
            </>
          ) : (
            <>
              <Rocket className="w-5 h-5 mr-2" />
              Launch Now
            </>
          )}
        </Button>
        <button
          onClick={handleCustomize}
          className="text-sm text-slate-400 hover:text-white transition-colors py-2"
        >
          Customize before publishing →
        </button>
      </div>

      <button
        onClick={() => setStage("input")}
        className="mt-3 text-xs text-slate-600 hover:text-slate-400 transition-colors text-center"
      >
        ← Start over
      </button>
    </div>
  );
}
