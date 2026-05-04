import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  MessageCircle,
  Mail,
  Clock,
  ArrowDownUp,
  Search,
  BarChart2,
  Bug,
  Lightbulb,
  HelpCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import type { FeedbackMessage } from "@/types/admin";
import { motion } from "framer-motion";

export default function AdminFeedbackMessages() {
  const [messages, setMessages] = useState<FeedbackMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const [categoryFilter, setCategoryFilter] = useState<"all" | string>("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadFeedback = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("feedback_messages")
        .select("*, profiles(full_name, email)")
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        toast.error("Failed to load feedback messages.");
      } else {
        setMessages(data as unknown as FeedbackMessage[]);
      }
      setLoading(false);
    };
    loadFeedback();
  }, []);

  /* ─────────────────────────────── Filtering + Sorting ─────────────────────────────── */
  const filteredMessages = useMemo(() => {
    let result = [...messages];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (m) =>
          m.message.toLowerCase().includes(term) ||
          m.profiles?.email?.toLowerCase().includes(term) ||
          m.page?.toLowerCase().includes(term)
      );
    }

    if (categoryFilter !== "all") {
      result = result.filter((m) => m.category === categoryFilter);
    }

    result.sort((a, b) => {
      const da = new Date(a.created_at ?? 0).getTime();
      const db = new Date(b.created_at ?? 0).getTime();
      return sortOrder === "newest" ? db - da : da - db;
    });

    return result;
  }, [messages, searchTerm, categoryFilter, sortOrder]);

  /* ─────────────────────────────── Summary Counts ─────────────────────────────── */
  const summary = useMemo(() => {
    const counts = { bug: 0, suggestion: 0, question: 0, general: 0 };
    messages.forEach((m) => {
      if (
        m.category &&
        counts[m.category as keyof typeof counts] !== undefined
      ) {
        counts[m.category as keyof typeof counts]++;
      }
    });
    const total = messages.length;
    return { ...counts, total };
  }, [messages]);

  /* ─────────────────────────────── UI ─────────────────────────────── */
  return (
    <div className="min-h-screen bg-[var(--color-bg)] transition-colors pb-20">

      {/* ── Fancy Banner / Header ── */}
      <div className="relative pt-12 pb-24 px-8 bg-gradient-to-br from-slate-900 via-teal-900 to-slate-800 text-white shadow-2xl overflow-hidden rounded-b-[3rem] md:rounded-b-[4rem]">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-teal-300 text-[10px] font-bold uppercase tracking-widest mb-6"
              >
                <MessageCircle size={12} />
                User Sentiment
              </motion.div>
              
              <h1 className="text-4xl md:text-5xl font-bold font-display tracking-tight mb-4">
                Platform Feedback
              </h1>
              <p className="text-slate-300 max-w-2xl text-lg leading-relaxed">
                Review direct feedback from the community. Track bugs, evaluate suggestions, 
                and respond to user inquiries to improve the Bevisly experience.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-5 py-3 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center gap-4 shadow-2xl">
                <div className="text-center">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">Total</p>
                  <p className="text-lg font-bold text-white">{messages.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-12 relative z-20 space-y-8">
        
        {/* Summary Category Cards */}
        {!loading && summary.total > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { key: "bug", label: "Bugs", Icon: Bug, color: "red", count: summary.bug },
              { key: "suggestion", label: "Ideas", Icon: Lightbulb, color: "yellow", count: summary.suggestion },
              { key: "question", label: "Queries", Icon: HelpCircle, color: "blue", count: summary.question },
              { key: "general", label: "General", Icon: MessageCircle, color: "emerald", count: summary.general },
            ].map((cat) => (
              <button
                key={cat.key}
                onClick={() => setCategoryFilter(categoryFilter === cat.key ? "all" : cat.key)}
                className={`
                  relative group p-4 rounded-3xl border transition-all text-left overflow-hidden
                  ${categoryFilter === cat.key 
                    ? `bg-${cat.color}-500/10 border-${cat.color}-500 shadow-lg ring-2 ring-${cat.color}-500/20` 
                    : 'bg-white/50 dark:bg-slate-900/50 border-[var(--color-border)] backdrop-blur-md hover:border-[var(--color-brand-primary)]/50'}
                `}
              >
                <div className="relative z-10 flex flex-col gap-1">
                  <cat.Icon size={22} className={`mb-1 ${categoryFilter === cat.key ? `text-${cat.color}-600 dark:text-${cat.color}-400` : 'text-[var(--color-text-muted)]'}`} />
                  <span className={`text-[10px] font-black uppercase tracking-widest ${categoryFilter === cat.key ? `text-${cat.color}-600 dark:text-${cat.color}-400` : 'text-[var(--color-text-muted)]'}`}>
                    {cat.label}
                  </span>
                  <span className="text-2xl font-black text-[var(--color-text)]">
                    {cat.count}
                  </span>
                </div>
                <div className={`absolute -right-2 -bottom-2 w-16 h-16 rounded-full blur-2xl opacity-10 bg-${cat.color}-500 group-hover:scale-150 transition-transform`} />
              </button>
            ))}
          </div>
        )}

        {/* Controls Bar */}
        <div className="glass-panel p-4 rounded-[1.5rem] border border-[var(--color-border)] bg-white/50 dark:bg-slate-900/50 backdrop-blur-md shadow-xl flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Search */}
          <div className="relative w-full md:w-96">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input
              type="text"
              placeholder="Search messages or emails..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[var(--color-bg)]/50 border border-[var(--color-border)] rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-4 focus:ring-[var(--color-brand-primary)]/10 focus:border-[var(--color-brand-primary)] outline-none transition-all font-medium"
            />
          </div>

          {/* Sort */}
          <button
            onClick={() => setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest')}
            className="flex items-center gap-2 px-5 py-3 bg-[var(--color-bg)]/50 border border-[var(--color-border)] rounded-xl text-sm font-bold hover:bg-[var(--color-surface-hover)] transition-all shadow-sm group"
          >
            <ArrowDownUp size={16} className="text-[var(--color-brand-primary)] group-hover:rotate-180 transition-transform" />
            {sortOrder === 'newest' ? 'Newest' : 'Oldest'}
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-teal-500 border-t-transparent animate-spin shadow-glow-blue" />
            <p className="font-bold text-[var(--color-text-muted)] animate-pulse uppercase tracking-widest text-xs">Accessing feedback vault...</p>
          </div>
        )}

        {/* Data Grid */}
        {!loading && filteredMessages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel border border-[var(--color-border)] rounded-[2.5rem] overflow-hidden shadow-2xl bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="bg-[var(--color-bg)]/50 border-b border-[var(--color-border)]">
                    <th className="py-5 px-8 font-bold text-[var(--color-text-muted)] uppercase text-[10px] tracking-widest">Classification</th>
                    <th className="py-5 px-6 font-bold text-[var(--color-text-muted)] uppercase text-[10px] tracking-widest">Message Content</th>
                    <th className="py-5 px-6 font-bold text-[var(--color-text-muted)] uppercase text-[10px] tracking-widest">User / Origin</th>
                    <th className="py-5 px-8 font-bold text-[var(--color-text-muted)] uppercase text-[10px] tracking-widest text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]/30">
                  {filteredMessages.map((m) => (
                    <tr key={m.id} className="group hover:bg-[var(--color-brand-primary)]/5 transition-all">
                      <td className="py-6 px-8">
                        <span className={`
                          inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm border
                          ${m.category === "bug"
                            ? "bg-red-500/10 text-red-600 border-red-500/20"
                            : m.category === "suggestion"
                            ? "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20"
                            : m.category === "question"
                            ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                            : "bg-slate-500/10 text-slate-600 border-slate-500/20"}
                        `}>
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            m.category === 'bug' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 
                            m.category === 'suggestion' ? 'bg-yellow-500' : 
                            m.category === 'question' ? 'bg-blue-500' : 'bg-slate-400'
                          }`} />
                          {m.category}
                        </span>
                      </td>
                      <td className="py-6 px-6">
                        <p className="text-sm text-[var(--color-text)] font-medium leading-relaxed max-w-md">
                          {m.message}
                        </p>
                      </td>
                      <td className="py-6 px-6">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-text)]">
                            <Mail size={14} className="text-teal-500/60" />
                            <span className="truncate max-w-[180px]">{m.profiles?.email || "Anonymous contributor"}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-tighter">
                            <BarChart2 size={12} className="text-slate-400" />
                            On: {m.page || "Global Interface"}
                          </div>
                        </div>
                      </td>
                      <td className="py-6 px-8 text-right">
                        <div className="flex flex-col items-end gap-1">
                           <span className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-text)]">
                            <Clock size={14} className="text-[var(--color-text-muted)]" />
                            {m.created_at ? new Date(m.created_at).toLocaleDateString() : "Pending"}
                          </span>
                          <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-tighter">
                             {m.created_at ? new Date(m.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : ""}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && filteredMessages.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-32 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-[var(--color-surface)] flex items-center justify-center opacity-20 mb-6">
              <MessageCircle size={40} />
            </div>
            <h3 className="text-xl font-bold text-[var(--color-text)] mb-2">Silence is Golden</h3>
            <p className="text-[var(--color-text-muted)] max-w-sm font-medium">
              No feedback messages found matching your criteria. This usually means the system 
              is running smoothly or filters are too restrictive.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
