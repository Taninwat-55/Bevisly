import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { getPracticeTasks, getMyPracticeSubmissions } from "@/lib/api/practice";
import type { PracticeTask, PracticeSubmission } from "@/lib/api/practice";
import { Zap, Clock, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

const categoryColors: Record<string, string> = {
  Marketing: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  Design: "bg-pink-500/15 text-pink-400 border-pink-500/30",
  Frontend: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  Product: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  Data: "bg-green-500/15 text-green-400 border-green-500/30",
  Backend: "bg-slate-500/15 text-slate-400 border-slate-500/30",
};

const difficultyColors: Record<string, string> = {
  beginner: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  intermediate: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  advanced: "bg-red-500/15 text-red-400 border-red-500/30",
};

export default function PracticeTasksPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<PracticeTask[]>([]);
  const [submissions, setSubmissions] = useState<PracticeSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    Promise.all([getPracticeTasks(), getMyPracticeSubmissions(user.id)])
      .then(([t, s]) => {
        setTasks(t);
        setSubmissions(s);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [user?.id]);

  const submissionMap = submissions.reduce<Record<string, PracticeSubmission>>(
    (acc, s) => {
      acc[s.practice_task_id] = s;
      return acc;
    },
    {},
  );

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-[var(--color-text-muted)]">
        <div className="w-10 h-10 border-4 border-[var(--color-brand-primary)] border-t-transparent rounded-full animate-spin mb-4" />
        Loading practice tasks...
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="relative rounded-3xl overflow-hidden glass-panel border border-[var(--glass-border)] p-8 md:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[var(--color-brand-primary)]/10 rounded-full blur-[100px] -z-10 translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[var(--color-brand-secondary)]/10 rounded-full blur-[80px] -z-10 -translate-x-1/3 translate-y-1/3" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm mb-6">
            <Zap size={14} className="text-[var(--color-brand-primary)]" />
            <span className="text-xs font-medium text-[var(--color-text)]">
              AI-Graded Challenges
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-display text-[var(--color-text)] mb-4 tracking-tight">
            Practice & Improve
          </h1>
          <p className="text-lg text-[var(--color-text-muted)] leading-relaxed">
            Complete tasks to earn credits and build verified skills. AI grades your work instantly.
          </p>
        </div>
      </div>

      {/* Task Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map((task) => {
          const sub = submissionMap[task.id];
          const isCompleted = sub?.ai_score != null;

          return (
            <div
              key={task.id}
              onClick={() => navigate(`/candidate/practice/${task.id}`)}
              className="glass-panel rounded-2xl border border-[var(--color-border)] p-6 flex flex-col gap-4 cursor-pointer hover:border-[var(--color-brand-primary)]/50 hover:shadow-lg transition-all duration-200 group"
            >
              {/* Category + Difficulty badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${categoryColors[task.category] ?? "bg-slate-500/15 text-slate-400 border-slate-500/30"}`}>
                  {task.category}
                </span>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${difficultyColors[task.difficulty] ?? "bg-slate-500/15 text-slate-400 border-slate-500/30"}`}>
                  {task.difficulty}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-base font-semibold text-[var(--color-text)] leading-snug group-hover:text-[var(--color-brand-primary)] transition-colors">
                {task.title}
              </h3>

              {/* Expected time */}
              <div className="flex items-center gap-1.5 text-sm text-[var(--color-text-muted)]">
                <Clock size={14} />
                <span>{task.expected_time}</span>
              </div>

              {/* Skills chips */}
              <div className="flex flex-wrap gap-1.5">
                {task.skills.slice(0, 3).map((skill) => (
                  <span
                    key={skill}
                    className="text-xs px-2 py-0.5 rounded-md bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-muted)]"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              {/* CTA */}
              <div className="mt-auto pt-2">
                {isCompleted ? (
                  <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
                    <CheckCircle2 size={16} />
                    <span>Completed — {sub.ai_score}/10</span>
                  </div>
                ) : (
                  <button className="w-full py-2 rounded-xl bg-[var(--color-brand-primary)] text-white text-sm font-semibold hover:bg-[var(--color-brand-primary)]/90 transition-colors shadow-sm">
                    Start Practice
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
