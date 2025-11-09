/**
 * 📄 EmployerEditJob.tsx
 *
 * Wrapper page for editing an existing employer job.
 * Loads job data and passes it into EmployerJobForm in "edit" mode.
 *
 * URL: /employer/jobs/:id/edit
 */

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import EmployerJobForm from "./EmployerJobForm";
import { getJobWithTasks, updateJobWithTasks } from "@/lib/api/jobs";
import type { EmployerJob, ProofTask } from "@/types";

export default function EmployerEditJob() {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<Partial<
    EmployerJob & { proof_tasks: ProofTask[] }
  > | null>(null);

  useEffect(() => {
    if (id) getJobWithTasks(id).then(setJob).catch(console.error);
  }, [id]);

  if (!job)
    return (
      <div className="p-8 text-center text-[var(--color-text-muted)]">
        Loading job details…
      </div>
    );

  const handleUpdate = async (
    values: Partial<EmployerJob & { proof_tasks?: ProofTask[] }>
  ) => {
    try {
      await updateJobWithTasks(id!, values);
      toast.success("✅ Job updated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update job.");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] px-8 py-10">
      <h1 className="heading-lg mb-6 text-[var(--color-employer-dark)]">
        ✏️ Edit Job
      </h1>
      <EmployerJobForm
        mode="edit"
        defaultValues={job}
        onSubmit={handleUpdate}
        submitLabel="Update Job"
        onSuccess={() => console.log("Job updated successfully!")}
      />
    </div>
  );
}
