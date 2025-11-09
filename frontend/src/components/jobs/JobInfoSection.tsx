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
    <section>
      <h2 className="text-base font-semibold text-[var(--color-text)] mb-4">
        Job Information
      </h2>

      {/* Grid layout for main fields */}
      <div className="grid gap-5 sm:grid-cols-2">
        {/* Job Title */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
            Job Title
          </label>
          <input
            type="text"
            value={values.title ?? ""}
            onChange={(e) => onChange("title", e.target.value)}
            aria-invalid={!!errors.title}
            placeholder="e.g. Junior Frontend Developer"
            className={`w-full border rounded-[var(--radius-input)] p-2 bg-[var(--color-bg)] text-[var(--color-text)] focus:outline-none focus:ring-2 ${
              errors.title
                ? "border-[var(--color-error)] focus:ring-[var(--color-error)]"
                : "border-[var(--color-border)] focus:ring-[var(--color-employer)]"
            }`}
          />
          {errors.title && (
            <p className="text-[var(--color-error)] text-xs mt-1">
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
            aria-invalid={!!errors.company}
            placeholder="e.g. Bevis Labs"
            className={`w-full border rounded-[var(--radius-input)] p-2 bg-[var(--color-bg)] text-[var(--color-text)] focus:outline-none focus:ring-2 ${
              errors.company
                ? "border-[var(--color-error)] focus:ring-[var(--color-error)]"
                : "border-[var(--color-border)] focus:ring-[var(--color-employer)]"
            }`}
          />
          {errors.company && (
            <p className="text-[var(--color-error)] text-xs mt-1">
              {errors.company}
            </p>
          )}
        </div>
      </div>

      {/* Location + Paid */}
      <div className="grid gap-5 sm:grid-cols-2 mt-5">
        <div>
          <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
            Location
          </label>
          <input
            type="text"
            value={values.location ?? ""}
            onChange={(e) => onChange("location", e.target.value)}
            aria-invalid={!!errors.location}
            placeholder="e.g. Copenhagen, Remote"
            className={`w-full border rounded-[var(--radius-input)] p-2 bg-[var(--color-bg)] text-[var(--color-text)] focus:outline-none focus:ring-2 ${
              errors.location
                ? "border-[var(--color-error)] focus:ring-[var(--color-error)]"
                : "border-[var(--color-border)] focus:ring-[var(--color-employer)]"
            }`}
          />
          {errors.location && (
            <p className="text-[var(--color-error)] text-xs mt-1">
              {errors.location}
            </p>
          )}
        </div>

        <div className="flex items-center mt-6">
          <input
            type="checkbox"
            checked={values.paid ?? false}
            onChange={(e) => onChange("paid", e.target.checked)}
            className="mr-2 accent-[var(--color-employer-dark)]"
          />
          <label className="text-sm font-medium text-[var(--color-text)]">
            Paid Position
          </label>
        </div>
      </div>

      {/* Description */}
      <div className="mt-5">
        <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
          Description
        </label>
        <textarea
          value={values.description ?? ""}
          onChange={(e) => onChange("description", e.target.value)}
          aria-invalid={!!errors.description}
          rows={5}
          placeholder="Write a short summary of the position or project."
          className={`w-full border rounded-[var(--radius-input)] p-2 bg-[var(--color-bg)] text-[var(--color-text)] focus:outline-none focus:ring-2 ${
            errors.description
              ? "border-[var(--color-error)] focus:ring-[var(--color-error)]"
              : "border-[var(--color-border)] focus:ring-[var(--color-employer)]"
          }`}
        />
        {/* <p className="text-xs text-[var(--color-text-muted)] mt-1">
          Explain what candidates will learn or achieve by completing this job.
        </p> */}
      </div>
    </section>
  );
}
