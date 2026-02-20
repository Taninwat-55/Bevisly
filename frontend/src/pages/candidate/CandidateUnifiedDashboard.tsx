import { useState } from "react";
import CandidateOverview from "./CandidateOverview";
import CandidateProfile from "./CandidateProfile";
import CandidateCredits from "./CandidateCredits";
import { Briefcase, User } from "lucide-react";

export default function CandidateUnifiedDashboard() {
  const [activeTab, setActiveTab] = useState<"tasks" | "profile">("tasks");

  return (
    <div className="space-y-6">
      {/* ── Tab Navigation ────────────────────────────── */}
      <div className="flex bg-[var(--color-surface)] p-1 rounded-xl border border-[var(--color-border)] w-full max-w-sm mx-auto shadow-sm">
        <button
          onClick={() => setActiveTab("tasks")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium text-sm transition-all ${
            activeTab === "tasks"
              ? "bg-[var(--color-bg)] text-[var(--color-text)] shadow-sm border border-[var(--color-border)]"
              : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          }`}
        >
          <Briefcase size={16} />
          My Tasks
        </button>
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium text-sm transition-all ${
            activeTab === "profile"
              ? "bg-[var(--color-bg)] text-[var(--color-text)] shadow-sm border border-[var(--color-border)]"
              : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          }`}
        >
          <User size={16} />
          My Profile
        </button>
      </div>

      {/* ── Content Area ────────────────────────────── */}
      <div className="animate-fade-in max-w-5xl mx-auto mt-6">
        {activeTab === "tasks" && <CandidateOverview />}
        {activeTab === "profile" && (
          <div className="space-y-12">
            <CandidateProfile />
            
            {/* Credits section merged into profile view */}
            <div className="border-t border-[var(--color-border)] pt-8">
               <CandidateCredits />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
