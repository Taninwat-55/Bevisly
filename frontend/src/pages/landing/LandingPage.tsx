import { useState, useRef, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { ArrowRight, CheckCircle, Play, Search, Loader2, Star, Sparkles, MapPin, Building2 } from "lucide-react";
import type { GeneratedJobListing } from "@/lib/api/ai";
import { generateJobListing } from "@/lib/api/ai";
import { getFeaturedJobs } from "@/lib/api/jobs";
import toast from "react-hot-toast";
import AILoadingState from "@/components/common/AILoadingState";
import ContactModal from "@/components/common/ContactModal";
import PlatformStats from "@/components/landing/PlatformStats";
import ReactMarkdown, { type Components } from "react-markdown";
import DOMPurify from "dompurify";

const markdownComponents: Components = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  strong: ({ node, ...props }) => <strong className="font-bold text-white" {...props} />,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ul: ({ node, ...props }) => <ul className="list-disc pl-5 my-2 space-y-1" {...props} />,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ol: ({ node, ...props }) => <ol className="list-decimal pl-5 my-2 space-y-1" {...props} />,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  li: ({ node, ...props }) => <li className="text-slate-300" {...props} />,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  p: ({ node, ...props }) => <p className="mb-3 leading-relaxed" {...props} />,
};

export default function LandingPage() {
  const navigate = useNavigate();
  const [isContactOpen, setIsContactOpen] = useState(false);

  // Magic Box State
  const [rawInput, setRawInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedData, setGeneratedData] = useState<GeneratedJobListing | null>(null);
  const magicBoxRef = useRef<HTMLDivElement>(null);

  // Featured Jobs
  const [featuredJobs, setFeaturedJobs] = useState<{ id: string; title: string; company: string | null; location: string | null; salary_min?: number | null; salary_max?: number | null; pay_period?: string | null; show_salary_range?: boolean | null }[]>([]);

  useEffect(() => {
    getFeaturedJobs()
      .then(setFeaturedJobs)
      .catch(() => { /* silently fail — landing page shouldn't break if no featured jobs */ });
  }, []);

  // 1. JSON-LD Structured Data for GEO
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "name": "Bevisly",
        "url": "https://bevisly.com",
        "logo": "https://bevisly.com/logo.png",
        "sameAs": [
          "https://twitter.com/bevisly",
          "https://linkedin.com/company/bevisly"
        ]
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "How does proof-first hiring work for junior talent?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "You post a role and Bevisly generates a short proof task — typically 30 minutes. Junior candidates complete the task and submit their work. You review real deliverables and shortlist based on actual skill, not years of experience."
            }
          },
          {
            "@type": "Question",
            "name": "How quickly can I start reviewing candidates?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Most employers have their first proof task live within 15 minutes of signing up. Candidate submissions typically arrive within 24–48 hours of posting."
            }
          },
          {
            "@type": "Question",
            "name": "Is Bevisly free for candidates?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, always. Complete proof tasks, build your verified portfolio, and keep your credentials forever — at no cost. Candidates should never pay to prove themselves."
            }
          }
        ]
      }
    ]
  };

  const handleGenerateProofTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawInput.trim()) {
      toast.error("Please enter a job description first.");
      return;
    }

    setIsGenerating(true);
    setGeneratedData(null);
    try {
      // Pass 'Guest Company' or similar because they aren't logged in
      const data = await generateJobListing(rawInput, "your company");
      setGeneratedData(data);
      
      // Scroll to the result slightly after it renders
      setTimeout(() => {
         magicBoxRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
      
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate task. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-[var(--color-bg)] min-h-screen font-sans selection:bg-[var(--color-brand-primary)] selection:text-white">
      <Helmet>
        <title>Bevisly — Proof-First Hiring for Junior Talent</title>
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>
      <main>
        {/* ── HERO SECTION ────────────────────────────── */}
        <section className="relative pt-16 pb-20 md:pt-32 md:pb-32 overflow-hidden border-b border-[var(--color-border)]">

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center max-w-4xl mx-auto mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[var(--color-brand-subtle)] border border-[var(--color-brand-subtle-border)] mb-8 animate-fade-in-up">
                <span className="w-2 h-2 rounded-full bg-[var(--color-brand-primary)]" />
                <span className="text-sm font-medium text-[var(--color-brand-primary)]">
                  Now hiring junior talent for top Nordic companies
                </span>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold font-display tracking-tight text-[var(--color-text)] mb-6 leading-[1.1] animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                The{" "}
                <span className="text-[var(--color-brand-primary)]">
                  proof-first
                </span>{" "}
                platform <br />
                for hiring junior talent.
              </h1>

              <p className="text-xl text-[var(--color-text-muted)] mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
                Candidates prove skills with 30-minute tasks.
                Employers review real work, not CVs.
              </p>

              <div className="max-w-2xl mx-auto relative animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
                <form
                  onSubmit={handleGenerateProofTask}
                  className={`relative flex items-center w-full rounded-xl bg-[var(--color-surface)] border transition-colors overflow-hidden shadow-sm ${isGenerating ? 'border-[var(--color-brand-primary)] opacity-80 pointer-events-none' : 'border-[var(--color-border-strong)] focus-within:border-[var(--color-brand-primary)]'}`}
                >
                  <Search className={`absolute left-4 md:left-6 transition-colors ${isGenerating ? 'text-[var(--color-brand-primary)]' : 'text-[var(--color-text-muted)]'}`} size={24} />
                  <input 
                     type="text" 
                     value={rawInput}
                     onChange={(e) => setRawInput(e.target.value)}
                     disabled={isGenerating}
                     placeholder="e.g. Junior Frontend Developer for 3-month contract..."
                     className="w-full bg-transparent border-none py-5 pl-14 md:pl-16 pr-32 md:pr-48 text-lg md:text-xl text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-muted)] disabled:opacity-50"
                  />
                  <button
                     type="submit"
                     disabled={isGenerating || !rawInput.trim()}
                     className="absolute right-2 top-2 bottom-2 bg-[var(--color-brand-primary)] text-white font-bold px-4 md:px-8 rounded-lg hover:bg-[var(--color-brand-primary-hover)] disabled:opacity-50 transition-colors flex items-center gap-2"
                  >
                     {isGenerating ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          <span className="hidden sm:inline">Generating...</span>
                        </>
                     ) : (
                        <>
                          <span>Generate</span>
                          <ArrowRight size={18} className="hidden sm:block" />
                        </>
                     )}
                  </button>
                </form>
                <div className="flex items-center justify-center gap-4 mt-6">
                  <p className="text-sm font-medium text-[var(--color-text-muted)]">
                    Describe the role. AI writes the proof task. Free to try — no account needed.
                  </p>
                </div>
              </div>
            </div>

            {/* Hero Visual / Mockup */}
            <div ref={magicBoxRef} className="relative mx-auto max-w-5xl mt-16 animate-scale-in" style={{ animationDelay: "0.4s" }}>
              <div className="glass-panel p-2 rounded-2xl md:rounded-[2rem] shadow-2xl border-gradient-primary bg-slate-900/50 backdrop-blur-xl">
                <div className="bg-slate-950 rounded-xl md:rounded-[1.5rem] overflow-hidden border border-slate-800 min-h-[320px] sm:aspect-[16/9] relative flex flex-col">
                  {/* Mock Window Header */}
                  <div className="h-12 border-b border-slate-800 flex items-center px-6 gap-2 bg-slate-900/50">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                      <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50" />
                    </div>
                    <div className="ml-4 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-400">
                      bevisly.com/verify/task-8291
                    </div>
                  </div>

                  {/* Dynamic Content Area */}
                  <div className="flex-1 flex overflow-hidden">
                    {isGenerating ? (
                      /* ── STATE 1: GENERATING (SKELETON) ── */
                      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-900/50">
                        <AILoadingState variant="dark" />
                      </div>
                    ) : generatedData ? (

                      /* ── STATE 2: SUCCESS (AI RESULTS) ── */
                      <div className="flex-1 p-4 md:p-6 flex flex-col gap-4 overflow-y-auto bg-slate-900/50 relative">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
                            
                            {/* Card 1: Job Listing */}
                            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 md:p-6 flex flex-col shadow-lg relative overflow-hidden">
                                {/* Decorative Glow */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-brand-primary)]/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                                
                                <div className="bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] border border-[var(--color-brand-primary)]/20 px-3 py-1 rounded-full inline-flex items-center gap-2 mb-4 self-start relative z-10">
                                    <CheckCircle size={12} />
                                    <span className="font-semibold text-[10px] tracking-widest uppercase">1. Job Listing</span>
                                </div>
                                <h3 className="text-white text-xl font-bold font-display tracking-tight mb-3 relative z-10 shrink-0">
                                    {generatedData.title}
                                </h3>
                                <div className="text-slate-400 text-sm leading-relaxed flex-1 relative z-10 overflow-y-auto custom-scrollbar pr-2">
                                    <ReactMarkdown components={markdownComponents}>
                                        {DOMPurify.sanitize(generatedData.description)}
                                    </ReactMarkdown>
                                    
                                    <div className="mt-4 pt-4 border-t border-slate-800/60">
                                        <h4 className="text-slate-200 font-semibold mb-3">Key Requirements</h4>
                                        <ReactMarkdown components={markdownComponents}>
                                            {DOMPurify.sanitize(generatedData.requirements)}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            </div>

                            {/* Card 2: Proof Task */}
                            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 md:p-6 flex flex-col shadow-lg relative overflow-hidden">
                                {/* Decorative Glow */}
                                <div className="absolute top-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl -translate-y-1/2 -translate-x-1/2 pointer-events-none" />
                                
                                <div className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-3 py-1 rounded-full inline-flex items-center gap-2 mb-4 self-start relative z-10">
                                    <CheckCircle size={12} />
                                    <span className="font-semibold text-[10px] tracking-widest uppercase">2. Proof Task</span>
                                </div>
                                
                                <div className="flex flex-col gap-5 flex-1 overflow-y-auto custom-scrollbar pr-2 relative z-10">
                                    {generatedData.proof_tasks.map((task, i) => (
                                        <div key={i} className="flex flex-col gap-2">
                                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                                                <h4 className="text-base font-medium text-white leading-tight">
                                                    {task.title}
                                                </h4>
                                                <div className="flex flex-row gap-1.5 shrink-0 items-center">
                                                    <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-mono whitespace-nowrap">
                                                        {task.expected_time}
                                                    </span>
                                                    <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-mono whitespace-nowrap uppercase">
                                                        {task.submission_format}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-sm text-slate-400 font-mono leading-relaxed">
                                                <ReactMarkdown components={markdownComponents}>{DOMPurify.sanitize(task.description)}</ReactMarkdown>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* CTA - Bottom Right */}
                        <div className="absolute bottom-4 right-4 z-30">
                            <Button size="md" onClick={() => navigate('/auth?tab=signup&role=employer')}>
                                Post This Role &amp; Find Junior Talent <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </div>
                      </div>

                    ) : (

                      /* ── STATE 3: DEFAULT MOCKUP ── */
                      <>
                        {/* Mock Sidebar */}
                        <div className="w-48 border-r border-slate-800 bg-slate-900/30 hidden md:flex flex-col p-4 gap-3">
                          <div className="h-2 w-20 bg-slate-800 rounded mb-4" />
                          <div className="h-8 w-full bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center px-3 gap-2">
                            <div className="w-4 h-4 bg-blue-500/50 rounded-full" />
                            <div className="h-2 w-16 bg-blue-500/30 rounded" />
                          </div>
                          <div className="h-8 w-full rounded-lg flex items-center px-3 gap-2 opacity-50">
                            <div className="w-4 h-4 bg-slate-700 rounded-full" />
                            <div className="h-2 w-12 bg-slate-700 rounded" />
                          </div>
                          <div className="h-8 w-full rounded-lg flex items-center px-3 gap-2 opacity-50">
                            <div className="w-4 h-4 bg-slate-700 rounded-full" />
                            <div className="h-2 w-20 bg-slate-700 rounded" />
                          </div>
                        </div>

                        {/* Mock Main Area */}
                        <div className="flex-1 p-4 sm:p-6 md:p-8 flex flex-col gap-6 font-mono text-xs md:text-sm text-slate-400">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-3 py-1 rounded-full inline-flex items-center gap-2 mb-2">
                                <CheckCircle size={12} />
                                <span className="font-semibold">Verification Complete</span>
                              </div>
                              <h3 className="text-slate-100 text-lg md:text-xl font-bold font-sans">Submit & Verify Task</h3>
                            </div>
                            <div className="bg-[var(--color-brand-primary)] text-white px-4 py-2 rounded-lg font-sans font-medium text-xs">
                              98/100 Score
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 space-y-2">
                              <div className="h-2 w-12 bg-slate-700 rounded" />
                              <div className="h-2 w-24 bg-slate-600 rounded" />
                              <div className="mt-4 space-y-1">
                                <div className="flex gap-2"><span className="text-purple-400">const</span> <span className="text-blue-400">result</span> = <span className="text-yellow-400">await</span> fn();</div>
                                <div className="flex gap-2"><span className="text-purple-400">if</span> (result.ok) <span className="text-slate-600">{"{"}</span></div>
                                <div className="pl-4 text-slate-500">// Task validated successfully</div>
                                <div className="pl-4"><span className="text-blue-400">return</span> <span className="text-emerald-400">true</span>;</div>
                                <div className="text-slate-600">{"}"}</div>
                              </div>
                            </div>
                            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 flex flex-col justify-center items-center gap-3">
                              <div className="w-12 h-12 rounded-full border-2 border-emerald-500/50 flex items-center justify-center text-emerald-500">
                                <CheckCircle />
                              </div>
                              <div className="text-center">
                                <div className="text-slate-200 font-sans font-medium">All Tests Passed</div>
                                <div className="text-slate-600 text-[10px]">24/24 assertions checks</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Floating Cards (Decorative - Adjusted Positioning) */}
              <div className="absolute -left-4 md:-left-8 bottom-8 glass-card p-3 md:p-4 rounded-xl hidden md:block animate-card-lift bg-white/90 dark:bg-slate-800/90 shadow-xl border border-white/20" style={{ animationDelay: "0.6s" }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200">JD</div>
                  <div className="pr-2">
                    <p className="font-semibold text-sm text-[var(--color-text)] leading-tight">John Doe</p>
                    <p className="text-[10px] text-[var(--color-text-muted)] font-medium">Top 1% React Developer</p>
                  </div>
                </div>
              </div>

              <div className="absolute -right-4 md:-right-8 top-12 glass-card p-3 md:p-4 rounded-xl hidden md:block animate-card-lift bg-white/90 dark:bg-slate-800/90 shadow-xl border border-white/20" style={{ animationDelay: "0.8s" }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-500 border border-amber-200">
                    <Star size={18} className="fill-current" />
                  </div>
                  <div className="pr-2">
                    <p className="font-bold text-lg text-[var(--color-text)] leading-none">4.9/5</p>
                    <p className="text-[10px] text-[var(--color-text-muted)] mt-1 font-medium">Average Candidate Rating</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── PLATFORM STATS (gated, hidden until thresholds met) ─── */}
        <PlatformStats />

        {/* ── FEATURED JOBS (only show if there are featured jobs) ─── */}
        {featuredJobs.length > 0 && (
          <section className="py-20 bg-[var(--color-bg-subtle)] border-t border-[var(--color-border)]">
            <div className="max-w-7xl mx-auto px-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[var(--color-brand-subtle)] border border-[var(--color-brand-subtle-border)] text-sm font-medium text-[var(--color-brand-primary)] mb-3">
                    <Sparkles size={14} />
                    Featured Roles
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold font-display text-[var(--color-text)]">
                    Companies hiring <span className="text-[var(--color-brand-primary)]">right now</span>
                  </h2>
                </div>
                <Button variant="outline" size="md" onClick={() => navigate('/jobs')} className="shrink-0">
                  View all jobs <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {featuredJobs.map((job) => (
                  <Link
                    key={job.id}
                    to={`/jobs/${job.id}`}
                    className="group flex flex-col p-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-brand-primary)]/40 hover:shadow-md transition-all duration-150"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-[var(--color-brand-subtle)] border border-[var(--color-brand-subtle-border)] flex items-center justify-center text-[var(--color-brand-primary)] font-bold text-sm shrink-0">
                        {job.company ? job.company.charAt(0).toUpperCase() : <Building2 size={16} />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-[var(--color-text)] text-base leading-tight truncate group-hover:text-[var(--color-brand-primary)] transition-colors">
                          {job.title}
                        </h3>
                        <p className="text-sm text-[var(--color-text-muted)] truncate mt-0.5">{job.company}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-auto">
                      {job.location && (
                        <span className="inline-flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
                          <MapPin size={11} /> {job.location}
                        </span>
                      )}
                      {job.show_salary_range && job.salary_min && job.salary_max && (
                        <span className="text-xs text-[var(--color-text-muted)]">
                          €{job.salary_min.toLocaleString()}–{job.salary_max.toLocaleString()}
                          {job.pay_period === 'yearly' ? '/yr' : job.pay_period === 'hourly' ? '/hr' : '/mo'}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── FEATURES GRID (Bento) ────────────────────────────── */}
        <section id="features" className="py-24 bg-[var(--color-bg)]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold font-display text-[var(--color-text)] mb-4">
                From job post to shortlist <br />
                <span className="text-[var(--color-brand-primary)]">in under 10 minutes</span>
              </h2>
              <p className="text-[var(--color-text-muted)] text-lg max-w-2xl mx-auto">
                The full proof-first pipeline: AI generates the task, candidates submit real work, you review what matters.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature 1: Large Box */}
              <div className="md:col-span-2 p-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] relative overflow-hidden">
                <div className="w-12 h-12 rounded-lg bg-[var(--color-brand-subtle)] flex items-center justify-center text-[var(--color-brand-primary)] mb-6">
                  <CheckCircle />
                </div>
                <h3 className="text-2xl font-bold font-display text-[var(--color-text)] mb-2">AI Writes the Proof Task</h3>
                <p className="text-[var(--color-text-muted)] max-w-sm">
                  Describe the role in plain English. Bevisly's AI generates a job-relevant 30-minute task, ready to send to candidates. No task design experience needed.
                </p>
              </div>

              {/* Feature 2: Tall Box */}
              <div className="p-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] md:row-span-2 relative overflow-hidden">
                <div className="w-12 h-12 rounded-lg bg-[var(--color-brand-subtle)] flex items-center justify-center text-[var(--color-brand-primary)] mb-6">
                  <Play />
                </div>
                <h3 className="text-2xl font-bold font-display text-[var(--color-text)] mb-2">Review Real Work, Not Resumes</h3>
                <p className="text-[var(--color-text-muted)]">
                  Candidates submit actual deliverables — code, designs, writing, analysis. You review what they built, guided by AI evidence summaries. Humans decide. AI helps.
                </p>
              </div>

              {/* Feature 3: Standard Box */}
              <div className="p-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
                <h3 className="text-xl font-bold font-display text-[var(--color-text)] mb-2">Employer-Reviewed, AI-Assisted</h3>
                <p className="text-[var(--color-text-muted)] text-sm">
                  Transparent scoring. You see the rubric, the AI notes, and the raw submission. No black boxes — every decision rests with your team.
                </p>
              </div>

              {/* Feature 4: Standard Box */}
              <div className="p-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
                <h3 className="text-xl font-bold font-display text-[var(--color-text)] mb-2">Team Collaboration</h3>
                <p className="text-[var(--color-text-muted)] text-sm">
                  Invite your team, share feedback, and make hiring decisions together in one unified dashboard.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── PROBLEM / SOLUTION - EMPLOYERS ────────────────────────────── */}
        <section id="employers" className="py-24 bg-[var(--color-bg-subtle)] border-t border-[var(--color-border)]">
          <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-block px-3 py-1 rounded-md border border-[var(--color-brand-subtle-border)] bg-[var(--color-brand-subtle)] text-sm font-medium text-[var(--color-brand-primary)] mb-6">
                For Employers
              </div>
              <h2 className="text-4xl md:text-5xl font-bold font-display text-[var(--color-text)] mb-6">Stop screening CVs.<br />Start reviewing proof.</h2>
              <p className="text-[var(--color-text-muted)] text-lg leading-relaxed mb-8">
                Junior roles get flooded with applications. Bevisly cuts through by replacing the CV with a 30-minute proof task. AI writes it for you. Review submissions in 10 minutes.
              </p>
              <Button variant="primary" size="lg" onClick={() => navigate('/auth?tab=signup&role=employer')}>
                Post Your First Role
              </Button>
            </div>

            <div className="space-y-3">
              {/* Comparison Item 1 */}
              <div className="flex items-start gap-4 p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]">
                <div className="w-7 h-7 rounded-md bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-500 shrink-0 text-sm font-bold">✕</div>
                <div>
                  <h4 className="font-semibold text-[var(--color-text)]">CV Screening</h4>
                  <p className="text-sm text-[var(--color-text-muted)] mt-0.5">Hundreds of applications with identical buzzwords. No signal on who can actually do the work.</p>
                </div>
              </div>

              {/* Comparison Item 2 — highlighted */}
              <div className="flex items-start gap-4 p-4 rounded-lg bg-[var(--color-brand-subtle)] border border-[var(--color-brand-subtle-border)]">
                <div className="w-7 h-7 rounded-md bg-[var(--color-brand-primary)] flex items-center justify-center text-white shrink-0 text-sm font-bold">✓</div>
                <div>
                  <h4 className="font-semibold text-[var(--color-text)]">Proof-First Review</h4>
                  <p className="text-sm text-[var(--color-text-muted)] mt-0.5">Candidates submit a 30-minute task. You review real deliverables. Shortlist the top 3 in a single afternoon.</p>
                </div>
              </div>

              {/* Comparison Item 3 */}
              <div className="flex items-start gap-4 p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]">
                <div className="w-7 h-7 rounded-md bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-500 shrink-0 text-sm font-bold">✕</div>
                <div>
                  <h4 className="font-semibold text-[var(--color-text)]">Keyword Filtering</h4>
                  <p className="text-sm text-[var(--color-text-muted)] mt-0.5">ATS systems that reject strong junior candidates for lacking the right phrasing.</p>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* ── CANDIDATES SECTION ────────────────────────────── */}
        <section id="candidates" className="py-24 bg-[var(--color-bg)] border-t border-[var(--color-border)]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <div className="inline-block px-3 py-1 rounded-md border border-[var(--color-brand-subtle-border)] bg-[var(--color-brand-subtle)] text-sm font-medium text-[var(--color-brand-primary)] mb-4">
                For Junior Talent
              </div>
              <h2 className="text-3xl md:text-5xl font-bold font-display text-[var(--color-text)] mb-4">
                Your skills deserve more <br />
                <span className="text-[var(--color-brand-primary)]">than a resume.</span>
              </h2>
              <p className="text-[var(--color-text-muted)] text-lg max-w-2xl mx-auto">
                Build a proof portfolio before you even apply. 30-minute tasks, verified feedback, credentials that live forever on your public profile.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
                <div className="w-10 h-10 rounded-lg bg-[var(--color-brand-subtle)] flex items-center justify-center text-[var(--color-brand-primary)] mb-5 font-bold text-base">1</div>
                <h3 className="text-lg font-bold text-[var(--color-text)] mb-2">Find a Role (or Practice)</h3>
                <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">Browse proof-based junior roles — or complete a practice proof task to start building your portfolio before you even apply.</p>
              </div>
              <div className="p-6 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
                <div className="w-10 h-10 rounded-lg bg-[var(--color-brand-subtle)] flex items-center justify-center text-[var(--color-brand-primary)] mb-5 font-bold text-base">2</div>
                <h3 className="text-lg font-bold text-[var(--color-text)] mb-2">Complete the Proof Task</h3>
                <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">30 minutes. Real work. Submit your deliverable — no cover letter, no keyword stuffing.</p>
              </div>
              <div className="p-6 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
                <div className="w-10 h-10 rounded-lg bg-[var(--color-brand-subtle)] flex items-center justify-center text-[var(--color-brand-primary)] mb-5 font-bold text-base">3</div>
                <h3 className="text-lg font-bold text-[var(--color-text)] mb-2">Earn a Verified Credential</h3>
                <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">Employer-reviewed feedback added to your proof portfolio. Reuse it. Share it. Keep it forever.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── PRACTICE PROOFS SECTION ────────────────────────────── */}
        <section className="py-24 bg-[var(--color-bg-subtle)] border-t border-[var(--color-border)]">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div className="inline-block px-3 py-1 rounded-md border border-[var(--color-brand-subtle-border)] bg-[var(--color-brand-subtle)] text-sm font-medium text-[var(--color-brand-primary)] mb-6">
              Practice Proofs — No Application Required
            </div>
            <h2 className="text-3xl md:text-5xl font-bold font-display text-[var(--color-text)] mb-6">
              Build your proof portfolio <br />
              <span className="text-[var(--color-brand-primary)]">before you apply.</span>
            </h2>
            <p className="text-[var(--color-text-muted)] text-lg max-w-2xl mx-auto mb-8">
              Don't wait for the right job posting. Browse open proof tasks, complete them on your own time, and build a verified portfolio. When your ideal role appears, your proof is already waiting.
            </p>
            <Button size="lg" onClick={() => navigate('/jobs')}>
              Browse Proof Tasks <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <p className="mt-4 text-sm text-[var(--color-text-muted)]">
              Junior candidates use Practice Proofs to stand out before their first job application.
            </p>
          </div>
        </section>

        {/* ── TRANSPARENT SCORING SECTION ────────────────────────────── */}
        <section className="py-24 bg-[var(--color-bg)] border-t border-[var(--color-border)]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <div className="inline-block px-3 py-1 rounded-md border border-[var(--color-brand-subtle-border)] bg-[var(--color-brand-subtle)] text-sm font-medium text-[var(--color-brand-primary)] mb-6">
                Employer-Reviewed, AI-Assisted
              </div>
              <h2 className="text-3xl md:text-5xl font-bold font-display text-[var(--color-text)] mb-4">
                Transparent scoring. <br />
                <span className="text-[var(--color-brand-primary)]">Humans decide.</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-8 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
                <div className="w-10 h-10 rounded-lg bg-[var(--color-brand-subtle)] flex items-center justify-center text-[var(--color-brand-primary)] mb-6 font-bold text-base">1</div>
                <h3 className="text-xl font-bold font-display text-[var(--color-text)] mb-3">You define what good looks like</h3>
                <p className="text-[var(--color-text-muted)]">Set a rubric when posting the role. AI uses your criteria to evaluate each submission consistently.</p>
              </div>
              <div className="p-8 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
                <div className="w-10 h-10 rounded-lg bg-[var(--color-brand-subtle)] flex items-center justify-center text-[var(--color-brand-primary)] mb-6 font-bold text-base">2</div>
                <h3 className="text-xl font-bold font-display text-[var(--color-text)] mb-3">AI highlights what matters</h3>
                <p className="text-[var(--color-text-muted)]">Surfaces notable moments in each submission — what they did well, what they skipped. No black boxes.</p>
              </div>
              <div className="p-8 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
                <div className="w-10 h-10 rounded-lg bg-[var(--color-brand-subtle)] flex items-center justify-center text-[var(--color-brand-primary)] mb-6 font-bold text-base">3</div>
                <h3 className="text-xl font-bold font-display text-[var(--color-text)] mb-3">You make every decision</h3>
                <p className="text-[var(--color-text-muted)]">No automated rejections. Shortlist who you want. Every candidate gets clear feedback either way.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── EARLY ACCESS BANNER ────────────────────────────── */}
        <section id="early-access" className="py-20 bg-[var(--color-bg)] border-t border-[var(--color-border)]">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-6">
              <Sparkles size={12} />
              Free During Early Access
            </div>
            <h2 className="text-3xl md:text-4xl font-bold font-display text-[var(--color-text)] mb-4">
              Everything is free. <br />
              <span className="text-[var(--color-brand-primary)]">While we launch.</span>
            </h2>
            <p className="text-[var(--color-text-muted)] text-lg mb-2 max-w-xl mx-auto">
              We're onboarding our first companies. Post proof-based jobs, review candidates with AI-assisted scoring, and build your employer profile — <strong className="text-[var(--color-text)]">all free</strong>.
            </p>
            <p className="text-sm text-[var(--color-text-muted)] mb-8">
              No credit card · No hidden limits · Be an early adopter and shape the platform with us
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" onClick={() => navigate("/auth?tab=signup&role=employer")}>
                Join as Early Employer
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate("/auth?tab=signup")}>
                Sign Up as Candidate
              </Button>
            </div>
          </div>
        </section>

        {/* ── FAQ SECTION (New for GEO) ────────────────────────────── */}
        <section className="py-24 bg-[var(--color-bg)] border-t border-[var(--color-border)]">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-3xl font-bold font-display text-[var(--color-text)] mb-12 text-center">
              Frequently Asked Questions
            </h2>
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-[var(--color-text)] mb-2">How does proof-first hiring work for junior talent?</h3>
                <p className="text-[var(--color-text-muted)] leading-relaxed">
                  You post a role and Bevisly generates a short proof task — typically 30 minutes. Junior candidates complete the task and submit their work. You review real deliverables and shortlist based on actual skill, not years of experience.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[var(--color-text)] mb-2">How quickly can I start reviewing candidates?</h3>
                <p className="text-[var(--color-text-muted)] leading-relaxed">
                  Most employers have their first proof task live within 15 minutes of signing up. Candidate submissions typically arrive within 24–48 hours of posting.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[var(--color-text)] mb-2">Is Bevisly free for candidates?</h3>
                <p className="text-[var(--color-text-muted)] leading-relaxed">
                  Yes, always. Complete proof tasks, build your verified portfolio, and keep your credentials forever — at no cost. Candidates should never pay to prove themselves.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-32 bg-[var(--color-bg-subtle)] border-t border-[var(--color-border)]">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-4xl md:text-5xl font-bold font-display text-[var(--color-text)] mb-6 tracking-tight">
              Ready to hire your next <br />
              <span className="text-[var(--color-brand-primary)]">junior with confidence?</span>
            </h2>
            <p className="text-xl text-[var(--color-text-muted)] mb-10 max-w-2xl mx-auto">
              Post a role in 5 minutes. AI generates the proof task. Review real work from junior candidates who can actually do the job.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="px-10" onClick={() => navigate('/auth?tab=signup&role=employer')}>
                Post Your First Role
              </Button>
              <Button variant="outline" size="lg" className="px-10" onClick={() => navigate('/jobs')}>
                Browse Proof Tasks
              </Button>
            </div>

            <p className="mt-6 text-sm text-[var(--color-text-muted)]">
              Free to start. No invitation code needed.
            </p>
          </div>
        </section>

      </main >
      
      <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
    </div >
  );
}
