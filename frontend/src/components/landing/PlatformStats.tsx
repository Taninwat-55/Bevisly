import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Stats = {
  submissions: number;
  jobs: number;
  employers: number;
};

const THRESHOLDS = {
  submissions: 50,
  jobs: 10,
  employers: 5,
};

export default function PlatformStats() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadStats() {
      try {
        const [{ count: submissions }, { count: jobs }, { count: employers }] =
          await Promise.all([
            supabase
              .from("submissions")
              .select("*", { count: "exact", head: true }),
            supabase.from("jobs").select("*", { count: "exact", head: true }),
            supabase
              .from("profiles")
              .select("*", { count: "exact", head: true })
              .eq("role", "employer"),
          ]);

        if (cancelled) return;

        setStats({
          submissions: submissions ?? 0,
          jobs: jobs ?? 0,
          employers: employers ?? 0,
        });
      } catch {
        // Silently fail — section just won't render
      }
    }

    loadStats();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!stats) return null;
  if (
    stats.submissions < THRESHOLDS.submissions ||
    stats.jobs < THRESHOLDS.jobs ||
    stats.employers < THRESHOLDS.employers
  ) {
    return null;
  }

  const items = [
    { value: stats.submissions, label: "Proofs submitted" },
    { value: stats.jobs, label: "Jobs posted" },
    { value: stats.employers, label: "Companies on Bevisly" },
  ];

  return (
    <section className="relative py-16 md:py-20 border-y border-[var(--color-border)] bg-[var(--color-surface)]/30">
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-4">
          {items.map((item) => (
            <div key={item.label} className="text-center">
              <div className="text-4xl md:text-5xl font-bold font-display text-[var(--color-brand-primary)] mb-2 tabular-nums">
                {item.value.toLocaleString()}
              </div>
              <div className="text-sm md:text-base text-[var(--color-text-muted)] uppercase tracking-wider">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
