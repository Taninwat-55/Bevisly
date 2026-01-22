import { useState } from "react";
import { Star, ThumbsUp, Lightbulb, Target, MessageSquare, Zap } from "lucide-react";
import { motion } from "framer-motion";

interface ScorecardProps {
    stars: number;
    setStars: (val: number) => void;
    strengths: string;
    setStrengths: (val: string) => void;
    improvements: string;
    setImprovements: (val: string) => void;
    isLocked?: boolean;
}

// Quick feedback tags for faster evaluation
const STRENGTH_TAGS = [
    "Clean code",
    "Well documented",
    "Creative solution",
    "Thorough testing",
    "Good communication",
    "Attention to detail",
];

const IMPROVEMENT_TAGS = [
    "Needs more tests",
    "Could be cleaner",
    "Missing documentation",
    "Edge cases",
    "Performance",
    "Incomplete",
];

// Category scores for structured feedback
const CATEGORIES = [
    { key: "technical", label: "Technical Skills", icon: Zap },
    { key: "communication", label: "Communication", icon: MessageSquare },
    { key: "problem_solving", label: "Problem Solving", icon: Lightbulb },
    { key: "execution", label: "Execution Quality", icon: Target },
];

export default function Scorecard({
    stars,
    setStars,
    strengths,
    setStrengths,
    improvements,
    setImprovements,
    isLocked = false,
}: ScorecardProps) {
    const [categoryScores, setCategoryScores] = useState<Record<string, number>>({
        technical: 0,
        communication: 0,
        problem_solving: 0,
        execution: 0,
    });

    const handleTagClick = (tag: string, type: "strength" | "improvement") => {
        if (isLocked) return;

        if (type === "strength") {
            const current = strengths.trim();
            if (current.includes(tag)) return;
            setStrengths(current ? `${current}, ${tag}` : tag);
        } else {
            const current = improvements.trim();
            if (current.includes(tag)) return;
            setImprovements(current ? `${current}, ${tag}` : tag);
        }
    };

    const handleCategoryScore = (category: string, score: number) => {
        if (isLocked) return;
        setCategoryScores(prev => ({ ...prev, [category]: score }));
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel rounded-2xl p-6 space-y-6"
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="heading-md flex items-center gap-2">
                    <ThumbsUp size={20} className="text-[var(--color-employer)]" />
                    Scorecard
                </h2>
                {isLocked && (
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                        ✓ Submitted
                    </span>
                )}
            </div>

            {/* Overall Rating */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-[var(--color-text)]">
                    Overall Rating
                </label>
                <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((val) => (
                        <button
                            key={val}
                            disabled={isLocked}
                            onClick={() => setStars(val)}
                            className={`p-1 transition-all duration-200 ${isLocked ? "cursor-default" : "hover:scale-110"
                                }`}
                        >
                            <Star
                                size={32}
                                className={`transition-colors ${val <= stars
                                        ? "fill-amber-400 text-amber-400"
                                        : "text-[var(--color-border)] hover:text-amber-200"
                                    }`}
                            />
                        </button>
                    ))}
                    <span className="ml-3 text-sm text-[var(--color-text-muted)]">
                        {stars === 0 && "Select rating"}
                        {stars === 1 && "Poor"}
                        {stars === 2 && "Below Average"}
                        {stars === 3 && "Average"}
                        {stars === 4 && "Good"}
                        {stars === 5 && "Excellent"}
                    </span>
                </div>
            </div>

            {/* Category Scores */}
            <div className="space-y-3">
                <label className="block text-sm font-medium text-[var(--color-text)]">
                    Category Scores
                </label>
                <div className="grid grid-cols-2 gap-3">
                    {CATEGORIES.map(({ key, label, icon: Icon }) => (
                        <div
                            key={key}
                            className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)]"
                        >
                            <Icon size={16} className="text-[var(--color-employer)] shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-[var(--color-text)] truncate">{label}</p>
                                <div className="flex gap-0.5 mt-1">
                                    {[1, 2, 3, 4, 5].map((score) => (
                                        <button
                                            key={score}
                                            disabled={isLocked}
                                            onClick={() => handleCategoryScore(key, score)}
                                            className={`w-4 h-4 rounded-full transition-all ${score <= categoryScores[key]
                                                    ? "bg-[var(--color-employer)]"
                                                    : "bg-[var(--color-border)]"
                                                } ${isLocked ? "" : "hover:scale-110"}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Strengths */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-[var(--color-text)]">
                    Strengths
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                    {STRENGTH_TAGS.map((tag) => (
                        <button
                            key={tag}
                            disabled={isLocked}
                            onClick={() => handleTagClick(tag, "strength")}
                            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all
                ${strengths.includes(tag)
                                    ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
                                    : "bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                                }
                ${isLocked ? "cursor-default opacity-60" : "hover:scale-105"}
              `}
                        >
                            {tag}
                        </button>
                    ))}
                </div>
                <textarea
                    disabled={isLocked}
                    value={strengths}
                    onChange={(e) => setStrengths(e.target.value)}
                    rows={3}
                    placeholder="What did they do well?"
                    className="w-full border border-[var(--color-border)] rounded-xl p-3 
            bg-[var(--color-bg)] text-[var(--color-text)] text-sm 
            focus:ring-2 focus:ring-[var(--color-employer)] focus:border-transparent outline-none
            disabled:opacity-60 disabled:cursor-default
            placeholder:text-[var(--color-text-muted)]"
                />
            </div>

            {/* Areas for Improvement */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-[var(--color-text)]">
                    Areas for Improvement
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                    {IMPROVEMENT_TAGS.map((tag) => (
                        <button
                            key={tag}
                            disabled={isLocked}
                            onClick={() => handleTagClick(tag, "improvement")}
                            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all
                ${improvements.includes(tag)
                                    ? "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300"
                                    : "bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:bg-amber-50 dark:hover:bg-amber-900/20"
                                }
                ${isLocked ? "cursor-default opacity-60" : "hover:scale-105"}
              `}
                        >
                            {tag}
                        </button>
                    ))}
                </div>
                <textarea
                    disabled={isLocked}
                    value={improvements}
                    onChange={(e) => setImprovements(e.target.value)}
                    rows={3}
                    placeholder="Constructive feedback for growth..."
                    className="w-full border border-[var(--color-border)] rounded-xl p-3 
            bg-[var(--color-bg)] text-[var(--color-text)] text-sm 
            focus:ring-2 focus:ring-[var(--color-employer)] focus:border-transparent outline-none
            disabled:opacity-60 disabled:cursor-default
            placeholder:text-[var(--color-text-muted)]"
                />
            </div>
        </motion.div>
    );
}
