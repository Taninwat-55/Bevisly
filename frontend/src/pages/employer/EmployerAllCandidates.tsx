import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getEmployerSubmissionsWithFeedback } from "@/lib/api";
import type { EmployerSubmission } from "@/types";
import { 
    Users, 
    Search, 
    Star, 
    Calendar, 
    Briefcase,
    ChevronRight,
    User,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { motion, AnimatePresence } from "framer-motion";
import EmployerReviewProof from "./EmployerReviewProof";
import toast from "react-hot-toast";

export default function EmployerAllCandidates() {
    const { user } = useAuth();
    const [submissions, setSubmissions] = useState<EmployerSubmission[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);

    useEffect(() => {
        if (!user?.id) return;
        
        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await getEmployerSubmissionsWithFeedback(user.id);
                setSubmissions(data);
            } catch (error) {
                console.error("Error fetching talent database:", error);
                toast.error("Failed to load candidates");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user?.id]);

    const filteredCandidates = useMemo(() => {
        return submissions.filter(s => {
            const search = searchQuery.toLowerCase();
            return (
                s.profiles?.full_name?.toLowerCase().includes(search) ||
                s.jobs?.title?.toLowerCase().includes(search)
            );
        });
    }, [submissions, searchQuery]);

    const getStatusColor = (status: string | null) => {
        switch (status?.toLowerCase()) {
            case 'hired': return 'bg-emerald-500/10 text-emerald-600 border-emerald-200';
            case 'rejected': return 'bg-rose-500/10 text-rose-600 border-rose-200';
            case 'shortlisted': return 'bg-blue-500/10 text-blue-600 border-blue-200';
            case 'submitted': return 'bg-amber-500/10 text-amber-600 border-amber-200';
            default: return 'bg-slate-500/10 text-slate-600 border-slate-200';
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <div className="w-10 h-10 border-4 border-[var(--color-brand-primary)] border-t-transparent rounded-full animate-spin" />
                <p className="text-[var(--color-text-muted)] font-medium">Loading Talent Database...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] text-xs font-bold uppercase tracking-widest">
                        <Users size={14} />
                        Candidates
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold font-display text-[var(--color-text)]">
                        Talent Database
                    </h1>
                    <p className="text-[var(--color-text-muted)] text-lg max-w-xl">
                        A complete history of every candidate who has engaged with your job postings.
                    </p>
                </div>
                
                <div className="relative w-full md:w-80">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                    <input 
                        type="text"
                        placeholder="Search by name or job..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-sm focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 focus:border-[var(--color-brand-primary)] transition-all outline-none placeholder:text-slate-400"
                    />
                </div>
            </div>

            {/* Table Card */}
            <Card className="overflow-hidden border-[var(--color-border)] shadow-xl shadow-slate-200/50 dark:shadow-none">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-[var(--color-border)]">
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Candidate</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Applied For</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Status</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500 text-center">Rating</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Date</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--color-border)]">
                            {filteredCandidates.length > 0 ? (
                                filteredCandidates.map((submission) => (
                                    <tr key={submission.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/80 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center border border-[var(--color-border)] shrink-0 group-hover:scale-110 transition-transform">
                                                    <User size={18} className="text-slate-500" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-[var(--color-text)] leading-tight">{submission.profiles?.full_name || "Anonymous"}</p>
                                                    <p className="text-xs text-[var(--color-text-muted)]">{submission.profiles?.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Briefcase size={14} className="text-blue-500" />
                                                <span className="text-sm font-medium text-[var(--color-text)] truncate max-w-[200px]">
                                                    {submission.jobs?.title}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(submission.hiring_stage || submission.status)}`}>
                                                {submission.hiring_stage || submission.status || 'New'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star 
                                                        key={i} 
                                                        size={14} 
                                                        className={i < (submission.feedback?.[0]?.stars || 0) ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200 dark:text-slate-700 dark:fill-slate-700"} 
                                                    />
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                                                <Calendar size={14} />
                                                {new Date(submission.created_at || '').toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="rounded-lg group-hover:bg-[var(--color-brand-primary)] group-hover:text-white transition-all"
                                                onClick={() => setSelectedSubmissionId(submission.id)}
                                                rightIcon={<ChevronRight size={14} />}
                                            >
                                                View
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400">
                                                <Search size={32} />
                                            </div>
                                            <p className="text-lg font-medium text-[var(--color-text-muted)]">No candidates found matching your criteria</p>
                                            <Button variant="ghost" onClick={() => setSearchQuery("")}>Clear Search</Button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Review Slide-Over */}
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
                                <h2 className="text-lg font-bold text-[var(--color-text)]">Candidate Details</h2>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedSubmissionId(null)}
                                >
                                    ✕ Close
                                </Button>
                            </div>
                            <EmployerReviewProof
                                submissionId={selectedSubmissionId}
                                onBack={() => {
                                    setSelectedSubmissionId(null);
                                    // Refresh data if needed
                                }}
                            />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
