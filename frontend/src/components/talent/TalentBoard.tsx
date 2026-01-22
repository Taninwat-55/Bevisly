import { useMemo, useRef, useState, useEffect } from "react";
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  TouchSensor,
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
import CandidateCard from "./CandidateCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const STAGES: { key: HiringStage; label: string }[] = [
  { key: "new", label: "New" },
  { key: "shortlisted", label: "Shortlisted" },
  { key: "interview", label: "Interview" },
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
}: {
  submissions: EmployerSubmission[];
  setSubmissions: React.Dispatch<React.SetStateAction<EmployerSubmission[]>>;
}) {
  // Enhanced sensors with touch support for mobile
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 }
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 }
    })
  );

  const [activeId, setActiveId] = useState<string | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Grouped columns (memoized)
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

    const draggedId = String(active.id);
    const destinationStage = over.data.current?.stage as
      | HiringStage
      | undefined;
    if (!destinationStage) return;

    const dragged = submissions.find((s) => s.id === draggedId);
    if (!dragged || dragged.hiring_stage === destinationStage) return;

    // Optimistic update
    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === draggedId ? { ...s, hiring_stage: destinationStage } : s
      )
    );

    try {
      await updateHiringStage(
        draggedId,
        destinationStage,
        dragged.employer_notes ?? ""
      );
      toast.success(`Moved to ${destinationStage}`);
    } catch {
      toast.error("Failed to update stage");
      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === draggedId ? { ...s, hiring_stage: dragged.hiring_stage } : s
        )
      );
    }
  }

  // Scroll awareness for arrows
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const update = () => {
      setCanScrollLeft(el.scrollLeft > 0);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
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
    <div className="relative">
      {/* Scroll Navigation Buttons */}
      <AnimatePresence>
        {canScrollLeft && (
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            onClick={() =>
              scrollRef.current?.scrollBy({ left: -340, behavior: "smooth" })
            }
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20
              w-10 h-10 rounded-full flex items-center justify-center
              bg-[var(--color-surface)]/90 backdrop-blur-md
              border border-[var(--color-border)] 
              text-[var(--color-text)] 
              shadow-lg hover:shadow-xl
              hover:bg-[var(--color-surface)] hover:scale-105
              transition-all duration-200"
            aria-label="Scroll left"
          >
            <ChevronLeft size={20} />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {canScrollRight && (
          <motion.button
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            onClick={() =>
              scrollRef.current?.scrollBy({ left: 340, behavior: "smooth" })
            }
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20
              w-10 h-10 rounded-full flex items-center justify-center
              bg-[var(--color-surface)]/90 backdrop-blur-md
              border border-[var(--color-border)] 
              text-[var(--color-text)] 
              shadow-lg hover:shadow-xl
              hover:bg-[var(--color-surface)] hover:scale-105
              transition-all duration-200"
            aria-label="Scroll right"
          >
            <ChevronRight size={20} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Edge Fade Gradients */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-8 z-10 pointer-events-none transition-opacity duration-300 ${canScrollLeft ? 'opacity-100' : 'opacity-0'}`}
        style={{ background: 'linear-gradient(to right, var(--color-bg), transparent)' }}
      />
      <div
        className={`absolute right-0 top-0 bottom-0 w-8 z-10 pointer-events-none transition-opacity duration-300 ${canScrollRight ? 'opacity-100' : 'opacity-0'}`}
        style={{ background: 'linear-gradient(to left, var(--color-bg), transparent)' }}
      />

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetectionStrategy}
        onDragStart={(e) => setActiveId(String(e.active.id))}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        <div
          ref={scrollRef}
          className="flex overflow-x-auto gap-4 px-8 py-4 snap-x snap-mandatory scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {STAGES.map(({ key, label }) => (
            <StageColumn
              key={key}
              stage={key}
              label={label}
              submissions={grouped[key]}
            />
          ))}
        </div>

        {/* Premium Drag Overlay */}
        <DragOverlay
          dropAnimation={{
            duration: 300,
            easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          {activeItem ? (
            <motion.div
              initial={{ scale: 1, rotate: 0 }}
              animate={{ scale: 1.05, rotate: 1 }}
              className="cursor-grabbing"
              style={{
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 119, 204, 0.3)',
                borderRadius: '12px',
              }}
            >
              <CandidateCard submission={activeItem} />
            </motion.div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
