/**
 * 🧩 JobInfoSection.tsx
 * Handles basic job information: title, company, location, paid toggle, and description.
 */

import type { EmployerJob } from "@/types";

interface JobInfoSectionProps {
  values: Partial<EmployerJob>;
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
      {/* ─── Header ─── */}
      <h2 className="text-base font-semibold text-[var(--color-text)]">
        Job Information
      </h2>

      {/* ─── Basic Info ─── */}
      <div className="grid sm:grid-cols-2 gap-6">
        {/* Job Title */}
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
          {errors.title && (
            <p className="text-xs text-[var(--color-error)] mt-1">
              {errors.title}
            </p>
          )}
        </div>

        {/* Company */}
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
          {errors.company && (
            <p className="text-xs text-[var(--color-error)] mt-1">
              {errors.company}
            </p>
          )}
        </div>
      </div>

      {/* ─── Location & Paid Toggle ─── */}
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
          {errors.location && (
            <p className="text-xs text-[var(--color-error)] mt-1">
              {errors.location}
            </p>
          )}
        </div>

        {/* Paid toggle */}
        <div className="flex items-center sm:mt-8">
          <input
            id="paid"
            type="checkbox"
            checked={values.paid ?? false}
            onChange={(e) => onChange("paid", e.target.checked)}
            className="mr-2 accent-[var(--color-employer-dark)]"
          />
          <label
            htmlFor="paid"
            className="text-sm font-medium text-[var(--color-text)]"
          >
            Paid Position
          </label>
        </div>
      </div>

      {/* ─── Proof Task Payment ─── */}
      {values.paid && (
        <div className="space-y-3 border-t border-[var(--color-border)] pt-6">
          <h3 className="text-sm font-semibold text-[var(--color-text)]">
            Proof Task Payment
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <input
              type="number"
              placeholder="Amount (e.g., 200)"
              value={values.payment_amount ?? ""}
              onChange={(e) =>
                onChange("payment_amount", Number(e.target.value))
              }
              className="border border-[var(--color-border)] rounded-[var(--radius-input)] p-2 bg-[var(--color-bg)] text-[var(--color-text)]"
            />
            <select
              value={values.payment_currency ?? "EUR"}
              onChange={(e) => onChange("payment_currency", e.target.value)}
              className="border border-[var(--color-border)] rounded-[var(--radius-input)] p-2 bg-[var(--color-bg)] text-[var(--color-text)]"
            >
              <option value="EUR">EUR</option>
              <option value="SEK">SEK</option>
              <option value="DKK">DKK</option>
              <option value="USD">USD</option>
              <option value="NOK">NOK</option>
            </select>
          </div>
        </div>
      )}

      {/* ─── Salary Range Toggle ─── */}
      <div className="flex items-center border-t border-[var(--color-border)] pt-6">
        <input
          id="show_salary_range"
          type="checkbox"
          checked={values.show_salary_range ?? false}
          onChange={(e) => onChange("show_salary_range", e.target.checked)}
          className="mr-2 accent-[var(--color-employer-dark)]"
        />
        <label
          htmlFor="show_salary_range"
          className="text-sm font-medium text-[var(--color-text)]"
        >
          Display salary range
        </label>
      </div>

      {/* ─── Salary Range Fields ─── */}
      {/* ─── Salary Range Fields ─── */}
      {values.show_salary_range && (
        <div className="space-y-3">
          <div className="grid sm:grid-cols-3 gap-4">
            <input
              type="number"
              placeholder="Min salary (e.g., 30000)"
              value={values.salary_min ?? ""}
              onChange={(e) => onChange("salary_min", Number(e.target.value))}
              className="border border-[var(--color-border)] rounded-[var(--radius-input)] p-2 bg-[var(--color-bg)] text-[var(--color-text)]"
            />
            <input
              type="number"
              placeholder="Max salary (e.g., 45000)"
              value={values.salary_max ?? ""}
              onChange={(e) => onChange("salary_max", Number(e.target.value))}
              className="border border-[var(--color-border)] rounded-[var(--radius-input)] p-2 bg-[var(--color-bg)] text-[var(--color-text)]"
            />
            <select
              value={values.payment_currency ?? "EUR"}
              onChange={(e) => onChange("payment_currency", e.target.value)}
              className="border border-[var(--color-border)] rounded-[var(--radius-input)] p-2 bg-[var(--color-bg)] text-[var(--color-text)]"
            >
              <option value="EUR">EUR</option>
              <option value="SEK">SEK</option>
              <option value="DKK">DKK</option>
              <option value="USD">USD</option>
              <option value="NOK">NOK</option>
            </select>
          </div>

          <select
            value={values.pay_period ?? "monthly"}
            onChange={(e) => onChange("pay_period", e.target.value)}
            className="border border-[var(--color-border)] rounded-[var(--radius-input)] p-2 bg-[var(--color-bg)] text-[var(--color-text)]"
          >
            <option value="hourly">Hourly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
      )}

      {/* ─── Description ─── */}
      <div className="border-t border-[var(--color-border)] pt-6">
        <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
          Description
        </label>
        <textarea
          value={values.description ?? ""}
          onChange={(e) => onChange("description", e.target.value)}
          rows={5}
          placeholder="Write a short summary of the position or project."
          className={`w-full border rounded-[var(--radius-input)] p-2 bg-[var(--color-bg)] text-[var(--color-text)] focus:outline-none focus:ring-2 ${
            errors.description
              ? "border-[var(--color-error)] focus:ring-[var(--color-error)]"
              : "border-[var(--color-border)] focus:ring-[var(--color-employer)]"
          }`}
        />
        {errors.description && (
          <p className="text-xs text-[var(--color-error)] mt-1">
            {errors.description}
          </p>
        )}
      </div>
    </section>
  );
}
