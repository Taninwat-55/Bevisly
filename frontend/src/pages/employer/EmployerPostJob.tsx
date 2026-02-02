import EmployerJobForm from "./EmployerJobForm";

export default function EmployerPostJob() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold font-display text-[var(--color-text)]">Post a New Job</h1>
        <p className="text-[var(--color-text-muted)]">
          Create a proof-based job listing to attract verified talent.
        </p>
      </div>

      <EmployerJobForm
        mode="create"
        submitLabel="Publish Job"
        onSuccess={() => console.log("Job successfully created!")}
      />
    </div>
  );
}
