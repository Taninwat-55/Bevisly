// src/components/jobs/JobInfoSection.tsx
import type { EmployerJob } from "@/types";
import MarkdownEditor from "@/components/ui/MarkdownEditor"; 
import { Sparkles } from "lucide-react";

interface JobInfoSectionProps {
  values: Partial<EmployerJob & { requirements?: string }>;
  onChange: (field: keyof EmployerJob | string, value: unknown) => void;
  errors?: Record<string, string>;
}

export default function JobInfoSection({
  values,
  onChange,
  errors = {},
}: JobInfoSectionProps) {
  return (
    <section className="space-y-8">
      <h2 className="text-base font-semibold text-[var(--color-text)]">
        Job Information
      </h2>

      {/* ─── Basic Info (Title & Company) ─── */}
      <div className="grid sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
            Job Title
          </label>
          <input
            type="text"
            value={values.title ?? ""}
            onChange={(e) => onChange("title", e.target.value)}
            placeholder="e.g. Junior Frontend Developer"
            className={`w-full border rounded-[var(--radius-input)] p-2 bg-[var(--color-bg)] text-[var(--color-text)] focus:outline-none focus:ring-2 ${
              errors.title
                ? "border-[var(--color-error)] focus:ring-[var(--color-error)]"
                : "border-[var(--color-border)] focus:ring-[var(--color-employer)]"
            }`}
          />
          {errors.title && <p className="text-xs text-[var(--color-error)] mt-1">{errors.title}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
            Company
          </label>
          <input
            type="text"
            value={values.company ?? ""}
            onChange={(e) => onChange("company", e.target.value)}
            placeholder="e.g. Bevis Labs"
            className={`w-full border rounded-[var(--radius-input)] p-2 bg-[var(--color-bg)] text-[var(--color-text)] focus:outline-none focus:ring-2 ${
              errors.company
                ? "border-[var(--color-error)] focus:ring-[var(--color-error)]"
                : "border-[var(--color-border)] focus:ring-[var(--color-employer)]"
            }`}
          />
          {errors.company && <p className="text-xs text-[var(--color-error)] mt-1">{errors.company}</p>}
        </div>
      </div>

      {/* ─── Location, Paid, Deadline ─── */}
      <div className="grid sm:grid-cols-2 gap-6 items-start">
        <div>
          <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
            Location
          </label>
          <input
            type="text"
            value={values.location ?? ""}
            onChange={(e) => onChange("location", e.target.value)}
            placeholder="e.g. Copenhagen, Remote"
            className={`w-full border rounded-[var(--radius-input)] p-2 bg-[var(--color-bg)] text-[var(--color-text)] focus:outline-none focus:ring-2 ${
              errors.location
                ? "border-[var(--color-error)] focus:ring-[var(--color-error)]"
                : "border-[var(--color-border)] focus:ring-[var(--color-employer)]"
            }`}
          />
          {errors.location && <p className="text-xs text-[var(--color-error)] mt-1">{errors.location}</p>}
        </div>

        <div className="flex items-center sm:mt-8">
          <input
            id="paid"
            type="checkbox"
            checked={values.paid ?? false}
            onChange={(e) => onChange("paid", e.target.checked)}
            className="mr-2 accent-[var(--color-employer-dark)]"
          />
          <label htmlFor="paid" className="text-sm font-medium text-[var(--color-text)]">
            Paid Task
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
            Application Deadline
          </label>
          <input
            type="date"
            value={values.expires_at ? new Date(values.expires_at).toISOString().split('T')[0] : ""}
            onChange={(e) => onChange("expires_at", new Date(e.target.value).toISOString())}
            className="w-full border border-[var(--color-border)] rounded-[var(--radius-input)] p-2 bg-[var(--color-bg)] text-[var(--color-text)]"
          />
        </div>
      </div>

      {/* ─── Payment Fields (Hidden if not paid) ─── */}
      {values.paid && (
        <div className="space-y-3 border-t border-[var(--color-border)] pt-6">
          <h3 className="text-sm font-semibold text-[var(--color-text)]">Proof Task Payment</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <input
              type="number"
              placeholder="Amount"
              value={values.payment_amount ?? ""}
              onChange={(e) => onChange("payment_amount", Number(e.target.value))}
              className="border border-[var(--color-border)] rounded-[var(--radius-input)] p-2 bg-[var(--color-bg)] text-[var(--color-text)]"
            />
            <select
              value={values.payment_currency ?? "EUR"}
              onChange={(e) => onChange("payment_currency", e.target.value)}
              className="border border-[var(--color-border)] rounded-[var(--radius-input)] p-2 bg-[var(--color-bg)] text-[var(--color-text)]"
            >
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
              <option value="DKK">DKK</option>
            </select>
          </div>
        </div>
      )}

      {/* ─── Salary Toggle & Fields ─── */}
      <div className="border-t border-[var(--color-border)] pt-6">
        <div className="flex items-center mb-4">
          <input
            id="show_salary_range"
            type="checkbox"
            checked={values.show_salary_range ?? false}
            onChange={(e) => onChange("show_salary_range", e.target.checked)}
            className="mr-2 accent-[var(--color-employer-dark)]"
          />
          <label htmlFor="show_salary_range" className="text-sm font-medium text-[var(--color-text)]">
            Display salary range
          </label>
        </div>

        {values.show_salary_range && (
          <div className="grid sm:grid-cols-3 gap-4 text-[var(--color-text)]">
            <input type="number" placeholder="Min" value={values.salary_min ?? ""} onChange={(e) => onChange("salary_min", Number(e.target.value))} className="border border-[var(--color-border)] rounded-[var(--radius-input)] p-2 bg-[var(--color-bg)]" />
            <input type="number" placeholder="Max" value={values.salary_max ?? ""} onChange={(e) => onChange("salary_max", Number(e.target.value))} className="border border-[var(--color-border)] rounded-[var(--radius-input)] p-2 bg-[var(--color-bg)]" />
            <select value={values.pay_period ?? "monthly"} onChange={(e) => onChange("pay_period", e.target.value)} className="border border-[var(--color-border)] rounded-[var(--radius-input)] p-2 bg-[var(--color-bg)]">
              <option value="hourly">Hourly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        )}
      </div>

      {/* ─── ✅ RICH TEXT FIELDS ─── */}
      <div className="border-t border-[var(--color-border)] pt-6 space-y-6">
        {/* 🤖 AI Tip Box */}
        <div className="flex items-start gap-3 bg-[var(--color-candidate)]/5 border border-[var(--color-candidate)]/20 p-4 rounded-[var(--radius-card)]">
          <div className="p-2 bg-[var(--color-surface)] rounded-full text-[var(--color-candidate)] shadow-sm">
            <Sparkles size={16} />
          </div>
          <div className="text-sm">
            <p className="font-medium text-[var(--color-text)] mb-1">
              Need help writing?
            </p>
            <p className="text-[var(--color-text-muted)] leading-relaxed">
              You can use AI tools like <strong>ChatGPT</strong>, <strong>Claude</strong>, or <strong>Gemini</strong> to draft your job description. Just prompt them: 
              <em className="block mt-1 text-[var(--color-text)]">"Write a fun, engaging job description for a [Job Title] at [Company] focusing on [Key Skill]."</em>
            </p>
          </div>
        </div>

        <MarkdownEditor 
          label="Job Description"
          placeholder="Describe the position, team, and day-to-day responsibilities..."
          value={values.description ?? ""}
          onChange={(val) => onChange("description", val)}
          error={errors.description}
          rows={8}
        />

        <MarkdownEditor 
          label="Requirements & Skills"
          placeholder="List requirements, tech stack, and qualifications..."
          value={values.requirements ?? ""}
          onChange={(val) => onChange("requirements", val)}
          rows={6}
        />
      </div>
    </section>
  );
}