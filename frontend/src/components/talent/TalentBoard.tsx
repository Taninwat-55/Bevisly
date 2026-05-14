import { useMemo, useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  rectIntersection,
  type CollisionDetection,
} from "@dnd-kit/core";
import { updateHiringStage, sendRejectionFeedbackEmail, sendOfferEmail, sendInterviewEmail } from "@/lib/api/submissions";
import toast from "react-hot-toast";
import type { EmployerSubmission, HiringStage } from "@/types";
import StageColumn from "./StageColumn";
import { CandidateCardOverlay } from "./CandidateCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import EmailConfirmationSheet, { type PendingEmail } from "./EmailConfirmationSheet";

const STAGES: { key: HiringStage; label: string }[] = [
  { key: "new", label: "New" },
  { key: "shortlisted", label: "Shortlisted" },
  { key: "interview", label: "Interview" },
  { key: "offer_sent", label: "Offer Sent" },
  { key: "hold", label: "On Hold" },
  { key: "hired", label: "Hired" },
  { key: "rejected", label: "Rejected" },
];

// Custom collision: prioritize columns
const collisionDetectionStrategy: CollisionDetection = (args) => {
  const intersections = rectIntersection(args);
  if (intersections.length > 0) {
    const droppable = intersections.find(
      (i) => i.data?.droppableContainer?.data?.current?.stage
    );
    return droppable ? [droppable] : [intersections[0]];
  }
  return [];
};

export default function TalentBoard({
  submissions,
  setSubmissions,
  onReview,
}: {
  submissions: EmployerSubmission[];
  setSubmissions: React.Dispatch<React.SetStateAction<EmployerSubmission[]>>;
  onReview?: (id: string) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );
  const [activeId, setActiveId] = useState<string | null>(null);
  const [pendingEmail, setPendingEmail] = useState<PendingEmail | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 🧮 Grouped columns (memoized)
  const grouped = useMemo(() => {
    const groups: Record<HiringStage, EmployerSubmission[]> = {
      new: [],
      shortlisted: [],
      interview: [],
      offer_sent: [],
      hold: [],
      hired: [],
      rejected: [],
    };
    for (const s of submissions) {
      const stage = (s.hiring_stage ?? "new") as HiringStage;
      groups[stage].push(s);
    }
    return groups;
  }, [submissions]);

  const activeItem = activeId
    ? submissions.find((s) => s.id === activeId) ?? null
    : null;

  function handleUpdateSubmission(id: string, updated: Partial<EmployerSubmission>) {
    setSubmissions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updated } : s))
    );
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const activeId = String(active.id);
    const destinationStage = over.data.current?.stage as HiringStage | undefined;
    if (!destinationStage) return;

    const dragged = submissions.find((s) => s.id === activeId);
    if (!dragged || dragged.hiring_stage === destinationStage) return;

    // Optimistic update
    setSubmissions((prev) =>
      prev.map((s) => s.id === activeId ? { ...s, hiring_stage: destinationStage } : s)
    );

    const candidateName = dragged.profiles?.full_name ?? "Candidate";
    const fromStage = dragged.hiring_stage ?? "new";

    try {
      await updateHiringStage(activeId, destinationStage, dragged.employer_notes ?? "");

      // Notify if moving OUT of a column where email was already sent
      if (fromStage === "rejected" && dragged.rejection_email_sent) {
        toast(`${candidateName} moved. Rejection email already sent — it won't repeat.`, { icon: "📋" });
      } else if (fromStage === "offer_sent" && dragged.offer_email_sent) {
        toast(`${candidateName} moved. Offer email already sent — it won't repeat.`, { icon: "📋" });
      } else if (fromStage === "interview" && dragged.interview_email_sent) {
        toast(`${candidateName} moved. Interview invitation already sent — it won't repeat.`, { icon: "📋" });
      } else {
        toast.success(`Moved to ${STAGES.find((s) => s.key === destinationStage)?.label ?? destinationStage}`);
      }

      // For email-triggering stages, show confirmation sheet (or skip if already sent)
      if (destinationStage === "rejected" || destinationStage === "offer_sent" || destinationStage === "interview") {
        const alreadySent =
          (destinationStage === "rejected" && dragged.rejection_email_sent) ||
          (destinationStage === "offer_sent" && dragged.offer_email_sent) ||
          (destinationStage === "interview" && dragged.interview_email_sent);

        if (!alreadySent) {
          setPendingEmail({ submissionId: activeId, candidateName, stage: destinationStage });
        }
      }
    } catch {
      toast.error("Failed to update stage");
      setSubmissions((prev) =>
        prev.map((s) => s.id === activeId ? { ...s, hiring_stage: dragged.hiring_stage } : s)
      );
    }
  }

  function handleRequestEmail(submissionId: string, stage: "interview" | "offer_sent" | "rejected") {
    const sub = submissions.find((s) => s.id === submissionId);
    const candidateName = sub?.profiles?.full_name ?? sub?.profiles?.email?.split("@")[0] ?? "Candidate";
    setPendingEmail({ submissionId, candidateName, stage });
  }

  async function handleEmailSend(note: string) {
    if (!pendingEmail) return;
    const { submissionId, candidateName, stage } = pendingEmail;
    setPendingEmail(null);

    const sendFn = stage === "rejected" ? sendRejectionFeedbackEmail
      : stage === "offer_sent" ? sendOfferEmail
      : sendInterviewEmail;

    const flagField = stage === "rejected" ? "rejection_email_sent"
      : stage === "offer_sent" ? "offer_email_sent"
      : "interview_email_sent";

    const emailLabel = stage === "rejected" ? "Rejection email"
      : stage === "offer_sent" ? "Offer email"
      : "Interview invitation";

    toast.promise(sendFn(submissionId, note), {
      loading: `Sending ${emailLabel.toLowerCase()}…`,
      success: () => {
        handleUpdateSubmission(submissionId, { [flagField]: true } as Partial<EmployerSubmission>);
        return `${emailLabel} sent to ${candidateName} ✓`;
      },
      error: (err: unknown) =>
        err instanceof Error ? err.message : `Failed to send ${emailLabel.toLowerCase()}`,
    });
  }

  function handleEmailSkip() {
    setPendingEmail(null);
  }

  // 🧭 Scroll awareness for arrows/fade
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const update = () => {
      setCanScrollLeft(el.scrollLeft > 0);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth);
    };
    update();
    el.addEventListener("scroll", update);
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div className="relative w-full max-w-full isolate">
      {/* Scroll buttons */}
      {canScrollLeft && (
        <button
          onClick={() =>
            scrollRef.current?.scrollBy({ left: -300, behavior: "smooth" })
          }
          className="absolute text-[var(--color-text)] left-2 top-1/2 -translate-y-1/2 bg-[var(--color-surface)]/80 backdrop-blur-sm shadow-md p-2 rounded-full border border-[var(--color-border)] hover:bg-[var(--color-border)] transition z-10"
        >
          <ChevronLeft size={18} />
        </button>
      )}
      {canScrollRight && (
        <button
          onClick={() =>
            scrollRef.current?.scrollBy({ left: 300, behavior: "smooth" })
          }
          className="absolute text-[var(--color-text)] right-2 top-1/2 -translate-y-1/2 bg-[var(--color-surface)]/80 backdrop-blur-sm shadow-md p-2 rounded-full border border-[var(--color-border)] hover:bg-[var(--color-border)] transition z-10"
        >
          <ChevronRight size={18} />
        </button>
      )}

      {/* Kanban */}
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetectionStrategy}
        onDragStart={(e) => setActiveId(String(e.active.id))}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        <div
          ref={scrollRef}
          className="flex overflow-x-auto gap-x-4 px-6 py-2 snap-x snap-mandatory relative scroll-smooth"
        >
          {STAGES.map(({ key, label }) => (
            <StageColumn
              key={key}
              stage={key}
              label={label}
              submissions={grouped[key]}
              onReview={onReview}
              onUpdateSubmission={handleUpdateSubmission}
              onRequestEmail={handleRequestEmail}
            />
          ))}
        </div>

        {typeof document !== "undefined" &&
          createPortal(
            <DragOverlay>
              {activeItem ? (
                <div className="w-[270px] opacity-90">
                  <CandidateCardOverlay submission={activeItem} />
                </div>
              ) : null}
            </DragOverlay>,
            document.body
          )}
      </DndContext>

      <EmailConfirmationSheet
        pending={pendingEmail}
        onSend={handleEmailSend}
        onSkip={handleEmailSkip}
      />
    </div>
  );
}
