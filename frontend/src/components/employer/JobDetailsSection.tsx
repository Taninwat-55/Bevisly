import { useState, useEffect } from "react";
import type { EmployerJob } from "@/types";

interface JobDetailsSectionProps {
  values: Partial<
    EmployerJob & {
      salary_range?: string;
      job_type?: string;
      department?: string;
      work_mode?: string;
    }
  >;
  onChange: (field: string, value: unknown) => void;
}

export default function JobDetailsSection({
  values,
  onChange,
}: JobDetailsSectionProps) {
  const [customDept, setCustomDept] = useState("");

  const jobTypes = [
    "Full-time",
    "Part-time",
    "Internship",
    "Contract",
    "Freelance",
    "Volunteer",
  ];
  const departments = [
    "Frontend",
    "Backend",
    "Full-stack",
    "Design",
    "Marketing",
    "Business",
    "Finance",
    "Product Management",
    "Content Creation",
    "Data & Analytics",
    "Consultant",
    "Other",
  ];
  const workModes = ["Remote", "Hybrid", "On-site"];

  // If department is manually typed, sync it back
  useEffect(() => {
    if (values.department !== "Other" && values.department !== customDept) {
      setCustomDept("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.department]);

  return (
    <section>
      <h2 className="text-base font-semibold text-[var(--color-text)] mb-4">
        Job Details
      </h2>

      <div className="grid sm:grid-cols-2 gap-5">
        {/* Job Type */}
        <div>
          <label className="block text-[var(--color-text)] text-sm font-medium mb-1">
            Job Type
          </label>
          <select
            value={values.job_type ?? ""}
            onChange={(e) => onChange("job_type", e.target.value)}
            className="w-full border rounded-[var(--radius-input)] p-2 bg-[var(--color-bg)] text-[var(--color-text)]"
          >
            {jobTypes.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Department */}
        <div>
          <label className="block text-[var(--color-text)] text-sm font-medium mb-1">
            Role / Department
          </label>
          <select
            value={values.department ?? ""}
            onChange={(e) => {
              const val = e.target.value;
              onChange("department", val);
              if (val !== "Other") setCustomDept("");
            }}
            className="w-full border rounded-[var(--radius-input)] p-2 bg-[var(--color-bg)] text-[var(--color-text)]"
          >
            {departments.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>

          {/* Custom department field (only visible if "Other" is selected) */}
          {values.department === "Other" && (
            <input
              type="text"
              placeholder="Specify department or area"
              value={customDept}
              onChange={(e) => {
                setCustomDept(e.target.value);
                onChange("department", e.target.value);
              }}
              className="mt-2 w-full border rounded-[var(--radius-input)] p-2 bg-[var(--color-bg)] text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-employer)]"
            />
          )}
        </div>

        {/* Work Mode */}
        <div>
          <label className="block text-[var(--color-text)] text-sm font-medium mb-1">
            Work Mode
          </label>
          <select
            value={values.work_mode ?? ""}
            onChange={(e) => onChange("work_mode", e.target.value)}
            className="w-full border rounded-[var(--radius-input)] p-2 bg-[var(--color-bg)] text-[var(--color-text)]"
          >
            {workModes.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </div>

        {/* Compensation */}
        {values.paid && (
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium mb-1">
              Compensation Range
            </label>
            <input
              type="text"
              placeholder="e.g. $500 – $1,000 / project or $15/hr"
              value={values.salary_range ?? ""}
              onChange={(e) => onChange("salary_range", e.target.value)}
              className="w-full border rounded-[var(--radius-input)] p-2 bg-[var(--color-bg)] text-[var(--color-text)]"
            />
          </div>
        )}
      </div>
    </section>
  );
}
