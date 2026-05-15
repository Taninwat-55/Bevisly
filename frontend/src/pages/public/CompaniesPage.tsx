import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/lib/supabaseClient";
import { Loader2, Search, Building2, Briefcase } from "lucide-react";
import { motion } from "framer-motion";
import ResponsibilityScoreBadge from "@/components/employer/ResponsibilityScoreBadge";

interface CompanyListItem {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  responsibility_score: number | null;
  description: string | null;
  open_jobs: number;
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<CompanyListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const fetchCompanies = async () => {
      setLoading(true);

      const [{ data: companyData }, { data: jobData }] = await Promise.all([
        supabase
          .from("companies")
          .select("id, name, slug, logo_url, responsibility_score, description")
          .eq("is_internal", false)
          .order("name"),
        supabase
          .from("jobs")
          .select("company_id")
          .eq("status", "active"),
      ]);

      const jobCountMap: Record<string, number> = {};
      for (const job of jobData ?? []) {
        if (job.company_id) {
          jobCountMap[job.company_id] = (jobCountMap[job.company_id] ?? 0) + 1;
        }
      }

      setCompanies(
        (companyData ?? []).map((c) => ({
          ...c,
          open_jobs: jobCountMap[c.id] ?? 0,
        }))
      );
      setLoading(false);
    };

    fetchCompanies();
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return companies;
    const q = query.toLowerCase();
    return companies.filter((c) => c.name.toLowerCase().includes(q));
  }, [companies, query]);

  return (
    <>
      <Helmet>
        <title>Companies Hiring on Bevisly — Proof-Based Recruitment</title>
        <meta name="description" content="Browse startups and SMEs hiring on Bevisly. Every role includes a proof task — apply with real work, not a CV." />
        <link rel="canonical" href="https://bevisly.com/companies" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://bevisly.com/companies" />
        <meta property="og:title" content="Companies Hiring on Bevisly" />
        <meta property="og:description" content="Browse startups and SMEs hiring on Bevisly. Every role includes a proof task — apply with real work, not a CV." />
        <meta property="og:image" content="https://bevisly.com/logo.png" />
        <meta property="og:site_name" content="Bevisly" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:site" content="@bevisly" />
        <meta name="twitter:title" content="Companies Hiring on Bevisly" />
        <meta name="twitter:description" content="Browse startups and SMEs hiring on Bevisly. Apply with real work, not a CV." />
      </Helmet>

      {/* Header */}
      <div className="relative py-12 px-8 bg-[var(--color-brand-primary)] text-white shadow-xl overflow-hidden mt-2 rounded-b-[3rem] mx-4">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold font-display leading-tight mb-2">Companies on Bevisly</h1>
          <p className="text-blue-100 text-lg mb-8">
            Browse employers who hire through proof tasks — not just CVs.
          </p>
          <div className="relative max-w-xl mx-auto">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input
              type="text"
              placeholder="Search companies..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 text-base rounded-xl border border-white/20 bg-white/10 text-white placeholder:text-blue-200 focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur-sm"
            />
          </div>
        </div>
      </div>

      <div className="px-8 py-10 max-w-6xl mx-auto">
        {loading ? (
          <div className="flex justify-center items-center py-24 text-[var(--color-text-muted)]">
            <Loader2 className="animate-spin mr-2" size={20} /> Loading companies…
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center text-center max-w-md mx-auto">
            <div className="w-20 h-20 bg-[var(--color-surface)] border-2 border-[var(--color-border)] rounded-full flex items-center justify-center mb-6">
              <Building2 size={36} className="text-[var(--color-text-muted)] opacity-50" />
            </div>
            <h3 className="text-xl font-bold text-[var(--color-text)] mb-2">
              {query ? "No companies found" : "No companies yet"}
            </h3>
            <p className="text-[var(--color-text-muted)]">
              {query ? "Try a different search term." : "Companies will appear here once they join Bevisly."}
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-[var(--color-text-muted)] mb-6">
              {filtered.length} {filtered.length === 1 ? "company" : "companies"}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((company, i) => (
                <motion.div
                  key={company.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Link
                    to={`/company/${company.slug}`}
                    className="block h-full p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:shadow-md hover:border-[var(--color-brand-primary)]/30 transition-all group"
                  >
                    <div className="flex items-start gap-4">
                      {company.logo_url ? (
                        <img
                          src={company.logo_url}
                          alt={company.name}
                          className="w-14 h-14 rounded-xl object-contain border border-[var(--color-border)] bg-white p-1 shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-[var(--color-brand-primary)]/10 flex items-center justify-center shrink-0">
                          <Building2 size={24} className="text-[var(--color-brand-primary)]" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h2 className="font-bold text-[var(--color-text)] group-hover:text-[var(--color-brand-primary)] transition-colors truncate">
                          {company.name}
                        </h2>
                        {company.responsibility_score !== null && (
                          <div className="mt-1">
                            <ResponsibilityScoreBadge score={company.responsibility_score} size="sm" />
                          </div>
                        )}
                      </div>
                    </div>

                    {company.description && (
                      <p className="mt-4 text-sm text-[var(--color-text-muted)] line-clamp-2">
                        {company.description}
                      </p>
                    )}

                    <div className="mt-4 flex items-center gap-1.5 text-sm text-[var(--color-text-muted)]">
                      <Briefcase size={14} />
                      <span>
                        {company.open_jobs > 0
                          ? `${company.open_jobs} open ${company.open_jobs === 1 ? "role" : "roles"}`
                          : "No open roles"}
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
