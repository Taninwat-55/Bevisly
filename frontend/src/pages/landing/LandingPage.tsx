import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { ArrowRight, CheckCircle, Play, Check, Search, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { GeneratedJobListing } from "@/lib/api/ai";
import { generateJobListing } from "@/lib/api/ai";
import toast from "react-hot-toast";
import UserMenu from "@/components/common/UserMenu";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import RequestAccessModal from "@/components/common/RequestAccessModal";
import ContactModal from "@/components/common/ContactModal";

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pricingMode, setPricingMode] = useState<"employer" | "candidate">("employer");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);

  // Magic Box State
  const [rawInput, setRawInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedData, setGeneratedData] = useState<GeneratedJobListing | null>(null);

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
            "name": "How is Bevisly different from a resume?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Bevisly verifies actual skills through code and design tasks, whereas resumes are just self-reported claims. We provide improved trust for employers and a fair chance for candidates."
            }
          },
          {
            "@type": "Question",
            "name": "Do I need an invitation to join?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Candidates can join freely and start verifying skills immediately. Employers currently need an invitation code to post jobs during our closed beta."
            }
          },
          {
            "@type": "Question",
            "name": "Is Bevisly free for candidates?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, candidates can create a profile and display verified badges for free. We also offer a Pro tier for enhanced visibility."
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
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate task. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCTA = () => {
    if (user) {
      if (user.role === "employer") return navigate("/employer/dashboard");
      return navigate("/candidate");
    }
    navigate("/auth");
  };

  const handleRequestAccess = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="bg-[var(--color-bg)] min-h-screen font-sans selection:bg-[var(--color-brand-primary)] selection:text-white">
      <Helmet>
        <title>Bevisly - Hire Proven Talent</title>
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>
      {/* ── HEADER ────────────────────────────── */}
      <header className="fixed top-0 inset-x-0 z-50 transition-all duration-200 bg-[var(--color-bg)]/80 backdrop-blur-md border-b border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-brand-primary)] to-[var(--color-brand-secondary)] flex items-center justify-center text-white font-bold text-lg">
              B
            </div>
            <span className="text-xl font-bold font-display tracking-tight text-[var(--color-text)]">
              Bevisly
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">Features</a>
            <a href="#employers" className="text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">For Employers</a>
            <a href="#candidates" className="text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">For Candidates</a>
            <a href="#pricing" className="text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">Pricing</a>
          </nav>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            {!user ? (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>
                  Log in
                </Button>
                <Button size="sm" onClick={handleCTA}>
                  Join Beta
                </Button>
              </>
            ) : (
              <>
                <Button size="sm" onClick={handleCTA}>
                  Dashboard
                </Button>
                <UserMenu />
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        {/* ── HERO SECTION ────────────────────────────── */}
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
          {/* Background Elements */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-[var(--color-brand-primary)]/20 rounded-full blur-[120px] -z-10" />
          <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-[var(--color-brand-secondary)]/10 rounded-full blur-[100px] -z-10" />
          <div className="absolute inset-0 bg-noise opacity-[0.03] z-0 mix-blend-overlay pointer-events-none" />

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center max-w-4xl mx-auto mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm mb-8 animate-fade-in-up">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-sm font-medium text-[var(--color-text-muted)]">
                  Invitation-Only Beta Now Live
                </span>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold font-display tracking-tight text-[var(--color-text)] mb-6 leading-[1.1] animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                Stop Hiring Resumes. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-brand-primary)] to-[var(--color-brand-secondary)]">
                  Start Hiring Proof.
                </span>
              </h1>

              <p className="text-xl text-[var(--color-text-muted)] mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
                Bevisly replaces outdated CVs with verified proof of work.
                Currently in private beta for select partners.
              </p>

              <div className="max-w-2xl mx-auto relative animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
                <form 
                  onSubmit={handleGenerateProofTask}
                  className={`relative flex items-center w-full shadow-[0_0_40px_rgba(var(--color-brand-primary),0.15)] rounded-2xl bg-[var(--color-surface)] border-2 transition-colors overflow-hidden ${isGenerating ? 'border-[var(--color-brand-primary)] opacity-80 pointer-events-none' : 'border-[var(--color-brand-primary)]/30 focus-within:border-[var(--color-brand-primary)]'}`}
                >
                  <Search className={`absolute left-4 md:left-6 transition-colors ${isGenerating ? 'text-[var(--color-brand-primary)]' : 'text-[var(--color-text-muted)]'}`} size={24} />
                  <input 
                     type="text" 
                     value={rawInput}
                     onChange={(e) => setRawInput(e.target.value)}
                     disabled={isGenerating}
                     placeholder="e.g. Need a Senior React Developer..." 
                     className="w-full bg-transparent border-none py-5 pl-14 md:pl-16 pr-32 md:pr-48 text-lg md:text-xl text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-muted)] disabled:opacity-50"
                  />
                  <button 
                     type="submit"
                     disabled={isGenerating || !rawInput.trim()}
                     className="absolute right-2 top-2 bottom-2 bg-gradient-to-r from-[var(--color-brand-primary)] to-[var(--color-brand-secondary)] text-white font-bold px-4 md:px-8 rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-2"
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
                    Enter a job description to instantly generate a skill proof task.
                  </p>
                </div>
              </div>
            </div>

            {/* Hero Visual / Mockup */}
            <div className="relative mx-auto max-w-5xl mt-16 animate-scale-in" style={{ animationDelay: "0.4s" }}>
              <div className="glass-panel p-2 rounded-2xl md:rounded-[2rem] shadow-2xl border-gradient-primary bg-slate-900/50 backdrop-blur-xl">
                <div className="bg-slate-950 rounded-xl md:rounded-[1.5rem] overflow-hidden border border-slate-800 aspect-[16/9] relative flex flex-col">
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
                      <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-6 animate-pulse">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--color-brand-primary)] to-[var(--color-brand-secondary)] flex items-center justify-center text-white shadow-[0_0_30px_rgba(var(--color-brand-primary),0.3)] animate-bounce">
                          <CheckCircle size={32} />
                        </div>
                        <div className="text-center space-y-2">
                           <h3 className="text-xl font-bold font-sans text-white">Analyzing Requirements...</h3>
                           <p className="text-slate-400 font-mono text-sm max-w-sm mx-auto">Gemini AI is extracting the ideal job title, requirements, and building a practical Proof Task.</p>
                        </div>
                        
                        <div className="w-full max-w-md space-y-3 mt-4">
                           <div className="h-4 w-3/4 bg-slate-800 rounded"></div>
                           <div className="h-4 w-1/2 bg-slate-800 rounded"></div>
                           <div className="h-4 w-5/6 bg-slate-800 rounded"></div>
                        </div>
                      </div>
                    ) : generatedData ? (

                      /* ── STATE 2: SUCCESS (AI RESULTS) ── */
                      <div className="flex-1 p-6 md:p-10 flex flex-col gap-6 overflow-y-auto bg-slate-900/50">
                        {/* Header Row */}
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 border-b border-slate-800 pb-6">
                          <div>
                            <div className="bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] border border-[var(--color-brand-primary)]/20 px-3 py-1 rounded-full inline-flex items-center gap-2 mb-3">
                              <CheckCircle size={12} />
                              <span className="font-semibold text-xs tracking-wider uppercase">AI Generated</span>
                            </div>
                            <h3 className="text-white text-2xl md:text-3xl font-bold font-display tracking-tight mb-2">
                              {generatedData.title}
                            </h3>
                            <p className="text-slate-400 text-sm line-clamp-2 md:line-clamp-3 max-w-2xl leading-relaxed">
                              {generatedData.description.replace(/[#*]/g, '') /* Simple strip of MD syntax for quick preview */}
                            </p>
                          </div>
                          <div className="shrink-0">
                            <Button size="lg" className="w-full md:w-auto shadow-glow-primary" onClick={() => navigate('/auth?tab=signup&role=employer')}>
                              Post this Job for Free <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Proof Task Generated */}
                        <div className="grid grid-cols-1 gap-4">
                          <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-widest">Recommended Proof Task</h4>
                          {generatedData.proof_tasks.map((task, i) => (
                              <div key={i} className="p-5 rounded-2xl border border-slate-800 bg-slate-950/50 flex flex-col gap-4">
                                <div className="flex justify-between items-start gap-4">
                                  <h5 className="text-lg font-medium text-white">{task.title}</h5>
                                  <div className="flex gap-2 shrink-0">
                                    <span className="px-2 py-1 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-mono">
                                      {task.expected_time}
                                    </span>
                                    <span className="px-2 py-1 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-mono">
                                      {task.submission_format}
                                    </span>
                                  </div>
                                </div>
                                <p className="text-sm text-slate-400 font-mono leading-relaxed line-clamp-3">
                                  {task.description}
                                </p>
                              </div>
                          ))}
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
                        <div className="flex-1 p-6 md:p-8 flex flex-col gap-6 font-mono text-xs md:text-sm text-slate-400">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-3 py-1 rounded-full inline-flex items-center gap-2 mb-2">
                                <CheckCircle size={12} />
                                <span className="font-semibold">Verification Complete</span>
                              </div>
                              <h3 className="text-slate-100 text-lg md:text-xl font-bold font-sans">Submit & Verify Task</h3>
                            </div>
                            <div className="bg-blue-600 text-white px-4 py-2 rounded-lg font-sans font-medium text-xs shadow-glow-primary">
                              98/100 Score
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
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
                    <span>⭐️</span>
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



        {/* ── FEATURES GRID (Bento) ────────────────────────────── */}
        <section id="features" className="py-24 bg-[var(--color-bg)]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold font-display text-[var(--color-text)] mb-4">
                Everything you need to <br />
                <span className="text-[var(--color-brand-primary)]">hire with confidence</span>
              </h2>
              <p className="text-[var(--color-text-muted)] text-lg max-w-2xl mx-auto">
                Move beyond the resume. Our platform gives you the tools to verify real skills in a fraction of the time.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature 1: Large Box */}
              <div className="md:col-span-2 glass-panel p-8 rounded-2xl relative overflow-hidden group hover:shadow-glow-primary transition-all duration-300">
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 mb-6">
                    <CheckCircle />
                  </div>
                  <h3 className="text-2xl font-bold font-display text-[var(--color-text)] mb-2">Automated Verification</h3>
                  <p className="text-[var(--color-text-muted)] max-w-sm">
                    Our system automatically validates code submissions, design files, and other proof tasks so you don't have to manually check every detail.
                  </p>
                </div>
                {/* Abstract Line Decoration */}
                <div className="absolute right-0 bottom-0 w-64 h-64 bg-gradient-to-tl from-[var(--color-brand-primary)]/10 to-transparent rounded-full blur-3xl group-hover:blur-2xl transition-all" />
              </div>

              {/* Feature 2: Tall Box */}
              <div className="glass-panel p-8 rounded-2xl md:row-span-2 relative overflow-hidden group hover:shadow-glow-orange transition-all duration-300">
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 mb-6">
                    <Play />
                  </div>
                  <h3 className="text-2xl font-bold font-display text-[var(--color-text)] mb-2">Video Explainers</h3>
                  <p className="text-[var(--color-text-muted)]">
                    Candidates record short Loom-style videos explaining their thought process. See how they communicate complex ideas before you interview.
                  </p>
                </div>
                <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[var(--color-brand-secondary)]/10 to-transparent" />
              </div>

              {/* Feature 3: Standard Box */}
              <div className="glass-panel p-8 rounded-2xl group hover:-translate-y-1 transition-all duration-300">
                <h3 className="text-xl font-bold font-display text-[var(--color-text)] mb-2">Anti-Cheating</h3>
                <p className="text-[var(--color-text-muted)] text-sm">
                  Smart detection algorithms flag suspicious activity and AI-generated copy-paste responses.
                </p>
              </div>

              {/* Feature 4: Standard Box */}
              <div className="glass-panel p-8 rounded-2xl group hover:-translate-y-1 transition-all duration-300">
                <h3 className="text-xl font-bold font-display text-[var(--color-text)] mb-2">Team Collaboration</h3>
                <p className="text-[var(--color-text-muted)] text-sm">
                  Invite your team, share feedback, and make hiring decisions together in one unified dashboard.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── PROBLEM / SOLUTION (Dark Contrast) - EMPLOYERS ────────────────────────────── */}
        <section id="employers" className="py-24 bg-[#0B0C10] text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none" />

          <div className="max-w-7xl mx-auto px-6 relative z-10 grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-block px-3 py-1 rounded-full border border-white/20 bg-white/5 text-sm font-medium text-white/80 mb-6">
                The Old Way vs. The New Way
              </div>
              <h2 className="text-4xl md:text-5xl font-bold font-display mb-6">Resumes are broken.<br />We fixed them.</h2>
              <p className="text-blue-100 text-lg leading-relaxed mb-8">
                Traditional hiring relies on self-reported skills and keyword stuffing. Bevisly validates ability through actual work samples.
              </p>
              <Button variant="primary" size="lg" onClick={handleRequestAccess}>
                Request Beta Access
              </Button>
            </div>

            <div className="space-y-4">
              {/* Comparison Item 1 */}
              <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 shrink-0">✕</div>
                <div>
                  <h4 className="font-bold text-white">Outdated Resumes</h4>
                  <p className="text-sm text-gray-400">Static documents that don't reflect current capabilities.</p>
                </div>
              </div>

              {/* Comparison Item 2 */}
              <div className="flex items-start gap-4 p-4 rounded-xl bg-blue-600/20 border border-blue-500/50 relative overflow-hidden">
                <div className="absolute inset-0 bg-blue-600/10 animate-pulse" />
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white shrink-0 relative z-10">✓</div>
                <div className="relative z-10">
                  <h4 className="font-bold text-white">Verified Proof Tasks</h4>
                  <p className="text-sm text-blue-100">Live work samples validated by code execution and peer review.</p>
                </div>
              </div>

              {/* Comparison Item 3 */}
              <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 shrink-0">✕</div>
                <div>
                  <h4 className="font-bold text-white">Keyword Filtering</h4>
                  <p className="text-sm text-gray-400">ATS systems that reject great candidates for missing buzzwords.</p>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* ── CANDIDATES SECTION ────────────────────────────── */}
        <section id="candidates" className="py-24 bg-[var(--color-bg)] border-t border-[var(--color-border)]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <div className="inline-block px-3 py-1 rounded-full bg-[var(--color-candidate)]/10 text-[var(--color-candidate)] text-sm font-medium mb-4">
                For Candidates
              </div>
              <h2 className="text-3xl md:text-5xl font-bold font-display text-[var(--color-text)] mb-4">
                Don't let your resume <br />
                <span className="text-[var(--color-candidate)]">hold you back</span>
              </h2>
              <p className="text-[var(--color-text-muted)] text-lg max-w-2xl mx-auto">
                Skip the ATS black hole. Prove your worth with real-world tasks and get fast-tracked to final interviews.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-candidate)]/50 transition-colors">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 mb-4 font-bold text-xl">1</div>
                <h3 className="text-xl font-bold mb-2">Find a Role</h3>
                <p className="text-[var(--color-text-muted)]">Browse jobs that match your skills, not just your job history.</p>
              </div>
              <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-candidate)]/50 transition-colors">
                <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 mb-4 font-bold text-xl">2</div>
                <h3 className="text-xl font-bold mb-2">Complete the Task</h3>
                <p className="text-[var(--color-text-muted)]">Showcase your coding, design, or writing skills in a real-world scenario.</p>
              </div>
              <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-candidate)]/50 transition-colors">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 mb-4 font-bold text-xl">3</div>
                <h3 className="text-xl font-bold mb-2">Get Hired</h3>
                <p className="text-[var(--color-text-muted)]">Top performers get interviewed directly. No resume screening.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── PRICING SECTION ────────────────────────────── */}
        <section id="pricing" className="py-24 bg-[var(--color-bg)]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-bold font-display text-[var(--color-text)] mb-6">
                Simple, transparent pricing
              </h2>
              <p className="text-[var(--color-text-muted)] text-lg max-w-2xl mx-auto mb-8">
                Currently in Beta. Early adopters get special rates.
              </p>

              {/* Toggle */}
              <div className="inline-flex items-center p-1 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm">
                <button
                  onClick={() => setPricingMode("employer")}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${pricingMode === "employer" ? "bg-[var(--color-text)] text-[var(--color-bg)] shadow-sm" : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"}`}
                >
                  For Employers
                </button>
                <button
                  onClick={() => setPricingMode("candidate")}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${pricingMode === "candidate" ? "bg-[var(--color-text)] text-[var(--color-bg)] shadow-sm" : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"}`}
                >
                  For Candidates
                </button>
              </div>
            </div>

            {/* Pricing Cards */}
            <div className="flex flex-col md:flex-row justify-center gap-8 items-start flex-wrap">

              {pricingMode === "employer" ? (
                <>
                  {/* Free Starter */}
                  <div className="flex-1 min-w-[300px] glass-panel p-8 rounded-2xl border border-[var(--color-border)] hover:border-[var(--color-brand-primary)]/50 transition-all group">
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-[var(--color-text)]">Beta Starter</h3>
                      <p className="text-[var(--color-text-muted)] text-sm mt-2">For early-stage startups.</p>
                    </div>
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-[var(--color-text)]">0 DKK</span>
                      <span className="text-[var(--color-text-muted)]"> / month</span>
                    </div>
                    <Button variant="outline" className="w-full mb-8 group-hover:border-[var(--color-brand-primary)] group-hover:text-[var(--color-brand-primary)]" onClick={handleRequestAccess}>Request Invite</Button>
                    <ul className="space-y-4 text-sm text-[var(--color-text-muted)]">
                      <li className="flex items-center gap-3"><Check size={16} className="text-[var(--color-brand-primary)]" /> <span>Unlimited Job Posts (Standard)</span></li>
                      <li className="flex items-center gap-3"><Check size={16} className="text-[var(--color-brand-primary)]" /> <span>Manual Review</span></li>
                      <li className="flex items-center gap-3"><Check size={16} className="text-[var(--color-brand-primary)]" /> <span>Standard Support</span></li>
                    </ul>
                  </div>

                  {/* Founder Pro */}
                  <div className="flex-1 min-w-[300px] glass-panel p-8 rounded-2xl border border-[var(--color-brand-secondary)]/50 relative hover:shadow-glow-secondary transition-all">
                    <div className="absolute top-0 right-0 bg-[var(--color-brand-secondary)] text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-lg">
                       POPULAR
                    </div>
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-[var(--color-text)]">Founder Pro</h3>
                      <p className="text-[var(--color-text-muted)] text-sm mt-2">For solo founders & small teams.</p>
                    </div>
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-[var(--color-text)]">449 DKK</span>
                      <span className="text-[var(--color-text-muted)]"> / month</span>
                    </div>
                    <Button className="w-full mb-8 bg-[var(--color-brand-secondary)] hover:bg-[var(--color-brand-secondary)]/90 text-white" onClick={handleRequestAccess}>Request Invite</Button>
                    <ul className="space-y-4 text-sm text-[var(--color-text-muted)]">
                      <li className="flex items-center gap-3"><Check size={16} className="text-[var(--color-brand-secondary)]" /> <span>AI-Copilot (Drafting)</span></li>
                      <li className="flex items-center gap-3"><Check size={16} className="text-[var(--color-brand-secondary)]" /> <span>5 Active Proof Tasks</span></li>
                      <li className="flex items-center gap-3"><Check size={16} className="text-[var(--color-brand-secondary)]" /> <span>1 Featured Slot (7 days)</span></li>
                    </ul>
                  </div>

                  {/* Growth SaaS */}
                  <div className="flex-1 min-w-[300px] glass-panel p-8 rounded-2xl border-2 border-[var(--color-brand-primary)] relative shadow-glow-primary">
                    <div className="absolute top-0 right-0 bg-[var(--color-brand-primary)] text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-lg">
                      BEST VALUE
                    </div>
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-[var(--color-text)]">Growth SaaS</h3>
                      <p className="text-[var(--color-text-muted)] text-sm mt-2">For agencies & scaleups.</p>
                    </div>
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-[var(--color-text)]">1,499 DKK</span>
                      <span className="text-[var(--color-text-muted)]"> / month</span>
                    </div>
                    <Button className="w-full mb-8 bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary)]/90 text-white" onClick={handleRequestAccess}>Request Invite</Button>
                    <ul className="space-y-4 text-sm text-[var(--color-text-muted)]">
                      <li className="flex items-center gap-3"><Check size={16} className="text-[var(--color-brand-primary)]" /> <span>Unlimited Proof Tasks</span></li>
                      <li className="flex items-center gap-3"><Check size={16} className="text-[var(--color-brand-primary)]" /> <span>Team Collaboration</span></li>
                      <li className="flex items-center gap-3"><Check size={16} className="text-[var(--color-brand-primary)]" /> <span>3 Featured Slots (Rolling)</span></li>
                      <li className="flex items-center gap-3"><Check size={16} className="text-[var(--color-brand-primary)]" /> <span>Priority Support</span></li>
                    </ul>
                  </div>
                </>
              ) : (
                /* Candidate Pro */
                <div className="flex-1 max-w-md w-full glass-panel p-8 rounded-2xl border-2 border-[var(--color-candidate)] relative shadow-glow-orange">
                  <div className="absolute top-0 right-0 bg-[var(--color-candidate)] text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-lg">
                    CAREER BOOST
                  </div>
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-[var(--color-text)]">Candidate Pro</h3>
                    <p className="text-[var(--color-text-muted)] text-sm mt-2">Stand out from the crowd.</p>
                  </div>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-[var(--color-text)]">89 DKK</span>
                    <span className="text-[var(--color-text-muted)]"> / month</span>
                  </div>
                  <Button className="w-full mb-8 bg-[var(--color-candidate)] hover:bg-[var(--color-candidate)]/90 text-white" onClick={handleRequestAccess}>Request Invite</Button>
                  <ul className="space-y-4 text-sm text-[var(--color-text-muted)]">
                    <li className="flex items-center gap-3"><Check size={16} className="text-[var(--color-candidate)]" /> <span>Permanent Profile Hosting</span></li>
                    <li className="flex items-center gap-3"><Check size={16} className="text-[var(--color-candidate)]" /> <span>Advanced View Analytics</span></li>
                    <li className="flex items-center gap-3"><Check size={16} className="text-[var(--color-candidate)]" /> <span>Custom Profile URL</span></li>
                    <li className="flex items-center gap-3"><Check size={16} className="text-[var(--color-candidate)]" /> <span>Priority Placement</span></li>
                  </ul>
                </div>
              )}

            </div>
          </div>
        </section >

        {/* ── FAQ SECTION (New for GEO) ────────────────────────────── */}
        <section className="py-24 bg-[var(--color-bg)] border-t border-[var(--color-border)]">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-3xl font-bold font-display text-[var(--color-text)] mb-12 text-center">
              Frequently Asked Questions
            </h2>
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-[var(--color-text)] mb-2">How is Bevisly different from a resume?</h3>
                <p className="text-[var(--color-text-muted)] leading-relaxed">
                  Bevisly verifies actual skills through code and design tasks, whereas resumes are just self-reported claims. We provide improved trust for employers and a fair chance for candidates.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[var(--color-text)] mb-2">Do I need an invitation to join?</h3>
                <p className="text-[var(--color-text-muted)] leading-relaxed">
                  Candidates can join freely and start verifying skills immediately. Employers currently need an invitation code to post jobs during our closed beta.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[var(--color-text)] mb-2">Is Bevisly free for candidates?</h3>
                <p className="text-[var(--color-text-muted)] leading-relaxed">
                   Yes, candidates can create a profile and display verified badges for free. We also offer a Pro tier for enhanced visibility.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-32 relative overflow-hidden bg-[var(--color-surface)]">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-brand-primary)]/5 to-[var(--color-brand-secondary)]/5" />

          <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <h2 className="text-4xl md:text-6xl font-bold font-display text-[var(--color-text)] mb-6 tracking-tight">
              Ready to hire <br />
              <span className="text-[var(--color-brand-primary)]">proven talent?</span>
            </h2>
            <p className="text-xl text-[var(--color-text-muted)] mb-10 max-w-2xl mx-auto">
              Join forward-thinking companies building their teams with verified proof, not just promises.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="h-16 px-10 text-xl rounded-2xl shadow-glow-primary hover:scale-105 transition-transform" onClick={handleCTA}>
                Enter Invitation Code
              </Button>
            </div>

            <p className="mt-6 text-sm text-[var(--color-text-muted)]">
              Beta access is currently limited. <button onClick={() => setIsContactOpen(true)} className="underline hover:text-[var(--color-brand-primary)]">Contact us</button> for enterprise inquiries.
            </p>
          </div>
        </section>

      </main >
      
      <RequestAccessModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
    </div >
  );
}
