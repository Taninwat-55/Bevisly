import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getEmployerSubmissionsWithFeedback } from "@/lib/api/submissions";
import { getEmployerJobs } from "@/lib/api/jobs";
import { deductCompanyCredits } from "@/lib/api/companies"; // New Import
import { useCompany } from "@/hooks/useCompany"; // For credit balance
import type { EmployerSubmission } from "@/types";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Loader2,
  Star,
  ArrowUpDown,
  UserCheck,
  Filter,
  Award,
  Briefcase,
  Search,
  ArrowRight,
  Send,
  X
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function EmployerTalentPool() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState<EmployerSubmission[]>([]);
  const [jobs, setJobs] = useState<{ id: string; title: string }[]>([]);
  const [selectedJob, setSelectedJob] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState<
    "all" | "reviewed" | "pending" | "hired"
  >("all");
  const [sortBy, setSortBy] = useState<"date" | "rating" | "job">("date");
  const [topOnly, setTopOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Send Task Modal State
  const { company, refresh: refreshCompany } = useCompany();
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteJobId, setInviteJobId] = useState("");
  const [sending, setSending] = useState(false);

  const handleSendTask = async () => {
    if (!inviteEmail || !inviteJobId) {
      toast.error("Please fill in email and select a job");
      return;
    }

    setSending(true);
    try {
      const success = await deductCompanyCredits(1);
      if (!success) {
        toast.error("Insufficient credits! Please top up.");
        return;
      }

      // Here we would call the actual API to send the invite/email
      // For MVP, we simulate success after credit deduction
      await new Promise(r => setTimeout(r, 1000));

      toast.success(`Proof Task sent to ${inviteEmail}`);
      setIsSendModalOpen(false);
      setInviteEmail("");
      refreshCompany(); // Update credit display
    } catch {
      toast.error("Failed to send task");
    } finally {
      setSending(false);
    }
  };

  /* ─── Fetch Data ─────────────────────────────── */
  useEffect(() => {
    if (!user?.id) return;
    async function loadData() {
      try {
        setLoading(true);
        const [subsData, jobsData] = await Promise.all([
          getEmployerSubmissionsWithFeedback(user!.id),
          getEmployerJobs(user!.id),
        ]);
        setSubmissions(subsData);
        setJobs(jobsData);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  /* ─── Derived Computations ─────────────────────────────── */
  const reviewed = submissions.filter((s) => s.status === "reviewed");
  const avgRating =
    reviewed.length > 0
      ? (
        reviewed.reduce((sum, s) => sum + (s.feedback?.[0]?.stars ?? 0), 0) /
        reviewed.length
      ).toFixed(1)
      : null;

  let filtered = submissions.filter((s) => {
    const statusMatch =
      statusFilter === "all" ? true : s.status === statusFilter;
    const jobMatch = selectedJob === "all" ? true : s.job_id === selectedJob;
    const nameMatch = (s.profiles?.full_name || s.profiles?.email || "").toLowerCase().includes(searchTerm.toLowerCase());
    return statusMatch && jobMatch && nameMatch;
  });

  if (topOnly) {
    filtered = filtered.filter((s) => (s.feedback?.[0]?.stars ?? 0) >= 4);
  }

  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case "rating": {
        const ratingA = a.feedback?.[0]?.stars ?? 0;
        const ratingB = b.feedback?.[0]?.stars ?? 0;
        return ratingB - ratingA;
      }
      case "job": {
        const jobA = a.jobs?.title?.toLowerCase() ?? "";
        const jobB = b.jobs?.title?.toLowerCase() ?? "";
        return jobA.localeCompare(jobB);
      }
      default:
        return (
          new Date(b.created_at ?? "").getTime() -
          new Date(a.created_at ?? "").getTime()
        );
    }
  });

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-[var(--color-text-muted)] gap-3">
        <Loader2 className="animate-spin text-[var(--color-brand-primary)]" size={32} />
        <p>Loading your talent pool...</p>
      </div>
    );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-[var(--color-text)] flex items-center gap-3">
            Talent Pool
            <span className="px-2.5 py-0.5 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] text-sm font-sans font-medium text-[var(--color-text-muted)]">
              {submissions.length}
            </span>
          </h1>
          <p className="text-[var(--color-text-muted)] mt-1">
            Review proofs and manage verified candidates.
          </p>

        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => {
              setInviteJobId(jobs[0]?.id || "");
              setIsSendModalOpen(true);
            }}
            className="bg-[var(--color-brand-primary)] text-white shadow-glow-primary hover:scale-105 transition-transform"
            leftIcon={<Send size={16} />}
          >
            Send Proof Task
          </Button>

          <div className="flex gap-3">
            <Card className="flex items-center gap-3 px-4 py-2 border-l-4 border-l-emerald-500">
              <UserCheck className="text-emerald-500" size={18} />
              <div>
                <p className="text-[10px] uppercase text-[var(--color-text-muted)] font-bold">Verified</p>
                <p className="text-lg font-bold leading-none">{reviewed.length}</p>
              </div>
            </Card>

            <Card className="flex items-center gap-3 px-4 py-2 border-l-4 border-l-amber-500">
              <Star className="text-amber-500" size={18} />
              <div>
                <p className="text-[10px] uppercase text-[var(--color-text-muted)] font-bold">Avg Rating</p>
                <p className="text-lg font-bold leading-none">{avgRating ?? "—"}</p>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Controls */}
      <Card className="p-4 space-y-4 md:space-y-0 md:flex md:items-center md:gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Search by name or email..."
            leftIcon={<Search size={16} />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-[var(--color-bg)]"
          />
        </div>

        <div className="h-8 w-[1px] bg-[var(--color-border)] hidden md:block" />

        <div className="flex items-center gap-3 flex-wrap">
          {/* Job Select */}
          <div className="relative">
            <select
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
              className="appearance-none pl-9 pr-8 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[var(--radius-input)] text-sm text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 outline-none cursor-pointer hover:bg-[var(--color-bg-hover)] transition"
            >
              <option value="all">All Jobs</option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>{job.title}</option>
              ))}
            </select>
            <Briefcase size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" />
          </div>

          {/* Status Select */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="appearance-none pl-9 pr-8 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[var(--radius-input)] text-sm text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 outline-none cursor-pointer hover:bg-[var(--color-bg-hover)] transition"
            >
              <option value="all">All Status</option>
              <option value="reviewed">Reviewed</option>
              <option value="pending">Pending</option>
              <option value="hired">Hired</option>
            </select>
            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" />
          </div>

          {/* Sort Select */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="appearance-none pl-9 pr-8 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[var(--radius-input)] text-sm text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 outline-none cursor-pointer hover:bg-[var(--color-bg-hover)] transition"
            >
              <option value="date">Newest First</option>
              <option value="rating">Highest Rating</option>
              <option value="job">Job Title</option>
            </select>
            <ArrowUpDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" />
          </div>

          {/* Toggle */}
          <button
            onClick={() => setTopOnly(!topOnly)}
            className={`flex items-center gap-2 px-3 py-2 rounded-[var(--radius-input)] border text-sm font-medium transition-all ${topOnly
              ? "bg-amber-500/10 border-amber-500/20 text-amber-600"
              : "bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              }`}
          >
            <Award size={16} />
            Top Talent Only
          </button>
        </div>
      </Card>

      {/* Main List */}
      <div className="space-y-4">
        {sorted.length === 0 ? (
          <div className="text-center py-20 bg-[var(--color-surface)] rounded-[var(--radius-card)] border border-dashed border-[var(--color-border)]">
            <div className="w-16 h-16 bg-[var(--color-bg)] rounded-full flex items-center justify-center mx-auto mb-4">
              <UserCheck className="text-[var(--color-text-muted)]" size={32} />
            </div>
            <h3 className="text-lg font-medium text-[var(--color-text)]">No candidates found</h3>
            <p className="text-[var(--color-text-muted)] max-w-sm mx-auto mt-1">
              Try adjusting your filters or wait for more submissions to arrive.
            </p>
          </div>
        ) : (
          sorted.map((s) => {
            const rating = s.feedback?.[0]?.stars;
            const isTop = rating && rating >= 4;

            return (
              <Card
                key={s.id}
                padding="none"
                className={`overflow-hidden group hover:shadow-md transition-all border-l-4 ${isTop ? "border-l-amber-500" : "border-l-transparent"
                  }`}
                onClick={() => navigate(`/employer/dashboard`)}
              >
                <div className="p-5 flex flex-col md:flex-row md:items-center gap-5">
                  {/* Avatar/Initials */}
                  <div className="shrink-0">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold border ${isTop
                      ? "bg-gradient-to-br from-amber-500/10 to-orange-500/10 text-amber-600 border-amber-500/20"
                      : "bg-gradient-to-br from-blue-500/10 to-indigo-500/10 text-blue-600 border-blue-500/20"
                      }`}>
                      {(s.profiles?.full_name?.[0] || s.profiles?.email?.[0] || "?").toUpperCase()}
                    </div>
                  </div>

                  <div className="md:w-1/4 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-[var(--color-text)] truncate">
                        {s.profiles?.full_name || s.profiles?.email || "Candidate"}
                      </h3>
                      {isTop && <Star size={12} className="text-amber-500 fill-amber-500" />}
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)] flex items-center gap-1 mt-0.5">
                      Submitted {new Date(s.created_at || "").toLocaleDateString()}
                    </p>
                  </div>

                  <div className="md:w-1/3 min-w-0 flex flex-col gap-1">
                    <p className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-semibold">Applied For</p>
                    <p className="text-sm font-medium text-[var(--color-text)] truncate" title={s.jobs?.title || "Unknown Job"}>
                      {s.jobs?.title || "Unknown Job"}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)] flex items-center gap-1">
                      <Briefcase size={10} /> {s.proof_tasks?.title || "Task"}
                    </p>
                  </div>

                  <div className="flex-1 flex items-center justify-between md:justify-end gap-4 md:gap-8">
                    <div>
                      {rating ? (
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-amber-500 font-bold">
                            <span>{rating}.0</span>
                            <Star size={14} fill="currentColor" />
                          </div>
                          <p className="text-[10px] text-[var(--color-text-muted)]">Proof Rating</p>
                        </div>
                      ) : (
                        <span className="text-xs text-[var(--color-text-muted)] italic">Not rated</span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${s.status === 'reviewed' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' :
                        s.status === 'hired' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                          'bg-amber-500/10 text-amber-600 border-amber-500/20'
                        }`}>
                        {s.status}
                      </span>

                      <Button size="sm" variant="outline" rightIcon={<ArrowRight size={14} />}>
                        Review
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>


      {/* Send Task Modal Overlay */}
      {isSendModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-[var(--color-bg)] w-full max-w-md rounded-2xl border border-[var(--color-border)] shadow-xl overflow-hidden animate-fade-in-up">
            <div className="p-6 border-b border-[var(--color-border)] flex justify-between items-center bg-[var(--color-surface)]">
              <h3 className="text-lg font-bold font-display text-[var(--color-text)]">Send Proof Task</h3>
              <button
                onClick={() => setIsSendModalOpen(false)}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">

              {/* Credit Info */}
              <div className="flex items-center justify-between p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm">
                <span className="text-blue-600 font-medium">Cost: 1 Credit</span>
                <span className="text-[var(--color-text-muted)]">Balance: <strong className="text-[var(--color-text)]">{company?.credits ?? 0} Credits</strong></span>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[var(--color-text)]">Candidate Email</label>
                  <Input
                    placeholder="candidate@example.com"
                    type="email"
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[var(--color-text)]">Select Job</label>
                  <select
                    value={inviteJobId}
                    onChange={(e) => setInviteJobId(e.target.value)}
                    className="w-full h-10 px-3 rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface)] text-sm focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 outline-none"
                  >
                    <option value="" disabled>Select a job...</option>
                    {jobs.map(j => (
                      <option key={j.id} value={j.id}>{j.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="ghost" onClick={() => setIsSendModalOpen(false)}>Cancel</Button>
                <Button
                  isLoading={sending}
                  onClick={handleSendTask}
                  leftIcon={<Send size={16} />}
                  disabled={!company?.credits || company.credits < 1}
                >
                  Send Invite
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}