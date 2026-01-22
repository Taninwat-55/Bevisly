/**
 * 
 * Handles submission button for job form.
 */

interface SubmitSectionProps {
  loading: boolean;
  mode: "create" | "edit";
  submitLabel?: string;
}

export default function SubmitSection({
  loading,
  mode,
  submitLabel,
}: SubmitSectionProps) {
  return (
    <div className="pt-6">
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[var(--color-employer)] text-white py-2.5 rounded-[var(--radius-button)] hover:bg-[var(--color-employer-dark)] transition disabled:opacity-60"
      >
        {loading
          ? "Saving..."
          : submitLabel ?? (mode === "edit" ? "Update Job" : "Post Job")}
      </button>
    </div>
  );
}
