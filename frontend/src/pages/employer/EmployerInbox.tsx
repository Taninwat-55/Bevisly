import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { getEmployerSubmissionsWithFeedback } from "@/lib/api";
import type { EmployerSubmission } from "@/types";
import { 
    Inbox, 
    ArrowRight, 
    Clock, 
    User, 
    Briefcase,
    CheckCircle2,
    Search,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { motion, AnimatePresence } from "framer-motion";
import EmployerReviewProof from "./EmployerReviewProof";
import toast from "react-hot-toast";

export default function EmployerInbox() {
    const { user } = useAuth();
    const [submissions, setSubmissions] = useState<EmployerSubmission[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user?.id) return;
        
        const fetchSubmissions = async () => {
            try {
                setLoading(true);
                const data = await getEmployerSubmissionsWithFeedback(user.id);
                setSubmissions(data);
            } catch (error) {
                console.error("Error fetching inbox:", error);
                toast.error("Failed to load your inbox");
            } finally {
                setLoading(false);
            }
        };

        fetchSubmissions();
    }, [user?.id]);

    const needsReview = useMemo(() => {
        return submissions.filter(s => 
            s.status === 'submitted' && 
            (!s.feedback || s.feedback.length === 0)
        ).filter(s => {
            const search = searchQuery.toLowerCase();
            return (
                s.profiles?.full_name?.toLowerCase().includes(search) ||
                s.jobs?.title?.toLowerCase().includes(search)
            );
        });
    }, [submissions, searchQuery]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <div className="w-10 h-10 border-4 border-[var(--color-brand-primary)] border-t-transparent rounded-full animate-spin" />
                <p className="text-[var(--color-text-muted)] font-medium">Gathering your pending reviews...</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] text-xs font-bold uppercase tracking-widest">
                        <Inbox size={14} />
                        Action Items
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold font-display text-[var(--color-text)]">
                        Inbox
                    </h1>
                    <p className="text-[var(--color-text-muted)] text-lg max-w-xl leading-relaxed">
                        Every candidate waiting for your feedback, across all your active job listings.
                    </p>
                </div>
                
                {/* Search & Filter Bar */}
                <div className="relative w-full md:w-72">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                    <input 
                        type="text"
                        placeholder="Search candidates or jobs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-sm focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 focus:border-[var(--color-brand-primary)] transition-all outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    />
                </div>
            </div>

            {/* Submissions List */}
            <div className="grid gap-4">
                <AnimatePresence mode="popLayout">
                    {needsReview.length > 0 ? (
                        needsReview.map((submission, index) => (
                            <motion.div
                                key={submission.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Card className="p-0 overflow-hidden hover:border-[var(--color-brand-primary)]/50 transition-all duration-300 group shadow-sm hover:shadow-xl hover:shadow-[var(--color-brand-primary)]/5">
                                    <div className="flex flex-col md:flex-row md:items-center p-5 md:p-6 gap-6">
                                        {/* Avatar/Initial */}
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center border border-[var(--color-border)] shrink-0 group-hover:scale-105 transition-transform duration-300">
                                            <span className="text-xl font-bold text-[var(--color-text)]">
                                                {submission.profiles?.full_name?.[0].toUpperCase() || <User size={24} />}
                                            </span>
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0 space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-lg text-[var(--color-text)] truncate">
                                                    {submission.profiles?.full_name || "Anonymous Candidate"}
                                                </h3>
                                                <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-[var(--color-border)]" />
                                                <span className="hidden sm:inline-block text-xs font-medium text-[var(--color-text-muted)]">
                                                    {submission.profiles?.email}
                                                </span>
                                            </div>
                                            
                                            <div className="flex flex-wrap items-center gap-y-1 gap-x-4">
                                                <div className="flex items-center gap-1.5 text-sm text-[var(--color-text-muted)]">
                                                    <Briefcase size={14} className="text-[var(--color-brand-primary)]" />
                                                    <span className="font-medium text-[var(--color-text)]">{submission.jobs?.title}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-sm text-[var(--color-text-muted)]">
                                                    <Clock size={14} />
                                                    <span>Submitted {new Date(submission.created_at || '').toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-3">
                                            <Button 
                                                onClick={() => setSelectedSubmissionId(submission.id)}
                                                className="rounded-xl px-6"
                                                rightIcon={<ArrowRight size={16} />}
                                            >
                                                Review Proof
                                            </Button>
                                        </div>
                                    </div>
                                    
                                    {/* Footer strip */}
                                    <div className="px-6 py-2 bg-[var(--color-surface-hover)]/30 border-t border-[var(--color-border)]/50 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">Awaiting Rating</span>
                                        </div>
                                        <div className="text-[10px] font-medium text-[var(--color-text-muted)]">
                                            Proof Task: <span className="text-[var(--color-text)]">{submission.proof_tasks?.title}</span>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-[var(--color-surface)] rounded-3xl border-2 border-dashed border-[var(--color-border)]">
                            <div className="w-20 h-20 mx-auto bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-6">
                                <CheckCircle2 size={40} />
                            </div>
                            <h2 className="text-2xl font-bold text-[var(--color-text)] mb-2">You're all caught up!</h2>
                            <p className="text-[var(--color-text-muted)] max-w-sm mx-auto">
                                No candidates are currently waiting for a review. Great job maintaining your inbox.
                            </p>
                            <Button 
                                variant="outline" 
                                className="mt-8 rounded-xl" 
                                onClick={() => navigate("/employer")}
                            >
                                Back to Dashboard
                            </Button>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* Review Slide-Over Panel */}
            <AnimatePresence>
                {selectedSubmissionId && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
                            onClick={() => setSelectedSubmissionId(null)}
                        />
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 30, stiffness: 300 }}
                            className="fixed top-0 right-0 z-[70] h-full w-full max-w-3xl bg-[var(--color-bg)] border-l border-[var(--color-border)] shadow-2xl overflow-y-auto"
                        >
                            <div className="sticky top-0 z-10 bg-[var(--color-bg)]/80 backdrop-blur-md border-b border-[var(--color-border)] px-6 py-4 flex items-center justify-between">
                                <h2 className="text-lg font-bold text-[var(--color-text)]">Review Submission</h2>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedSubmissionId(null)}
                                >
                                    ✕ Close
                                </Button>
                            </div>
                            <div className="p-0">
                                <EmployerReviewProof
                                    submissionId={selectedSubmissionId}
                                    onBack={() => {
                                        setSelectedSubmissionId(null);
                                        // Refresh the list after review
                                        if (user?.id) {
                                            getEmployerSubmissionsWithFeedback(user.id).then(setSubmissions);
                                        }
                                    }}
                                />
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
