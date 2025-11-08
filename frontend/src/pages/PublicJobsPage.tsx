import { useEffect, useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom"; // ✅ already imported
import { getAllJobs } from "@/lib/api/jobs";
import { getErrorMessage } from "@/lib/error";
import type { CandidateJob } from "@/types";
import { Search, MapPin, Briefcase, XCircle } from "lucide-react";
import MultiSelectFilter from "@/components/ui/MultiSelectFilter";
import BackButton from "@/components/ui/BackButton";
import FilterChips from "@/components/ui/FilterChips";

type JobWithSkills = CandidateJob & { required_skills?: string[] | null };

export default function PublicJobsPage() {
  const [jobs, setJobs] = useState<JobWithSkills[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ STEP 1: Read from URL
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("query") || "";
  const initialCategory = searchParams.get("category") || "";

  // --- filters ---
  // ✅ STEP 2: Initialize with URL values
  const [query, setQuery] = useState(initialQuery);
  const [paidOnly, setPaidOnly] = useState(false);
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [locations, setLocations] = useState<string[]>([]);
  const [companies, setCompanies] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>(
    initialCategory ? [initialCategory] : []
  );

  useEffect(() => {
    getAllJobs()
      .then((data) => setJobs(data ?? []))
      .catch((e) => setErr(getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  // ✅ STEP 3: Sync URL changes dynamically (optional)
  useEffect(() => {
    const q = searchParams.get("query") || "";
    const cat = searchParams.get("category") || "";
    setQuery(q);
    setCategories(cat ? [cat] : []);
  }, [searchParams]);

  // --- unique filter options ---
  const allLocations = useMemo(
    () =>
      Array.from(
        new Set(jobs.map((j) => j.location).filter(Boolean))
      ) as string[],
    [jobs]
  );
  const allCompanies = useMemo(
    () =>
      Array.from(
        new Set(jobs.map((j) => j.company).filter(Boolean))
      ) as string[],
    [jobs]
  );
  const allCategories = useMemo(() => {
    const tags = jobs.flatMap((j) => j.required_skills || []);
    return Array.from(new Set(tags)).sort();
  }, [jobs]);

  // --- clear all filters ---
  const clearFilters = () => {
    setQuery("");
    setPaidOnly(false);
    setRemoteOnly(false);
    setLocations([]);
    setCompanies([]);
    setCategories([]);
  };

  const anyFilterActive =
    query ||
    paidOnly ||
    remoteOnly ||
    locations.length > 0 ||
    companies.length > 0 ||
    categories.length > 0;

  // --- filtered results ---
  const filteredJobs = useMemo(() => {
    return jobs
      .filter((j) =>
        j.title?.toLowerCase().includes(query.toLowerCase().trim())
      )
      .filter((j) => (paidOnly ? j.paid : true))
      .filter((j) =>
        remoteOnly ? j.location?.toLowerCase() === "remote" : true
      )
      .filter((j) =>
        locations.length > 0 ? locations.includes(j.location || "") : true
      )
      .filter((j) =>
        companies.length > 0 ? companies.includes(j.company || "") : true
      )
      .filter((j) =>
        categories.length > 0
          ? (j.required_skills || []).some((c) => categories.includes(c))
          : true
      );
  }, [jobs, query, paidOnly, remoteOnly, locations, companies, categories]);

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <BackButton to="/" />
        {/* --- Header --- */}
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2">
            Find your next opportunity
          </h1>
          <p className="text-[var(--color-text-muted)]">
            Browse proof-based roles and filter by company, category, or
            location.
          </p>
        </header>

        {/* --- Filters Panel --- */}
        <div className="mb-10 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm space-y-5">
          {/* Search Bar */}
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
            />
            <input
              type="text"
              placeholder="Search by title or keyword..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-[var(--radius-button)] border border-[var(--color-border)] bg-[var(--color-bg)] py-2 pl-10 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-employer-dark)]"
            />
          </div>

          {/* Multi-select filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <MultiSelectFilter
              label="Companies"
              options={allCompanies}
              selected={companies}
              onChange={setCompanies}
            />
            <MultiSelectFilter
              label="Locations"
              options={allLocations}
              selected={locations}
              onChange={setLocations}
            />
            <MultiSelectFilter
              label="Categories"
              options={allCategories}
              selected={categories}
              onChange={setCategories}
            />
          </div>

          {/* Checkbox toggles + Clear all */}
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-[var(--color-text-muted)]">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={paidOnly}
                  onChange={(e) => setPaidOnly(e.target.checked)}
                  className="accent-[var(--color-employer-dark)]"
                />
                Paid roles only
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={remoteOnly}
                  onChange={(e) => setRemoteOnly(e.target.checked)}
                  className="accent-[var(--color-employer-dark)]"
                />
                Remote only
              </label>
            </div>

            {anyFilterActive && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-error)] transition"
              >
                <XCircle size={14} />
                Clear all filters
              </button>
            )}
          </div>
        </div>

        {/* --- Active Filter Chips --- */}
        <FilterChips
          query={query}
          paidOnly={paidOnly}
          remoteOnly={remoteOnly}
          companies={companies}
          locations={locations}
          categories={categories}
          onRemove={(type, value) => {
            switch (type) {
              case "query":
                setQuery("");
                break;
              case "paidOnly":
                setPaidOnly(false);
                break;
              case "remoteOnly":
                setRemoteOnly(false);
                break;
              case "company":
                setCompanies((prev) => prev.filter((c) => c !== value));
                break;
              case "location":
                setLocations((prev) => prev.filter((l) => l !== value));
                break;
              case "category":
                setCategories((prev) => prev.filter((c) => c !== value));
                break;
            }
          }}
          onClearAll={clearFilters}
        />

        {/* --- Job Listings --- */}
        {loading && (
          <p className="text-center text-[var(--color-text-muted)]">
            Loading jobs...
          </p>
        )}

        {err && <p className="text-center text-[var(--color-error)]">{err}</p>}

        {!loading && !err && filteredJobs.length === 0 && (
          <div className="text-center py-20 border border-dashed border-[var(--color-border)] rounded-xl bg-[var(--color-surface)]">
            <p className="text-[var(--color-text-muted)]">
              No jobs match your filters.
            </p>
          </div>
        )}

        {!loading && !err && filteredJobs.length > 0 && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredJobs.map((job) => (
              <Link
                key={job.id}
                to={`/jobs/${job.id}`}
                className="block rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div className="text-xs text-[var(--color-text-muted)] flex items-center gap-1 mb-1">
                  <Briefcase size={14} /> {job.company ?? "Company"}
                </div>
                <h2 className="font-semibold text-[var(--color-text)] mb-1 line-clamp-1">
                  {job.title}
                </h2>
                <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                  {job.location && (
                    <span className="flex items-center gap-1">
                      <MapPin size={12} /> {job.location}
                    </span>
                  )}
                  <span className="rounded-md border border-[var(--color-border)] px-2 py-0.5">
                    {job.paid ? "Paid" : "XP"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
