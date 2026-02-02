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
import { updateHiringStage } from "@/lib/api/mutations";
import toast from "react-hot-toast";
import type { EmployerSubmission, HiringStage } from "@/types";
import StageColumn from "./StageColumn";
import { CandidateCardOverlay } from "./CandidateCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

const STAGES: { key: HiringStage; label: string; emoji: string }[] = [
  { key: "new", label: "New", emoji: "🆕" },
  { key: "shortlisted", label: "Shortlisted", emoji: "⭐" },
  { key: "interview", label: "Interview", emoji: "💬" },
  { key: "hold", label: "On Hold", emoji: "⏸" },
  { key: "hired", label: "Hired", emoji: "🎉" },
  { key: "rejected", label: "Rejected", emoji: "❌" },
];

// 🧭 Custom collision: prioritize columns
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
}: {
  submissions: EmployerSubmission[];
  setSubmissions: React.Dispatch<React.SetStateAction<EmployerSubmission[]>>;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );
  const [activeId, setActiveId] = useState<string | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 🧮 Grouped columns (memoized)
  const grouped = useMemo(() => {
    const groups: Record<HiringStage, EmployerSubmission[]> = {
      new: [],
      shortlisted: [],
      interview: [],
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

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const activeId = String(active.id);
    const destinationStage = over.data.current?.stage as
      | HiringStage
      | undefined;
    if (!destinationStage) return;

    const dragged = submissions.find((s) => s.id === activeId);
    if (!dragged || dragged.hiring_stage === destinationStage) return;

    // Optimistic update
    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === activeId ? { ...s, hiring_stage: destinationStage } : s
      )
    );

    try {
      await updateHiringStage(
        activeId,
        destinationStage,
        dragged.employer_notes ?? ""
      );
      toast.success(`Moved to ${destinationStage}`);
    } catch {
      toast.error("Failed to update stage");
      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === activeId ? { ...s, hiring_stage: dragged.hiring_stage } : s
        )
      );
    }
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
          {STAGES.map(({ key, label, emoji }) => (
            <StageColumn
              key={key}
              stage={key}
              label={`${emoji} ${label}`}
              submissions={grouped[key]}
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
    </div>
  );
}
