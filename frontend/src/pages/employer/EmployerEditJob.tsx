import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import EmployerJobForm from "./EmployerJobForm";
import { getJobWithTasks, updateJobWithTasks, deleteJob } from "@/lib/api/jobs"; // ✅ Import deleteJob
import type { EmployerJob, ProofTask } from "@/types";
import { Trash2 } from "lucide-react";

export default function EmployerEditJob() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Partial<
    EmployerJob & { proof_tasks: ProofTask[] }
  > | null>(null);

 useEffect(() => {
    if (id) {
      getJobWithTasks(id)
        .then((data) => {
          setJob(data as unknown as EmployerJob & { proof_tasks: ProofTask[] });
        })
        .catch(console.error);
    }
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

  // New Delete Handler
  const handleDelete = async () => {
    if (!id) return;
    if (!confirm("Are you sure you want to delete this job? All candidate submissions will be lost.")) {
      return;
    }

    try {
      await deleteJob(id);
      toast.success("Job deleted successfully");
      navigate("/employer/jobs"); 
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete job");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] px-8 py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="heading-lg text-[var(--color-employer-dark)]">
          ✏️ Edit Job
        </h1>
        
        {/* Delete Button */}
        <button 
          onClick={handleDelete}
          className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 transition"
        >
          <Trash2 size={16} />
          Delete Job
        </button>
      </div>

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