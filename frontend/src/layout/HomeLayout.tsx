// src/components/layout/HomeLayout.tsx
import FeedbackButton from "@/components/ui/FeedbackButton";
import { type ReactNode } from "react";

interface HomeLayoutProps {
  accentColor: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}

/**
 * 💡 Shared layout for CandidateHome & EmployerHome
 * Handles hero area, welcome text, and responsive grid.
 */
export default function HomeLayout({
  accentColor,
  title,
  subtitle,
  children,
}: HomeLayoutProps) {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] px-8 py-10 space-y-8 transition-colors">
      {/* 🏠 Hero Section */}
      <header>
        <h1
          className="text-2xl font-semibold mb-2"
          style={{ color: accentColor }}
        >
          {title}
        </h1>
        <p className="text-[var(--color-text-muted)] body-base">{subtitle}</p>
      </header>

      {/* 💡 Action Grid */}
      <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {children}
      </section>
       <FeedbackButton />
    </div>
  );
}
