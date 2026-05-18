import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Compass, ChevronRight, ChevronLeft, CheckCircle2, Loader2,
  MapPin, TrendingUp, AlertCircle, BookOpen, Search, BrainCircuit,
  GitBranch, Target, Sparkles, RefreshCw,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Input } from "@/components/ui/Input";
import AILoadingState from "@/components/common/AILoadingState";
import { runCareerCompass } from "@/lib/api/ai";
import type { CareerCompassResult } from "@/lib/api/ai";
import toast from "react-hot-toast";

// ── Types ────────────────────────────────────────────────────────────────────

type Screen = "loading" | "blocked" | "intro" | 1 | 2 | 3 | "analyzing" | "results";

interface IntakeData {
  experience_years: string;
  target_roles: string[];
  company_types: string[];
  work_arrangement: string;
  career_goal: string;
  biggest_strength: string;
  perceived_blocker: string;
  active_learning: string;
  urgency: string;
}

interface EducationEntry {
  level: string;
  field?: string;
  institution?: string;
  graduation_year?: string;
}

interface GateInfo {
  completenessScore: number;
  hasSubmission: boolean;
  missingFields: string[];
}

interface PreviousSession {
  id: string;
  created_at: string;
  status: string;
  ai_output: CareerCompassResult | null;
}

// ── Constants ────────────────────────────────────────────────────────────────

const EXPERIENCE_OPTIONS = ["None yet", "Less than 1 year", "1–2 years", "3–5 years", "5+ years"];
const ROLE_OPTIONS = ["Software Engineering", "Product Design", "Data & Analytics", "Marketing & Growth", "Operations", "Content & Writing", "Project Management", "Sales", "Other"];
const COMPANY_TYPE_OPTIONS = ["Early-stage startup", "Growth startup", "SME", "Large corporate", "Agency", "Nonprofit"];
const WORK_ARRANGEMENT_OPTIONS = ["Remote", "Hybrid", "On-site", "Flexible"];
const URGENCY_OPTIONS = ["Actively applying now", "Open to opportunities", "Just exploring"];

const COMPASS_LOADING_STEPS = [
  { label: "Reading your proof history…", icon: Search },
  { label: "Analysing rubric patterns…", icon: BrainCircuit },
  { label: "Mapping to career paths…", icon: GitBranch },
  { label: "Generating gap analysis…", icon: Target },
  { label: "Wrapping up your results…", icon: Sparkles },
];

const EMPTY_INTAKE: IntakeData = {
  experience_years: "", target_roles: [], company_types: [], work_arrangement: "",
  career_goal: "", biggest_strength: "", perceived_blocker: "", active_learning: "", urgency: "",
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function toggleArrayItem(arr: string[], item: string, max?: number): string[] {
  if (arr.includes(item)) return arr.filter((v) => v !== item);
  if (max && arr.length >= max) return arr;
  return [...arr, item];
}

const GAP_COLORS: Record<string, string> = {
  minor: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  moderate: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  significant: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

// ── Sub-components ───────────────────────────────────────────────────────────

function ProgressBar({ step }: { step: 1 | 2 | 3 }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {[1, 2, 3].map((s) => (
        <div key={s} className="flex items-center gap-2 flex-1">
          <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shrink-0 transition-all ${
            s < step ? "bg-[var(--color-brand-primary)] text-white" :
            s === step ? "bg-[var(--color-brand-primary)] text-white ring-4 ring-[var(--color-brand-primary)]/20" :
            "bg-[var(--color-surface-hover)] text-[var(--color-text-muted)]"
          }`}>
            {s < step ? <CheckCircle2 size={14} /> : s}
          </div>
          {s < 3 && <div className={`h-0.5 flex-1 rounded-full transition-all ${s < step ? "bg-[var(--color-brand-primary)]" : "bg-[var(--color-border)]"}`} />}
        </div>
      ))}
      <span className="text-xs text-[var(--color-text-muted)] ml-2 shrink-0">Step {step} of 3</span>
    </div>
  );
}

function ChipToggle({ options, selected, onToggle, max }: { options: string[]; selected: string[]; onToggle: (v: string) => void; max?: number }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = selected.includes(opt);
        const disabled = !active && !!max && selected.length >= max;
        return (
          <button key={opt} type="button" disabled={disabled} onClick={() => onToggle(opt)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
              active ? "bg-[var(--color-brand-primary)] text-white border-[var(--color-brand-primary)]" :
              disabled ? "opacity-40 cursor-not-allowed border-[var(--color-border)] text-[var(--color-text-muted)]" :
              "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-brand-primary)] hover:text-[var(--color-brand-primary)]"
            }`}>{opt}</button>
        );
      })}
    </div>
  );
}

function RadioToggle({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button key={opt} type="button" onClick={() => onChange(opt)}
          className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
            value === opt ? "bg-[var(--color-brand-primary)] text-white border-[var(--color-brand-primary)]" :
            "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-brand-primary)] hover:text-[var(--color-brand-primary)]"
          }`}>{opt}</button>
      ))}
    </div>
  );
}

// ── Results screen ───────────────────────────────────────────────────────────

function ResultsScreen({ result, onNewSession }: { result: CareerCompassResult; onNewSession: () => void }) {
  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--color-brand-primary)]/10 flex items-center justify-center">
            <Compass size={16} className="text-[var(--color-brand-primary)]" />
          </div>
          <h1 className="text-xl font-bold text-[var(--color-text)]">Your Career Compass</h1>
        </div>
        <Button variant="ghost" size="sm" onClick={onNewSession} leftIcon={<RefreshCw size={14} />}>
          New session
        </Button>
      </div>

      {/* Overall summary */}
      <div className="p-5 rounded-2xl border border-[var(--color-brand-primary)]/20 bg-[var(--color-brand-primary)]/5">
        <p className="text-sm font-medium text-[var(--color-brand-primary)] mb-2 uppercase tracking-wider">Overview</p>
        <p className="text-[var(--color-text)] leading-relaxed">{result.overall_summary}</p>
      </div>

      {/* Career Direction */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <MapPin size={18} className="text-[var(--color-brand-primary)]" />
          <h2 className="text-lg font-bold text-[var(--color-text)]">Career Direction</h2>
        </div>
        <div className="space-y-3">
          {result.career_direction.map((item) => (
            <div key={item.role} className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
              <div className="flex items-start justify-between gap-4 mb-3">
                <h3 className="font-bold text-[var(--color-text)]">{item.role}</h3>
                <div className="flex items-center gap-1.5 shrink-0">
                  <div className="w-20 h-2 rounded-full bg-[var(--color-surface-hover)] overflow-hidden">
                    <div className="h-full rounded-full bg-[var(--color-brand-primary)]" style={{ width: `${item.fit_score}%` }} />
                  </div>
                  <span className="text-sm font-bold text-[var(--color-brand-primary)]">{item.fit_score}%</span>
                </div>
              </div>
              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed mb-3">{item.reasoning}</p>
              <div className="flex flex-wrap gap-1.5">
                {item.key_strengths.map((s) => (
                  <span key={s} className="px-2.5 py-1 rounded-full bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] text-xs font-medium">{s}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Proof Readiness */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={18} className="text-[var(--color-brand-primary)]" />
          <h2 className="text-lg font-bold text-[var(--color-text)]">Proof Readiness</h2>
        </div>
        <div className="space-y-3">
          {result.proof_readiness.map((item) => (
            <div key={item.role} className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-[var(--color-text)]">{item.role}</h3>
                <span className="text-sm font-bold text-[var(--color-text)]">{item.readiness_score}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-[var(--color-surface-hover)] mb-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${item.readiness_score >= 70 ? "bg-emerald-500" : item.readiness_score >= 40 ? "bg-amber-500" : "bg-red-400"}`}
                  style={{ width: `${item.readiness_score}%` }}
                />
              </div>
              <p className="text-sm text-[var(--color-text-muted)] mb-2">{item.explanation}</p>
              <div className="flex items-start gap-2 p-3 rounded-xl bg-[var(--color-surface-hover)]">
                <BookOpen size={14} className="text-[var(--color-brand-primary)] mt-0.5 shrink-0" />
                <p className="text-xs text-[var(--color-text-muted)]"><span className="font-medium text-[var(--color-text)]">To improve:</span> {item.what_would_improve_it}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Skills Gap */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle size={18} className="text-[var(--color-brand-primary)]" />
          <h2 className="text-lg font-bold text-[var(--color-text)]">Skills Gap</h2>
        </div>
        <div className="space-y-3">
          {result.skills_gap.map((item) => (
            <div key={item.skill} className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-[var(--color-text)]">{item.skill}</h3>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${GAP_COLORS[item.gap_level] ?? GAP_COLORS.moderate}`}>
                  {item.gap_level}
                </span>
              </div>
              <p className="text-xs text-[var(--color-text-muted)] italic mb-2 leading-relaxed">"{item.evidence}"</p>
              <p className="text-sm text-[var(--color-text)] leading-relaxed">{item.suggestion}</p>
            </div>
          ))}
        </div>
      </section>

      <p className="text-xs text-center text-[var(--color-text-muted)] pb-4">
        AI guidance based on your Bevisly proof data · Private to you · Never shared with employers
      </p>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function CareerCompassPage() {
  const { user } = useAuth();
  const [screen, setScreen] = useState<Screen>("loading");
  const [gateInfo, setGateInfo] = useState<GateInfo | null>(null);
  const [previousSessions, setPreviousSessions] = useState<PreviousSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [compassResult, setCompassResult] = useState<CareerCompassResult | null>(null);
  const [intake, setIntake] = useState<IntakeData>(EMPTY_INTAKE);
  const [profileEducation, setProfileEducation] = useState<EducationEntry[]>([]);
  const [errors, setErrors] = useState<Partial<Record<keyof IntakeData, string>>>({});

  // ── Gate check ─────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!user?.id) return;

    async function checkGate() {
      const [profileRes, subsRes, sessionsRes] = await Promise.all([
        supabase.from("profiles")
          .select("full_name, bio, skills, work_status, avatar_url, resume_url, education, experience")
          .eq("id", user!.id).single(),
        supabase.from("submissions")
          .select("id", { count: "exact", head: true }).eq("user_id", user!.id),
        supabase.from("career_compass_sessions")
          .select("id, created_at, status, ai_output")
          .eq("user_id", user!.id)
          .order("created_at", { ascending: false }),
      ]);

      const profile = profileRes.data;
      const submissionCount = subsRes.count ?? 0;
      const missing: string[] = [];
      let score = 0;

      if (profile?.full_name) score++; else missing.push("Add your full name");
      if (profile?.bio) score++; else missing.push("Write a short bio");
      if ((profile?.skills as string[] | null)?.length) score++; else missing.push("Add at least one skill");
      if (profile?.work_status) score++; else missing.push("Set your availability status");
      if (profile?.avatar_url) score++; else missing.push("Upload a profile photo");
      if (profile?.resume_url) score++; else missing.push("Upload your resume");

      const sessions = (sessionsRes.data ?? []) as PreviousSession[];
      setPreviousSessions(sessions);

      // If the latest session already has results, show them directly
      const latest = sessions[0];
      if (latest?.status === "analysis_ready" && latest.ai_output) {
        setCurrentSessionId(latest.id);
        setCompassResult(latest.ai_output);
        setScreen("results");
        return;
      }

      // Pre-fill Step 1 from existing profile data
      const eduArr = Array.isArray(profile?.education) ? (profile!.education as EducationEntry[]) : [];
      const exp = profile?.experience as Record<string, string> | null;
      setProfileEducation(eduArr);
      if (exp?.years) {
        setIntake((prev) => ({ ...prev, experience_years: exp.years }));
      }

      setGateInfo({ completenessScore: score, hasSubmission: submissionCount > 0, missingFields: missing });
      setScreen(score >= 4 && submissionCount > 0 ? "intro" : "blocked");
    }

    checkGate().catch(console.error);
  }, [user?.id]);

  // ── Validation ─────────────────────────────────────────────────────────────

  function validateStep(step: 1 | 2 | 3): boolean {
    const e: typeof errors = {};
    if (step === 1) {
      if (!intake.experience_years) e.experience_years = "Please select your experience level";
    }
    if (step === 2) {
      if (!intake.target_roles.length) e.target_roles = "Select at least one role type";
      if (!intake.work_arrangement) e.work_arrangement = "Select a work arrangement";
      if (!intake.career_goal.trim()) e.career_goal = "Tell us your 12-month goal";
    }
    if (step === 3) {
      if (!intake.biggest_strength.trim()) e.biggest_strength = "This helps the AI identify your edge";
      if (!intake.perceived_blocker.trim()) e.perceived_blocker = "This is key to the gap analysis";
      if (!intake.urgency) e.urgency = "Select your job search urgency";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function next(currentStep: 1 | 2 | 3) {
    if (!validateStep(currentStep)) return;
    if (currentStep < 3) {
      setScreen((currentStep + 1) as 2 | 3);
    } else {
      handleSubmit();
    }
  }

  // ── Submit ──────────────────────────────────────────────────────────────────

  async function handleSubmit() {
    if (!user?.id) return;
    setScreen("analyzing");

    try {
      // Save session and persist experience_years to profile in parallel
      const [sessionRes] = await Promise.all([
        supabase.from("career_compass_sessions").insert({
          user_id: user.id,
          intake_data: intake,
          status: "intake_complete",
        }).select("id").single(),
        supabase.from("profiles").update({
          experience: { years: intake.experience_years },
        }).eq("id", user.id),
      ]);

      if (sessionRes.error || !sessionRes.data) {
        throw new Error("Failed to save session");
      }

      const sessionId = sessionRes.data.id;
      setCurrentSessionId(sessionId);

      // Call AI pipeline
      const result = await runCareerCompass(sessionId, user.id);
      setCompassResult(result);
      setScreen("results");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong";
      toast.error(message);
      setScreen(3);
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  if (screen === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-[var(--color-brand-primary)]" />
      </div>
    );
  }

  if (screen === "blocked") {
    return (
      <div className="max-w-xl mx-auto py-16 px-4">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <AlertCircle size={28} className="text-amber-500" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Not quite ready</h1>
          <p className="text-[var(--color-text-muted)] leading-relaxed">
            Career Compass needs enough Bevisly data to give you accurate guidance. Here's what's missing:
          </p>
          <ul className="w-full text-left space-y-2 mt-2">
            {!gateInfo?.hasSubmission && (
              <li className="flex items-start gap-3 p-3 rounded-xl bg-[var(--color-surface-hover)] text-sm">
                <AlertCircle size={16} className="text-amber-500 mt-0.5 shrink-0" />
                <span className="text-[var(--color-text)]">
                  <span className="font-semibold">Apply to at least one job</span> — Career Compass reads your proof submissions and employer feedback.{" "}
                  <Link to="/candidate/jobs" className="text-[var(--color-brand-primary)] underline">Browse jobs</Link>
                </span>
              </li>
            )}
            {gateInfo?.missingFields.map((field) => (
              <li key={field} className="flex items-start gap-3 p-3 rounded-xl bg-[var(--color-surface-hover)] text-sm">
                <AlertCircle size={16} className="text-amber-500 mt-0.5 shrink-0" />
                <span className="text-[var(--color-text)]">
                  <span className="font-semibold">{field}</span>{" "}
                  <Link to="/candidate/profile" className="text-[var(--color-brand-primary)] underline">Go to profile</Link>
                </span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-[var(--color-text-muted)] mt-2">
            Profile completeness: {gateInfo?.completenessScore ?? 0}/6 fields
          </p>
        </div>
      </div>
    );
  }

  if (screen === "analyzing") {
    return (
      <div className="max-w-xl mx-auto py-16 px-4">
        <AILoadingState steps={COMPASS_LOADING_STEPS} intervalMs={4000} />
      </div>
    );
  }

  if (screen === "results" && compassResult) {
    return (
      <ResultsScreen
        result={compassResult}
        onNewSession={() => {
          setIntake(EMPTY_INTAKE);
          setErrors({});
          setCompassResult(null);
          setCurrentSessionId(null);
          setScreen("intro");
        }}
      />
    );
  }

  if (screen === "intro") {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="flex flex-col items-center text-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-[var(--color-brand-primary)]/10 flex items-center justify-center">
            <Compass size={32} className="text-[var(--color-brand-primary)]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[var(--color-text)] mb-2">Career Compass</h1>
            <p className="text-[var(--color-text-muted)] text-lg leading-relaxed max-w-lg mx-auto">
              A short session that reads your Bevisly history and tells you where you fit — and what's in your way.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mt-2">
            {[
              { icon: MapPin, title: "Career Direction", desc: "Role types that match your demonstrated strengths" },
              { icon: TrendingUp, title: "Proof Readiness", desc: "How ready you are for the roles you want, with a score" },
              { icon: AlertCircle, title: "Skills Gap", desc: "What's in your way — grounded in real rubric data" },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="p-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] text-left">
                <div className="w-8 h-8 rounded-lg bg-[var(--color-brand-primary)]/10 flex items-center justify-center mb-3">
                  <Icon size={16} className="text-[var(--color-brand-primary)]" />
                </div>
                <p className="font-semibold text-[var(--color-text)] text-sm mb-1">{title}</p>
                <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center gap-3 w-full mt-2">
            <p className="text-xs text-[var(--color-text-muted)]">Takes about 3–5 minutes · Private to you · Never shared with employers</p>
            <Button size="lg" onClick={() => setScreen(1)} rightIcon={<ChevronRight size={18} />}>
              Start Career Compass
            </Button>
            {previousSessions.length > 0 && (
              <p className="text-sm text-[var(--color-text-muted)]">
                You have {previousSessions.length} previous session{previousSessions.length > 1 ? "s" : ""}.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Step forms ──────────────────────────────────────────────────────────────

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-[var(--color-brand-primary)]/10 flex items-center justify-center">
          <Compass size={16} className="text-[var(--color-brand-primary)]" />
        </div>
        <h1 className="text-xl font-bold text-[var(--color-text)]">Career Compass</h1>
      </div>

      <ProgressBar step={screen as 1 | 2 | 3} />

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 md:p-8">

        {/* ── Step 1: Background ── */}
        {screen === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-[var(--color-text)]">Your background</h2>
              <p className="text-sm text-[var(--color-text-muted)] mt-1">Gives the AI the right baseline to calibrate your guidance.</p>
            </div>

            {/* Read-only education summary pulled from profile */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">Education (from your profile)</label>
              {profileEducation.length > 0 ? (
                <div className="space-y-2">
                  {profileEducation.map((e, i) => (
                    <div key={i} className="px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-hover)] text-sm text-[var(--color-text)]">
                      {e.level}{e.field ? ` in ${e.field}` : ""}{e.institution ? ` — ${e.institution}` : ""}{e.graduation_year ? ` (${e.graduation_year})` : ""}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[var(--color-text-muted)] italic">
                  No education added yet.{" "}
                  <Link to="/candidate/profile" className="text-[var(--color-brand-primary)] underline">Add it to your profile</Link>
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">Years of relevant experience *</label>
              <select value={intake.experience_years} onChange={(e) => setIntake({ ...intake, experience_years: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/30 focus:border-[var(--color-brand-primary)] transition-all">
                <option value="">Select…</option>
                {EXPERIENCE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
              {errors.experience_years && <p className="text-xs text-red-500 mt-1">{errors.experience_years}</p>}
            </div>
          </div>
        )}

        {/* ── Step 2: Where you want to go ── */}
        {screen === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-[var(--color-text)]">Where you want to go</h2>
              <p className="text-sm text-[var(--color-text-muted)] mt-1">Seeds your readiness score — the AI needs a target to score you against.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">Target role types * <span className="text-[var(--color-text-muted)] font-normal">(pick up to 3)</span></label>
              <ChipToggle options={ROLE_OPTIONS} selected={intake.target_roles}
                onToggle={(v) => setIntake({ ...intake, target_roles: toggleArrayItem(intake.target_roles, v, 3) })} max={3} />
              {errors.target_roles && <p className="text-xs text-red-500 mt-2">{errors.target_roles}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">Company type preference <span className="text-[var(--color-text-muted)] font-normal">(pick any)</span></label>
              <ChipToggle options={COMPANY_TYPE_OPTIONS} selected={intake.company_types}
                onToggle={(v) => setIntake({ ...intake, company_types: toggleArrayItem(intake.company_types, v) })} />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">Work arrangement *</label>
              <RadioToggle options={WORK_ARRANGEMENT_OPTIONS} value={intake.work_arrangement}
                onChange={(v) => setIntake({ ...intake, work_arrangement: v })} />
              {errors.work_arrangement && <p className="text-xs text-red-500 mt-2">{errors.work_arrangement}</p>}
            </div>

            <Textarea label="What would success look like in 12 months? *" value={intake.career_goal}
              onChange={(e) => setIntake({ ...intake, career_goal: e.target.value })}
              placeholder="Be specific — a role, a skill level, a type of company, or an outcome you're working towards…"
              rows={4} error={errors.career_goal} />
          </div>
        )}

        {/* ── Step 3: Self-Assessment ── */}
        {screen === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-[var(--color-text)]">Self-assessment</h2>
              <p className="text-sm text-[var(--color-text-muted)] mt-1">The AI will validate these against your actual proof data.</p>
            </div>

            <Input label="What do you think you do best? *" value={intake.biggest_strength}
              onChange={(e) => setIntake({ ...intake, biggest_strength: e.target.value })}
              placeholder="e.g. Breaking down complex problems, communicating ideas clearly…"
              error={errors.biggest_strength} />

            <Input label="What do you think is holding you back right now? *" value={intake.perceived_blocker}
              onChange={(e) => setIntake({ ...intake, perceived_blocker: e.target.value })}
              placeholder="e.g. Lack of portfolio projects, technical skill gaps, no industry experience…"
              error={errors.perceived_blocker} />

            <Input label="Are you actively learning or building anything? (optional)" value={intake.active_learning}
              onChange={(e) => setIntake({ ...intake, active_learning: e.target.value })}
              placeholder="e.g. Building a React app, studying SQL, taking a PM course…" />

            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">How urgently are you looking? *</label>
              <RadioToggle options={URGENCY_OPTIONS} value={intake.urgency}
                onChange={(v) => setIntake({ ...intake, urgency: v })} />
              {errors.urgency && <p className="text-xs text-red-500 mt-2">{errors.urgency}</p>}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-[var(--color-border)]">
          <Button variant="ghost"
            onClick={() => setScreen(screen === 1 ? "intro" : ((screen as number) - 1) as 1 | 2)}
            leftIcon={<ChevronLeft size={16} />}>
            {screen === 1 ? "Back to intro" : "Back"}
          </Button>
          <Button onClick={() => next(screen as 1 | 2 | 3)}
            rightIcon={screen === 3 ? <Sparkles size={16} /> : <ChevronRight size={16} />}>
            {screen === 3 ? "Run Career Compass" : "Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
}
