/**
 * 📄 EmployerPostJob.tsx
 *
 * Wrapper page for creating a new employer job.
 * Uses EmployerJobForm in "create" mode.
 *
 * URL: /employer/jobs/new
 */

import EmployerJobForm from "./EmployerJobForm";

export default function EmployerPostJob() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] px-8 py-10">
      <h1 className="heading-lg mb-6 text-[var(--color-employer-dark)]">
        📢 Post a New Job
      </h1>
      <EmployerJobForm
        mode="create"
        submitLabel="Publish Job"
        onSuccess={() => console.log("Job successfully created!")}
      />
    </div>
  );
}
